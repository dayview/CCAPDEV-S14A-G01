const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');
const User = require('../models/User');

exports.getAdminHome = (req, res) => {
    res.render('admin/admin_homepage', { layout: 'admin' });
};

exports.getAdminLogin = (req, res) => {
    res.render('admin/admin_login', { layout: 'admin', isLoginPage: true });
};

exports.postAdminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await User.findOne({ username, password, role: 'admin' });
        if (admin) {
            res.redirect('/admin');
        } else {
            res.render('admin/admin_login', { layout: 'admin', error: 'Invalid admin credentials.' });
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
            .populate('user')
            .lean();
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
                .populate({ path: 'slot', populate: { path: 'lab' } })
                .lean();
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ notFound: !user, reservations });
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
        const labs = await Lab.find().sort({ labName: 1 }).lean();
        res.render('admin/admin_slot_overview', { layout: 'admin', labs });
    } catch (err) {
        console.error('getAdminSlotsOverview error:', err);
        res.status(500).render('admin/admin_slot_overview', { layout: 'admin', error: 'Could not load slots.' });
    }
};

exports.getAdminSlotSearch = async (req, res) => {
    try {
        const { lab: labName, date } = req.query;

        if (!labName || !date) {
            return res.status(400).json({ error: 'lab and date query parameters are required.' });
        }

        const lab = await Lab.findOne({ labName });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const searchDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

        const slots = await Slot.find({
            lab: lab._id,
            date: { $gte: searchDate, $lt: nextDay }
        });

        // Count only reserved/walk-in seats per time slot from DB records
        const reservedCountMap = {};
        for (const slot of slots) {
            if (slot.status !== 'available') {
                reservedCountMap[slot.startTime] = (reservedCountMap[slot.startTime] || 0) + 1;
            }
        }

        // Emit a full entry for every time slot using lab.capacity as the source of truth
        const ALL_TIME_SLOTS = [
            '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
            '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
            '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
        ];

        const timeSlots = ALL_TIME_SLOTS.map(startTime => {
            const reservedSeats = reservedCountMap[startTime] || 0;
            const totalSeats = lab.capacity;
            const availableSeats = totalSeats - reservedSeats;
            return { startTime, totalSeats, availableSeats, reservedSeats };
        });

        res.json({
            lab: { labName: lab.labName, capacity: lab.capacity },
            date,
            timeSlots
        });
    } catch (err) {
        console.error('getAdminSlotSearch error:', err);
        res.status(500).json({ error: 'Slot search failed.' });
    }
};

exports.getAdminSlotSeats = async (req, res) => {
    try {
        const { lab: labName, date, timeIn } = req.query;

        if (!labName || !date || !timeIn) {
            return res.status(400).json({ error: 'lab, date, and timeIn are required.' });
        }

        const lab = await Lab.findOne({ labName });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const searchDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

        const slots = await Slot.find({
            lab: lab._id,
            date: { $gte: searchDate, $lt: nextDay },
            startTime: timeIn,
            status: { $in: ['reserved', 'walk-in'] }
        });

        const occupiedSeats = slots.map(s => String(s.seatNum));

        res.json({ occupiedSeats });
    } catch (err) {
        console.error('getAdminSlotSeats error:', err);
        res.status(500).json({ error: 'Failed to fetch seat data.' });
    }
};

exports.getAdminSlotReservation = async (req, res) => {
    try {
        const labs = await Lab.find().lean();
        res.render('admin/admin_slot_reservation', { layout: 'admin', labs });
    } catch (err) {
        console.error('getAdminSlotReservation error:', err);
        res.status(500).render('admin/admin_slot_reservation', { layout: 'admin', error: 'Could not load slot details.' });
    }
};

exports.postAdminSlotReservation = async (req, res) => {
    try {
        const { studentId, date, timeIn, timeOut, room, seats } = req.body;

        const user = await User.findOne({ idNum: studentId });
        if (!user) {
            return res.status(404).json({ error: 'Student ID not found.' });
        }

        const lab = await Lab.findOne({ labName: room });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);

        const results = [];
        for (const seatNum of seats) {
            // Upsert the slot: find or create it
            let slot = await Slot.findOne({
                lab: lab._id,
                date: slotDate,
                startTime: timeIn,
                seatNum: Number(seatNum)
            });

            if (slot && slot.status !== 'available') {
                results.push({ seat: seatNum, success: false, reason: 'Already reserved' });
                continue;
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
                await Slot.findByIdAndUpdate(slot._id, { status: 'reserved', endTime: timeOut });
            }

            await Reservation.create({
                user: user._id,
                slot: slot._id,
                isAnonymous: false,
                status: 'active'
            });

            results.push({ seat: seatNum, success: true });
        }

        res.json({ results });
    } catch (err) {
        console.error('postAdminSlotReservation error:', err);
        res.status(500).json({ error: 'Reservation failed.' });
    }
};

exports.postAdminSlotRemoval = async (req, res) => {
    try {
        const { date, timeIn, room, seats } = req.body;

        const lab = await Lab.findOne({ labName: room });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

        const results = [];
        for (const seatNum of seats) {
            const slot = await Slot.findOne({
                lab: lab._id,
                date: { $gte: slotDate, $lt: nextDay },
                startTime: timeIn,
                seatNum: Number(seatNum)
            });

            if (!slot) {
                results.push({ seat: seatNum, success: false, reason: 'Slot not found' });
                continue;
            }

            await Slot.findByIdAndUpdate(slot._id, { status: 'available' });
            await Reservation.updateMany({ slot: slot._id, status: 'active' }, { status: 'cancelled' });
            results.push({ seat: seatNum, success: true });
        }

        res.json({ results });
    } catch (err) {
        console.error('postAdminSlotRemoval error:', err);
        res.status(500).json({ error: 'Removal failed.' });
    }
};