const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth_controller');

router.get('/login', ctrl.getLogin);
router.post('/login', ctrl.postLogin);

router.get('/signup', ctrl.getSignup);
router.post('/signup', ctrl.postSignup);

router.get('/profile', ctrl.postSignup);
router.get('/profile', ctrl.postProfile);

module.exports = router;