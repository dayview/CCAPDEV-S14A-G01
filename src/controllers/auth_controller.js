const User = require('../models/User');

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.redirect('/reservation');
        } else {
            res.render('login', { error: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error('postLogin error:', err);
        res.status(500).render('login', { error: 'Something went wrong. Please try again.' });
    }
};

exports.getSignup = (req, res) => {
    res.render('signup');
};

exports.postSignup = async (req, res) => {
    try {
        const { idNum, username, firstName, lastName, email, password } = req.body;
        await User.create({ idNum, username, firstName, lastName, email, password });
        res.redirect('/auth/login');
    } catch (err) {
        console.error('postSignup error:', err);
        res.status(500).render('signup', { error: 'Could not create account. Please try again.' });
    }
};

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.query.userId);
    res.render('user_profile', { user });
};

exports.postProfile = async (req, res) => {
    try {
        const { userId, description } = req.body;
        await User.findByIdAndUpdate(userId, { description });
        res.redirect('/auth/profile');
    } catch (err) {
        console.error('postProfile error:', err);
        res.status(500).render('user_profile', { error: 'Could not update profile.' });
    }
};