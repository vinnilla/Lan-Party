(function() {
	'use strict';

	angular.module('lanParty')
		.factory('userData', main);

	main.$inject = [];

	function main() {
		var factory = {};

		factory.isLoggedIn = function() {
			if (factory.name) {
				return true;
			}
			else {
				return false;
			}
		}

		factory.getName = function() {
			return factory.name;
		}

		return factory;
	}

}());