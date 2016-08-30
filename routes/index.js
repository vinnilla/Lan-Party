var express = require('express');
var router = express.Router();

var userController = require('../controllers/users')

// User Data
router.post('/login', userController.login);
router.post('/register', userController.register);

router.get('/users', userController.index)
router.post('/users', userController.newUser);
router.get('/users/:id', userController.profile);

module.exports = router;
