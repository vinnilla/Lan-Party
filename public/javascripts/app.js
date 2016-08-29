(function() {
	'use strict';

	angular.module('lanParty', ['ui.router'])
		.config(function($stateProvider, $urlRouterProvider){
			$urlRouterProvider.otherwise('/welcome');

			$stateProvider
				.state('welcome', {
					url: '/welcome',
					controller: "userController as user",
					templateUrl: "views/welcome.html"
				})
				.state('register', {
					url: '/register',
					controller: 'userController as user',
					templateUrl: 'views/register.html'
				})
				.state('login', {
					url: '/login',
					controller: 'userController as user',
					templateUrl: 'views/login.html'
				})
				.state('user', {
					url: '/user',
					controller: 'userController as user',
					templateUrl: 'views/user.html'
				})
		})// end of config

})();