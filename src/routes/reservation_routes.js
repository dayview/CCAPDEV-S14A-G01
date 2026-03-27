const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/reservation_controller');
const { requireStudent } = require('../middleware/auth');

const reservationRules = [
    body('labName').notEmpty().withMessage('Please select a room.'),
    body('date').notEmpty().withMessage('Please select a date.'),
    body('timeIn').notEmpty().withMessage('Please select a time.'),
    body('seatNum').notEmpty().withMessage('Please select a seat.')
];

const editRules = [
    body('date').notEmpty().withMessage('Please select a date.'),
    body('timeIn').notEmpty().withMessage('Please select a time.'),
];

router.get('/', ctrl.getReservationOverview);

router.get('/reservation_history', requireStudent, ctrl.getStudentReservation);
router.post('/student', requireStudent, reservationRules, ctrl.postStudentReservation);

router.get('/search', ctrl.getSearchPage);
router.get('/search-availability', ctrl.searchAvailability);

router.get('/edit', requireStudent, ctrl.getEditPage);
router.get('/delete', requireStudent, ctrl.getDeletePage);

router.post('/edit/:id', requireStudent, editRules, ctrl.postEditReservation);
router.post('/delete/:id', requireStudent, ctrl.postDeleteReservation);

module.exports = router;