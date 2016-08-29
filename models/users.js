var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	name:String,
	socket:String,
	experience:{type: Number, default: 0},
	class:{type: String, default: null},
	date:{type: Date, default: Date.now()}
});

module.exports = mongoose.model('User', userSchema);