const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');

exports.getReservationOverview = async (req, res) => {
    try {
        const labs = await Lab.find().sort({ labName: 1 }).lean();
        res.render('reservation', { labs });
    } catch (err) {
        console.error('getReservationOverview error:', err);
        res.status(500).render('reservation', { error: 'Could not load slots.' });
    }
};

exports.getStudentReservation = async (req, res) => {
    try {
        const slots = await Slot.find({ status: 'available' }).populate('lab');
        res.render('student_reservation', { slots });
    } catch (err) {
        console.error('getStudentReservation error:', err);
        res.status(500).render('student_reservation', { error: 'Could not load available slots.' });
    }
};

exports.postStudentReservation = async (req, res) => {
    try {
        const { userId, slotId, isAnonymous } = req.body;
        await Reservation.create({ user: userId, slot: slotId, isAnonymous: !!isAnonymous });
        await Slot.findByIdAndUpdate(slotId, { status: 'reserved' });
        res.redirect('/reservation');
    } catch (err) {
        console.error('postStudentReservation error:', err);
        res.status(500).render('student_reservation', { error: 'Could not create reservation.' });
    }
};

exports.getEditReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('slot');
        res.render('edit_reservation', { reservation });
    } catch (err) {
        console.error('getEditReservation error:', err);
        res.status(500).render('edit_reservation', { error: 'Could not load reservation.' });
    }
};

exports.postEditReservation = async (req, res) => {
    try {
        const { isAnonymous, remarks } = req.body;
        await Reservation.findByIdAndUpdate(req.params.id, { isAnonymous: !!isAnonymous, remarks });
        res.redirect('/reservation');
    } catch (err) {
        console.error('postEditReservation error:', err);
        res.status(500).render('edit_reservation', { error: 'Could not update reservation.' });
    }
};

exports.postDeleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        await Slot.findByIdAndUpdate(reservation.slot, { status: 'available' });
        await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.redirect('/reservation');
    } catch(err) {
        console.error('postDeleteReservation error:', err);
        res.status(500).render('delete_reservation', { error: 'Could not cancel reservation.' });
    }
};