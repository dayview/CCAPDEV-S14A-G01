const Slot = require('../models/Slot');
const Lab = require('../models/Lab');

exports.getSearch = async (req, res) => {
    try {
        const { labName, date } = req.query;
        let filter = { status: 'available' };
        if (date) filter.date = new Date(date);
        const slots = await Slot.find(filter).populate('lab');
        const labs = await Lab.find();
        res.render('search', { slots, labs, query: req.query });
    } catch (err) {
        console.error('getSearch error:', err);
        res.status(500).render('search', { error: 'Could not perform search.' });
    }
};