const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');
const { validationResult } = require('express-validator');

function formatReservations(rawReservations) {
    return rawReservations.map(reservation => {
        const localDate = new Date(reservation.slot.date);
        const adjustedDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        const dateValue = adjustedDate.toISOString().split('T')[0];

        return {
            ...reservation,
            dateValue,
            displayLabel: `${reservation.slot.lab.labName} | Seat ${reservation.slot.seatNum} | ${dateValue} | ${reservation.slot.startTime} - ${reservation.slot.endTime}`
        };
    });
}

exports.getSearchPage = async (req, res) => {
    try {
        res.render('search');
    } catch (err) {
        res.status(500).render('error', { message: 'Could not load search page.'});
    }
};

exports.getDeletePage = async (req, res) => {
    try {
        res.render('delete_reservation', { reservations: [] });
    } catch (err) {
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
        }).sort({createdAt: -1}).lean();
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


exports.getEditPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const rawReservations = await Reservation.find({
            user: userId,
            status: 'active'
        }).populate({
            path: 'slot',
            populate: {path: 'lab'}
        }).lean();
        const reservations = formatReservations(rawReservations);
        res.render('edit_reservation', {reservations});
    } catch (err) {
        res.status(500).render('error', { message: 'Could not load reservations.' });
    }
};


exports.postEditReservation = async (req, res) => {
    const errors = validationResult(req);

    try {
        const reservation = await Reservation.findOne({
            _id: req.params.id,
            user: req.session.userId
        }).populate({
            path: 'slot',
            populate: {path: 'lab'}
        });

        if (!reservation) {
            const rawReservations = await Reservation.find({
                user: req.session.userId,
                status: 'active'
            }).populate({
                path: 'slot',
                populate: {path: 'lab'}
            }).lean();

            const reservations = formatReservations(rawReservations);

            return res.status(400).render('edit_reservation', {
                error: 'Reservation not found.',
                reservations
            });
        }

        if(!errors.isEmpty()) {
            const userId = req.session.userId;

            const rawReservations = await Reservation.find({
                user: userId,
                status: 'active'
            }).populate({
                path: 'slot',
                populate: {path: 'lab'}
            }).lean();

            const reservations = formatReservations(rawReservations);

            return res.status(400).render('edit_reservation', {
                errors: errors.array(),
                reservations
            });
        }

        const{date, timeIn} = req.body;

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);

        const timeOutDate = new Date();
        const [hours, minutes] = timeIn.split(':').map(Number);
        timeOutDate.setHours(hours, minutes, 0, 0);
        timeOutDate.setMinutes(timeOutDate.getMinutes() + 30);

        const timeOut = timeOutDate.getHours().toString().padStart(2, '0') + ':' + timeOutDate.getMinutes().toString().padStart(2, '0');

        const currentSlot = reservation.slot;

        let newSlot = await Slot.findOne({
            lab: currentSlot.lab._id,
            date: slotDate,
            startTime: timeIn,
            seatNum: currentSlot.seatNum
        });

        if(newSlot && String(newSlot._id) !== String(currentSlot._id) && newSlot.status !== 'available') {
            const rawReservations = await Reservation.find({
                user: req.session.userId,
                status: 'active'
            }).populate({
                path: 'slot',
                populate: {path: 'lab'}
            }).lean();

            const reservations = formatReservations(rawReservations);

            return res.status(409).render('edit_reservation', {
                error: 'Slot not available.',
                reservations
            });
        }

        if(!newSlot) {
            newSlot = await Slot.create({
                lab: currentSlot.lab._id,
                date: slotDate,
                startTime: timeIn,
                endTime: timeOut,
                seatNum: currentSlot.seatNum,
                status: 'reserved'
            });
        } else {
            await Slot.findByIdAndUpdate(newSlot._id, {
                status: 'reserved',
                endTime: timeOut
            });
        }

        await Reservation.findByIdAndUpdate(reservation._id, {
            slot: newSlot._id
        });

        if (String(currentSlot._id) !== String(newSlot._id)) {
            await Slot.findByIdAndUpdate(currentSlot._id, {
                status: 'available'
            });
        }

        res.redirect('/reservation/reservation_history');
    } catch (err) {
        const rawReservations = await Reservation.find({
            user: req.session.userId,
            status: 'active'
        }).populate({
            path: 'slot',
            populate: {path: 'lab'}
        }).lean();

        const reservations = formatReservations(rawReservations);

        res.status(500).render('edit_reservation', {
            error: 'Could not update reservation.',
            reservations
        });
    }
};

exports.postDeleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        await Slot.findByIdAndUpdate(reservation.slot, { status: 'available' });
        await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.redirect('/reservation');
    } catch(err) {
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

        const reservation = await Reservation.find({
            slot: {$in: slotIds},
            status: 'active'
        }).populate('user').lean();

        const reservationMap = {};
        reservation.forEach(reservation => {
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
