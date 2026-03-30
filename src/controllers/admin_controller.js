const { validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Slot = require('../models/Slot');
const Lab = require('../models/Lab');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAdminHome = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).lean();
        res.render('admin/admin_homepage', { layout: 'admin', username: user?.username });
    } catch (err) {
        console.error('getAdminHome error:', err);
        res.status(500).render('error', { message: 'Could not load dashboard.' });
    }
};

exports.getAdminLogin = (req, res) => {
    res.render('admin/admin_login', { layout: 'admin', isLoginPage: true });
};

exports.postAdminLogin = async (req, res) => {
    try {
        const { username, password, remember } = req.body;
        const admin = await User.findOne({ username, role: 'admin' });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.render('admin/admin_login', { layout: 'admin', isLoginPage: true, error: 'Invalid admin credentials.' });
        }
        req.session.userId = admin._id;
        req.session.username = admin.username;
        req.session.isAdmin = true;
        if (remember) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
        } else {
            req.session.cookie.expires = false; // session cookie, expires on browser close
        }
        res.redirect('/admin');
    } catch (err) {
        console.error('postAdminLogin error:', err);
        res.status(500).render('admin/admin_login', { layout: 'admin', isLoginPage: true, error: 'Something went wrong.' });
    }
};

exports.getAdminLogout = (req, res) => {
    req.session.destroy(() => res.redirect('/admin/login'));
};

exports.getAdminReservations = (req, res) => {
    res.render('admin/admin_reservation', { layout: 'admin' });
};

exports.getAdminStudentReservations = (req, res) => {
    res.redirect('/admin/reservations');
};

exports.getAdminStudentSearch = async (req, res) => {
    try {
        const { idNum } = req.query;
        if (!idNum) {
            return res.render('admin/admin_reservation', { layout: 'admin' });
        }
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

        res.render('admin/admin_reservation', {
            layout: 'admin',
            reservations,
            searchedId: idNum,
            notFound: !user
        });
    } catch (err) {
        console.error('getAdminStudentSearch error:', err);
        res.status(500).render('admin/admin_reservation', { layout: 'admin', error: 'Search failed.' });
    }
};

exports.getAdminSlotsOverview = async (req, res) => {
    try {
        const labs = await Lab.find().sort({ labName: 1 }).lean();
        const user = await User.findById(req.session.userId).lean();
        res.render('admin/admin_slot_overview', { layout: 'admin', labs, username: user?.username });
    } catch (err) {
        console.error('getAdminSlotsOverview error:', err);
        res.status(500).render('admin/admin_slot_overview', { layout: 'admin', error: 'Could not load slots.' });
    }
};

// Helper: convert "HH:MM" to total minutes
function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

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
const searchDate = new Date(Date.UTC(year, month - 1, day));
const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

const slots = await Slot.find({
            lab: lab._id,
            date: { $gte: searchDate, $lt: nextDay }
        });

        const ALL_TIME_SLOTS = [
            '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
            '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
            '15:30', '16:00', '16:30', '17:00', '17:30'
        ];

        // FIX: expand each slot across all 30-min intervals it covers (startTime to endTime)
        const reservedCountMap = {};
        for (const slot of slots) {
            if (slot.status !== 'available') {
                const start = timeToMinutes(slot.startTime);
                const end   = timeToMinutes(slot.endTime);
                for (const ts of ALL_TIME_SLOTS) {
                    const tsMin = timeToMinutes(ts);
                    if (tsMin >= start && tsMin < end) {
                        reservedCountMap[ts] = (reservedCountMap[ts] || 0) + 1;
                    }
                }
            }
        }

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
        const searchDate = new Date(Date.UTC(year, month - 1, day));
        const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
        const allSlots = await Slot.find({
            lab: lab._id,
            date: { $gte: searchDate, $lt: nextDay },
            status: { $in: ['reserved', 'walk-in'] }
        });

        const queryMinutes = timeToMinutes(timeIn);

        const occupiedSeats = allSlots
            .filter(s => {
                const start = timeToMinutes(s.startTime);
                const end   = timeToMinutes(s.endTime);
                return queryMinutes >= start && queryMinutes < end;
            })
            .map(s => String(s.seatNum));

        res.json({ occupiedSeats });
    } catch (err) {
        console.error('getAdminSlotSeats error:', err);
        res.status(500).json({ error: 'Failed to fetch seat data.' });
    }
};

exports.getAdminSlotReservation = async (req, res) => {
    try {
        const labs = await Lab.find().lean();
        const user = await User.findById(req.session.userId).lean();
        res.render('admin/admin_slot_reservation', { layout: 'admin', labs, username: user?.username });
    } catch (err) {
        console.error('getAdminSlotReservation error:', err);
        res.status(500).render('admin/admin_slot_reservation', { layout: 'admin', error: 'Could not load slot details.' });
    }
};

