const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservation_controller');

router.get('/', ctrl.getReservationOverview);

router.get('/student', ctrl.getStudentReservation);
router.post('/student', ctrl.postStudentReservation);

router.get('/search', ctrl.getSearchPage);
router.get('/edit', ctrl.getEditPage);
router.get('/delete', ctrl.getDeletePage);

router.get('/edit/:id', ctrl.getEditReservation);
router.post('/edit/:id', ctrl.postEditReservation);
router.post('/delete/:id', ctrl.postDeleteReservation);

module.exports = router;