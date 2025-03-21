const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    city: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', LocationSchema);
