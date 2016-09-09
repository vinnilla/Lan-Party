(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController)
		.controller('userController', userController)
		.controller('gameController', gameController);

	mainController.$inject = ['userData']
	userController.$inject = ['userData']
	gameController.$inject = ['userData', "$rootScope", "$scope", "$http"]

	function mainController(userData) {
		var self = this;
		this.userData = userData; // pointer to factory
	}// end of mainController

	function userController(userData) {
		var self = this;
		this.userData = userData; // pointer to factory

		this.name; // updated dynamically with name input field
		this.password;
		this.conpassword;

		this.register = function() {
			// check if passwords match
			if(self.password === self.conpassword) {
				// send data to factory
				userData.name = self.name;
				userData.password = self.password;
				// factory function that talks to backend
				userData.register();
			}
			else {
				self.error = "Passwords do not match";
			}
		}

		this.login = function () {
			// send data to factory
			userData.name = self.name;
			userData.password = self.password;
			// factory function that talks to backend
			self.error = userData.login();

		}// end of join function

	}// end of userController

	function gameController(userData, $rootScope, $scope, $http) {

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
					$scope.upgrades.forEach(function(stat) {
						stat.value = $scope.player.stats[stat.name];
						// subtract cost of upgrades from exp
						$scope.player.experience -= (stat.value-stat.base)*stat.cost;
					})


				}
			})
		})

		$scope.userData = userData;
		$scope.player = userData.user;

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
			userData.joinRoom($scope.room);
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