(function() {
	'use strict';

	angular.module('lanParty')
	.factory('imageData', main);

	main.$inject = ['$http'];

	function main($http) {
		var factory = {};
		// get images from imgur
		factory.zn = "http://imgur.com/rni6597";
		return factory;
	}// end of main

}())