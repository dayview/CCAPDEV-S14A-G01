const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth_controller');

const signupRules = [
    body('idNum').matches(/^\d{8}$/).withMessage('ID number must be exactly 8 digits.'),
    body('username').notEmpty().withMessage('Username is required.'),
    body('email').matches(/@dlsu\.edu\.ph$/).withMessage('Must use a @dlsu.edu.ph email.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
];

const loginRules = [
    body('username').notEmpty().withMessage('Username is required.'),
    body('password').notEmpty().withMessage('Password is required.')
];

router.get('/login', ctrl.getLogin);
router.post('/login', loginRules, ctrl.postLogin);

router.get('/signup', ctrl.getSignup);
router.post('/signup', signupRules, ctrl.postSignup);

router.get('/profile', ctrl.getProfile);
router.post('/profile', ctrl.postProfile);

router.get('/search', ctrl.getSearchUser);

router.post('/delete-profile', ctrl.postDeleteProfile);

router.get('/logout', ctrl.getLogout);

module.exports = router;