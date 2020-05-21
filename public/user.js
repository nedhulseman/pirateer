var userId;
//make connection
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  userId = socket.id;
  document.getElementById('user-identifier').innerHTML = "Welcome user: " + userId;
});
function updateLobbyCount(num_clients){
  var lobbytracker = document.getElementById('lobby-tracker');
  var default_message = (num_clients==1 ? " pirate" : ' pirates') + " in the harbour";
  var message = num_clients + default_message;
  lobbytracker.innerHTML = message;
};

socket.on('player-join', function(num_clients){
  updateLobbyCount(num_clients);
});
socket.on('player-leave', function(num_clients){
  updateLobbyCount(num_clients);
});



/*
submit.addEventListener('click', function(){
  socket.emit('move', {
    x : d3.select("#piece-1").attr("cx"),
    y : d3.select("#piece-1").attr("cy")
  });
});
*/




var square = 30,
  w = 600,
  h = 600;
var gameStarted = false;
var nodes_data = [];
var startTurnNodes_data;
var nodes;
var playerOrder;
var movedPiece;
var players;
var currentTurn;
var currentTurnID;
var turnImage = '<img src="static/anchor.png" alt="" id="turn-anchor" height=5px width=5px></img>'
var turnImage = document.createElement('img');
turnImage.src = "static/anchor.png";
turnImage.setAttribute("id",  "turn-anchor");
turnImage.setAttribute("width",  "5px");
turnImage.setAttribute("height",  "5px");


//Get square centers
var boardMatrix = {};

// Dice
var rolled = false;
var global_legal_moves = {};
var highlighted_legal_moves;
var dice1 = 999;
var dice2 = 999;
var dice1Img = document.getElementById('dice-1');
var dice2Img = document.getElementById('dice-2');
var roll = document.getElementById("roll-dice");
var treasureOnIsland = true;
var totalMoved = 0;
function treasureFound(id){
  socket.emit('treasureFoundOnIsland', id);
}
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
function resetGamePlayeVars(){
  window.gameStarted = false;
  window.nodes_data = [];
  window.startTurnNodes_data = -1;
  window.nodes = -1;
  window.playerOrder = -1;
  window.movedPiece = false;
  window.players = -1;
  window.currentTurn;
  window.currentTurnID = -1;


  // Dice
  window.rolled = false;
  window.global_legal_moves = {};
  window.highlighted_legal_moves = -1;
  window.dice1 = 999;
  window.dice2 = 999;
  window.dice1Img = document.getElementById('dice-1');
  window.dice2Img = document.getElementById('dice-2');
  window.roll = document.getElementById("roll-dice");
  window.treasureOnIsland = true;
  window.totalMoved = 0;
  window.rolled=false;
};

function getMoved_i(id){
  for (var i=0; i<nodes_data.length; i++){
    if (nodes_data[i].id == id){
      return i;
    }
  }
}

function setGlobalLegalMoves(){
  global_legal_moves = {};
  var d1;
  var d2;
  var y;
  var x;
  var totalMoved=0;
  // Calculate total moves made to determine how many moves are left
  for (var p=0; p<startTurnNodes_data.length; p++){
      if (startTurnNodes_data[p].y != nodes_data[p].y || startTurnNodes_data[p].x != nodes_data[p].x){
        oldP = boardMatrix[startTurnNodes_data[p].y +'-'+ startTurnNodes_data[p].x];
        newP =  boardMatrix[nodes_data[p].y +'-'+ nodes_data[p].x];
        movedY = Math.abs( parseInt(newP.split('-')[1]) - parseInt(oldP.split('-')[1]));
        movedX = Math.abs( parseInt(newP.split('-')[2]) - parseInt(oldP.split('-')[2]));
        totalMoved += movedX + movedY;
      }
  };
  if (totalMoved == dice1 + dice2){
    d1 = 0;
    d2 = 0;
  }
  else if (totalMoved == 0){
    d1 = dice1;
    d2 = dice2;
  }
  else {
    d1 = dice1 + dice2 - totalMoved;
    d2 = 0;
  }
  for (var p=0; p<startTurnNodes_data.length; p++){
    //if (startTurnNodes_data[p].y == nodes_data[p].y && startTurnNodes_data[p].x == nodes_data[p].x){
    y = nodes_data[p].y;
    x = nodes_data[p].x;
    //}
    global_legal_moves[startTurnNodes_data[p].id] = getLegalMoves(boardMatrix[y+'-'+ x], d1, d2);
  }
};

