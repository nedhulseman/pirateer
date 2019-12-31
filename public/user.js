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

//Get square centers
var boardMatrix = {};

// Dice
var rolled = false;
var dice1 = 1;
var dice2 = 1;
var dice1Img = document.getElementById('dice-1');
var dice2Img = document.getElementById('dice-2');
var roll = document.getElementById("roll-dice");
roll.addEventListener('click', function(){
  if (gameStarted == true && players[userId].turn == true && rolled == false){
    rolled = true;
    dice1 = Math.floor(Math.random() * 6) +1;
    dice2 = Math.floor(Math.random() * 6) +1;
    socket.emit('dice-roll', [dice1, dice2]);
  }
});
socket.on('dice-roll', function(die){
  d1 = die[0];
  d2 = die[1];
  dice1Img.src = 'dice-'+d1+'.png';
  dice2Img.src = 'dice-'+d2+'.png';
  dice1Img.classList.add("animate");
  dice2Img.classList.add("animate");
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
});

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
    checkIfMovedPieces(d.id);
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
  minD = Math.min(dice1, dice2);
  maxD = Math.max(dice1, dice2);

  var movedP;
  for (var i=0; i<startTurnNodes_data.length; i++){
    if (startTurnNodes_data[i].id == d.id){
      movedP = i;
    }
  }
  newP = boardMatrix[nodes_data[movedP].y+'-'+nodes_data[movedP].x].split("-");
  oldP = startTurnNodes_data[movedP].sq.split("-");

  minM = Math.min(Math.abs(newP[1] - oldP[1]), Math.abs(newP[2] - oldP[2]));
  maxM = Math.max(Math.abs(newP[1] - oldP[1]), Math.abs(newP[2] - oldP[2]));
  if (minD != minM && maxD != maxM){
    nodes_data[movedP].x = startTurnNodes_data[movedP].x;
    nodes_data[movedP].y = startTurnNodes_data[movedP].y;
    d3.select('#'+nodes_data[movedP].id).transition().duration(100)
      .attr("cx", nodes_data[movedP].x)
      .attr("cy", nodes_data[movedP].y);
  }
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
          .classed('draggable', true);
    }
  }
  //Instantate nodes_data upon connection
  for (var p=0; p<players[userId].pieces.length; p++){
    coords = {id: players[userId].team +'-'+ p,
              x: d3.select('#'+players[userId].team +'-'+ p).attr('cx'),
              y: d3.select('#'+players[userId].team +'-'+ p).attr('cy'),
              sq: boardMatrix[d3.select('#'+players[userId].team +'-'+ p).attr('cy') +'-'+d3.select('#'+players[userId].team +'-'+ p).attr('cx')]
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
    }
  }

});


var submit = document.getElementById("submit");
submit.addEventListener('click', function(){
  //players[userId]
  console.log(players);
  if (players[userId].turn == true && rolled == true){
      players[userId].coords = nodes_data;
      for (var i=0; i<players[userId].coords.length; i++ ){
        players[userId].coords[i].sq = boardMatrix[players[userId].coords[i].y +'-'+ players[userId].coords[i].x]
      }
      startTurnNodes_data = _.cloneDeep(nodes_data);
      socket.emit('move', {user: userId,
                          players: players });
  };

});
socket.on('move', function(playerMoves){
  players = playerMoves.players;
  for (var p=0; p<Object.keys(players).length; p++){
    if (players[Object.keys(players)[p]].turn == true){
        currentTurn.innerHTML = "Current Turn: " + players[Object.keys(players)[p]].team;
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
});
