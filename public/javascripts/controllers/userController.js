(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController)
		.controller('userController', userController)
		.controller('gameController', gameController);

	mainController.$inject = ['userData']
	userController.$inject = ['userData']
	gameController.$inject = ['userData']

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

	function gameController(userData) {
		var self = this;
		this.userData = userData;
		this.player = userData.user;
		this.room;

		this.joinRoom = function() {
			userData.joinRoom(self.room);

		}
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