roll.addEventListener('click', function(){
  if (gameStarted == true && players[userId].turn == true && rolled == false){
    console.log("Dice rolled locally")
    rolled = true;
    dice1 = Math.floor(Math.random() * 6) +1;
    dice2 = Math.floor(Math.random() * 6) +1;
    //dice1 = 1;
    //dice2= 2;
    setGlobalLegalMoves();
    socket.emit('dice-roll', [dice1, dice2]);
  }
});
socket.on('dice-roll', function(die){
  console.log("Dice rolled everywhere");
  d1 = die[0];
  d2 = die[1];
  dice1Img.src = 'static/dice-'+d1+'.png';
  dice2Img.src = 'static/dice-'+d2+'.png';
  dice1Img.classList.add("animate");
  dice2Img.classList.add("animate");

  // Check to see if player is in the harbvour of Treasure treasureOnIsland
  // This would be if they defered to take the treasure
  if (treasureOnIsland == true && currentTurnID == userId){
    for (var i=0; i<anchorSquaresTreasure.length; i++){
      sqX = parseInt(d3.select('#'+ anchorSquaresTreasure[i]).attr('x')) + (square/2);
      sqY = parseInt(d3.select('#'+ anchorSquaresTreasure[i]).attr('y')) + (square/2);
      for (var p=0; p<players[userId].coords.length; p++){
        if (players[userId].coords[p].x == sqX && players[userId].coords[p].y == sqY) {
          if (confirm('Arrrrg! You struck treasure. \nWould you like to take this treasure?')){
            nodes_data[movedI].hasGold = true;
            treasureFound('#' + nodes_data[movedI].id);
            socket.emit('treasureFoundOnIsland');
          }
        }
      }
    }
  };
});
/*
d3.select('#'+playerMoves.players[playerMoves.user].coords[i].id).transition().duration(1500)
  .attr("cx", playerMoves.players[playerMoves.user].coords[i].x)
  .attr("cy", playerMoves.players[playerMoves.user].coords[i].y);

*/

function dragged(d) {
    d3.select(this)
      .attr("cx", d3.event.x)
      .attr("cy", d3.event.y);
  }

// create the svg
var svg = d3.select('#board').append('svg')
  .attr({
    width: w,
    height: h
  });

icons = {
  "black":"black-flag-piece",
  "blue":"blue-flag-piece",
  "white":"white-flag-piece",
  "green":"green-flag-piece"
};

for (var i=0; i< Object.keys(icons).length; i++){
  key = Object.keys(icons)[i];
  var defs = svg.append('svg:defs');

  defs.append("svg:pattern")
      .attr("id", icons[key])
      .attr("width", 30)
      .attr("height", 30)
      .attr("patternUnits", "userSpaceOnUse")
      .append("svg:image")
        .attr("xlink:href", 'static/'+icons[key]+'.png')
        .attr("width", 30)
        .attr("height", 30)
        .attr("x", 0)
        .attr("y", 0);
};


// calculate number of rows and columns
var squaresRow = Math.round(w / square);
var squaresColumn = Math.round(h / square);

