const mongoose = require('mongoose');

// Define the Weather schema
const WeatherSchema = new mongoose.Schema({
    city: { type: String, required: true },
    temperature: { type: Number, required: true },
    description: { type: String, required: true },
    humidity: { type: Number, required: true },
    pressure: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    windDirection: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create the Weather model from the schema
const Weather = mongoose.model('Weather', WeatherSchema);

// Export the model for use in other files
module.exports = Weather;
