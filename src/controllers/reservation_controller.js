const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');

exports.getSearchPage = async (req, res) => {
    try {
        res.render('search');
    } catch (err) {
        console.error('getSearchPage error:', err);
        res.status(500).send('Could not load search page.');
    }
};

exports.getEditPage = async (req, res) => {
    try {
        res.render('edit_reservation');
    } catch (err) {
        console.error('getEditPage error:', err);
        res.status(500).send('Could not load edit page.');
    }
};

exports.getDeletePage = async (req, res) => {
    try {
        res.render('delete_reservation', { reservations: [] });
    } catch (err) {
        console.error('getDeletePage error:', err);
        res.status(500).send('Could not load delete page.');
    }
};


exports.getReservationOverview = async (req, res) => {
    try {
        const labs = await Lab.find().sort({ labName: 1 }).lean();
        const slots = await Slot.find({status: 'available'}).populate('lab').lean();
        res.render('reservation', {labs, slots});
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
        const { labName, date, timeIn, timeOut, seatNum, isAnonymous } = req.body;
        const userId = req.session.userId;

        const lab = await Lab.findOne({ labName });
        if (!lab) {
            return res.status(404).render('reservation', {
                labs: await Lab.find().sort({ labName: 1 }).lean(),
                slots: await Slot.find({ status: 'available' }).populate('lab').lean(),
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
            return res.status(409).render('reservation', {
                labs: await Lab.find().sort({ labName: 1 }).lean(),
                slots: await Slot.find({ status: 'available' }).populate('lab').lean(),
                error: `Seat ${seatNum} at ${timeIn} is already reserved.`
            });
        }

        if (!slot) {
            slot = await Slot.create({
                lab: lab._id,
                date: slotDate,
                startTime: timeIn,
                endTime: timeOut,
                seatNum: Number(seatNum),
                status: 'reserved'
            });
        } else {
            await Slot.findByIdAndUpdate(slot._id, { status: 'reserved' });
        }

        await Reservation.create({
            user: userId,
            slot: slot._id,
            isAnonymous: !!isAnonymous,
            status: 'active'
        });

        res.redirect('/reservation');
    } catch (err) {
        console.error('postStudentReservation error:', err);
        res.status(500).render('reservation', {
            labs: await Lab.find().sort({ labName: 1 }).lean(),
            slots: await Slot.find({ status: 'available' }).populate('lab').lean(),
            error: 'Could not create reservation.'
        });
    }
};

exports.getEditReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('slot');
        if (!reservation) return res.redirect('/reservation');
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
        if (!reservation) return res.redirect('/reservation');
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

        const availableSeats = slots
            .map(slot => slot.seatNum)
            .sort((a, b) => a - b);

        res.json({ availableSeats });
    } catch (err) {
        console.error('searchAvailability error:', err);
        res.status(500).json({ error: 'Could not fetch available seats.' });
    }
};
