(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController)
		.controller('userController', userController)
		.controller('profileController', profileController)
		.controller('gameController', gameController);

	mainController.$inject = ['userData', 'authData']
	userController.$inject = ['userData', 'authData']
	profileController.$inject = ['userData', 'imageData', 'socketData', '$scope', '$http', '$state']
	gameController.$inject = ['userData', 'authData', 'imageData', "$rootScope", "$scope", "$http"]

	function mainController(userData, authData) {
		var self = this;
		this.userData = userData; // pointer to factory
		this.authData = authData;
	}// end of mainController

	function userController(userData, authData) {
		var self = this;
		this.userData = userData; // pointer to factory
		this.authData = authData;

		this.name; // updated dynamically with name input field
		this.password;
		this.conpassword;

		this.register = function() {
			// check if passwords match
			if(self.password === self.conpassword) {
				// send data to factory
				userData.name = self.name;
				authData.name = self.name;
				authData.password = self.password;
				// factory function that talks to backend
				authData.register();
			}
			else {
				self.error = "Passwords do not match";
			}
		}

		this.login = function () {
			// send data to factory
			userData.name = self.name;
			authData.name = self.name;
			authData.password = self.password;
			// factory function that talks to backend
			self.error = authData.login();

		}// end of join function

	}// end of userController

	function profileController(userData, images, socket, $scope, $http, $state) {

		$scope.userData = userData;
		var canvas = document.getElementById('playerPreview');
		var ctx = canvas.getContext('2d');

		$http.post('/api/user', {
			name: $scope.userData.name
		})
		.then(function(response) {
			$scope.color = response.data.color;
			// set up color picker
			$('#picker').spectrum({
				preferredFormat: "rgb",
				showInput: true,
				// showAlpha: true,
				showInitial: true,
				showButtons: false, // hide cancel and choose buttons
				containerClassName: 'colorPickerMenu',
				replacerClassName: 'colorPicker',
				color: $scope.color
			})
			// set up player preview
			ctx.canvas.width = 50;
			ctx.canvas.height = 50;
			ctx.fillStyle = $scope.color;
			ctx.fillRect(12, 2, 25, 40);
			ctx.drawImage(images.playerNeutral, 0, 0);
		})



		$("#picker").on('dragstop.spectrum', function(e, color) {
			ctx.fillStyle = color;
			ctx.fillRect(12, 2, 25, 40);
			ctx.drawImage(images.playerNeutral, 0, 0);
		})

		$scope.updateProfile = function() {
			var color = $("#picker").spectrum('get');
			color = `rgb(${Math.floor(color._r)}, ${Math.floor(color._g)}, ${Math.floor(color._b)})`;
			$http.put('/api/users', {
				name: $scope.userData.name,
				color: color
			})
			.then(function(response) {
				// update server with new user color
				socket.emit('updateColor', {name: $scope.userData.name, color: color});
				$state.go('game.home')
			})
		}
	}// end of profileController

	function gameController(userData, authData, imageData, $rootScope, $scope, $http) {

		$scope.$on('$viewContentLoaded', function() {
			$http.post('/api/refresh', {name: $scope.player.name})
			.then(function(response) {
				// update player data with backend
				$scope.player = response.data;
				// update $scope.weapons
				if ($scope.player.weapons) {
					$scope.weapons.forEach(function(weapon, wIndex) {
						if (weapon.weaponName === 'Pistol') {
							weapon.stats.forEach(function(stat, sIndex) {
								stat.value = $scope.player.weapons[wIndex].stats[sIndex].value;
								// subtract cost of weapons from exp
								$scope.player.experience -= (stat.value-stat.base)*stat.cost;
							})// end of inner for loop for stats
						}
					})// end of outer for loop for weapons
				}
			})
		})

		$scope.userData = userData;
		$scope.authData = authData;
		$scope.player = authData.user;

		$scope.weapons = [
		{weaponName: 'Pistol', stats: [
		{name: "Clip Size", value: 12, cost: 1000, base: 12, tick: 1},
		{name: "Reload Speed", value: 1, cost: 10000, base: 1, tick: 1}
		]}
		];

		$scope.changeStat = function(stat, type) {
			$scope.weapons.forEach(function(weapon) {

				if (weapon.weaponName === 'Pistol') { // CHANGE WHEN MORE WEAPONS ARE ADDED

					weapon.stats.forEach(function(upgrade) {
						if (upgrade.name === stat) {
							if (type === '+' && $scope.player.experience-upgrade.cost > 0) {
								upgrade.value += upgrade.tick;
								changeEXP(-upgrade.cost);
							}
							else if (type === '-'){
								if(upgrade.value-upgrade.tick >= upgrade.base) {
									upgrade.value -= upgrade.tick;
									changeEXP(upgrade.cost);
								}
							}
						}// end of upgrade.name === stat if
					})// end of inner for loop (stats) 
				}// end of weapon name match if statement
			})// end of outer for loop (weapons)
		}

		$scope.updateStats = function() {
			$scope.userData.team.forEach(function(player) {
				if (player.name === $scope.player.name) {
					player.weapons = [];
					$scope.weapons.forEach(function(weapon) {
						var newWeapon = {}; // create weapon object that matches weaponSchema
						newWeapon.weaponName = weapon.weaponName;
						newWeapon.stats = [];
						weapon.stats.forEach(function(stat) {
							var newStat = {}; // create stat object that matches statSchema
							newStat.statName = stat.name;
							newStat.value = stat.value;
							newWeapon.stats.push(newStat);
						}) // end of inner for loop for stats
						player.weapons.push(newWeapon);
					}) // end of outer for loop for weapons
					player.ready = true;
					// send data to server io
					$scope.userData.updatePlayer();
					// send data to database
					$http.put('/api/users', {
						name: player.name,
						weapons: player.weapons
					})
				}
			})
		}

		function changeEXP(cost) {
			$scope.player.experience += cost;
		}

		$scope.joinRoom = function() {
			$scope.userData.group = true;
			userData.joinRoom($scope.room);
		}

		$scope.soloRoom = function() {
			$scope.userData.group = false;
			userData.joinRoom(Math.floor(Math.random()*10000+1000).toString());
		}

		$rootScope.$on('error', function() {
			$scope.error = userData.error;
			$scope.$apply();
		})

		$rootScope.$on('newPlayers', function() {
			$scope.team = userData.team;
			$scope.$apply();
		})

		$rootScope.$on('startGame', function() {
			$scope.team = userData.team;
			$scope.$apply();
		})

		$rootScope.$on('refresh', function() {
			$scope.$apply();
		})

		$rootScope.$on('resetEXP', function() {
			// userData.team.forEach(function(player) {
			// 	if (player.name === $scope.player.name) {
			// 		console.log(player);
			// 		$scope.player = player;
			// 		$scope.weapons.forEach(function(stat, index) {
			// 			$scope.weapons[index].value = player.stats[stat.name];
			// 		})
			// 	}
			// })
			$http.post('/api/refresh', {name: $scope.player.name})
			.then(function(response) {
				$scope.player = response.data;
				console.log($scope.player);
			})
		})

	}// end of gameController


	// function UserController($http) {
	// 	var self = this;

	// 	$http({
	// 		url: '/user',
	// 		method: 'get',
	// 		params: {

	// 		}
	// 	})
	// }

})();