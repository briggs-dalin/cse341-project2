const express = require('express');
const { check, validationResult } = require('express-validator');
const Weather = require('../models/weather');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();



fetch('YOUR_OPENWEATHER_API_URL')
  .then(response => response.json()) 
  .then(data => {
    const formattedData = {
      city: data.name,
      temperature: data.main.temp - 273.15, // Convert from Kelvin to Celsius
      description: data.weather[0].description,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      timestamp: new Date().toISOString(), // Current timestamp
      __v: 0
    };

    console.log(formattedData); 
  })
  .catch(error => console.error('Error:', error));


/**
 * @swagger
 * components:
 *   schemas:
 *     Weather:
 *       type: object
 *       properties:
 *         city:
 *           type: string
 *           description: The name of the city
 *         temperature:
 *           type: number
 *           description: The temperature of the city
 *         description:
 *           type: string
 *           description: A brief description of the weather
 *         humidity:
 *           type: number
 *           description: The humidity level in percentage
 *         pressure:
 *           type: number
 *           description: The air pressure
 *         windSpeed:
 *           type: number
 *           description: The speed of the wind
 *         windDirection:
 *           type: string
 *           description: The direction of the wind
 */

/**
 * @swagger
 * /weather:
 *   post:
 *     summary: Create new weather data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Weather'
 *     responses:
 *       201:
 *         description: Weather data created successfully
 *       400:
 *         description: Weather data for this city already exists
 *       500:
 *         description: Error creating weather data
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
 * /weather:
 *   get:
 *     summary: Get all weather data for all cities
 *     responses:
 *       200:
 *         description: List of weather data for all cities
 *       500:
 *         description: Error fetching weather data
 */
router.get('/', async (req, res) => {
    try {
      const allWeatherData = await Weather.find();
      res.json(allWeatherData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching weather data' });
    }
  });

  /**
 * @swagger
 * /weather/{city}:
 *   get:
 *     summary: Get weather data for a specific city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the city
 *     responses:
 *       200:
 *         description: Weather data for the specified city
 *       404:
 *         description: Weather data not found for this city
 *       500:
 *         description: Error fetching weather data
 */
router.get('/:city', async (req, res) => {
    try {
      const { city } = req.params;
      const weatherData = await Weather.findOne({ city });
  
      if (!weatherData) {
        return res.status(404).json({ error: 'Weather data not found for this city' });
      }
  
      res.json(weatherData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching weather data' });
    }
  });

/**
 * @swagger
 * /weather/update/{city}:
 *   put:
 *     summary: Update weather data for a city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the city
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Weather'
 *     responses:
 *       200:
 *         description: Weather data updated successfully
 *       404:
 *         description: Weather data not found for this city
 *       500:
 *         description: Error updating weather data
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
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the city
 *     responses:
 *       200:
 *         description: Weather data deleted successfully
 *       404:
 *         description: Weather data not found for this city
 *       500:
 *         description: Error deleting weather data
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
