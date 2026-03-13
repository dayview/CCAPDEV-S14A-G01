/**
 * Authentication Middleware
 * Protects routes by checking if user has an active session
 */

// Middleware to check if user is logged in
exports.requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).redirect('/auth/login');
    }
    next();
};

// Middleware to check if user is an admin
exports.requireAdmin = (req, res, next) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).render('login', { error: 'Admin access required.' });
    }
    next();
};

// Middleware to check if user is a student
exports.requireStudent = (req, res, next) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.status(403).render('login', { error: 'Student access required.' });
    }
    next();
};

// Middleware to make session userId available to views
exports.sessionToView = (req, res, next) => {
    res.locals.userId = req.session.userId || null;
    res.locals.username = req.session.username || null;
    res.locals.role = req.session.role || null;
    res.locals.isLoggedIn = !!req.session.userId;
    next();
};
