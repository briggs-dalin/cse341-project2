const express = require('express');
const router = express.Router();
const Location = require('../models/location');


/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         city:
 *           type: string
 *           description: The name of the city
 *         country:
 *           type: string
 *           description: The country where the location is
 *         latitude:
 *           type: number
 *           description: The latitude of the location
 *         longitude:
 *           type: number
 *           description: The longitude of the location
 */


/**
 * @swagger
 * /api/location:
 *   post:
 *     summary: Add a new location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       500:
 *         description: Failed to save location
 */

// Add a new location
router.post('/', async (req, res) => {
    try {
        const { city, country, latitude, longitude } = req.body;
        const newLocation = new Location({ city, country, latitude, longitude });
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save location' });
    }
});

/**
 * @swagger
 * /api/location:
 *   get:
 *     summary: Get all locations
 *     responses:
 *       200:
 *         description: List of all locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       500:
 *         description: Failed to fetch locations
 */

// Get all locations
router.get('/', async (req, res) => {
    try {
        const locations = await Location.find();
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

/**
 * @swagger
 * /api/location/{city}:
 *   get:
 *     summary: Get a specific location by city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the city
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 *       500:
 *         description: Failed to fetch location
 */

// Get a specific location by city
router.get('/:city', async (req, res) => {
    try {
        const location = await Location.findOne({ city: req.params.city });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch location' });
    }
});

/**
 * @swagger
 * /api/location/{city}:
 *   put:
 *     summary: Update a location by city
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
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 *       500:
 *         description: Failed to update location
 */
router.put('/:city', async (req, res) => {
    try {
        const updatedLocation = await Location.findOneAndUpdate(
            { city: req.params.city },
            req.body,
            { new: true }
        );
        if (!updatedLocation) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(updatedLocation);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update location' });
    }
});

/**
 * @swagger
 * /api/location/{city}:
 *   delete:
 *     summary: Delete a location by city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the city
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 *       500:
 *         description: Failed to delete location
 */
router.delete('/:city', async (req, res) => {
    try {
        const deletedLocation = await Location.findOneAndDelete({ city: req.params.city });
        if (!deletedLocation) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

module.exports = router;
