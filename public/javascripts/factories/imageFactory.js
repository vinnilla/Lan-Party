(function() {
	'use strict';

	angular.module('lanParty')
	.factory('imageData', main);

	main.$inject = ['$http'];

	function main($http) {
		var factory = {};
		// get images from imgur
		factory.background = new Image();
		factory.background.src = "https://i.imgur.com/xGkCmzi.png";
		factory.zombieNeutral = new Image();
		factory.zombieNeutral.src = "https://i.imgur.com/rni6597.png";
		factory.playerNeutral = new Image();
		factory.playerNeutral.src = "https://i.imgur.com/nmCOktm.png";

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

		// create zombieDeath array of images
		factory.zombieDeath = [];
		image = new Image();
		image.src = "https://i.imgur.com/3t3trGk.png";
		factory.zombieDeath.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/h4wq1tJ.png";
		factory.zombieDeath.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/vtfVUZM.png";
		factory.zombieDeath.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/gZA6Gom.png";
		factory.zombieDeath.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/6zZeddC.png";
		factory.zombieDeath.push(image);
		image = new Image();
		image.src = "https://i.imgur.com/yP2918K.png";
		factory.zombieDeath.push(image);
		
		return factory;
	}// end of main

}())