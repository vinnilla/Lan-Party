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
		// create zombieWalk array of images
		factory.zombieWalk = [];
		var image = new Image();
		image.src = "http://i.imgur.com/7xnkd1x.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/W8YivT4.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/3lQndJR.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/ohyTwbe.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/u7uax8S.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/FAlCVro.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/g6zvOVC.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "http://i.imgur.com/6JNfe2p.png";
		factory.zombieWalk.push(image);
		image.addEventListener('load', function() {
			console.log('zombie images loaded');
		})
		
		return factory;
	}// end of main

}())