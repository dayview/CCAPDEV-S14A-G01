const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');
const User = require('../models/User');

exports.getAdminHome = (req, res) => {
    res.render('admin/admin_homepage', { layout: 'admin' });
};

exports.getAdminLogin = (req, res) => {
    res.render('admin/admin_login', { layout: 'admin' });
};

exports.postAdminLogin = async (req, res) => {
    try {
        const User = require('../models/User');
        const { email, password } = req.body;
        const admin = await User.findOne({ email, password, role: 'admin' });
        if (admin) {
            res.redirect('/admin');
        } else {
            res.render('admin/admin_login', { layout: 'admin', error: 'Invalid admin credentials/' });
        }
    } catch (err) {
        console.error('postAdminLogin error:', err);
        res.status(500).render('admin/admin_login', { layout: 'admin', error: 'Something went wrong.' });
    }
};

exports.getAdminReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate({ path: 'slot', populate: { path: 'lab' } })
            .populate('user');
        res.render('admin/admin_reservation', { layout: 'admin', reservations });
    } catch (err) {
        console.error('getAdminReservations error:', err);
        res.status(500).render('admin/admin_reservation', { layout: 'admin', error: 'Could not load reservations.' });
    }
};

exports.getAdminStudentReservations = (req, res) => {
    res.render('admin/admin_student_reservation', { layout: 'admin' });
};

exports.getAdminStudentSearch = async (req, res) => {
    try {
        const { idNum } = req.query;
        const user = await User.findOne({ idNum });
        let reservations = [];
        if (user) {
            reservations = await Reservation.find({ user: user._id })
                .populate({ path: 'slot', populate: { path: 'lab' } });
        }
        res.render('admin/admin_student_reservation', {
            layout: 'admin',
            reservations,
            searchedId: idNum,
            notFound: !user
        });
    } catch (err) {
        console.error('getAdminStudentSearch error:', err);
        res.status(500).render('admin/admin_student_reservation', { layout: 'admin', error: 'Search failed.' });
    }
};

exports.getAdminSlotsOverview = async (req, res) => {
    try {
        const slots = await Slot.find().populate('lab');
        res.render('admin/admin_slots_overview', { layout: 'admin', slots });
    } catch (err) {
        console.error('getAdminSlotsOverview error:', err);
        res.status(500).render('admin/admin_slot_overview', { layout: 'admin', error: 'Could not load slots.' });
    }
};

exports.getAdminSlotReservation = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id).populate('lab');
        const labs = await Lab.find();
        res.render('admin/admin_slot_reservation', { layout: 'admin', slot, labs });
    } catch (err) {
        console.error('getAdminSlotReservation error:', err);
        res.status(500).render('admin/admin_slot_reservation', { layout: 'admin', error: 'Could not load slot details.' });
    }
};