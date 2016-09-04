(function() {
	'use strict';

	// remove token on page load because socket id changes
	localStorage.removeItem('token');

	angular.module('lanParty', ['ui.router'])
		.config(function($stateProvider, $urlRouterProvider){
			$urlRouterProvider.otherwise('/welcome');

			$stateProvider
				.state('welcome', {
					url: '/welcome',
					controller: "userController as user",
					templateUrl: "views/welcome.html",
					data: {
						requireLogout: true
					}
				})
				.state('register', {
					url: '/register',
					controller: 'userController as user',
					templateUrl: 'views/register.html',
					data: {
						requireLogout: true
					}
				})
				.state('login', {
					url: '/login',
					controller: 'userController as user',
					templateUrl: 'views/login.html',
					data: {
						requireLogout: true
					}
				})
				.state('game', {
					url: '/game',
					controller: 'gameController',
					templateUrl: 'views/game.html',
					data: {
						requireLogin: true
					}
				})
				.state('game.home', {
					url: '/home',
					controller: 'gameController',
					templateUrl: 'views/game.home.html',
					data: {
						requireLogin: true
					}
				})
				.state('game.solo', {
					url: '/solo',
					controller: 'gameController',
					templateUrl: 'views/game.solo.html',
					data: {
						requireLogin: true
					}
				})
				.state('game.group', {
					url: '/group',
					controller: 'gameController',
					templateUrl: 'views/game.group.html',
					data: {
						requireLogin: true
					}
				})
				.state('game.start', {
					url: '/start',
					controller: 'gameController',
					templateUrl: 'views/game.start.html',
					data: {
						requireLogin: true
					}
				})
				.state('game.start.lobby', {
					url: '/lobby',
					controller: 'gameController',
					templateUrl: 'views/game.start.lobby.html',
					data: {
						requireLogin: true
					}
				})
				.state('game.start.playing', {
					url: '/playing',
					controller: 'gameController',
					templateUrl: 'views/game.start.playing.html',
					data: {
						requireLogin: true
					}
				})
		})// end of config
		.run(function($rootScope, $state){
			$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {

				// case 1: access requireLogin page without token
				if(toState.data.requireLogin && !localStorage.token) {
					event.preventDefault();
					$state.go('welcome');
				}

				// case 2: access requireLogout page with token
				else if (toState.data.requireLogout && localStorage.token) {
					event.preventDefault();
					$state.transitionTo('game.home');
				}

				// case 3: someone is trying to login with a fake token
				// ignore this case


					// var payloadb64 = localStorage.token.split('.')[1];
					// var payload = JSON.parse(atob(payloadb64));
				
			})// end of $on
		})// end of run 

})();