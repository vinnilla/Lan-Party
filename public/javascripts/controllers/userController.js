(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController)
		.controller('userController', userController)
		.controller('profileController', profileController)
		.controller('gameController', gameController);

	mainController.$inject = ['userData', 'authData']
	userController.$inject = ['userData', 'authData']
	profileController.$inject = ['userData', 'imageData', '$scope', '$http', '$state']
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

	function profileController(userData, images, $scope, $http, $state) {
		$scope.userData = userData;
		var canvas = document.getElementById('playerPreview');
		var ctx = canvas.getContext('2d');
		ctx.canvas.width = 50;
		ctx.canvas.height = 50;
		ctx.fillStyle = 'white';
		ctx.fillRect(12, 2, 25, 40);
		ctx.drawImage(images.playerNeutral, 0, 0);

		$("#picker").on('dragstop.spectrum', function(e, color) {
			console.log(color);
			ctx.fillStyle = color;
			ctx.fillRect(12, 2, 25, 40);
			ctx.drawImage(images.playerNeutral, 0, 0);
		})

		$scope.updateProfile = function() {
			var color = $("#picker").spectrum('get');
			color = `rgb(${color._r}, ${color._g}, ${color._b})`;
			$http.put('/api/users', {
				name: $scope.userData.name,
				color: color
			})
			.then(function(response) {
				console.log(response);
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
				if ($scope.userData.team) {
					$scope.userData.team.forEach(function(player) {
						if ($scope.player.name === player.name) {
							// update player stats
							$scope.player.stats = player.stats;
						}
					})// end of forEach
					// update $scope.upgrades
					if ($scope.player.stats) {
						$scope.upgrades.forEach(function(stat) {
							stat.value = $scope.player.stats[stat.name];
							// subtract cost of upgrades from exp
							$scope.player.experience -= (stat.value-stat.base)*stat.cost;
						})
					}
				}// end of if team exists
			})
		})

		$scope.userData = userData;
		$scope.authData = authData;
		$scope.player = authData.user;

		$scope.upgrades = [
		{name: "Clip Size", value: 12, cost: 1000, base: 12, tick: 1},
		{name: "Reload Speed", value: 1, cost: 10000, base: 1, tick: 1}
		];
		$scope.changeStat = function(stat, type) {
			$scope.upgrades.forEach(function(upgrade) {
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
				}
			})
		}
		$scope.updateStats = function() {
			$scope.userData.team.forEach(function(player) {
				if (player.name === $scope.player.name) {
					player.stats = {};
					$scope.upgrades.forEach(function(stat) {
						player.stats[stat.name] = stat.value;
					})
					player.ready = true;
					$scope.userData.updatePlayer();
					// $scope.$apply();
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
			// 		$scope.upgrades.forEach(function(stat, index) {
			// 			$scope.upgrades[index].value = player.stats[stat.name];
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