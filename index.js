var express = require('express');
var socket = require('socket.io')



//App Setup
var app = express();
var server = app.listen(4000, function(){
  console.log('listening to request on port 4000!')
});


//static files
app.use(express.static('public'));
var teams = ['black', 'blue', 'white', 'green']
var pieces = {
              "black": ["s-11-1", "s-12-1", "s-13-1"],
              "blue":  ["s-1-11", "s-1-12", "s-1-13"],
              "white": ["s-8-20", "s-9-20", "s-10-20"],
              "green": ["s-20-8", "s-20-9", "s-20-10"]
           };
var player = {};
var player_counter = 0;
var clients = [];






//socket Setup
var io = socket(server);

io.on('connection', function(socket){
  if (player_counter <= 3){
    player[socket.id] = {
      player_num: player_counter,
      team: teams[player_counter],
      pieces: pieces[teams[player_counter]],
      shipClass: teams[player_counter]+'-ship'
    }

    io.sockets.emit('player-join', player);
  player_counter += 1;
  }
  console.log(player);

  socket.on('start-game', function(players){
    io.sockets.emit('start-game', players);
  });

  socket.on('move', function(pieces){
    console.log('testing 1-2-3....')
    io.sockets.emit('move', pieces);
  });
});
