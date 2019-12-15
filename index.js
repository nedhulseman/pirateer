var express = require('express');
var socket = require('socket.io')



//App Setup
var app = express();
var server = app.listen(4000, function(){
  console.log('listening to request on port 4000!')
});


//static files
app.use(express.static('public'));

//socket Setup
var io = socket(server);

io.on('connection', function(socket){
  console.log('made socket connection', socket.id);

  socket.on('move', function(pieces){
    console.log('testing 1-2-3....')
    io.sockets.emit('move', pieces);
  });
});
