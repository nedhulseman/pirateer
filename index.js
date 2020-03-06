var express = require('express');
var socket = require('socket.io');




//App Setup
var app = express();
var server = app.listen(4000, function(){
  console.log('listening to request on port 4000!')
});


//static files
app.use(express.static('public'));
var teams = ['black', 'blue', 'white', 'green']
var startingBlocks = {
              "black": ["s-11-1", "s-12-1", "s-13-1"],
              "blue":  ["s-1-11", "s-1-12", "s-1-13"],
              "white": ["s-8-20", "s-9-20", "s-10-20"],
              "green": ["s-20-8", "s-20-9", "s-20-10"]
           };
var player = {};
var player_counter = 0;
var clients = [];
var gameInProgress = false;
var playOrder;
var playersTurn;


var orderTeams = function (array) {

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};



//socket Setup
var io = socket(server);

io.on('connection', function(socket){
  if (player_counter <= 3){
    player[socket.id] = {
      player_num: player_counter,
      team: teams[player_counter],
      //startingPos: pieces[teams[player_counter]],
      pieces : [ {id: teams[player_counter]+'-0',
                  pos: startingBlocks[teams[player_counter]][0]},
                 {id: teams[player_counter]+'-1',
                  pos: startingBlocks[teams[player_counter]][1]},
                 {id: teams[player_counter]+'-2',
                  pos: startingBlocks[teams[player_counter]][2]} ],
      coords : [],
      shipClass: teams[player_counter]+'-ship',
      turn: false,
    };

    io.sockets.emit('player-join', player);
  player_counter += 1;
  }

  socket.on('start-game', function(players){
    if (gameInProgress == false){
      playOrder = orderTeams(Object.keys(player));
      playersTurn = 0;
      players[playOrder[playersTurn]].turn = true;
      for (var i=0; i<playOrder.length; i++){
        players[playOrder[i]].playOrder = i;
      }
      gameInProgress = true;
      player = players;
      io.sockets.emit('start-game', players);
    }
  });
  socket.on('treasureFoundOnIsland', function(id){
    io.sockets.emit('treasureFoundOnIsland', id);
  })
  socket.on('dice-roll', function(die){
    io.sockets.emit('dice-roll', die);
  });

  socket.on('ship-captured', function(ship){
    io.sockets.emit('ship-captured', ship);
  });
  socket.on('move', function(playerMoves){
    playerMoves.players[playerMoves.user].turn = false;
    if (playersTurn == playOrder.length - 1){
      playersTurn = 0;
    }
    else {
      playersTurn += 1;
    }
    //player[playerMoves.user].coords = playerMoves.players[playerMoves.user].coord;
    playerMoves.players[playOrder[playersTurn]].turn = true;
    //playerMoves.players = _.cloneDeep(player);
    //console.log('Server player');
    //console.log(player);
    io.sockets.emit('move',playerMoves);
  });
});
