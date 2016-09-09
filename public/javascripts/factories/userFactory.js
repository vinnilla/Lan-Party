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
		// var round = 0;
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

		factory.joinRoom = function(name) {
			factory.room = name;
			socket.emit('join-room', {roomName: name});
		}

		socket.on('connect-room', function(data) {
			if (data.room[0].name === factory.name) {
				console.log('leader');
				factory.leader = true;
			}
			factory.team = data.room;
			factory.team.forEach(function(player) {
				player.ready = false;
			})
			// console.log(factory.team);
			$rootScope.$broadcast('newPlayers');
			$state.transitionTo('game.start.lobby');
		})

		// ---| INTERMISSION LOGIC |--- \\
		socket.on('round-end', function(team, status) {
			if (factory.leader) {
				// convert points to exp and save to backend
				factory.team.forEach(function(player) {
					// 10 xp/point
					var exp = player.score * 10;
					console.log(player.name, exp);
					$http.put('/api/users', {
						name: player.name,
						exp: exp
					})
					.then(function(response) {
						// console.log(response);
						if (response.data.error) {
							console.error(response.data.error)
						}
						else {
							// response.data has the updated user information
							// response.data.experience is how much exp the user has
						}
					})
				})
			}// end of factory.leader if

			if (status === 'victory') {
				document.removeEventListener('keydown', userInput);
				factory.message = `END OF ROUND ${round}`;
				$rootScope.$broadcast('refresh');
				startOnce = false;

				setTimeout(function() {
					factory.message = `STARTING ROUND ${round+1}`;
					$rootScope.$broadcast('refresh');
					// start round
					socket.emit('start-game', team, factory.room);
				},5000)
			}
			else if (status === 'failure') {
				document.removeEventListener('keydown', userInput);
				factory.message = `YOU LOST!`;
				$rootScope.$broadcast('refresh');
				roundEnd();

				setTimeout(function() {
					factory.message = '';
					$state.go('game.start.lobby');
					// $rootScope.$broadcast('refresh');
				},3000);
			}
		})

						function roundEnd() {
							clearInterval(collisionID);
							clearInterval(spawnID);
							clearInterval(scaleID);
							factory.zombies.forEach(function(zombie, zIndex) {
								// console.info('deleting zombie')
								clearInterval(zombie.intID);
							})
							// round = 0;
							factory.zombies = [];
							factory.bullets.forEach(function(bullet) {
								// console.info('deleting bullet')
								clearInterval(bullet.intID);
							})

							// $rootScope.$broadcast('resetEXP')
								
							factory.bullets = [];
							startOnce = false;
							scaling = 1;
						}

		// ---| GAME LOGIC |--- \\
		socket.on('start-game', function(team) {
			// ensure zombies are empty
			factory.zombies = [];
			// console.log(startOnce);
			if (!startOnce) {
			// movement | shooting | reload
			$state.transitionTo('game.start.playing');

			// round++;
			factory.message = `STARTING`;
			$rootScope.$broadcast('refresh');
			factory.team = team;
			var numZombies = baseNumZombies * factory.team.length;

			// clear message
			setTimeout(function() {
				factory.message = '';
				$rootScope.$broadcast('refresh');
			}, 2000)

			setTimeout(function() {
				document.addEventListener('keydown', userInput)
				// set canvas up
				canvas = document.getElementById('game_canvas');
				ctx = canvas.getContext('2d');
				var border = $('#game');
				ctx.canvas.width = border.width();
				ctx.canvas.height = border.height()*0.9;
				// ctx.canvas.width = 1080;
				// ctx.canvas.height = 720;
				// initialize team
				factory.team.forEach(function(player) {
					// console.log(player);
					player.alive = true;
					player.score = 0;
					player.bullets = player.stats['Clip Size'];
					player.x = 50;
					player.y = 300;
					ctx.fillStyle = player.color;
					ctx.fillRect(player.x, player.y, 50, 50);
				})

				var noMoreSpawning = false;

				// scale the zombie spawns
				scaleID = setInterval(function() {
					// console.info('scaling increases');
					scaling += 0.05;
					// console.log(scaling);
				}, 1000)

				// check collision
				collisionID = setInterval(function() {
					// console.info('collision');
					checkCollision();
					// if (noMoreSpawning && factory.zombies.length <= 0) {
					// 	clearInterval(collisionID);
					// 	TODO transition to intemission partial
					// 	socket.emit('round-end', factory.team, factory.room, 'victory');
					// }
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

						function userInput(e) {
							if (e.keyCode === 87 || e.keyCode === 68 || e.keyCode === 83 || e.keyCode === 65) {
								factory.sendMovement(e.key);
							}
							else if (e.keyCode === 32) {
								factory.sendShot(e.code); //code = "Space"
							}
							else if (e.keyCode === 82) {
								factory.sendReload(e.key);
							}
						}

						factory.sendMovement = function(key) {
							socket.emit('move-player', {player:factory.name, key: key}, factory.room);
						}

						factory.sendShot = function(key) {
							socket.emit('player-shoot', {player:factory.name, key: key, color: randomColor}, factory.room);
						}

						factory.sendReload = function(key) {
							socket.emit('player-reload', {player:factory.name, key:key}, factory.room);
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
									// zombie movement
									var intID = setInterval(function(){
										// save intID into zombie object
										zombie.intID = intID;
										// move zombie left
										zombie.x -= 2*scaling;
									}, frames)
									one = true;
									factory.zombies.push(zombie);
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
												$rootScope.$broadcast('refresh');
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
										document.removeEventListener('keydown', userInput)
									}
								})
							})

							// zombie and left border collision
							factory.zombies.forEach(function(zombie) {
								if(zombie.x <= 0) {
									// console.warn('zombie has reached the house!');
									//LOST
									if (factory.leader) { // prevent desync loss (remove if desync is extreme)
										socket.emit('round-end', factory.team, factory.room, 'failure');
									}
								}
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

		socket.on('player-reload', function(reload) {
			var playerIndex;
			factory.team.forEach(function(player, index) {
				if(player.name === reload.player) {
					playerIndex = index;
				}
			})
			factory.team[playerIndex].bullets = "..."
			setTimeout(function() {
				factory.team[playerIndex].bullets = factory.team[playerIndex].stats['Clip Size'];
			}, 2000-(factory.team[playerIndex].stats['Reload Speed']*200))
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

				if (factory.team[playerIndex].bullets > 0 && factory.team[playerIndex].bullets != "...") {
					// create projectile object
					var bullet = 
						{id: ranNum,
							x: factory.team[playerIndex].x,
							y: factory.team[playerIndex].y+24,
							color: factory.team[playerIndex].color,
							owner: factory.team[playerIndex].name
						};

					factory.team[playerIndex].bullets--;
							
					// set up movement
					var intID = setInterval(function() {
						// add intID to bullet object
						bullet.intID = intID;
						// move bullet right
						bullet.x += distancePerTick;

						// check if bullet has reached the edge of the canvas
						if (bullet.x > canvas.width) {
							// // deduct two points from player if bullet does not hit a zombie
							// factory.team.forEach(function(player, pIndex) {
							// 	if (bullet.owner === player.name) {
							// 		factory.team[pIndex].score -= 2;
							// 	}
							// })
							// remove bullet from array
							factory.bullets = factory.bullets.filter(function(bullet) {
								if(bullet.id != ranNum) {
									return bullet;
								}
							})
							clearInterval(intID);
						}// end of canvas edge check

					}, frames)
					// add bullet to array
					factory.bullets.push(bullet);
				}// end of checking if player has bullets
				// else {
				// 	// initialize reload
				// 	reload(playerIndex)
				// }
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
					ctx.strokeText(player.bullets, player.x+5, player.y+30)
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

		factory.startGame = function() {
			var test = true;
			factory.team.forEach(function(player) {
				if (!player.ready) {
					// console.log(player);
					test = false;
				}
			})
			if (test) {
				socket.emit('start-game', factory.team, factory.room);
			}
		}

		factory.updatePlayer = function() {
			socket.emit('relay-team', factory.team, factory.room);
		}

		socket.on('relay-team', function(team) {
			factory.team = team;
			// console.log(factory.team);
		})

		return factory;
	}

}());