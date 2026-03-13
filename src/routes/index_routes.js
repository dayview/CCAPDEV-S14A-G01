const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/index_controller');

router.get('/', ctrl.getIndex);
router.get('/user_profile', ctrl.getUserProfile);

module.exports = router;