// loop over number of columns
_.times(squaresColumn, function(n) {
//for (n=0; n<squaresColumn; n++) {

  // create each set of rows
  var rows = svg.selectAll('rect' + ' .row-' + (n + 1))
    .data(d3.range(squaresRow))
    .enter().append('rect')
    .attr({
      class: function(d, i) {
        return 'square row-' + (n + 1) + ' ' + 'col-' + (i + 1);
      },
      id: function(d, i) {
        return 's-' + (n + 1) +'-'+ (i + 1);
      },
      width: square,
      height: square,
      x: function(d, i) {
        return i * square;
      },
      y: n * square,
      fill: '#80b6d2',
      stroke: '#fff'
    });

    /*
    // test with some feedback
    var test = rows.on('mouseover', function (d, i) {
      d3.select('#grid-ref').text(function () {
        return 'row: ' + (n + 1) + ' | ' + 'column: ' + (i + 1);
      });
      d3.selectAll('.square')
        .attr('fill', '#000080')
        .attr('stroke', '#fff');
      d3.select(this)
        .attr('fill', '#ADD8E6')
        .attr('stroke', '#D4AF37');
    });
    */
});

land = ["s-1-1", "s-1-2","s-1-3", "s-1-4", "s-1-5", "s-1-6", "s-1-7", "s-1-8",
        "s-1-9", "s-1-16", "s-1-17", "s-1-18", "s-1-19", "s-1-20",
        "s-2-1", "s-2-2","s-2-3", "s-2-4", "s-2-5", "s-2-6", "s-2-7", "s-2-8",
        "s-2-9", "s-2-10","s-2-11", "s-2-12", "s-2-13",
        "s-2-16", "s-2-17", "s-2-18", "s-2-19", "s-2-20",
        "s-3-1", "s-3-2","s-3-3", "s-3-4", "s-3-5", "s-3-6", "s-3-7", "s-3-8",
        "s-3-10","s-3-11", "s-3-12",
        "s-3-16", "s-3-17", "s-3-18", "s-3-19", "s-3-20",
        "s-4-1", "s-4-2", "s-4-3", "s-4-17", "s-4-18", "s-4-19", "s-4-20",
        "s-5-1", "s-5-2", "s-5-3", "s-5-16", "s-5-18", "s-5-19", "s-5-20",
        "s-10-10", "s-10-11", "s-11-10", "s-11-11",
        "s-6-1", "s-6-2", "s-6-3",
        "s-7-1", "s-7-2", "s-7-3",
        "s-8-1", "s-8-2", "s-8-3", "s-8-3", "s-8-19",
        "s-9-1", "s-9-2", "s-9-18", "s-9-19",
        "s-10-2", "s-10-3", "s-10-18", "s-10-19",
        "s-11-2", "s-11-3", "s-11-18", "s-11-19",
        "s-12-2", "s-12-3", "s-12-19", "s-12-20",
        "s-13-2", "s-13-18", "s-13-19", "s-13-20",
        "s-14-18", "s-14-19", "s-14-20",
        "s-15-18", "s-15-19", "s-15-20",
        "s-16-1", "s-16-2", "s-16-3", "s-16-5", "s-16-18", "s-16-19", "s-16-20",
        "s-17-1", "s-17-2", "s-17-3", "s-17-4", "s-17-18", "s-17-19", "s-17-20",
        "s-18-1", "s-18-2","s-18-3", "s-18-4", "s-18-5", "s-18-9", "s-18-10", "s-18-11",
        "s-18-13","s-18-14", "s-18-15", "s-18-16","s-18-17", "s-18-18", "s-18-13","s-18-19", "s-18-20",
        "s-19-1", "s-19-2","s-19-3", "s-19-4", "s-19-5", "s-19-8",
        "s-19-9", "s-19-10","s-19-11", "s-19-12", "s-19-13", "s-19-14", "s-19-15",
        "s-19-16", "s-19-17", "s-19-18", "s-19-19", "s-19-20",
        "s-20-1", "s-20-2","s-20-3", "s-20-4", "s-20-5",
        "s-20-14", "s-20-13", "s-20-14", "s-20-15",
        "s-20-16", "s-20-17", "s-20-18", "s-20-19", "s-20-20",
 ]

