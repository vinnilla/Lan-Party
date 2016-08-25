(function() {
	'use strict';

	angular.module('lanParty')
		.controller('mainController', mainController);

	mainController.$inject = ['$log']

	function mainController($log) {
		// connect to socket
		var socket = io();
		var self = this;

		this.name;
		this.loggedin;
		this.join = function () {
			self.loggedin = self.name;
			$log.info('joined');
			socket.emit('add-player', {name: self.name});
		}// end of join function

	}// end of mainController

})();