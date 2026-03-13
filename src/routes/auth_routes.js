const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth_controller');

router.get('/login', ctrl.getLogin);
router.post('/login', ctrl.postLogin);

router.get('/signup', ctrl.getSignup);
router.post('/signup', ctrl.postSignup);

router.get('/profile', ctrl.getProfile);
router.post('/profile', ctrl.postProfile);

router.get('/logout', ctrl.getLogout);

module.exports = router;