function checkLand(currentRow, newRow, currentCol, newCol){
    hitLandByRow=false;
    hitLandByCol=false;
    piecesOtherTeams = [];
    piecesMyTeam = [];
    teams = ["black", "blue", "white", "green"];



    for (var t=0; t<teams.length; t++){
      for (var p=0; p<3; p++){
        piece = d3.select("#"+teams[t] +"-"+ p);
        if (!piece.empty()){
          pos = boardMatrix[ piece.attr("cy") +"-"+ piece.attr("cx") ];
          if (teams[t] == players[userId].team){
            if (currentRow != pos.split("-")[1] || currentCol != pos.split("-")[2] ){
              piecesMyTeam.push( pos );
            }
          }
          else {
            piecesOtherTeams.push( pos );
        }
        }
      }
    }


  // Test move for row first
  for (var r=0; r<Math.abs(newRow - currentRow)+1; r++){
    currentSq = "s-"+ (Math.min(newRow, currentRow)+r) + "-" + currentCol;
    if ( (land.indexOf( currentSq ) > -1 )
        || (Math.abs(newRow-currentRow) != r && piecesOtherTeams.indexOf(currentSq) > -1 )
        || (piecesMyTeam.indexOf(currentSq)>-1) ){
        hitLandByRow = true;
        break;
    }
  }
  if (hitLandByRow==false){
    for (var c=0; c<Math.abs(newCol - currentCol)+1; c++){
      currentSq = "s-"+newRow + "-" + (Math.min(newCol, currentCol)+c);
      if ( (land.indexOf( currentSq) > -1 )
          || (Math.abs(newCol-currentCol) != c && piecesOtherTeams.indexOf(currentSq) > -1 )
          || (piecesMyTeam.indexOf(currentSq)>-1) ){
            hitLandByRow = true;
            break;
      }
    }
  }

  // Test move for col first
  for (var c=0; c<Math.abs(newCol - currentCol)+1; c++){
    currentSq = "s-"+currentRow + "-" + (Math.min(newCol, currentCol)+c);
    if ( (land.indexOf(currentSq) >-1 )
        || (Math.abs(newCol-currentCol) != c && piecesOtherTeams.indexOf(currentSq) > -1 )
        || (piecesMyTeam.indexOf(currentSq)>-1) ){
          hitLandByCol = true;
          break;
    }
  }
  if (hitLandByCol==false){
    for (var r=0; r<Math.abs(newRow - currentRow)+1; r++){
      currentSq = "s-"+(Math.min(newRow, currentRow)+r) + "-" + newCol;
      if ( (land.indexOf(currentSq) > -1  )
          || (Math.abs(newRow-currentRow) != r && piecesOtherTeams.indexOf(currentSq) > -1  )
          || (piecesMyTeam.indexOf(currentSq)>-1) ){
            hitLandByCol = true;
            break;
      }
    }
  }

  if ( hitLandByCol==true && hitLandByRow==true ){
    return false;
  }
  return true;
};


