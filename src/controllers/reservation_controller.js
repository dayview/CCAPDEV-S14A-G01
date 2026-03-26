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
    try {
        const userId = req.session.userId;
        if (!userId) return res.redirect('/auth/login');

        const {labName, date, timeIn, timeOut, seatNum, isAnonymous} = req.body;

        if (!labName || !date || !timeIn || !seatNum) {
            return res.status(400).render('reservation', {
                error: 'All booking fields are required.'
            });
        }

        const lab = await Lab.findOne({labName});

        if(!lab) {
            return res.status(400).render('reservation', {
                error: 'Lab not found.'
            });
        }

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);

        let slot = await Slot.findOne({
            lab: lab._id,
            date: slotDate,
            startTime: timeIn,
            seatNum: Number(seatNum)
        });

        if (slot && slot.status !== 'available') {
            return res.status(400).render('reservation', {
                error: 'Seat not available.'
            });
        }

        if(!slot) {
            slot = await Slot.create({
                lab: lab._id,
                date: slotDate,
                startTime: timeIn,
                endTime: timeOut,
                seatNum: Number(seatNum),
                status: 'reserved'
            });
        } else {
            await Slot.findByIdAndUpdate(slot._id, {status: 'reserved'});
        }

        await Reservation.create({
            user: userId,
            slot: slot._id,
            isAnonymous: !!isAnonymous,
            status: 'active'
        });

        res.redirect('/reservation');
    }
    catch (err) {
        res.status(500).render('error', {message: 'Could not create reservation.'});
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
        const {date, time, room} = req.query;

        if (!date || !time || !room) {
            return res.status(400).json({error: 'Missing date, time, or room.'});
        }

        const lab = await Lab.findOne({labName: room}).lean();
        if (!lab) {
            return res.status(404).json({error: 'Room not found.'});
        }

        const [year, month, day] = date.split('-').map(Number);
        const searchDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

        const occupiedSlots = await Slot.find({
            lab: lab._id,
            date: {$gte: searchDate, $lt: nextDay},
            startTime: time,
            status: {$in: ['reserved', 'walk-in']}
        }).lean();

        const slotIds = occupiedSlots.map(slot => slot._id);

        const reservations = await Reservation.find({
            slot: {$in: slotIds},
            status: 'active'
        }).populate('user').lean();

        const reservationMap = {};
        reservations.forEach(reservation => {
            reservationMap[String(reservation.slot)] = reservation;
        });

        const occupiedSeatDetails = occupiedSlots.map(slot => {
            const reservation = reservationMap[String(slot._id)];

        let reservedBy = 'Unknown';
        if (reservation.isAnonymous) reservedBy = 'Anonymous';
        else reservedBy = `${reservation.user.firstName} ${reservation.user.lastName}`;

        return {
            seatNum: Number(slot.seatNum),
            status: slot.status,
            reservedBy
        }
    }).sort((a, b) => a.seatNum - b.seatNum);

        const occupiedSeats = occupiedSlots
            .map(slot => Number(slot.seatNum))
            .sort((a, b) => a - b);

        const availableSeats = [];
        for (let i = 1; i <= lab.capacity; i++) {
            if (!occupiedSeats.includes(i)) {
                availableSeats.push(i);
            }
        }

        res.json({
            room: lab.labName,
            capacity: lab.capacity,
            occupiedSeats,
            occupiedSeatDetails,
            availableSeats
        });
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch seat availability.' });
    }
};
