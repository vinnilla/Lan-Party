(function() {
	'use strict';

	angular.module('lanParty', ['ui.router'])
		.config(function($stateProvider, $urlRouterProvider){
			$urlRouterProvider.otherwise('/login');

			$stateProvider
				.state('login', {
					url: '/login',
					controller: "userController as user",
					templateUrl: "views/login.html"
				})
		})

})();