function getLegalMoves(currentSquare, dice1, dice2){
  legalMoves = [];
  currentSquareSplit = currentSquare.split("-");
  currentRow = parseInt(currentSquareSplit[1]);
  currentCol = parseInt(currentSquareSplit[2]);
  moves = [dice1, -dice1, 0, dice2, -dice2, 0];
  newPos = [];

  // Get legal moves when turn does not use both die in one direction
  for (var r =0; r<moves.length; r++){
    for (var c =0; c<moves.length; c++){
      if ( (r<3 && c>2) || (r>2 && c<3) ){
        newRow = currentRow + moves[r];
        newCol = currentCol + moves[c];
        newPos.push([newRow, newCol]);

      }
    }
  }
  //Get legal moves when both die are used in same position
  moves = [dice1 + dice2, -dice1+dice2, dice1-dice2, -dice1-dice2];
  for (var r=0; r<moves.length; r++){
    newPos.push([currentRow + moves[r], currentCol]);
  }
  for (var c=0; c<moves.length; c++){
    newPos.push([currentRow, currentCol + moves[c]]);
  }


  for (var pos=0; pos<newPos.length; pos++){
    //Check to make sure move is not out of bounds
    newRow = newPos[pos][0];
    newCol = newPos[pos][1];
    if ( (newRow>=1 && newRow<=20) && (newCol>=1 && newCol<=20) ){
      // Check if any land or ships are on or in between move
      if (checkLand(currentRow, newRow, currentCol, newCol)){
        legalMoves.push("#s-" + newRow + "-" + newCol);
      }
    }
  }

  return legalMoves;
};




for (var i=0; i<land.length; i++){
  d3.select("#"+land[i]).style("fill", "#c2b280");
};
//d3.select('rect').data(land).enter().style("fill", "#c2b280");
anchorSquaresTreasure = ["s-9-10", "s-9-11","s-10-9", "s-11-9", "s-12-10", "s-12-11",
                        "s-10-12", "s-11-12"];
anchorSquaresLanding  = ["s-1-10", "s-20-11", "s-10-1", "s-11-20"];
console.log(anchorSquaresTreasure.concat(anchorSquaresLanding));
var anchors = svg.selectAll('.anchor-landing')
  .data(anchorSquaresTreasure.concat(anchorSquaresLanding)).enter()
    .append("svg:image")
      .attr("href", "static/anchor.png")
      .attr("class", "anchor-landing")
      .attr("x", function(d) {console.log(d); return parseInt(d3.select('#'+d).attr('x')) + 5 ;})
      .attr("y", function(d) {return parseInt(d3.select('#'+d).attr('y')) + 5 })
      .attr("width", 20)
      .attr("height", 20)
      .attr("z-index", -1);
      //  function(d) {'rotate('+ Math.floor(anchorSquares.indexOf(d)*45 / 90)*-90  +' 0 0)'}

// Make matrix dict to get center of each squaresRow
for (var r=1; r<w/square +1; r++){
  for (var c=1; c<h/square +1; c++){
    sq = d3.select('#s-' + r + '-' + c);
    x = parseInt(sq.attr('x')) + (square/2);
    y = parseInt(sq.attr('y')) + (square/2);
    boardMatrix[y + '-' + x] = 's-' + r + '-' + c
  }
}


var drag = d3.behavior.drag()
  .origin(function(d) { return d; })
  .on("dragstart", dragstarted)
  .on("drag", dragged)
  .on("dragend", dropped);

function dragstarted(d){
  if (players[userId].turn == true);{
    d3.event.sourceEvent.stopPropagation();
    //checkIfMovedPieces(d.id);
  }
}

