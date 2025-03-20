const express = require('express');
const Weather = require('../models/weather');

const router = express.Router();

/**
 * @swagger
 * /weather:
 *   post:
 *     summary: Create new weather data
 *     description: Add weather data for a city to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *               temperature:
 *                 type: number
 *               description:
 *                 type: string
 *               humidity:
 *                 type: number
 *               pressure:
 *                 type: number
 *               windSpeed:
 *                 type: number
 *               windDirection:
 *                 type: number
 *     responses:
 *       201:
 *         description: Weather data created successfully
 *       500:
 *         description: Error creating weather data
 */

// Create new weather data
// Create new weather data
router.post('/', async (req, res) => {
    try {
        const { city, temperature, description, humidity, pressure, windSpeed, windDirection } = req.body;

        // Check if the weather data for this city already exists
        const existingWeatherData = await Weather.findOne({ city });

        if (existingWeatherData) {
            return res.status(400).json({ error: 'Weather data for this city already exists.' });
        }

        // If no existing data, create and save new weather data
        const newWeatherData = new Weather({
            city,
            temperature,
            description,
            humidity,
            pressure,
            windSpeed,
            windDirection
        });

        await newWeatherData.save();
        res.status(201).json(newWeatherData);

    } catch (error) {
        res.status(500).json({ error: 'Error creating weather data' });
    }
});


/**
 * @swagger
 * /weather/data/{city}:
 *   get:
 *     summary: Get weather data by city
 *     description: Retrieve weather data for a specific city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         description: The city name for which you want to fetch the weather data.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved weather data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   temperature:
 *                     type: number
 *                   description:
 *                     type: string
 *                   humidity:
 *                     type: number
 *                   pressure:
 *                     type: number
 *                   windSpeed:
 *                     type: number
 *                   windDirection:
 *                     type: number
 *       404:
 *         description: No weather data found for the specified city
 */

// Read weather data by city
router.get('/data/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const weatherData = await Weather.find({ city });

        if (weatherData.length === 0) {
            return res.status(404).json({ error: 'No weather data found for this city' });
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
 *     description: Update existing weather data for a specific city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         description: The city name for which you want to update the weather data.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature:
 *                 type: number
 *               description:
 *                 type: string
 *               humidity:
 *                 type: number
 *               pressure:
 *                 type: number
 *               windSpeed:
 *                 type: number
 *               windDirection:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully updated weather data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city:
 *                   type: string
 *                 temperature:
 *                   type: number
 *                 description:
 *                   type: string
 *                 humidity:
 *                   type: number
 *                 pressure:
 *                   type: number
 *                 windSpeed:
 *                   type: number
 *                 windDirection:
 *                   type: number
 *       404:
 *         description: Weather data not found for the specified city
 *       500:
 *         description: Error updating weather data
 */

// Update weather data for a city
router.put('/update/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const { temperature, description, humidity, pressure, windSpeed, windDirection } = req.body;

        const updatedWeatherData = await Weather.findOneAndUpdate(
            { city },
            { temperature, description, humidity, pressure, windSpeed, windDirection },
            { new: true }
        );

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
 *     description: Delete the weather data of a specific city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         description: The city name for which you want to delete the weather data.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted weather data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No weather data found for the specified city to delete
 *       500:
 *         description: Error deleting weather data
 */

// Delete weather data for a city
router.delete('/delete/:city', async (req, res) => {
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
