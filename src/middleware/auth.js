exports.requireStudent = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    next();
};