// require user model
var User = require('../models/users');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

function index(req, res) {
	User.find({}, function(err,users) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(users);
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

function remove(req, res) {
	User.findOneAndRemove({name: req.body.name}, function(err, result) {
		if(err) {
			res.json(err);
		}
		else {
			res.json({msg:"user deleted"});
		}
	})
}

function profile(req, res) {
	User.findOne({id: req.token._id}, function(err, user) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(user);
		}
	});
}

function login(req, res) {
	var name = req.body.name;
	var password = req.body.password;
	var socket = req.body.socket;

	if (!name || !password) {
		res.json({error: "Name and password must be set"})
		return false;
	}

	User.findOne({name: name}, function(err, user) {
		if (err) {
			res.json(err);
			return false;
		}
		if (!user) {
			res.json({error: "User cannot be found"});
			return false;
		}
		// decrypt password and compare
		bcrypt.compare(password, user.password_hash, function(err, result) {
			if (err) {
				res.json(err);
				return false;
			}
			if (!result) {
				res.json({error: "Invalid password"});
				return false;
			}
			// update user with new socket
			user.socket = socket;
			user.save(function(err, user) {
				if(err) {
					res.json(err);
					return false;
				}
				res.json({user: user, token: createToken(user)});
			})
			
		})
	})
}

function register(req, res) {
	var name = req.body.name;
	var password = req.body.password;
	var socket = req.body.socket;

	if (!name || !password) {
		res.json({error: "Name and password must be set"})
		return false;
	}

	// verify username has not been taken
	User.findOne({name: name}, function(err, user) {
		if (err) {
			res.json(err);
			return false;
		}
		if (user) {
			res.json({error: "Name has already been taken"});
			return false;
		}
		// create new user
		bcrypt.hash(password, 10, function(err, hash) {
			if (err) {
				res.json(err);
				return false;
			}
			var user = new User();
			user.name = name;
			user.socket = socket;
			user.password_hash = hash;
			user.save(function(err, user) {
				if(err) {
					res.json(err);
					return false;
				}
				//everything worked, send back token
				res.json({user: user, token: createToken(user)})

			})
		})
	})
}

function verify(req, res, next) {
	jwt.verify(req.query.token, process.env.JWT_SECRET, function(err, decoded) {
		if (err) {
			res.json(err);
			return false;
		}
		req.token = decoded;
		next();
	})
}

function createToken(user) {
	return jwt.sign(user._id, process.env.JWT_SECRET);
}

module.exports = {
	index: index,
	newUser: create,
	profile: profile,
	login: login,
	register: register,
	remove: remove,
	verifyToken: verify
}