function checkIfMovedPieces(movedPiece){
  for (var i=0; i<nodes_data.length; i++){
    if (nodes_data[i].id != movedPiece){
      nodes_data[i].x = startTurnNodes_data[i].x;
      nodes_data[i].y = startTurnNodes_data[i].y;
      d3.select('#'+nodes_data[i].id).transition().duration(100)
        .attr("cx", nodes_data[i].x)
        .attr("cy", nodes_data[i].y);
    }
  }
}
function dropped(d) {

  if (rolled == false){
    dice1Img.src = 'static/roll-dice.png';
    dice2Img.src = 'static/roll-dice.png';
  }
  d3.select('#'+d.id).moveToFront();

  minD = Math.min(dice1, dice2);
  maxD = Math.max(dice1, dice2);

  var movedP;
  for (var i=0; i<startTurnNodes_data.length; i++){
    if (startTurnNodes_data[i].id == d.id){
      movedP = i;
    }
  }
  newP = boardMatrix[nodes_data[movedP].y+'-'+nodes_data[movedP].x];
  oldP = boardMatrix[startTurnNodes_data[movedP].y+'-'+startTurnNodes_data[movedP].x];

  minM = Math.min(Math.abs(newP[1] - oldP[1]), Math.abs(newP[2] - oldP[2]));
  maxM = Math.max(Math.abs(newP[1] - oldP[1]), Math.abs(newP[2] - oldP[2]));

  if (totalMoved > 0){
    _d = [dice1, dice2].indexOf(totalMoved);
    d2 = _d==0 ? dice2 : dice1;
    d1 = 0;
  }
  else{
    d2 = dice2;
    d1 = dice1;
  }

  //legalMoves = getLegalMoves(oldP, d2, d1);
  legalMoves = global_legal_moves[startTurnNodes_data[movedP].id];



  if (!legalMoves.includes("#"+newP)){
    nodes_data[movedP].x = startTurnNodes_data[movedP].x;
    nodes_data[movedP].y = startTurnNodes_data[movedP].y;
    d3.select('#'+nodes_data[movedP].id).transition().duration(100)
      .attr("cx", nodes_data[movedP].x)
      .attr("cy", nodes_data[movedP].y);
  }
  else {
    totalMoved += minM + maxM;
  };

  setGlobalLegalMoves();

}
  //Called when the drag event occurs (object should be moved)
function dragged(d){

  movedPiece = d.id;
  d.x = d3.event.x;
  d.y = d3.event.y;


  if (d.x > w - square) {
    d.x = w - square;
  }
  else if (d.x < 0) {
    d.x = 0
  }
  if (d.x % square <= square) {
    d.x = Math.floor(d.x/square) * square + (square/2);
  }
  else {
    d.x = Math.ceil(d.x/square) * square + (square/2);
  }


  if (d.y > h - square) {
    d.y = h - square;
  }
  else if (d.y < 0) {
    d.y = 0
  }
  if (d.y % square <= square) {
    d.y = Math.floor(d.y/square) * square + (square/2);
  }
  else {
    d.y = Math.ceil(d.y/square) * square + (square/2);
  }


  d3.select(this)
    .attr("cx", d.x)
    .attr("cy", d.y);
}




/*
coords = piece.node().getBBox();
nodes_data = [
    {x: coords.x + coords.width/2,
     y: coords.y + coords.height/2}
   ];
*/



var restartGame = document.getElementById('restart-game');
restartGame.addEventListener('click', function(){
  if (confirm("Are you sure you want to clear the waters?")) {
    socket.emit('restart-game');
  }
});
socket.on('restart-game', function(){
  for (var player=0; player<Object.keys(players).length; player++){
    //var player_info = players[Object.keys(players)[player]];
    //Iterate over pieces for a given player
    for (var piece=0; piece<players[Object.keys(players)[player]].coords.length; piece++){
      id = players[Object.keys(players)[player]].coords[piece].id;
      d3.select('#' + id).remove();
    }
  }
  d3.select("#treasureOnIsland").remove();
  resetGamePlayeVars();
  console.log(players);
});


var startGame = document.getElementById('start-game');
startGame.addEventListener('click', function(){

  socket.emit('start-game');
});

