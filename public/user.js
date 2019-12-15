//make connection
var socket = io.connect('http://localhost:4000');
socket.on('connect', function() {
  const userId = socket.id;
  document.getElementById('user-identifier').innerHTML = "Welcome user: " + socket.id;
});

var submit = document.getElementById("submit")



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
        return 's-' + (n + 1) + (i + 1);
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


//var piece_svg = d3.select("#s-12")
var piece = svg.append("circle")
    .attr("class", "ships")
    .attr("id", "piece-1")
    .attr("cx", 60)
    .attr("cy", 60)
    .attr("r", 15)
    .attr("fill", "red")
    .classed('draggable', true);

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


coords = piece.node().getBBox();
nodes_data = [
    {x: coords.x + coords.width/2,
     y: coords.y + coords.height/2}];
nodes = svg.selectAll(".draggable").call(drag).data(nodes_data);




submit.addEventListener('click', function(){
  console.log("testing....")
  socket.emit('move', {
    x : d3.select("#piece-1").attr("cx"),
    y : d3.select("#piece-1").attr("cy")
  });
});
socket.on('move', function(pieces){
  console.log('server worked...');
  d3.select("#piece-1").transition().duration(500)
    .attr("cx", pieces.x)
    .attr("cy", pieces.y);
});
