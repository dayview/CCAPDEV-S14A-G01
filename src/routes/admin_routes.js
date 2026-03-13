const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin_controller');
const { requireAdmin } = require('../middleware/auth');

router.get('/login', ctrl.getAdminLogin);
router.post('/login', ctrl.postAdminLogin);
router.get('/logout', ctrl.getAdminLogout);

router.get('/', requireAdmin, ctrl.getAdminHome);
router.get('/reservations', requireAdmin, ctrl.getAdminReservations);
router.get('/student-reservations', requireAdmin, ctrl.getAdminStudentReservations);
router.get('/student-reservations/search', requireAdmin, ctrl.getAdminStudentSearch);
router.get('/slots', requireAdmin, ctrl.getAdminSlotsOverview);
router.get('/slots/search', requireAdmin, ctrl.getAdminSlotSearch);
router.get('/slots/seats', requireAdmin, ctrl.getAdminSlotSeats);
router.get('/slots/reservation', requireAdmin, ctrl.getAdminSlotReservation);
router.post('/slots/reservation', requireAdmin, ctrl.postAdminSlotReservation);
router.post('/slots/removal', requireAdmin, ctrl.postAdminSlotRemoval);

module.exports = router;