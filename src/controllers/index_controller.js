exports.getIndex = (req, res) => {
    res.render('index');
};

exports.getUserProfile = (req, res) => {
    const user = {
        firstName: 'Justine',
        lastName: 'Po',
        username: 'justine123',
        idNumber: '12345678'
    };

    res.render('user_profile', { user });
};