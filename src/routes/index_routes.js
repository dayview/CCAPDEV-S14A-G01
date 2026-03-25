const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/index_controller');

router.get('/', ctrl.getIndex);
router.get('/about', (req, res) => res.render('about'));

module.exports = router;