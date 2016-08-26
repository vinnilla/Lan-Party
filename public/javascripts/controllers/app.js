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

		// this.name; // updated dynamically with name input field
		// this.loggedin; // updated with join()

		this.join = function () {
			userData.name = self.name;
			self.loggedin = userData.isLoggedIn();
			socket.emit('add-player', {name: self.name});
			console.info('joined');
		}// end of join function

	}// end of userController


})();