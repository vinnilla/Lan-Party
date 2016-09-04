(function() {
	'use strict';

	angular.module('lanParty')
		.factory('userData', main);

	main.$inject = ['$http', '$state', "$rootScope"];

	function main($http, $state, $rootScope) {
		var factory = {};
		// connect to socket
		var socket = io();

		factory.login

		factory.name;
		factory.password;

		socket.on('get-socket', function(data) {
			factory.socket = data.socket;
			console.info(factory.socket);
		})

		socket.on('connect-room', function(data) {
			factory.room = data.room;
			$rootScope.$broadcast('newPlayers');
			$state.transitionTo('game.start.lobby');
		})

		socket.on('start-game', function(team) {
			factory.team = team;
			console.log(factory.team)
			$rootScope.$broadcast('startGame');
		})

		socket.on('move-player', function(move) {
			// console.log(move);
			var player = $(`#${move.player}`);
			console.log(player)
			if (move.key === 'w') {
				player.css('top', `${parseInt(player.css('top')) - 10}px`);
				console.log(player.css('top'));
			} else if (move.key === 's') {
				player.css('top', `${parseInt(player.css('top')) + 10}px`);
			} else if (move.key === 'a') {
				player.css('left', `${parseInt(player.css('left')) - 10}px`);
			} else if (move.key === 'd') {
				player.css('left', `${parseInt(player.css('left')) + 10}px`);
			}

		})

		socket.on('error', function(data) {
			console.warn(data.msg);
			factory.error = data.msg;
			$rootScope.$broadcast('error');
		})

		factory.userDatabase = function() {
			//retrieve user array from database
			$http.get('/api/users')
				.then(function(users) {
					factory.users = users;
				}, function(err) {
					console.error(err);
				})
		}

		factory.login = function() {
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

		factory.isLoggedIn = function() {
			if (factory.name) {
				return true;
			}
			else {
				return false;
			}
		}

		factory.getName = function() {
			if(!factory.error) {
				return factory.name;
			}
		}

		factory.getError = function() {
			return factory.error;
		}

		factory.getTeam = function() {
			return factory.room;
		}

		factory.joinRoom = function(name) {
			socket.emit('join-room', {roomName: name});
		}

		factory.startGame = function() {
			$state.transitionTo('game.start.playing');
			socket.emit('start-game', factory.room);
		}

		factory.sendMovement = function(key) {
			console.log(key);
			socket.emit('move-player', {player:factory.name, key: key});
		}

		function addPlayer(player,token) {
			// keep user data in factory
			factory.user = player;
			socket.emit('add-player', {name:player.name, socket: player.socket, class: player.class, exp: player.experience, token: token})
			// switch to game state
			$state.transitionTo('game.home')
		}

		return factory;
	}

}());