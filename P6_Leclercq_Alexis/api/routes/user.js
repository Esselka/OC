const express = require('express');

const router = express.Router();
const userCtrl = require('../controllers/user');
const noCache = require('../middleware/noCache');
const verifyPassword = require('../middleware/verifyPassword');

router.post('/signup', noCache, verifyPassword, userCtrl.signup)
router.post('/login', noCache, userCtrl.login)

module.exports = router;