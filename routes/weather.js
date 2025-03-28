const express = require('express');
const { check, validationResult } = require('express-validator');
const Weather = require('../models/weather');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /weather:
 *   post:
 *     summary: Create new weather data
 */
router.post(
  '/',
  [
    check('city').notEmpty().withMessage('City is required'),
    check('temperature').isNumeric().withMessage('Temperature must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { city, temperature, description, humidity, pressure, windSpeed, windDirection } = req.body;

      const existingWeatherData = await Weather.findOne({ city });

      if (existingWeatherData) {
        return res.status(400).json({ error: 'Weather data for this city already exists.' });
      }

      const newWeatherData = new Weather({ city, temperature, description, humidity, pressure, windSpeed, windDirection });
      await newWeatherData.save();
      res.status(201).json(newWeatherData);
    } catch (error) {
      res.status(500).json({ error: 'Error creating weather data' });
    }
  }
);

/**
 * @swagger
 * /weather/update/{city}:
 *   put:
 *     summary: Update weather data for a city
 */
router.put('/update/:city', ensureAuthenticated, async (req, res) => {
  try {
    const { city } = req.params;
    const updateFields = req.body;

    const updatedWeatherData = await Weather.findOneAndUpdate({ city }, updateFields, { new: true });

    if (!updatedWeatherData) {
      return res.status(404).json({ error: 'Weather data not found for this city' });
    }

    res.json(updatedWeatherData);
  } catch (error) {
    res.status(500).json({ error: 'Error updating weather data' });
  }
});

/**
 * @swagger
 * /weather/delete/{city}:
 *   delete:
 *     summary: Delete weather data for a city
 */
router.delete('/delete/:city', ensureAuthenticated, async (req, res) => {
  try {
    const { city } = req.params;
    const deletedWeatherData = await Weather.findOneAndDelete({ city });

    if (!deletedWeatherData) {
      return res.status(404).json({ error: 'No weather data found for this city to delete' });
    }

    res.json({ message: 'Weather data deleted successfully', data: deletedWeatherData });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting weather data' });
  }
});

module.exports = router;
