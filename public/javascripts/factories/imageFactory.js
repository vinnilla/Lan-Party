(function() {
	'use strict';

	angular.module('lanParty')
	.factory('imageData', main);

	main.$inject = ['$http'];

	function main($http) {
		var factory = {};
		// get images from imgur
		factory.zombieNeutral = new Image();
		factory.zombieNeutral.src = "https://i.imgur.com/rni6597.png";
		// create zombieWalk array of images
		factory.zombieWalk = [];
		var image = new Image();
		image.src = "https://i.imgur.com/7xnkd1x.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/W8YivT4.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/3lQndJR.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/ohyTwbe.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/u7uax8S.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/FAlCVro.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/g6zvOVC.png";
		factory.zombieWalk.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/6JNfe2p.png";
		factory.zombieWalk.push(image);
		
		return factory;
	}// end of main

}())