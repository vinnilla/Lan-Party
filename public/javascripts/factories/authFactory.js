(function() {
	'use strict';

	angular.module('lanParty')
		.factory('authData', main);

	main.$inject = ['socketData', '$http', '$state']

	function main(socket, $http, $state) {
		var factory = {};

		// generate random color
		var r = Math.floor(Math.random()*155)+100;
		var g = Math.floor(Math.random()*155)+100;
		var b = Math.floor(Math.random()*155)+100;
		// var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
		var randomColor = `rgb(${r},${g},${b})`;

		// check server for all logged in users
		socket.emit('check-players');

		socket.on('check-players', function(data) {
			factory.allPlayers = data;
		})

		factory.login = function() {
			// check if account is already logged in
			var unique = true;
			factory.allPlayers.forEach(function(player) {
				if (player.name === factory.name) {
					unique = false;
					console.log('not unique');
					factory.error = "Account is already logged in."
				}
			})

			if (unique) {
			$http.post('/api/login', 
				{name:factory.name, 
				password: factory.password,
				socket: factory.socket})
			.then(function(response) {
				if(response.data.error) {
					factory.error = response.data.error;
				}
				else {
					factory.error = undefined;
					localStorage.token = response.data.token;
					addPlayer(response.data.user, response.data.token);
				}
			})
			}
		}

		factory.register = function() {
			$http.post('/api/register',
				{name: factory.name,
				password: factory.password,
				socket: factory.socket})
			.then(function(response) {
				if(response.data.error) {
					factory.error = response.data.error;
				}
				else {
					factory.error = undefined;
					localStorage.token = response.data.token;
					addPlayer(response.data.user, response.data.token);
				}
			})
		}

						function addPlayer(player,token) {
							// keep user data in factory
							factory.user = player;
							socket.emit('add-player', {name:player.name, socket: socket.id, class: player.class, exp: player.experience, color: randomColor, token: token})
							// switch to game state
							$state.transitionTo('game.home')
						}


		return factory;
	}// end of main

}());