var  io = require('socket.io')();
var players = [];

io.on('connection', function(socket) {
	console.log(socket.id);

	socket.on('add-player', function(data) {
		players.push(data);
		console.log(players);
	})

})// end of io connection

module.exports = io;