const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { register, login, getProfile, logout } = require('../controllers/authController');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', auth, getProfile);
router.post('/logout', auth, logout);

module.exports = router;
