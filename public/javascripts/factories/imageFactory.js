(function() {
	'use strict';

	angular.module('lanParty')
	.factory('imageData', main);

	main.$inject = ['$http'];

	function main($http) {
		var factory = {};
		// get images from imgur
		factory.zombieNeutral = new Image();
		factory.zombieNeutral.src = "http://i.imgur.com/rni6597.png";
		return factory;
	}// end of main

}())