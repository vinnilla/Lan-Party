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

		factory.team;
		factory.bullets = [];
		factory.zombies = [];

		var r = Math.floor(Math.random()*155)+100;
		var g = Math.floor(Math.random()*155)+100;
		var b = Math.floor(Math.random()*155)+100;
		var randomColor = `rgb(${r},${g},${b})`;
		console.log(randomColor);
		// var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

		var bottom;
		var right;

		var frames = 15;

		var canvas;
		var ctx;

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
			// console.log(factory.team);
			// $rootScope.$broadcast('startGame');
			setTimeout(function() {
				canvas = document.getElementById('game_canvas');
				ctx = canvas.getContext('2d');
				var border = $('#game');
				ctx.canvas.width = border.width();
				ctx.canvas.height = border.height()*0.9;
				// getDimensions();
				// console.log(bottom);
				factory.team.forEach(function(player) {
					player.score = 0;
					player.x = 50;
					player.y = 300;
					console.log(player);
					factory.player = player;
					ctx.fillStyle = player.color;
					ctx.fillRect(player.x, player.y, 50, 50);
					// element.css('top', bottom/2);
				})
				// spawn zombies
				setInterval(function() {
					spawnZombie();
				}, 1000/team.length)

				// check collsion
				setInterval(function() {
					checkCollision();
				},frames);
			},200)

		})

		socket.on('move-player', function(move) {
			var playerIndex;
			// find player that moved
			factory.team.forEach(function(player, index) {
				if (player.name === move.player) {
					playerIndex = index;
				}
			})
			var distancePerMove = 50;
			// check movement keys
			if (move.key === 'w' && (factory.team[playerIndex].y-distancePerMove) >= 0) {
				factory.team[playerIndex].y -= distancePerMove;
			}
			if (move.key === 's' && (factory.team[playerIndex].y+distancePerMove) <= canvas.height) {				
				factory.team[playerIndex].y += distancePerMove;
			}
			if (move.key === 'a' && (factory.team[playerIndex].x-distancePerMove) >= 0) {
				factory.team[playerIndex].x -= distancePerMove;
			}
			if (move.key === 'd' && (factory.team[playerIndex].x+distancePerMove) <= canvas.width) {
				factory.team[playerIndex].x += distancePerMove;
			}
			drawAll();
		})

		socket.on('player-shoot', function(input) {
			var playerIndex;
			// find player that moved
			factory.team.forEach(function(player, index) {
				if (player.name === input.player) {
					playerIndex = index;
				}
			})
			var distancePerTick = 25;
			// check input
			if (input.key === 'Space') {
				var ranNum = Math.floor(Math.random()*10000);
				// create projectile object
				var bullet = {id: ranNum,
											x: factory.team[playerIndex].x,
											y: factory.team[playerIndex].y+24,
											color: factory.team[playerIndex].color,
											owner: factory.team[playerIndex].name};
				// add bullet to array
				factory.bullets.push(bullet); 				
				// set movement
				var intID = setInterval(function() {
					// store bullet index
					var bulletIndex;
					factory.bullets.forEach(function(bullet, index) {
						if (bullet.id === ranNum) {
							bulletIndex = index;
						}
					})
					// add intID to bullet object
					factory.bullets[bulletIndex].intID = intID;
					// move bullet right
					factory.bullets[bulletIndex].x += distancePerTick;
					if (factory.bullets[bulletIndex].x > canvas.width) {
						// remove bullet from array when boundary is hit
						factory.bullets = factory.bullets.filter(function(bullet) {
							if (bullet.id != ranNum) {
								return bullet;
							}
						})
						clearInterval(intID);
						// deduct 2 points from player for spamming 
						// factory.team.forEach(function() {
							
						// })
					}
				}, frames)
			}
			console.log(factory.bullets.length)
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

		function spawnZombie() {
			// console.log(new Date().getTime());
			// var y = Math.floor(Math.random() * canvas.height-100);
			var y = ((new Date().getTime()) % canvas.height)-100;
			var remainder = y%50;
			y = 50+y-remainder;
			console.log(y);
			var ranNum = Math.floor(Math.random()*10000);
			// create new zombie
			var zombie = {id: ranNum, y: y, x:canvas.width};
			factory.zombies.push(zombie);
			// zombie movement
			var intID = setInterval(function(){
				// find zombie index
				var zomIndex;
				factory.zombies.forEach(function(zombie, index) {
					if(zombie.id === ranNum) {
						zomIndex = index;
					}
				})
				// save intID into zombie object
				factory.zombies[zomIndex].intID = intID;
				// move zombie left
				factory.zombies[zomIndex].x -= 2;
			}, frames)
		}

		function checkCollision() {
			// bullet zombie collision
			factory.bullets.forEach(function(bullet, bIndex) {
				factory.zombies.forEach(function(zombie, zIndex) {
					if (bullet.y > zombie.y && bullet.y < zombie.y+50 &&
							bullet.x+5 > zombie.x) {
						// remove from arrays
						factory.bullets.splice(bIndex, 1);
						factory.zombies.splice(zIndex, 1);
						// clear intervals
						clearInterval(bullet.intID);
						clearInterval(zombie.intID);
						// add score to player
						factory.team.forEach(function(player, pIndex) {
							if (bullet.owner === player.name) {
								factory.team[pIndex].score += 5;
							}
						})
					}
				})				
			})

			// player zombie collision
			factory.team.forEach(function(player, pIndex) {
				factory.zombies.forEach(function(zombie) {
					if (player.x+25 > zombie.x && player.x+25 < zombie.x+50 &&
							player.y+25 > zombie.y && player.y+25 < zombie.y+50) {
						factory.team.splice(pIndex,1);
					}
				})
			})

			drawAll();
		}

			// function checkCollisionMelee(weapon) {
			// 	var weapon_length = 50
			// 	var zombies = $('.zombie');
			// 	var weaponPos = weapon.position();
			// 	var weaponEnd = weaponPos.left + weapon_length;
			// 	var weaponID = weapon.attr('id');
			// 	var playerName = weaponID.substring(0,weaponID.indexOf('_'));
			// 	for (var j=0; j<zombies.length; j++) {
			// 		var zomPos = $(zombies[j]).position();
			// 		var zomHeight = $(zombies[j]).height();
			// 		var zomWidth = $(zombies[j]).width();
			// 		// check to see if bullet position and zombie position range match
			// 		if (weaponEnd > zomPos.left && weaponEnd < (zomPos.left+zomWidth) &&
			// 				weaponPos.top > zomPos.top && weaponPos.top < (zomPos.top+zomHeight) ) {
			// 			weapon.remove();
			// 			$(zombies[j]).remove();
			// 			factory.team.forEach(function(player) {
			// 				if(player.name === playerName) {
			// 					player.score += 5;
			// 				}
			// 			})
			// 			console.log(factory.team[0].score);
			// 		}
			// 	}
			// }

			// CANVAS FUNCTIONS

			function drawAll() {
				// clear canvas
				ctx.clearRect(0,0,canvas.width, canvas.height);
				drawPlayers();
				drawBullets();
				drawZombies();
			}

			function drawPlayers() {
				factory.team.forEach(function(player) {
					ctx.fillStyle = player.color;
					ctx.fillRect(player.x, player.y, 50, 50);
					ctx.font = '24px serif';
					ctx.strokeText(player.score, player.x+5, player.y+30)
				})
			}

			function drawBullets() {
				factory.bullets.forEach(function(bullet) {
					ctx.fillStyle = bullet.color;
					ctx.fillRect(bullet.x, bullet.y, 10, 3);
				})
			}

			function drawZombies() {
				factory.zombies.forEach(function(zombie) {
					ctx.fillStyle = 'green';
					ctx.fillRect(zombie.x, zombie.y, 50, 50);
				})
			}

		return factory;
	}

}());