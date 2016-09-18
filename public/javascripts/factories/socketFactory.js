(function() {
	'use strict';

	angular.module('lanParty')
		.factory('socketData', main);

	function main() {
		 return io();
	}

})()