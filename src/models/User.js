const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    idNum: {
        type: String,
        required: true,
        unique: true,
        match: /^\d{8}$/
        /* Implementation notes: <to insert> */
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[^\s@]+@dlsu\.edu\.ph$/
        /* Implementation notes: <to insert> */
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profilePicture: { type: String, default: '/images/default_avatar.png' },
    description: { type: String, default: '', maxlength: 300 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);