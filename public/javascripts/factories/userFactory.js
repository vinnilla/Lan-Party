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

		var r = Math.floor(Math.random()*155)+100;
		var g = Math.floor(Math.random()*155)+100;
		var b = Math.floor(Math.random()*155)+100;
		var randomColor = `rgb(${r},${g},${b})`;
		console.log(randomColor);
		// var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

		var bottom;
		var right;

		var frames = 15;

		socket.on('get-socket', function(data) {
			factory.socket = data.socket;
			console.info(factory.socket);
		})

		socket.on('connect-room', function(data) {
			factory.room = data.room;
			$rootScope.$broadcast('newPlayers');
			$state.transitionTo('game.start.lobby');
			setTimeout(function() {
			factory.room.forEach(function(player) {
				console.log(player);
				var name = $(`#${player.name}-name`).css('color', player.color);
				var image = $(`#${player.name}-image`).css('background-color', player.color);
			})
			},500)
		})

		socket.on('start-game', function(team) {
			// movement
			document.addEventListener('keydown', function(e) {
				if (e.keyCode === 87 || e.keyCode === 68 || e.keyCode === 83 || e.keyCode === 65) {
					factory.sendMovement(e.key);
				}
			})
			// shooting
			document.addEventListener('keydown', function(e) {
				if (e.keyCode === 32) {
					factory.sendShot(e.code); //code = "Space"
				}
			})
			$state.transitionTo('game.start.playing');
			factory.team = team;
			console.log(factory.team);
			// $rootScope.$broadcast('startGame');
			setTimeout(function() {
				getDimensions();
				console.log(bottom);
				factory.team.forEach(function(player) {
					var element = $(`#${player.name}-player`);
					element.css('background-color', player.color);
					element.css('top', bottom/2);
				})
			},200)

			// spawn zombies
			setInterval(function() {
				spawnZombie();
			}, 1000)

			// check collsion
			// setInterval(function() {
			// 	checkCollision();
			// },frames);
		})

		socket.on('move-player', function(move) {
			getDimensions();
			var distancePerMove = 50;
			var player = $( `#${move.player}-player`);
			var height = player.height();
			var width = player.width();
			if (move.key === 'w' && parseInt(player.css('top')) > distancePerMove) {
				player.css('top', `${parseInt(player.css('top')) - distancePerMove}px`);
			} else if (move.key === 's' && parseInt(player.css('top')) < (bottom-distancePerMove-height)) {
				player.css('top', `${parseInt(player.css('top')) + distancePerMove}px`);
			} else if (move.key === 'a' && parseInt(player.css('left')) > distancePerMove) {
				player.css('left', `${parseInt(player.css('left')) - distancePerMove}px`);
			} else if (move.key === 'd' && parseInt(player.css('left')) < (right-distancePerMove-width)) {
				player.css('left', `${parseInt(player.css('left')) + distancePerMove}px`);
			}
		})

		socket.on('player-shoot', function(input) {
			getDimensions();
			var ranNum = Math.floor(Math.random()*10000);
			var distancePerTick = 25;
			var player = $(`#${input.player}-player`);
			if (input.key === "Space") {
				// spawn a projectile at the player's position
				var top = `${parseInt(player.css('top'))+20}px`;
				var left = `${parseInt(player.css('left'))+50}px`;
				$('<div/>', {
					id: `${input.player}_bullet${ranNum}`,
					'class': 'bullet'
				}).appendTo('#playing');
				var bullet = $(`#${input.player}_bullet${ranNum}`);
				bullet.css('top', top);
				bullet.css('left', left);
				bullet.css('background-color', input.color);
				// make the projectile move
				var intID = setInterval(function() {
					bullet.css('left', `${parseInt(bullet.css('left'))+distancePerTick}px`);

					// check collision with zombies
					checkCollision(bullet);

					// delete bullet once border is hit
					if (parseInt(bullet.css('left'))+distancePerTick > right) {
						bullet.remove();
					}
				},frames)				
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
			
			socket.emit('start-game', factory.room);
		}

		factory.sendMovement = function(key) {
			socket.emit('move-player', {player:factory.name, key: key});
		}

		factory.sendShot = function(key) {
			socket.emit('player-shoot', {player:factory.name, key: key, color: randomColor});
		}

		function addPlayer(player,token) {
			// keep user data in factory
			factory.user = player;
			socket.emit('add-player', {name:player.name, socket: player.socket, class: player.class, exp: player.experience, color: randomColor, token: token})
			// switch to game state
			$state.transitionTo('game.home')
		}

		function getDimensions() {
			// dimensions of playing field
			var gameBoard = $(`#playing`);
			bottom = gameBoard.height();
			right = gameBoard.width();
			// console.log(gameBoard, bottom, right);
		}

		function spawnZombie() {
			getDimensions();
			var y = Math.floor(Math.random() * (bottom-100));
			var remainder = y%50;
			y = 50+y-remainder;
			var ranNum = Math.floor(Math.random()*10000);
			$('<div/>', {
				'class': 'zombie',
				id: `z-${ranNum}`
			}).appendTo('#playing')
			.css('top', y)
			.css('left', right-50);
			var zombie = $(`#z-${ranNum}`);
			var intID = setInterval(function() {
				var currentPos = parseInt(zombie.css('left'))-1;
				zombie.css('left', `${currentPos}px`);
			}, frames)
		}

		function checkCollision(bullet) {
			// TODO optimize with nlog(n)
			// var bullets = $(".bullet");
			var zombies = $(".zombie");
			var bulletPos = bullet.position();
			// for (var i=0; i< bullets.length; i++) {
			// 	var bulletPos = $(bullets[i]).position();
				for (var j=0; j<zombies.length; j++) {
					var zomPos = $(zombies[j]).position();
					var zomHeight = $(zombies[j]).height();
					var zomWidth = $(zombies[j]).width();
					// check to see if bullet position and zombie position range match
					if (bulletPos.left > zomPos.left && bulletPos.left < (zomPos.left+zomWidth) &&
							bulletPos.top > zomPos.top && bulletPos.top < (zomPos.top+zomHeight) ) {
						bullet.remove();
						$(zombies[j]).remove();
					}
				}
			//}

		}

		return factory;
	}

}());