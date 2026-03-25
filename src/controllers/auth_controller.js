const User = require('../models/User');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const { validationResult } = require('express-validator');

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('login', { errors: errors.array() });
    }
    
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid username or password.' });
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = user.role === 'admin';
        res.redirect(user.role === 'admin' ? '/admin' : '/reservation');
    } catch (err) {
        console.error('postLogin error:', err);
        res.status(500).render('login', { error: 'Something went wrong. Please try again.' });
    }
};

exports.getSignup = (req, res) => {
    res.render('signup');
};

exports.postSignup = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('signup', { errors: errors.array() });
    }

    try {
        const { idNum, username, firstName, lastName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await User.create({ idNum, username, firstName, lastName, email, password: hashedPassword });
        res.redirect('/auth/login');
    } catch (err) {
        console.error('postSignup error:', err);
        res.status(500).render('signup', { error: 'Could not create account. Please try again.' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        const user = await User.findById(req.session.userId).lean();
        if (!user) return res.redirect('/auth/login');
        res.render('user_profile', { user });
    } catch (err) {
        console.error('getProfile error:', err);
        res.status(500).render('user_profile', { error: 'Could not load profile.' });
    }
};

exports.postProfile = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        const { description } = req.body;
        await User.findByIdAndUpdate(req.session.userId, { description });
        res.redirect('/auth/profile');
    } catch (err) {
        console.error('postProfile error:', err);
        res.status(500).render('user_profile', { error: 'Could not update profile.' });
    }
};

exports.getLogout = (req, res) => {
    req.session.destroy(() => res.redirect('/'));
};