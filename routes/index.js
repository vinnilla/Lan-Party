var express = require('express');
var router = express.Router();

var userController = require('../controllers/users')

// User Data
router.post('/login', userController.login);
router.post('/register', userController.register);

router.get('/users', userController.index)
router.post('/users', userController.newUser);
router.post('/refresh', userController.refresh);
router.put('/users', userController.update);
router.get('/user', userController.verifyToken, userController.profile);
router.delete('/users', userController.remove);

module.exports = router;
