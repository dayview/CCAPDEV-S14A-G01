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
        const userId = req.session.userId;    
        const latestReservation = await Reservation.findOne({ user: userId, status: 'active' }).populate({path: 'slot',populate: { path: 'lab' }}).sort({ createdAt: -1 }).lean();
        
      
        if (!latestReservation) {
            return res.render('edit_reservation', { 
                hasReservation: false,
                message: 'You have no active reservations to edit.'
            });
        }
        
        
        const formattedDate = latestReservation.slot.date.toISOString().split('T')[0];
        
        
        res.render('edit_reservation', { 
            reservation: latestReservation,
            formattedDate: formattedDate,
            hasReservation: true
        });
    } catch (err) {
        console.error('getEditPage error:', err);
        res.status(500).render('error', { message: 'Could not load edit page.' });
    }
};

exports.getDeletePage = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        
        const reservations = await Reservation.find({ user: userId, status: 'active' }).populate({ path: 'slot',populate: { path: 'lab' }}).sort({ createdAt: -1 }); 
        
        
        const formattedReservations = reservations.map(reservation => ({
            _id: reservation._id,
            date: reservation.slot.date.toISOString().split('T')[0],
            timeIn: reservation.slot.startTime,
            room: reservation.slot.lab.labName,
            seat: reservation.slot.seatNum,
            isAnonymous: reservation.isAnonymous,
            status: reservation.status
        }));
        
        res.render('delete_reservation', { 
            reservations: formattedReservations,
            hasReservations: formattedReservations.length > 0
        });
    } catch (err) {
        console.error('getDeletePage error:', err);
        res.status(500).render('error', { message: 'Could not load delete page.' });
    }
};

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const slots = await Slot.find({ status: 'available' }).populate('lab');
        return res.status(400).render('student_reservation', { errors: errors.array(), slots });
    }

    try {
        const userId = req.session.userId;
        const { slotId, isAnonymous } = req.body;

        if (!userId) return res.redirect('/auth/login');

        const slot = await Slot.findById(slotId);
        if (!slot || slot.status !== 'available') {
            return res.status(400).render('student_reservation', { error: 'Slot is no longer available.' });
        }

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
        const reservation = await Reservation.findById(req.params.id).populate('slot').lean();
        res.render('edit_reservation', { reservation });
    } catch (err) {
        console.error('getEditReservation error:', err);
        res.status(500).render('edit_reservation', { error: 'Could not load reservation.' });
    }
};

exports.getEditReservationData = async (req, res) => {
    try {
        const userId = req.session.userId;
        const reservationId = req.params.id;
        
        const reservation = await Reservation.findOne({ _id: reservationId, user: userId,status: 'active'}).populate({ path: 'slot',populate: { path: 'lab' }});
        
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        res.json({ reservation });
    } catch (err) {
        console.error('getEditReservationData error:', err);
        res.status(500).json({ error: 'Could not load reservation' });
    }
};

exports.postEditReservation = async (req, res) => {
    const errors = validationResult(req);
    const reservationId = req.params.id;
    
    if (!errors.isEmpty()) {
        const reservation = await Reservation.findById(reservationId).populate({ path: 'slot',populate: { path: 'lab' }});
        return res.status(400).render('edit_reservation', { 
            errors: errors.array(), 
            reservation 
        });
    }

    try {
        const userId = req.session.userId;
        const { date, time, room, seatNum, isAnonymous, remarks } = req.body;
        
        
        const reservation = await Reservation.findOne({_id: reservationId, user: userId, status: 'active'}).populate('slot');
        
        if (!reservation) {
            return res.status(404).render('error', { message: 'Reservation not found or cannot be edited.' });
        }
        
        
        const lab = await Lab.findOne({ labName: room });
        if (!lab) {
            return res.status(400).render('edit_reservation', {
                error: 'Room not found.',
                reservation: reservation
            });
        }
        
        
        const isChangingSlot = (date !== req.body.originalDate || 
                               time !== reservation.slot.startTime || 
                               room !== reservation.slot.lab.labName || 
                               parseInt(seatNum) !== reservation.slot.seatNum);
        
        if (isChangingSlot) {
            
            const [year, month, day] = date.split('-').map(Number);
            const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);
            
            
            let targetSlot = await Slot.findOne({
                lab: lab._id,
                date: slotDate,
                startTime: time,
                seatNum: parseInt(seatNum)
            });
            
            
            if (!targetSlot) {
                targetSlot = await Slot.create({
                    lab: lab._id,
                    date: slotDate,
                    startTime: time,
                    endTime: getEndTime(time),
                    seatNum: parseInt(seatNum),
                    status: 'available'
                });
            }
            
            
            if (targetSlot.status !== 'available') {
                return res.status(400).render('edit_reservation', {
                    error: 'This seat is no longer available for the selected schedule.',
                    reservation: reservation
                });
            }
            
            
            await Slot.findByIdAndUpdate(reservation.slot._id, { status: 'available' });
            
            
            await Reservation.findByIdAndUpdate(reservationId, {
                slot: targetSlot._id,
                isAnonymous: !!isAnonymous,
                remarks: remarks || ''
            });
            
            
            await Slot.findByIdAndUpdate(targetSlot._id, { status: 'reserved' });
            
        } else {
           
            await Reservation.findByIdAndUpdate(reservationId, {
                isAnonymous: !!isAnonymous,
                remarks: remarks || ''
            });
        }
        
        res.redirect('/reservation');
        
    } catch (err) {
        console.error('postEditReservation error:', err);
        const reservation = await Reservation.findById(req.params.id).populate({ path: 'slot',populate: { path: 'lab' }});
        res.status(500).render('edit_reservation', {
            error: 'Could not update reservation.',
            reservation: reservation
        });
    }
};

exports.postDeleteReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;
        
        console.log("Attempting to delete reservation:", reservationId);
        
        
        const reservation = await Reservation.findById(reservationId).populate('slot');
        
        if (!reservation) {
            console.log("Reservation not found");
            return res.redirect('/reservation/delete');
        }
        
        console.log("Found reservation. Slot ID:", reservation.slot._id);
        console.log("Current slot status:", reservation.slot.status);
        
        
        await Slot.findByIdAndUpdate(reservation.slot._id, { status: 'available' });
        console.log("Slot updated to available");
        
        
        await Reservation.findByIdAndUpdate(reservationId, { status: 'cancelled' });
        console.log("Reservation updated to cancelled");
        
        res.redirect('/reservation/delete');
    } catch(err) {
        console.error('postDeleteReservation error:', err);
        res.redirect('/reservation/delete');
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

        
        const allSlots = await Slot.find({
            lab: lab._id,
            date: slotDate,
            startTime: time
        }).lean();

        
        const unavailableSeats = allSlots
            .filter(slot => slot.status !== 'available')
            .map(slot => slot.seatNum);

      
        const existingSeats = allSlots.map(slot => slot.seatNum);

        const availableSeats = [];
        for (let i = 1; i <= lab.capacity; i++) {
            if (!unavailableSeats.includes(i)) {
                availableSeats.push(i);
            }
        }

        availableSeats.sort((a, b) => a - b);

        res.json({ 
            availableSeats,
            capacity: lab.capacity
        });
    } catch (err) {
        console.error('searchAvailability error:', err);
        res.status(500).json({ error: 'Could not fetch available seats.' });
    }
};