socket.on('start-game', function(ps){
  gameStarted = true;
  window.players = ps;
  console.log(players);


  for (var player=0; player<Object.keys(players).length; player++){
    //var player_info = players[Object.keys(players)[player]];
    //Iterate over pieces for a given player
    for (var piece=0; piece<players[Object.keys(players)[player]].pieces.length; piece++){
        svg.append("circle")
          .attr("class", players[Object.keys(players)[player]].team + '-ship')
          .attr("id", players[Object.keys(players)[player]].team +'-'+ piece)
          .attr("cx", parseInt(d3.select('#'+players[Object.keys(players)[player]].pieces[piece].pos).attr('x')) + square/2)
          .attr("cy", parseInt(d3.select('#'+players[Object.keys(players)[player]].pieces[piece].pos).attr('y')) + square/2)
          .attr("r", 15)
            .attr("fill", "url(#" + icons[players[Object.keys(players)[player]].team] +")" )
          /*.attr("fill", "static/black-flag.png")*/
          .classed('draggable', true)
          .on("mouseover", function(){
            if  (window.players[userId].turn == true && d3.select(this).attr("id").split("-")[0] == window.players[userId].team){
              d3.select(this)
                .attr("stroke", "#d4af37")
                .attr("stroke-width", "3px");

              if (totalMoved > 0){
                _d = [dice1, dice2].indexOf(totalMoved);
                d2 = _d==0 ? dice2 : dice1;
                d1 = 0;
              }
              else{
                d2 = dice2;
                d1 = dice1;
              }

              thisPiece = d3.select(this).attr("id");
              //position = boardMatrix[startTurnNodes_data[thisPiece].y+'-'+ startTurnNodes_data[thisPiece].x];
              //legalMoves = getLegalMoves(position, d2, d1);
              legalMoves = global_legal_moves[thisPiece];
              highlighted_legal_moves = global_legal_moves[thisPiece];

              for (var sq=0; sq<legalMoves.length; sq++){
                d3.select(legalMoves[sq])
                  .attr("fill", "#b9daeb")
              }
            };
          })
          .on("mouseout", function(){
            if  (window.players[userId].turn == true){
              d3.select(this)
                .attr("stroke", "none")
                .attr("stroke-width", "none");
              if (totalMoved > 0){
                _d = [dice1, dice2].indexOf(totalMoved);
                d2 = _d==0 ? dice2 : dice1;
                d1 = 0;
              }
              else{
                d2 = dice2;
                d1 = dice1;
              }

              thisPiece = d3.select(this).attr("id");
              //position = boardMatrix[startTurnNodes_data[thisPiece].y+'-'+ startTurnNodes_data[thisPiece].x];
              //legalMoves = getLegalMoves(position, d2, d1);
              //legalMoves = global_legal_moves[thisPiece];
              for (var sq=0; sq<highlighted_legal_moves.length; sq++){
                d3.select(highlighted_legal_moves[sq])
                  .attr("fill", "#80b6d2")
              }
            };
          });

    }
  }

/*
d3.selectAll('.square')
  .attr('fill', '#000080')
  .attr('stroke', '#fff');
d3.select(this)
  .attr('fill', '#ADD8E6')
  .attr('stroke', '#D4AF37');
*/

  svg.append("circle")
    .attr("id", "treasureOnIsland")
    .attr("cx", w/2)
    .attr("cy", h/2)
    .attr("r", 15)
    .attr("fill", '#d4af37')
  //Instantate nodes_data upon connection
  for (var p=0; p<players[userId].pieces.length; p++){
    coords = {id: players[userId].team +'-'+ p,
              x: d3.select('#'+players[userId].team +'-'+ p).attr('cx'),
              y: d3.select('#'+players[userId].team +'-'+ p).attr('cy'),
              sq: boardMatrix[d3.select('#'+players[userId].team +'-'+ p).attr('cy') +'-'+d3.select('#'+players[userId].team +'-'+ p).attr('cx')],
              hasGold: false
            }
    nodes_data.push(coords);
  };
  startTurnNodes_data = _.cloneDeep(nodes_data);
  nodes = svg.selectAll("."+players[userId].team+'-ship').call(drag).data(nodes_data);
  players[userId].coords = nodes_data;
  window.players = players;
  for (var p=0; p<Object.keys(players).length; p++){
    if (players[Object.keys(players)[p]].turn == true){
        d3.select("#turn-anchor").remove();
        currentTurnID = Object.keys(players)[p];
        currentTurnColor = players[currentTurnID].team;
        currentTurn = document.getElementById('team-' +currentTurnColor).cells[0];
        currentTurn.appendChild(turnImage);

    }
  }

});

