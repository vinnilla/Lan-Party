(function() {
	'use strict';

	angular.module('lanParty')
		.factory('userData', main);

	main.$inject = ['$http'];

	function main($http) {
		var factory = {};

		factory.userDatabase = function() {
			//retrieve user array from database
			$http.get('http://localhost:3000/api/users')
				.then(function(users) {
					factory.users = users;
				}, function(err) {
					console.error(err);
				})
		}

		factory.login = function() {
			//check for unique username
			//have access to factory.name and factory.password on login
			factory.userDatabase();
			var unique = true;
			factory.users.forEach(function(user) {
				if(user.name.toLowerCase() == factory.name.toLowerCase()) {
					unique = false;
				}
			})
			if(unique) {
				//register
			}
			else {
				//pull user data
			}
		}

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