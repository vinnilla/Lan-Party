(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController)
		.controller('userController', userController);

	mainController.$inject = ['userData']
	userController.$inject = ['userData']

	function mainController(userData) {
		var self = this;
		this.userData = userData; // pointer to factory
	}// end of mainController

	function userController(userData) {
		// connect to socket
		var socket = io();
		var self = this;
		this.userData = userData; // pointer to factory

		this.name; // updated dynamically with name input field
		this.password;
		this.conpassword;
		this.loggedin; // updated with join()

		this.chooseRegister = function() {
			console.info('registering')
			return true;
		}

		this.chooseLogin = function() {
			return true;
		}

		this.register = function() {
			if(self.password === self.conpassword) {
				// send data to factory/backend
			}
			else {
				self.error = "Passwords do not match";
			}
		}

		this.login = function () {
			userData.name = self.name; // send name to factory
			userData.password = self.password;
			// TODO talk to backend
			self.loggedin = userData.isLoggedIn(); // pull boolean for login status
			socket.emit('add-player', {name: self.name}); // send player object to server
			console.info('joined');
		}// end of join function

	}// end of userController


})();