exports.postAdminSlotReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { studentId, date, timeIn, timeOut, room, seats, isAnonymous } = req.body;

        const user = await User.findOne({ idNum: studentId });
        if (!user) {
            return res.status(404).json({ error: 'Student ID not found.' });
        }

        const lab = await Lab.findOne({ labName: room });
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(Date.UTC(year, month - 1, day));

        const results = [];
        for (const seatNum of seats) {
    // Fetch ALL reserved/walk-in slots for this seat on this day
    const daySlots = await Slot.find({
        lab: lab._id,
        date: slotDate,
        seatNum: Number(seatNum),
        status: { $in: ['reserved', 'walk-in'] }
    });

    // Check if any existing slot overlaps the requested timeIn–timeOut window
    const reqStart = timeToMinutes(timeIn);
    const reqEnd   = timeToMinutes(timeOut);

    const conflict = daySlots.find(s => {
        const sStart = timeToMinutes(s.startTime);
        const sEnd   = timeToMinutes(s.endTime);
        return reqStart < sEnd && reqEnd > sStart;
    });

    if (conflict) {
        results.push({ seat: seatNum, success: false, reason: 'Already reserved' });
        continue;
    }

    const slot = await Slot.create({
        lab: lab._id,
        date: slotDate,
        startTime: timeIn,
        endTime: timeOut,
        seatNum: Number(seatNum),
        status: 'reserved'
    });

    await Reservation.create({
        user: user._id,
        slot: slot._id,
        isAnonymous: !!isAnonymous,
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
        const slotDate = new Date(Date.UTC(year, month - 1, day));
        const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

        const results = [];
        for (const seatNum of seats) {

    const daySlots = await Slot.find({
        lab: lab._id,
        date: { $gte: slotDate, $lt: nextDay },
        seatNum: Number(seatNum),
        status: { $in: ['reserved', 'walk-in'] }
    });

    const reqMinutes = timeToMinutes(timeIn);

    const slot = daySlots.find(s => {
        const sStart = timeToMinutes(s.startTime);
        const sEnd   = timeToMinutes(s.endTime);
        return reqMinutes >= sStart && reqMinutes < sEnd;
    });

    if (!slot) {
        results.push({ seat: seatNum, success: false, reason: 'Slot not found' });
        continue;
    }

    await Slot.findByIdAndUpdate(slot._id, { status: 'available' }, { runValidators: true });
    await Reservation.updateMany({ slot: slot._id, status: 'active' }, { status: 'cancelled' });
    results.push({ seat: seatNum, success: true });
}

        res.json({ results });
    } catch (err) {
        console.error('postAdminSlotRemoval error:', err);
        res.status(500).json({ error: 'Removal failed.' });
    }
};

exports.getAdminEditReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate({ path: 'slot', populate: { path: 'lab' } })
            .populate('user')
            .lean();

        if (!reservation) {
            return res.status(404).render('error', { message: 'Reservation not found.' });
        }

        if (reservation.status !== 'active') {
            return res.status(403).render('error', { message: 'Only active reservations can be edited.' });
        }

        const localDate = new Date(reservation.slot.date);
        const adjusted  = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        const dateValue = adjusted.toISOString().split('T')[0];

        const labs      = await Lab.find().sort({ labName: 1 }).lean();
        const adminUser = await User.findById(req.session.userId).lean();

        const currentLabName = reservation.slot.lab.labName;
        labs.forEach(lab => {
            lab.selected = lab.labName === currentLabName ? 'selected' : '';
        });
        
        res.render('admin/admin_edit_reservation', {
            layout: 'admin',
            reservation,
            dateValue,
            labs,
            username: adminUser?.username
        });
    } catch (err) {
        console.error('getAdminEditReservation error:', err);
        res.status(500).render('error', { message: 'Could not load edit page.' });
    }
};

