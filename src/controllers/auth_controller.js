const User = require('../models/User');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const { validationResult } = require('express-validator');

const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('login', { errors: errors.array() });
    }

    try {
        const { username, password, rememberMe } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', { error: 'Invalid username or password.' });
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.isAdmin = user.role === 'admin';

        if (rememberMe) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
        } else {
            req.session.cookie.expires = false;
        }

        req.session.save((err) => {
            if (err) {
                return res.status(500).render('login', { error: 'Could not save session. Please try again.' });
            }

            return res.redirect(user.role === 'admin' ? '/admin' : '/reservation');
        });
    } catch (err) {
        return res.status(500).render('login', { error: 'Something went wrong. Please try again.' });
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
        res.status(500).render('user_profile', { error: 'Could not update profile.' });
    }
};

exports.postLogout = (req, res) => {
    req.session.destroy(() => res.redirect('/'));
};

exports.postDeleteProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) return res.redirect('/auth/login');

        const activeReservations = await Reservation.find({ user: userId, status: 'active' });
        
        for (const resv of activeReservations) {
            await Slot.findByIdAndUpdate(resv.slot, { status: 'available' });
        }
        
        await Reservation.deleteMany({ user: userId });
        
        await User.findByIdAndDelete(userId);

        req.session.destroy((err) => {
            res.redirect('/');
        });

    } catch (err) {
        res.status(500).send('An error occurred while deleting the profile.');
    }
};

exports.getSearchUser = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/auth/login');
        
        const searchQuery = req.query.q;
        if (!searchQuery) return res.redirect('/auth/profile');

        
        const searchTerms = searchQuery.split(' ').map(term => new RegExp(term, 'i'));

        // ONLY search by First Name and Last Name
        const targetUser = await User.findOne({
            $or: [
                { firstName: { $in: searchTerms } },
                { lastName: { $in: searchTerms } }
            ]
        }).lean();

        if (!targetUser) {
            return res.send("<script>alert('User not found. Please ensure you typed their first or last name correctly.'); window.location.href='/auth/profile';</script>");
        }
        res.render('public_profile', { targetUser });

    } catch (err) {
        res.status(500).send('An error occurred while searching for the user.');
    }
};

