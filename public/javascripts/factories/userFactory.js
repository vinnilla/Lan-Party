(function() {
	'use strict';

	angular.module('lanParty')
		.factory('userData', main);

	main.$inject = ['$http', '$state', "$rootScope"];

	function main($http, $state, $rootScope) {
		var factory = {};
		// connect to socket
		var socket = io();

		// variables updated with controllers
		factory.login;
		factory.name;
		factory.password;

		// game variables
		factory.team;
		factory.bullets = [];
		factory.zombies = [];
		var frames = 15;
		var baseNumZombies = 1;
		var round = 0;
		var canvas;
		var ctx;

		var collisionID;
		var scaleID;
		var spawnID;
		var startOnce = false;
		var scaling = 1;

		var r = Math.floor(Math.random()*155)+100;
		var g = Math.floor(Math.random()*155)+100;
		var b = Math.floor(Math.random()*155)+100;
		var randomColor = `rgb(${r},${g},${b})`;
		// var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

		socket.on('get-socket', function(data) {
			factory.socket = data.socket;
		})

		socket.on('connect-room', function(data) {
			if (data.room[0].name === factory.name) {
				console.log('leader');
				factory.leader = true;
			}
			factory.team = data.room;
			$rootScope.$broadcast('newPlayers');
			$state.transitionTo('game.start.lobby');
			setTimeout(function() {
			data.room.forEach(function(player) {
				var name = $(`#${player.name}-name`).css('color', player.color);
				var image = $(`#${player.name}-image`).css('background-color', player.color);
			})
			},500)
		})

		// ---| INTERMISSION LOGIC |--- \\
		socket.on('round-end', function(team, status) {
			// convert points to exp and save to backend
			factory.team.forEach(function(player) {
				// 5 xp/point
				var exp = player.score * 5;
				console.log(exp);
				$http.put('/api/users', {
					name: player.name,
					exp: exp
				})
				.then(function(response) {
					// console.log(response);
					if (response.data.error) {
						console.log(response.data.error)
					}
					else {
						// response.data has the updated user information
						// response.data.experience is how much exp the user has
					}
				})
			})

			if (status === 'victory') {
				document.removeEventListener('keydown', shoot);
				factory.message = `END OF ROUND ${round}`;
				$rootScope.$broadcast('refresh');
				startOnce = false;

				setTimeout(function() {
					document.removeEventListener('keydown', movement);
					factory.message = `STARTING ROUND ${round+1}`;
					$rootScope.$broadcast('refresh');
					// start round
					socket.emit('start-game', team, factory.room);
				},5000)
			}
			else if (status === 'failure') {
				document.removeEventListener('keydown', shoot);
				document.removeEventListener('keydown', movement);
				factory.message = `YOU LOST!`;
				$rootScope.$broadcast('refresh');
				roundEnd();

				setTimeout(function() {
					factory.message = '';
					$state.go('game.start.lobby');
				},3000);
			}
		})

						function roundEnd() {
							clearInterval(collisionID);
							clearInterval(spawnID);
							clearInterval(scaleID);
							factory.zombies.forEach(function(zombie, zIndex) {
								console.info('deleting zombie')
								clearInterval(zombie.intID);
							})
							round = 0;
							factory.zombies = [];
							factory.bullets.forEach(function(bullet) {
								console.info('deleting bullet')
								clearInterval(bullet.intID);
							})
							factory.bullets = [];
							startOnce = false;
							scaling = 1;
						}

		// ---| GAME LOGIC |--- \\
		socket.on('start-game', function(team) {
			console.log(startOnce);
			if (!startOnce) {
			// movement
			document.addEventListener('keydown', movement)
			// shooting
			document.addEventListener('keydown', shoot)
			$state.transitionTo('game.start.playing');

			round++;
			factory.message = `STARTING`;
			$rootScope.$broadcast('refresh');
			factory.team = team;
			var numZombies = baseNumZombies * round * factory.team.length;

			// clear message
			setTimeout(function() {
				factory.message = '';
				$rootScope.$broadcast('refresh');
			}, 2000)

			setTimeout(function() {
				// set canvas up
				canvas = document.getElementById('game_canvas');
				ctx = canvas.getContext('2d');
				var border = $('#game');
				ctx.canvas.width = border.width();
				ctx.canvas.height = border.height()*0.9;
				// initialize team
				factory.team.forEach(function(player) {
					player.alive = true;
					player.score = 0;
					player.x = 50;
					player.y = 300;
					ctx.fillStyle = player.color;
					ctx.fillRect(player.x, player.y, 50, 50);
				})

				var noMoreSpawning = false;

				// scale the zombie spawns
				scaleID = setInterval(function() {
					console.info('scaling increases');
					scaling += 0.5;
					console.log(scaling);
				}, 10000)

				// check collision
				collisionID = setInterval(function() {
					// console.info('collision');
					checkCollision();
					if (noMoreSpawning && factory.zombies.length <= 0) {
						clearInterval(collisionID);
						// TODO transition to intermission partial
						socket.emit('round-end', factory.team, factory.room, 'victory');
					}
				},frames);
				
				// spawn zombies
			 	spawnID = setInterval(function() {
			 		// console.info('spawning');
					if (numZombies <= 0) {
						noMoreSpawning = true;
						clearInterval(spawnID);
						console.log('no more zombies will spawn');
					} else {
						spawnZombie();
						// numZombies--;
					}
				}, 1000/team.length) // scale spawning with number of players

			},1000)// end of setTimeout
			}// end of startOnce if statement

			startOnce = true;
		})
						function movement(e) {
							if (e.keyCode === 87 || e.keyCode === 68 || e.keyCode === 83 || e.keyCode === 65) {
								factory.sendMovement(e.key);
							}
						}

						function shoot(e) {
							if (e.keyCode === 32) {
								factory.sendShot(e.code); //code = "Space"
							}
						}

						factory.sendMovement = function(key) {
							socket.emit('move-player', {player:factory.name, key: key}, factory.room);
						}

						factory.sendShot = function(key) {
							socket.emit('player-shoot', {player:factory.name, key: key, color: randomColor}, factory.room);
						}

						function spawnZombie() {
							var one = false;
							// var y = ((new Date().getTime()) % canvas.height)-100;

							// only the leader will ask server to generate random spawn point
							if (factory.leader) {
								socket.emit('get-random', canvas.height, factory.room);
							}
							socket.on('get-random', function(randomHeight) {
								var ranNum = Math.floor(Math.random()*10000);

								if (!one) {
									// create new zombie
									var zombie = {id: ranNum, y: randomHeight, x:canvas.width};
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
										factory.zombies[zomIndex].x -= 2*scaling;

										// check zombie collision with left border
										if (factory.zombies[zomIndex].x <= 0) {
											console.log('zombie has reached the house!');
											factory.zombies.splice(zomIndex, 1);
											clearInterval(intID);
											// LOST
											socket.emit('round-end', factory.team, factory.room, 'failure');
										}
									}, frames)
									one = true;
								}
							})
							
						}

						function checkCollision() {
							// bullet zombie collision
							factory.bullets.forEach(function(bullet, bIndex) {
								factory.zombies.forEach(function(zombie, zIndex) {
									if (bullet.y > zombie.y && bullet.y < zombie.y+50 &&
											bullet.x+5 > zombie.x && bullet.x+5 < zombie.x+50) {
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
										factory.team[pIndex].alive = false;
									}
								})
							})

							drawAll();
						}

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
				var bullet = 
					{id: ranNum,
						x: factory.team[playerIndex].x,
						y: factory.team[playerIndex].y+24,
						color: factory.team[playerIndex].color,
						owner: factory.team[playerIndex].name
					};
				// add bullet to array
				factory.bullets.push(bullet); 				
				// set up movement
				var intID = setInterval(function() {
					// store bullet index
					var bulletIndex;
					factory.bullets.forEach(function(bullet, index) {
						if (bullet.id === ranNum) {
							bulletIndex = index;
						}
					})
					if (bulletIndex) {
						// add intID to bullet object
						factory.bullets[bulletIndex].intID = intID;
						// move bullet right
						factory.bullets[bulletIndex].x += distancePerTick;
						// check if bullet has reached the edge of the canvas
						if (factory.bullets[bulletIndex].x > canvas.width) {
							// deduct 2 points from player for spamming 
							factory.team.forEach(function(player, pIndex) {
								if (factory.bullets[bulletIndex].owner === player.name) {
									factory.team[pIndex].score -= 2;
								}
							})
							// remove bullet from array
							factory.bullets = factory.bullets.filter(function(bullet) {
								if (bullet.id != ranNum) {
									return bullet;
								}
							})
							clearInterval(intID);
						}// end of edge of canvas check
					}// end of if bulletIndex
				}, frames)
			}
		})

		// ---| CANVAS FUNCTIONS |--- \\
		function drawAll() {
			// clear canvas
			ctx.clearRect(0,0,canvas.width, canvas.height);
			drawPlayers();
			drawBullets();
			drawZombies();
		}

		function drawPlayers() {
			factory.team.forEach(function(player) {
				if (player.alive) {
					ctx.fillStyle = player.color;
					ctx.fillRect(player.x, player.y, 50, 50);
					ctx.font = '24px serif';
					ctx.strokeText(player.score, player.x+5, player.y+30)
				}
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

		// ---| GENERAL |--- \\
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
						function addPlayer(player,token) {
							// keep user data in factory
							factory.user = player;
							socket.emit('add-player', {name:player.name, socket: player.socket, class: player.class, exp: player.experience, color: randomColor, token: token})
							// switch to game state
							$state.transitionTo('game.home')
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
			return factory.team;
		}

		factory.joinRoom = function(name) {
			factory.room = name;
			socket.emit('join-room', {roomName: name});
		}

		factory.startGame = function() {
			socket.emit('start-game', factory.team, factory.room);
		}

		return factory;
	}

}());