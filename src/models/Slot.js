const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    lab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    seatNum: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: ['available', 'reserved', 'walk-in'],
        default: 'available'
    }
}, { timestamps: true });

slotSchema.index({ lab: 1, date: 1, startTime: 1, seatNum: 1 }, { unique: true});

module.exports = mongoose.model('Slot', slotSchema);