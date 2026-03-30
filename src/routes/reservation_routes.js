const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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

const profileRules = [
    body('username').notEmpty().trim().escape().withMessage('Username is required.'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('password').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.session.userId}-${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

router.get('/', ctrl.getReservationOverview);

router.get('/reservation_history', requireStudent, ctrl.getStudentReservation);
router.post('/student', requireStudent, ctrl.postStudentReservation);

router.post('/user_profile', requireStudent, upload.single('profilePicture'), profileRules, ctrl.postEditProfile);

router.get('/search', ctrl.getSearchPage);
router.get('/search-availability', ctrl.searchAvailability);

router.get('/edit', requireStudent, ctrl.getEditPage);
router.get('/delete', requireStudent, ctrl.getDeletePage);

router.post('/edit/:id', requireStudent, editRules, ctrl.postEditReservation);
router.post('/delete/:id', requireStudent, ctrl.postDeleteReservation);

module.exports = router;