exports.postAdminEditReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate({ path: 'slot', populate: { path: 'lab' } })
            .populate('user');

        if (!reservation || reservation.status !== 'active') {
            return res.status(403).render('error', { message: 'Reservation cannot be edited.' });
        }

        // timeOut now comes directly from the form submission
        const { date, timeIn, timeOut, room, seatNum, isAnonymous } = req.body;

        if (!timeOut) {
            return res.status(400).render('error', { message: 'Time Out is required.' });
        }

        const lab = await Lab.findOne({ labName: room });
        if (!lab) {
            return res.status(404).render('error', { message: 'Lab not found.' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const slotDate = new Date(Date.UTC(year, month - 1, day));

        const currentSlot = reservation.slot;

        let newSlot = await Slot.findOne({
            lab:       lab._id,
            date:      slotDate,
            startTime: timeIn,
            seatNum:   Number(seatNum)
        });

        const isSameSlot = newSlot && String(newSlot._id) === String(currentSlot._id);
        if (newSlot && !isSameSlot && newSlot.status !== 'available') {
            const localDate = new Date(currentSlot.date);
            const adjusted  = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
            const dateValue = adjusted.toISOString().split('T')[0];
            const labs      = await Lab.find().sort({ labName: 1 }).lean();
            const adminUser = await User.findById(req.session.userId).lean();

            return res.status(409).render('admin/admin_edit_reservation', {
                layout: 'admin',
                reservation: reservation.toObject(),
                dateValue,
                labs,
                username: adminUser?.username,
                error: 'That seat is already reserved at the selected date and time.'
            });
        }

        if (!newSlot) {
            try {
                newSlot = await Slot.create({
                    lab:       lab._id,
                    date:      slotDate,
                    startTime: timeIn,
                    endTime:   timeOut,
                    seatNum:   Number(seatNum),
                    status:    'reserved'
                });
            } catch (createErr) {
                if (createErr.code === 11000) {
                    const localDate = new Date(currentSlot.date);
                    const adjusted  = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
                    const dateValue = adjusted.toISOString().split('T')[0];
                    const labs      = await Lab.find().sort({ labName: 1 }).lean();
                    const adminUser = await User.findById(req.session.userId).lean();
                    return res.status(409).render('admin/admin_edit_reservation', {
                        layout: 'admin',
                        reservation: reservation.toObject(),
                        dateValue,
                        labs,
                        username: adminUser?.username,
                        error: 'That seat was just reserved by someone else. Please choose another.'
                    });
                }
                throw createErr;
            }
        } else if (!isSameSlot) {
            await Slot.findByIdAndUpdate(newSlot._id, { status: 'reserved', endTime: timeOut });
        } else {
            // Same slot — just update the endTime in case timeOut changed
            await Slot.findByIdAndUpdate(newSlot._id, { endTime: timeOut });
        }

        await Reservation.findByIdAndUpdate(reservation._id, {
            slot:        newSlot._id,
            isAnonymous: !!isAnonymous
        });

        if (String(currentSlot._id) !== String(newSlot._id)) {
            await Slot.findByIdAndUpdate(currentSlot._id, { status: 'available' });
        }

        res.redirect('/admin/reservations');
    } catch (err) {
        console.error('postAdminEditReservation error:', err);
        res.status(500).render('error', { message: 'Could not update reservation.' });
    }
};

exports.getAdminSearchUser = (req, res) => {
    res.render('admin/admin_search_user', { layout: 'admin' });
};

exports.getAdminUserLookup = async (req, res) => {
    try {
        const { idNum } = req.query;
        const user = await User.findOne({ idNum }).lean();
        if (!user) return res.json({ notFound: true });
        // Don't expose the hashed password
        const { password: _pw, ...safeUser } = user;
        res.json({ notFound: false, user: safeUser });
    } catch (err) {
        console.error('getAdminUserLookup error:', err);
        res.status(500).json({ error: 'Lookup failed.' });
    }
};

exports.postAdminEditUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, description, password } = req.body;

        const target = await User.findById(id);
        if (!target) return res.status(404).json({ error: 'User not found.' });
        if (target.role === 'admin') return res.status(403).json({ error: 'Admin accounts cannot be edited.' });

        // Check username uniqueness (excluding self)
        const existing = await User.findOne({ username, _id: { $ne: id } });
        if (existing) return res.status(409).json({ error: 'Username is already taken.' });

        const update = { username, description };
        if (password) {
            update.password = await bcrypt.hash(password, 10);
        }

        await User.findByIdAndUpdate(id, update, { runValidators: true });
        res.json({ success: true });
    } catch (err) {
        console.error('postAdminEditUser error:', err);
        res.status(500).json({ error: 'Update failed.' });
    }
};

exports.postAdminDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const target = await User.findById(id);
        if (!target) return res.status(404).json({ error: 'User not found.' });
        if (target.role === 'admin') return res.status(403).json({ error: 'Admin accounts cannot be deleted.' });

        // Cancel active reservations and free up their slots
        const activeReservations = await Reservation.find({ user: id, status: 'active' });
        for (const reservation of activeReservations) {
            await Slot.findByIdAndUpdate(reservation.slot, { status: 'available' });
        }

        await Reservation.deleteMany({ user: id });
        await User.findByIdAndDelete(id);

        res.json({ success: true });
    } catch (err) {
        console.error('postAdminDeleteUser error:', err);
        res.status(500).json({ error: 'Delete failed.' });
    }
};

