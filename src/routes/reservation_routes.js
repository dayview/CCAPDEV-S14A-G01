const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/reservation_controller');
const { requireStudent } = require('../middleware/auth');

const reservationRules = [];

const editRules = [
    body('remarks').optional().isLength({ max: 300 }).withMessage('Remarks must be 300 characters or fewer.')
];

router.get('/', ctrl.getReservationOverview);

router.get('/student', requireStudent, ctrl.getStudentReservation);
router.post('/student', requireStudent, reservationRules, ctrl.postStudentReservation);

router.get('/search', ctrl.getSearchPage);
router.get('/search-availability', ctrl.searchAvailability);

router.get('/edit', requireStudent, ctrl.getEditPage);
router.get('/delete', requireStudent, ctrl.getDeletePage);

router.get('/edit/:id', requireStudent, ctrl.getEditReservation);
router.post('/edit/:id', requireStudent, editRules, ctrl.postEditReservation);
router.post('/delete/:id', requireStudent, ctrl.postDeleteReservation);

module.exports = router;