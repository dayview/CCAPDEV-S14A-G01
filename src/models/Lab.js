const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    labName: { type: String, required: true, unique: true, trim: true },
    building: { type: String, required: true, trim: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);