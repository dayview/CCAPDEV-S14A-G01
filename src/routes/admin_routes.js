const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/admin_controller');
const { requireAdmin } = require('../middleware/auth');

const adminSlotRules = [
    body('studentId').notEmpty().withMessage('Student ID is required.'),
    body('date').notEmpty().withMessage('Date is required.'),
    body('timeIn').notEmpty().withMessage('Time-in is required.'),
    body('timeOut').notEmpty().withMessage('Time-out is required.'),
    body('room').notEmpty().withMessage('Room is required.'),
    body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected.')
];

const editRules = [
    body('date').notEmpty().withMessage('Date is required.'),
    body('timeIn').notEmpty().withMessage('Time-in is required.'),
    body('timeOut').notEmpty().withMessage('Time-out is required.'),
    body('room').notEmpty().withMessage('Room is required.'),
    body('seatNum').notEmpty().withMessage('Seat number is required.')
];

router.get('/login', ctrl.getAdminLogin);
router.post('/login', ctrl.postAdminLogin);
router.get('/logout', ctrl.getAdminLogout);

router.get('/', requireAdmin, ctrl.getAdminHome);
router.get('/reservations', requireAdmin, ctrl.getAdminReservations);
router.get('/student-reservations', requireAdmin, ctrl.getAdminStudentReservations);
router.get('/student-reservations/search', requireAdmin, ctrl.getAdminStudentSearch);

// Edit reservation routes
router.get('/reservations/edit/:id', requireAdmin, ctrl.getAdminEditReservation);
router.post('/reservations/edit/:id', requireAdmin, editRules, ctrl.postAdminEditReservation);

router.get('/slots', requireAdmin, ctrl.getAdminSlotsOverview);
router.get('/slots/search', requireAdmin, ctrl.getAdminSlotSearch);
router.get('/slots/seats', requireAdmin, ctrl.getAdminSlotSeats);
router.get('/slots/reservation', requireAdmin, ctrl.getAdminSlotReservation);
router.post('/slots/reservation', requireAdmin, adminSlotRules, ctrl.postAdminSlotReservation);
router.post('/slots/removal', requireAdmin, ctrl.postAdminSlotRemoval);

// Search user routes
router.get("/search-user", requireAdmin, ctrl.getAdminSearchUser);
router.get("/search-user/lookup", requireAdmin, ctrl.getAdminUserLookup);
router.post("/search-user/edit/:id", requireAdmin, ctrl.postAdminEditUser);
router.post("/search-user/delete/:id", requireAdmin, ctrl.postAdminDeleteUser);

module.exports = router;
