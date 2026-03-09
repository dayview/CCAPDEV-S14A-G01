const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin_controller');

router.get('/', ctrl.getAdminHome);

router.get('/login', ctrl.getAdminLogin);
router.post('/login', ctrl.postAdminLogin);

router.get('/reservations', ctrl.getAdminReservations);

router.get('/slots', ctrl.getAdminSlotsOverview);
router.get('/slots/:id', ctrl.getAdminSlotReservation);

module.exports = router;