(function() {
	'use strict';

	angular.module('lanParty')
		.factory('userData', main);

	main.$inject = ['$http', '$state'];

	function main($http, $state) {
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