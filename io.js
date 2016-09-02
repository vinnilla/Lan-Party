var io = require('socket.io')();
var players = [];
var rooms = {};

io.on('connection', function(socket) {
	console.log(socket.id);
	socket.emit('get-socket', {socket: socket.id})
	var player;

	socket.on('add-player', function(data) {
		players.push(data);
		player = data;
		console.info(`On connect: `);
		console.info(players);
	})

	socket.on('join-room', function(data) {
		function joinRoom() {
			console.log(rooms);
			console.info(`${socket.id} has joined ${data.name}`);
			// update player object with room name
			player.room = data.name;
			io.to(data.name).emit('connect-room', {user: data.name});
		}

		socket.join(data.name);
		// keep track of rooms and number of players in them
		if(!rooms[data.name]) {
			rooms[data.name] = 1;
			joinRoom();
		} 
		else if(rooms[data.name] < 4) {
			rooms[data.name]++;
			joinRoom();
		}
		else { // a 5th player is trying to join the room
			io.emit('error', {msg:"That room is already full. Please try to join another room."})
		}
	})

	socket.on('disconnect', function() {
		//disconnect player from room
		if (player) {
			//update hash table
			rooms[player.room]--;
			console.log(rooms);
		}
		players = players.filter(function(player) {
			// remove disconnected player from array
			if(player.socket != socket.id) {
				return player;
			}
		})// end of filter
		console.info(`After disconnect: `);
		console.info(players);
	})// end of disconnect
})// end of io connection

module.exports = io;