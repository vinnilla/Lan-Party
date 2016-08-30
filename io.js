var io = require('socket.io')();
var players = [];

io.on('connection', function(socket) {
	console.log(socket.id);
	socket.emit('get-socket', {socket: socket.id})


	socket.on('add-player', function(data) {
		players.push(data);
		console.info(`On connect: `);
		console.info(players);
	})


	socket.on('disconnect', function() {
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