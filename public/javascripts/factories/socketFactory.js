(function() {
	'use strict';

	angular.module('lanParty')
		.factory('socketData', main);

	main.$inject = [];

	function main() {
		 return io();
	}

})()