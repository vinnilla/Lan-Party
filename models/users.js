var mongoose = require('mongoose');

var statSchema = new mongoose.Schema({
	statName:String,
	value:Number
});

var weaponSchema = new mongoose.Schema({
	weaponName:String,
	stats:[statSchema]
});

var userSchema = new mongoose.Schema({
	name:String,
	password_hash:String,
	socket:String,
	experience:{type: Number, default: 0},
	class:{type: String, default: null},
	color:{type:String, default: 'white'},
	room:{type: String, default: null},
	date:{type: Date, default: Date.now()},
	weapons:[weaponSchema]
});

module.exports = mongoose.model('User', userSchema);