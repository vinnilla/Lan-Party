// require user model
var User = require('../models/users');

function index(req, res) {
	User.find({}, function(err,user) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(user);
		}
	})
}

function create(req,res) {
	var user = new User();
	if (req.body.name) user.name = req.body.name;
	if (req.body.socket) user.socket = req.body.socket;

	user.save(function(err, user) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(user);
		}
	})
}

function profile(req, res) {
	User.findById({}, function(err, user) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(user);
		}
	});
}

module.exports = {
	index: index,
	newUser: create,
	profile: profile
}