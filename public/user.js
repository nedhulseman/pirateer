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
  teamLists.innerHTML = teamHTML;



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
  .on("drag", dragged);

function dragstarted(d){
  d3.event.sourceEvent.stopPropagation();
}

  //Called when the drag event occurs (object should be moved)
function dragged(d){
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


var nodes_data = [];
var nodes;

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

socket.on('start-game', function(serverPlayers){
  //Iterate over players
  console.log(Object.keys(serverPlayers));
  for (var player=0; player<Object.keys(serverPlayers).length; player++){
    var player_info = serverPlayers[Object.keys(serverPlayers)[player]];
    //Iterate over pieces for a given player
    for (var piece=0; piece<player_info.pieces.length; piece++){
        svg.append("circle")
          .attr("class", player_info.team + '-ship')
          .attr("id", player_info.team +'-'+ piece)
          .attr("cx", parseInt(d3.select('#'+player_info.pieces[piece]).attr('x')) + square/2)
          .attr("cy", parseInt(d3.select('#'+player_info.pieces[piece]).attr('y')) + square/2)
          .attr("r", 15)
          .attr("fill", player_info.team)
          .classed('draggable', true);
    }
  }
  //Instantate nodes_data upon connection
  for (var p=0; p<players[userId].pieces.length; p++){
    coords = {id: players[userId].team +'-'+ p,
              x: d3.select('#'+players[userId].team +'-'+ p).attr('cx'),
              y: d3.select('#'+players[userId].team +'-'+ p).attr('cy')}
    nodes_data.push(coords);
  };
  nodes = svg.selectAll("."+players[userId].team+'-ship').call(drag).data(nodes_data);
});




var submit = document.getElementById("submit");
submit.addEventListener('click', function(){
  console.log("testing....")
  socket.emit('move', nodes_data);
});
socket.on('move', function(pieces){
  console.log(pieces);
  for (var i=0; i<pieces.length; i++){
    d3.select('#'+pieces[i].id).transition().duration(1500)
      .attr("cx", pieces[i].x)
      .attr("cy", pieces[i].y);
  }

});
