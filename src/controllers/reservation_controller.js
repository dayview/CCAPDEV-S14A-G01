const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');
const { validationResult } = require('express-validator');

exports.getSearchPage = async (req, res) => {
    try {
        res.render('search');
    } catch (err) {
        console.error('getSearchPage error:', err);
        res.status(500).render('error', { message: 'Could not load search page.'});
    }
};

exports.getEditPage = async (req, res) => {
    try {
        res.render('edit_reservation');
    } catch (err) {
        console.error('getEditPage error:', err);
        res.status(500).render('error', { message: 'Could not load edit page.' });
    }
};

exports.getDeletePage = async (req, res) => {
    try {
        res.render('delete_reservation', { reservations: [] });
    } catch (err) {
        console.error('getDeletePage error:', err);
        res.status(500).render('error', { message: 'Could not load delete page.' });
    }
};

exports.getReservationOverview = async (req, res) => {
    try {
        res.render('reservation', {
            isLoggedIn: !!req.session.userId
        });
    } catch (err) {
        res.status(500).render('reservation', {
            error: 'Could not load reservation page.',
            isLoggedIn: !!req.session.userId
        });
    }
};

exports.getStudentReservation = async (req, res) => {
    try {
        const reservations = await Reservation.find({user: req.session.userId}).populate({
            path: 'slot',
            populate: {path: 'lab'}
        }).lean();
        res.render('reservation_history', {reservations});
    }
    catch (err) {
        res.status(500).render('reservation_history', { error: 'Could not load reservations.' });
    }
};

exports.postStudentReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    if (!errors.isEmpty()) {
        const slots = await Slot.find({ status: 'available' }).populate('lab');
        return res.status(400).render('reservation', { errors: errors.array(), slots });
    }

    try {
        const userId = req.session.userId;
        const { slotId, labName, date, timeIn, seatNum, isAnonymous } = req.body;

        if (!userId) return res.redirect('/auth/login');

        let slot;

        if (slotId) slot = await Slot.findById(slotId);

        else if (labName && date && timeIn && seatNum) {
            const lab = await Lab.findOne({labName});
            if (!lab) {
                return res.status(404).render('reservation', {
                    error: 'Lab not found.',
                    isLoggedIn: true
                });
            }

            const [year, month, day] = date.split('-').map(Number);
            const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);

            slot = await Slot.findOne({
                lab: lab._id,
                date: slotDate,
                startTime: timeIn,
                seatNum: Number(seatNum)
            });
        }
        else {
            return res.status(400).render('reservation', {
                error: 'Incomplete reservation details.',
                isLoggedIn: true
            });
        }

        if(!slot || slot.status !== 'available') {
            return res.status(400).render('reservation', {
                error: 'Slot is no longer available.',
                isLoggedIn: true
            });
        }

        await Reservation.create({ user: userId, slot: slot._id, isAnonymous: !!isAnonymous });
        await Slot.findByIdAndUpdate(slot._id, { status: 'reserved' });
        res.redirect('/reservation');
    } catch (err) {
        res.status(500).render('reservation', {
            error: 'Could not create reservation.',
            isLoggedIn: true
        });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const reservation = await Reservation.findById(req.params.id).populate('slot');
        return res.status(400).render('edit_reservation', { errors: errors.array(), reservation });
    }

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

exports.searchAvailability = async (req, res) => {
    try {
        const { date, time, room } = req.query;

        if (!date || !time || !room) {
            return res.status(400).json({ error: 'Missing date, time, or room.' });
        }

        const lab = await Lab.findOne({ labName: room }).lean();

        if (!lab) {
            return res.status(404).json({ error: 'Room not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);

        const slots = await Slot.find({
            lab: lab._id,
            date: slotDate,
            startTime: time,
            status: 'available'
        }).lean();

        const availableSeats = slots.map(slot => slot.seatNum).sort((a, b) => a - b);
        res.json({ availableSeats });
    } catch (err) {
        console.error('searchAvailability error:', err);
        res.status(500).json({ error: 'Could not fetch available seats.' });
    }
};
