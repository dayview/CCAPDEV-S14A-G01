const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin_controller');

router.get('/', ctrl.getAdminHome);

router.get('/login', ctrl.getAdminLogin);
router.post('/login', ctrl.postAdminLogin);

router.get('/reservations', ctrl.getAdminReservations);
router.get('/student-reservations', ctrl.getAdminStudentReservations);
router.get('/student-reservations/search', ctrl.getAdminStudentSearch);

router.get('/slots', ctrl.getAdminSlotsOverview);
router.get('/slots/search', ctrl.getAdminSlotSearch);
router.get('/slots/seats', ctrl.getAdminSlotSeats);
router.get('/slots/reservation', ctrl.getAdminSlotReservation);
router.post('/slots/reservation', ctrl.postAdminSlotReservation);
router.post('/slots/removal', ctrl.postAdminSlotRemoval);

module.exports = router;