var submit = document.getElementById("submit");
submit.addEventListener('click', function(){
  //players[userId]
  if (players[userId].turn == true && rolled == true){
      players[userId].coords = nodes_data;
      for (var i=0; i<players[userId].coords.length; i++ ){
        players[userId].coords[i].sq = boardMatrix[players[userId].coords[i].y +'-'+ players[userId].coords[i].x]
      }
      startTurnNodes_data = _.cloneDeep(nodes_data);

      // Check if any ships were captured
      movedI = getMoved_i(movedPiece);
      movedPieceX = d3.select('#'+movedPiece).attr('cx');
      movedPieceY = d3.select('#'+movedPiece).attr('cy');
      for (var p=0; p<Object.keys(players).length; p++){
        for (var s=0; s<players[Object.keys(players)[p]].coords.length; s++){
          plyr = players[Object.keys(players)[p]];
          if (plyr.team != players[userId].team && plyr.coords[s].x == movedPieceX && plyr.coords[s].y == movedPieceY){
            // Need to emit broadcast and remove svg from map
            socket.emit('ship-captured', players[Object.keys(players)[p]].coords[s].id);
            //Check if captured ship has gold
            if (players[Object.keys(players)[p]].coords[s].hasGold == true){
              players[userId].coords[movedI].hasGold = true;
              treasureFound('#' + nodes_data[movedI].id);
            };

            // Remove ship from players before broadcasting
            players[Object.keys(players)[p]].coords.splice(s, 1);

          }
        }
      }
      if (treasureOnIsland == true){
        for (var i=0; i<anchorSquaresTreasure.length; i++){
          sqX = parseInt(d3.select('#'+ anchorSquaresTreasure[i]).attr('x')) + (square/2);
          sqY = parseInt(d3.select('#'+ anchorSquaresTreasure[i]).attr('y')) + (square/2);
          if (movedPieceX == sqX && movedPieceY == sqY) {
            if (confirm('Arrrrg! You struck treasure. \nWould you like to take this treasure?')){
              nodes_data[movedI].hasGold = true;
              treasureFound('#' + nodes_data[movedI].id);
            }
          }
        }
      };
      socket.emit('move', {user: userId,
                          players: players });
  };
});

socket.on('ship-captured', function(ship){
  console.log(ship);
  d3.select('#'+ship).remove();
});
socket.on('treasureFoundOnIsland', function(id){
  if (treasureOnIsland == true){
   d3.select('#treasureOnIsland').transition().duration(6000)
        .attr("cx", d3.select(id).attr("cx"))
        .attr("cy", d3.select(id).attr("cy"));
   d3.select('#treasureOnIsland').remove();
  }
  d3.select(id).style("fill", '#d4af37');
  treasureOnIsland = false;
})

socket.on('move', function(playerMoves){
  players = playerMoves.players;
  for (var p=0; p<Object.keys(players).length; p++){
    if (players[Object.keys(players)[p]].turn == true){
      d3.select("#turn-anchor").remove();
      currentTurnID = Object.keys(players)[p];
      currentTurnColor = players[currentTurnID].team;
      currentTurn = document.getElementById('team-' +currentTurnColor).cells[0];
      currentTurn.appendChild(turnImage);
    }
  }
  for (var i=0; i<playerMoves.players[playerMoves.user].coords.length; i++){
    d3.select('#'+playerMoves.players[playerMoves.user].coords[i].id).transition().duration(1500)
      .attr("cx", playerMoves.players[playerMoves.user].coords[i].x)
      .attr("cy", playerMoves.players[playerMoves.user].coords[i].y);
  }



  rolled = false;
  dice1Img.classList.remove("animate");
  dice2Img.classList.remove("animate");
  dice1 = 999;
  dice2 = 999;
  totalMoved = 0;
  global_legal_moves = {};
});
