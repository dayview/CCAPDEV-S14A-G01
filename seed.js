require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

const User = require('./src/models/User');
const Lab = require('./src/models/Lab');
const Slot = require('./src/models/Slot');
const Reservation = require('./src/models/Reservation');

const users = [
    {
        idNum: '12345678', username: 'dcheng', firstName: 'Danny', lastName: 'Cheng',
        email: 'danny_cheng@dlsu.edu.ph', password: 'dcheng123',
        role: 'student', description: 'BSCS-ST, ID123'
    },
    {
        idNum: '12100005', username: 'lpavino', firstName: 'Leon', lastName: 'Pavino',
        email: 'leon_pavino@dlsu.edu.ph', password: 'lpavino121',
        role: 'student', description: 'BSIS, ID121'
    },
    {
        idNum: '12100099', username: 'jmajor', firstName: 'Justine', lastName: 'Major',
        email: 'justine_major@dlsu.edu.ph', password: 'jmajor121',
        role: 'student', description: 'BSCS-ST, ID123'
    },
    {
        idNum: '12100021', username: 'asese', firstName: 'Alj', lastName: 'Sese',
        email: 'alj_sese@dlsu.edu.ph', password: 'asese123',
        role: 'student', description: 'BS-MTH, ID121'
    },
    {
        idNum: '12100056', username: 'mcolcol', firstName: 'Massi', lastName: 'Colcol',
        email: 'massi_colcol@dlsu.edu.ph', password: 'mcolcol123',
        role: 'student', description: 'BSCS-ST, ID122'
    }
];

const labs = [
    {
        labName: 'GK301A', building: 'Gokongwei', floor: 3, capacity: 40,
        openTime: '07:30', closeTime: '19:00', description: 'General purpose for CS laboratory classes'
    },
    {
        labName: 'GK301B', building: 'Gokongwei', floor: 3, capacity: 40,
        openTime: '07:30', closeTime: '19:00', description: 'General purpose for CS laboratory classes'
    },
    {
        labName: 'GK302', building: 'Gokongwei', floor: 3, capacity: 35,
        openTime: '08:00', closeTime: '18:00', description: 'CS-ST laboratory classes'
    },
    {
        labName: 'AG1901', building: 'Andrew', floor: 19, capacity: 30,
        openTime: '07:30', closeTime: '20:00', description: 'IT/IS laboratory classes'
    },
    {
        labName: 'LS307', building: 'La Salle', floor: 3, capacity: 25,
        openTime: '08:00', closeTime: '17:00', description: 'COB/SOE/COS Multi-laboratory classes'
    }
];

const d = (str) => new Date(str);

async function seed() {
    await connectDB();

    await Promise.all([
        User.deleteMany({}),
        Lab.deleteMany({}),
        Slot.deleteMany({}),
        Reservation.deleteMany({})
    ]);
    console.log('Collections cleared.');

    const insertedUsers = await User.insertMany(users);
    const insertedLabs = await Lab.insertMany(labs);
    console.log(`Inserted ${insertedUsers.length} users, ${insertedLabs.length} labs.`);

    const GK301A = insertedLabs.find(l => l.labName === 'GK301A')._id;
    const GK301B = insertedLabs.find(l => l.labName === 'GK301B')._id;
    const AG1901 = insertedLabs.find(l => l.labName === 'AG1901')._id;

    const slots = [
        { lab: GK301A, date: d('2026-03-10'), startTime: '08:00', endTime: '09:30', seatNum: 1, status: 'available' },
        { lab: GK301A, date: d('2026-03-10'), startTime: '08:00', endTime: '09:30', seatNum: 2, status: 'reserved' },
        { lab: GK301A, date: d('2026-03-10'), startTime: '10:00', endTime: '11:30', seatNum: 1, status: 'available' },
        { lab: GK301B, date: d('2026-03-10'), startTime: '08:00', endTime: '09:30', seatNum: 5, status: 'walk-in' },
        { lab: GK301B, date: d('2026-03-11'), startTime: '13:00', endTime: '14:30', seatNum: 3, status: 'available' },
        { lab: AG1901, date: d('2026-03-11'), startTime: '09:00', endTime: '10:30', seatNum: 10, status: 'reserved' },
        { lab: AG1901, date: d('2026-03-12'), startTime: '14:00', endTime: '15:30', seatNum: 7, status: 'available' },
        { lab: AG1901, date: d('2026-03-12'), startTime: '16:00', endTime: '17:30', seatNum: 2, status: 'available' }
    ];

    const insertedSlots = await Slot.insertMany(slots);
    console.log(`Inserted ${insertedSlots.length} slots.`);

    const [u1, u2, u3, u4, u5] = insertedUsers;
    const [s1, s2, , , s5, s6] = insertedSlots;

    const reservations = [
        { user: u1._id, slot: s2._id, isAnonymous: false, status: 'active', remarks: 'Need seat near power outlet.' },
        { user: u2._id, slot: s6._id, isAnonymous: false, status: 'active', remarks: '' },
        { user: u3._id, slot: s1._id, isAnonymous: true, status: 'active', remarks: 'Anonymous booking for thesis work.' },
        { user: u4._id, slot: s5._id, isAnonymous: false, status: 'cancelled', remarks: 'Schedule conflict.' },
        { user: u5._id, slot: s2._id, isAnonymous: false, status: 'completed', remarks: 'Completed database project.' },
        { user: u1._id, slot: s6._id, isAnonymous: false, status: 'active', remarks: 'Follow-up session.' }
    ];

    const insertedReservations = await Reservation.insertMany(reservations);
    console.log(`Inserted ${insertedReservations.length} reservations.`);

    console.log('\nSeeding complete.');
    mongoose.disconnect();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    mongoose.disconnect();
});