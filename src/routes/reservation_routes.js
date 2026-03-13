const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservation_controller');
const { requireStudent } = require('../middleware/auth');

router.get('/', ctrl.getReservationOverview);

router.get('/student', requireStudent, ctrl.getStudentReservation);
router.post('/student', requireStudent, ctrl.postStudentReservation);

router.get('/search', requireStudent, ctrl.getSearchPage);
router.get('/search-availability', requireStudent, ctrl.searchAvailability);

router.get('/edit', requireStudent, ctrl.getEditPage);
router.get('/delete', requireStudent, ctrl.getDeletePage);

router.get('/edit/:id', requireStudent, ctrl.getEditReservation);
router.post('/edit/:id', requireStudent, ctrl.postEditReservation);
router.post('/delete/:id', requireStudent, ctrl.postDeleteReservation);


module.exports = router;