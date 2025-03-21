require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Import the Weather model
const Weather = require('./models/weather.js');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Swagger definition (inside server.js)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'API for retrieving and storing weather data',
    },
    servers: [
      {
        url: 'https://cse341-project2-k1u5.onrender.com',
      },
    ],
  },
  apis: ['./routes/weather.js', './routes/location.js']
};


// Initialize Swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Write the Swagger JSON to a file
const swaggerFilePath = path.join(__dirname, 'swagger-output.json');
fs.writeFileSync(swaggerFilePath, JSON.stringify(swaggerSpec, null, 2), 'utf-8');
console.log('Swagger JSON saved to swagger-output.json');

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
const weatherRoutes = require('./routes/weather.js');
app.use('/weather', weatherRoutes);
const locationRoutes = require('./routes/location.js');
app.use('/api/location', locationRoutes);

// Fetch weather data by city or get from database if exists
app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;


    // Fetch weather data from OpenWeather API
    const response = await axios.get(url);
    const { temp, humidity, pressure } = response.data.main;
    const description = response.data.weather[0].description;
    const windSpeed = response.data.wind.speed;
    const windDirection = response.data.wind.deg;

    // Check if the weather data for the city already exists in the database
    let weatherData = await Weather.findOne({ city });

    if (!weatherData) {
      // If no data exists, create and save new weather data
      weatherData = new Weather({
        city,
        temperature: temp,
        description,
        humidity,
        pressure,
        windSpeed,
        windDirection
      });

      // Save the weather data in MongoDB
      await weatherData.save();
    }

    // Send the weather data as a response
    res.json(weatherData);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

app.get('/weather-data', async (req, res) => {
  try {
    // Fetch all weather data from MongoDB
    const weatherData = await Weather.find();
    
    // Return the weather data
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// Test Route
app.get('/', (req, res) => res.send('Weather API is running!'));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
