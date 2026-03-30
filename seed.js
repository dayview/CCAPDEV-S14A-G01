require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const bcrypt = require('bcrypt');

const User = require('./src/models/User');
const Lab = require('./src/models/Lab');
const Slot = require('./src/models/Slot');
const Reservation = require('./src/models/Reservation');

const d = (offsetDays = 0) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offsetDays);
    return date;
};

const users = [
    {
        idNum: '12345678', username: 'dcheng', firstName: 'Danny', lastName: 'Cheng',
        email: 'danny_cheng@dlsu.edu.ph', password: 'dcheng123',
        role: 'admin', description: 'Administrator for DLSU - IT Department'
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
        labName: 'GK302A', building: 'Gokongwei', floor: 3, capacity: 20,
        openTime: '07:30', closeTime: '18:00', description: 'General purpose for CS laboratory classes'
    },
    {
        labName: 'GK302B', building: 'Gokongwei', floor: 3, capacity: 20,
        openTime: '07:30', closeTime: '18:00', description: 'General purpose for CS laboratory classes'
    },
    {
        labName: 'GK304B', building: 'Gokongwei', floor: 3, capacity: 20,
        openTime: '07:30', closeTime: '18:00', description: 'CS-ST laboratory classes'
    },
    {
        labName: 'GK305A', building: 'Gokongwei', floor: 3, capacity: 20,
        openTime: '07:30', closeTime: '18:00', description: 'CS lab for networking classes'
    },
    {
        labName: 'GK305B', building: 'Gokongwei', floor: 3, capacity: 20,
        openTime: '07:30', closeTime: '18:00', description: 'CS lab for software engineering classes'
    }
];

