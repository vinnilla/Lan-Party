(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController)
		.controller('userController', userController)
		.controller('gameController', gameController);

	mainController.$inject = ['userData']
	userController.$inject = ['userData']
	gameController.$inject = ['userData', "$rootScope", "$scope"]

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

	function gameController(userData, $rootScope, $scope) {

		$scope.userData = userData;
		$scope.player = userData.user;

		$scope.joinRoom = function() {
			userData.joinRoom($scope.room);
		}

		$scope.startGame = function() {
			userData.startGame();
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