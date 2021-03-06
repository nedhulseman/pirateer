var userId;
//make connection
var socket = io.connect('http://localhost:4000');
socket.on('connect', function() {
  userId = socket.id;
  document.getElementById('user-identifier').innerHTML = "Welcome user: " + userId;
  /*
  socket.emit('player-join', {
    x : d3.select("#piece-1").attr("cx"),
    y : d3.select("#piece-1").attr("cy")
  });
  socket.on('player-join', function(player){
    document.getElementById('team').innerHTML = "Team: " + player[socket.id].team;
  });
  */
});
var players;
socket.on('player-join', function(ps){
  players = ps;
  teamHTML = ""
  var teamLists = document.getElementById('team-assignments');
  for (var p=0; p<Object.keys(ps).length; p++){
    teamHTML += "<p>" + Object.keys(ps)[p] +": "+ps[Object.keys(ps)[p]].team+"</p>";
  }
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
var currentTurn = document.getElementById('current-turn');
var currentTurnID;

//Get square centers
var boardMatrix = {};

// Dice
var rolled = false;
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
function getMoved_i(id){
  for (var i=0; i<nodes_data.length; i++){
    if (nodes_data[i].id == id){
      return i;
    }
  }
}
roll.addEventListener('click', function(){
  if (gameStarted == true && players[userId].turn == true && rolled == false){
    rolled = true;
    dice1 = Math.floor(Math.random() * 6) +1;
    dice2 = Math.floor(Math.random() * 6) +1;
    dice1 = 1;
    dice2= 2;
    socket.emit('dice-roll', [dice1, dice2]);
  }
});
socket.on('dice-roll', function(die){
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
      fill: '#000080',
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
        || (Math.abs(newRow-currentRow) != Math.min(newRow, currentRow)+r && piecesOtherTeams.indexOf(currentSq) > -1 && newCol - currentCol == 0 )
        || (piecesMyTeam.indexOf(currentSq)>-1) ){
        hitLandByRow = true;
        break;
    }
  }
  if (hitLandByRow==false){
    for (var c=0; c<Math.abs(newCol - currentCol)+1; c++){
      currentSq = "s-"+newRow + "-" + (Math.min(newCol, currentCol)+c);
      if ( (land.indexOf( currentSq) > -1 )
          || (Math.abs(newCol-currentCol) != Math.min(newCol, currentCol)+c && piecesOtherTeams.indexOf(currentSq) > -1 )
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
        || (Math.abs(newCol-currentCol) != Math.min(newCol, currentCol)+c && piecesOtherTeams.indexOf(currentSq) > -1 && newRow-currentRow == 0 )
        || (piecesMyTeam.indexOf(currentSq)>-1) ){
          hitLandByCol = true;
          break;
    }
  }
  if (hitLandByCol==false){
    for (var r=0; r<Math.abs(newRow - currentRow)+1; r++){
      currentSq = "s-"+(Math.min(newRow, currentRow)+r) + "-" + newCol;
      if ( (land.indexOf(currentSq) > -1  )
          || (Math.abs(newRow-currentRow) != Math.min(newRow, currentRow)+r && piecesOtherTeams.indexOf(currentSq) > -1  )
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

  for (var r =0; r<moves.length; r++){
    for (var c =0; c<moves.length; c++){
      if ( (r<3 && c>2) || (r>2 && c<3) ){
        newRow = currentRow + moves[r];
        newCol = currentCol + moves[c];

        //Check to make sure move is not out of bounds
        if ( (newRow>=1 && newRow<=20) && (newCol>=1 && newCol<=20) ){
          // Check if any land or ships are on or in between move
          if (checkLand(currentRow, newRow, currentCol, newCol)){
            legalMoves.push("#s-" + newRow + "-" + newCol);
          }
        }
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
var anchors = svg.selectAll('image')
  .data(anchorSquaresTreasure.concat(anchorSquaresLanding)).enter()
    .append("svg:image")
      .attr("href", "static/anchor.png")
      .attr("x", function(d) {return parseInt(d3.select('#'+d).attr('x')) + 5 })
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

/*
//var piece_svg = d3.select("#s-12")
var piece = svg.append("circle")
    .attr("class", "ships")
    .attr("id", "piece-1")
    .attr("cx", 60)
    .attr("cy", 60)
    .attr("r", 15)
    .attr("fill", "red")
    .classed('draggable', true);
*/
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

  legalMoves = getLegalMoves(oldP, d2, d1);
  console.log("----  Dropped ----");
  console.log('oldP: #'+oldP);
  console.log("New Piece: #"+newP);
  console.log("--- Dice -----")
  console.log('d1: '+d1);
  console.log('d2: '+d2);
  console.log("----------Legal Moves-----")
  console.log(legalMoves);


  if (!legalMoves.includes("#"+newP)  ){//}|| totalMoved + minM + maxM > totalMoved){
    nodes_data[movedP].x = startTurnNodes_data[movedP].x;
    nodes_data[movedP].y = startTurnNodes_data[movedP].y;
    d3.select('#'+nodes_data[movedP].id).transition().duration(100)
      .attr("cx", nodes_data[movedP].x)
      .attr("cy", nodes_data[movedP].y);
  }
  else {
    totalMoved += minM + maxM;
  };


  /*
  if (minM == 0){
    if ( (totalMoved + maxM <= minD+maxD) && (maxM != maxD || maxM != minD ) && (maxM != minD + maxD && maxM != Math.abs(minD - maxD)) ){
      nodes_data[movedP].x = startTurnNodes_data[movedP].x;
      nodes_data[movedP].y = startTurnNodes_data[movedP].y;
      d3.select('#'+nodes_data[movedP].id).transition().duration(100)
        .attr("cx", nodes_data[movedP].x)
        .attr("cy", nodes_data[movedP].y);
    }
  }
  else{
    if (minD != minM || maxD != maxM){
      nodes_data[movedP].x = startTurnNodes_data[movedP].x;
      nodes_data[movedP].y = startTurnNodes_data[movedP].y;
      d3.select('#'+nodes_data[movedP].id).transition().duration(100)
        .attr("cx", nodes_data[movedP].x)
        .attr("cy", nodes_data[movedP].y);
    }
  }
  totalMoved += maxM;
  */
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







var startGame = document.getElementById('start-game');
startGame.addEventListener('click', function(){
  socket.emit('start-game', players);
});

socket.on('start-game', function(players){
  gameStarted = true;
  //Iterate over players
  /*playerOrder = serverPlayers[1];
  orderedList = document.getElementById('team-order');
  for (var i=0; i<Object.keys(players).length.length; i++){
    orderedList.innerHTML += "<li>" + playerOrder[i]+"</li>";
  }
  */
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
          .attr("fill", players[Object.keys(players)[player]].team)
          .classed('draggable', true)
          .on("mouseover", function(){
            if  (players[userId].turn == true && d3.select(this).attr("id").split("-")[0] == players[userId].team){
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

              thisPiece = parseInt(d3.select(this).attr("id").split("-")[1]);
              position = boardMatrix[startTurnNodes_data[thisPiece].y+'-'+ startTurnNodes_data[thisPiece].x];
              legalMoves = getLegalMoves(position, d2, d1);
              for (var sq=0; sq<legalMoves.length; sq++){
                d3.select(legalMoves[sq])
                  .attr("fill", "#ADD8E6")
              }
            };
          })
          .on("mouseout", function(){
            if  (players[userId].turn == true){
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

              thisPiece = parseInt(d3.select(this).attr("id").split("-")[1]);
              position = boardMatrix[startTurnNodes_data[thisPiece].y+'-'+ startTurnNodes_data[thisPiece].x];
              legalMoves = getLegalMoves(position, d2, d1);
              for (var sq=0; sq<legalMoves.length; sq++){
                d3.select(legalMoves[sq])
                  .attr("fill", "#000080")
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
  console.log(players);
  window.players = players;
  for (var p=0; p<Object.keys(players).length; p++){
    if (players[Object.keys(players)[p]].turn == true){
        currentTurn.innerHTML = "Current Turn: " + players[Object.keys(players)[p]].team;
        currentTurnID = Object.keys(players)[p];
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

            console.log('Captured Coords!');
            console.log(players[Object.keys(players)[p]].coords);
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
        currentTurn.innerHTML = "Current Turn: " + players[Object.keys(players)[p]].team;
        currentTurnID = Object.keys(players)[p];
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
});