async function seed() {
    await connectDB();
    await Promise.all([
        User.deleteMany({}),
        Lab.deleteMany({}),
        Slot.deleteMany({}),
        Reservation.deleteMany({})
    ]);
    console.log('Collections cleared.');

    const hashedUsers = await Promise.all(
        users.map(async u => ({ ...u, password: await bcrypt.hash(u.password, 10)}))
    );
    
    const insertedUsers = await User.insertMany(hashedUsers);
    const insertedLabs = await Lab.insertMany(labs);
    console.log(`Inserted ${insertedUsers.length} users, ${insertedLabs.length} labs.`);
    
    const labId = name => insertedLabs.find(l => l.labName === name)._id;
    const GK302A = labId('GK302A');
    const GK302B = labId('GK302B');
    const GK304B = labId('GK304B');
    const GK305A = labId('GK305A');
    const GK305B = labId('GK305B');

    const slots = [
        { lab: GK302A, date: d(3),  startTime: '08:00', endTime: '08:30', seatNum: 1,  status: 'reserved'  }, // r01, lpavino
        { lab: GK302A, date: d(3),  startTime: '09:00', endTime: '09:30', seatNum: 2,  status: 'reserved'  }, // r02, jmajor (anonymous reservation)
        { lab: GK302A, date: d(4),  startTime: '10:00', endTime: '10:30', seatNum: 3,  status: 'reserved'  }, // r03, asese
        { lab: GK302B, date: d(4),  startTime: '11:00', endTime: '11:30', seatNum: 5,  status: 'reserved'  }, // r04, mcolcol
        { lab: GK304B, date: d(5),  startTime: '13:00', endTime: '13:30', seatNum: 4,  status: 'reserved'  }, // r05, lpavino (second reservation)
        { lab: GK305A, date: d(6),  startTime: '14:00', endTime: '14:30', seatNum: 7,  status: 'reserved'  }, // r06, jmajor
        { lab: GK305B, date: d(7),  startTime: '15:00', endTime: '15:30', seatNum: 2,  status: 'reserved'  }, // r07, asese (second reservation)
        { lab: GK302A, date: d(7),  startTime: '16:00', endTime: '16:30', seatNum: 6,  status: 'reserved'  }, // r08, mcolcol (second reservation)
        { lab: GK302B, date: d(10), startTime: '08:00', endTime: '08:30', seatNum: 3,  status: 'reserved'  }, // r09, lpavino (third reservation)
        { lab: GK304B, date: d(11), startTime: '09:00', endTime: '09:30', seatNum: 10, status: 'reserved'  }, // r10, jmajor (third reservation)
        { lab: GK305A, date: d(12), startTime: '10:00', endTime: '10:30', seatNum: 1,  status: 'reserved'  }, // r11, asese (third reservation)

        // Available slots for search/availability demonstration (expected seed)
        { lab: GK302A, date: d(3),  startTime: '11:00', endTime: '11:30', seatNum: 4,  status: 'available' },
        { lab: GK302A, date: d(4),  startTime: '13:00', endTime: '13:30', seatNum: 5,  status: 'available' },
        { lab: GK302B, date: d(5),  startTime: '08:00', endTime: '08:30', seatNum: 8,  status: 'available' },
        { lab: GK304B, date: d(6),  startTime: '14:00', endTime: '14:30', seatNum: 2,  status: 'available' },
        { lab: GK305B, date: d(7),  startTime: '09:00', endTime: '09:30', seatNum: 9,  status: 'available' },
        { lab: GK305A, date: d(10), startTime: '15:00', endTime: '15:30', seatNum: 6,  status: 'available' },
        { lab: GK302B, date: d(3),  startTime: '07:30', endTime: '08:00', seatNum: 1,  status: 'walk-in'   },
    ];

    const insertedSlots = await Slot.insertMany(slots);
    console.log(`Inserted ${insertedSlots.length} slots.`);

    const [r01, r02, r03, r04, r05, r06, r07, r08, r09, r10, r11] = insertedSlots;
    const [u1_admin, u2_lpavino, u3_jmajor, u4_asese, u5_mcolcol] = insertedUsers;

    const reservations = [
        { user: u2_lpavino._id, slot: r01._id, isAnonymous: false, status: 'active',    remarks: 'Need seat near power outlet.' },
        { user: u2_lpavino._id, slot: r05._id, isAnonymous: false, status: 'active',    remarks: 'Group study session.' },
        { user: u2_lpavino._id, slot: r09._id, isAnonymous: false, status: 'active',    remarks: 'Thesis final review.' },
        { user: u3_jmajor._id,  slot: r02._id, isAnonymous: true,  status: 'active',    remarks: 'Anonymous booking for thesis work.' },
        { user: u3_jmajor._id,  slot: r06._id, isAnonymous: false, status: 'active',    remarks: 'Lab practice.' },
        { user: u3_jmajor._id,  slot: r10._id, isAnonymous: false, status: 'active',    remarks: 'Exam review.' },
        { user: u4_asese._id,   slot: r03._id, isAnonymous: false, status: 'active',    remarks: 'Working on math project.' },
        { user: u4_asese._id,   slot: r07._id, isAnonymous: false, status: 'active',    remarks: 'Self-study session.' },
        { user: u4_asese._id,   slot: r11._id, isAnonymous: true,  status: 'active',    remarks: '' },
        { user: u5_mcolcol._id, slot: r04._id, isAnonymous: false, status: 'active',    remarks: 'Software engineering demo prep.' },
        { user: u5_mcolcol._id, slot: r08._id, isAnonymous: false, status: 'active',    remarks: 'Capstone project work.' },

        // For reservation history view demo
        { user: u2_lpavino._id, slot: r04._id, isAnonymous: false, status: 'cancelled', remarks: 'Schedule conflict.' },
        { user: u3_jmajor._id,  slot: r03._id, isAnonymous: false, status: 'completed', remarks: 'Completed database project.' },
        { user: u4_asese._id,   slot: r01._id, isAnonymous: false, status: 'cancelled', remarks: 'Class was moved online.' },
        { user: u5_mcolcol._id, slot: r02._id, isAnonymous: false, status: 'completed', remarks: 'Finished CCAPDEV phase 2.' },
    ];

    const insertedReservations = await Reservation.insertMany(reservations);
    console.log(`Inserted ${insertedReservations.length} reservations.`);

    console.log('\nSeeding complete. Sample accounts have been inserted.')
    console.log('  Admin   → username: dcheng   | password: dcheng123');
    console.log('  Student → username: lpavino  | password: lpavino121');
    console.log('  Student → username: jmajor   | password: jmajor121');
    console.log('  Student → username: asese    | password: asese123');
    console.log('  Student → username: mcolcol  | password: mcolcol123');
    mongoose.disconnect();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    mongoose.disconnect();
});