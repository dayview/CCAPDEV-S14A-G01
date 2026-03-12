const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lab_controller');

router.get('/search', ctrl.getSearch);

module.exports = router;