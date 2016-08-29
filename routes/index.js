var express = require('express');
var router = express.Router();

var userController = require('../controllers/users')

// User Data
router.get('/users', userController.index)
router.post('/users', userController.newUser);
router.get('/users/:id', userController.profile);

module.exports = router;
