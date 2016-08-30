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
		this.loggedin; // updated with join()

		this.register = function() {
			// check if passwords match
			if(self.password === self.conpassword) {
				// send data to factory/backend
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
			userData.name = self.name; // send name to factory
			userData.password = self.password;
			// factory function that talks to backend
			userData.login();
			self.loggedin = userData.isLoggedIn(); // pull boolean for login status
			console.info('joined');
		}// end of join function

	}// end of userController

	function gameController(userData) {
		var self = this;
	}// end of gameController


})();