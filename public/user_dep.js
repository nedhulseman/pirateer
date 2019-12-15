//make connection
var socket = io.connect('http://localhost:4000');


//Create board
var board_size = 20;
var board_widths = ''
var cell_width = '25'
var board = document.getElementById('board');
for (i=0; i<board_size*board_size; i++){
  board.innerHTML += '<div class="cell"></div>'
}


var cells = document.getElementsByClassName("cell");

for (i=0; i<board_size; i++){
  board_widths += cell_width+'px '
}
board.style.cssText += "grid-template-columns: "+board_widths;
board.style.cssText += "grid-template-rows: "+board_widths;

cells[5].innerHTML = "<svg height='25' width='25'><circle cx='12.5' cy='12.5' r='10' fill='red'/></svg>"



/*
//query DOM
var message = document.getElementById('message');
var handle = document.getElementById('handle');
var btn = document.getElementById('send');
var output = document.getElementById('output');
var feedback = document.getElementById('feedback');


//emit events
btn.addEventListener('click', function(){
  socket.emit('chat', {
    message: message.value,
    handle: handle.value
  });
});

message.addEventListener('keypress', function(){
  socket.emit('typing', handle.value);
});


//listen for addEventListener
socket.on('chat', function(data){
  feedback.innerHTML = "";
  output.innerHTML += '<p><strong>'+data.handle+': </strong>'+data.message+'</p>';
  message.value = "";
});



//listen for addEventListener
socket.on('typing', function(data){
  feedback.innerHTML = '<p><em>'+data+' is typing....</em></p>';
});
*/
