

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const session = require('express-session');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Weather = require('./models/weather');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Passport OAuth2 Strategy
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://github.com/login/oauth/authorize',
  tokenURL: 'https://github.com/login/oauth/access_token',
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URL,
}, async (accessToken, refreshToken, params, done) => {
  try {
      const response = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
      });

      const profile = response.data;

      let user = await User.findOne({ oauthId: profile.id });
      if (!user) {
          user = new User({ oauthId: profile.id, username: profile.login });
          await user.save();
      }
      return done(null, user);
  } catch (error) {
      return done(error, null);
  }
}));



// OAuth Routes
app.get('/auth', passport.authenticate('oauth2'));
app.get('/auth/callback', passport.authenticate('oauth2', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/weather-data');
});

app.get('/logout', (req, res, next) => {
  req.logout(err => {
      if (err) return next(err);
      req.session.destroy(err => {
          if (err) return res.status(500).json({ error: 'Logout failed' });
          res.json({ message: 'Successfully logged out' });
      });
  });
});


// Weather Routes
const weatherRoutes = require('./routes/weather');
app.use('/weather', weatherRoutes);

// Secure Weather Data Route
app.get('/weather-data', ensureAuthenticated, async (req, res) => {
    try {
        const weatherData = await Weather.find();
        res.json(weatherData);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

// Swagger Documentation (Updated for Authentication)
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Weather API', version: '1.0.0', description: 'API for weather data' },
        servers: [{ url: 'https://cse341-project2-k1u5.onrender.com' }],
        components: {
            securitySchemes: {
                OAuth2: { type: 'oauth2', flows: { authorizationCode: { authorizationUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token', scopes: {} } } }
            }
        },
        security: [{ OAuth2: [] }]
    },
    apis: ['./routes/weather.js', './routes/location.js']
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
fs.writeFileSync(path.join(__dirname, 'swagger-output.json'), JSON.stringify(swaggerSpec, null, 2));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const Weather = require('../models/weather');
const router = express.Router();
const { ensureAuthenticated } = require('./middleware/auth');

router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        const existingWeather = await Weather.findOne({ city: req.body.city });
        if (existingWeather) return res.status(400).json({ error: 'Weather data for this city exists' });
        const newWeather = new Weather(req.body);
        await newWeather.save();
        res.status(201).json(newWeather);
    } catch (error) {
        res.status(500).json({ error: 'Error creating weather data' });
    }
});

router.put('/update/:city', ensureAuthenticated, async (req, res) => {
    try {
        const updatedWeather = await Weather.findOneAndUpdate(
            { city: req.params.city },
            req.body,
            { new: true }
        );
        if (!updatedWeather) return res.status(404).json({ error: 'Weather data not found' });
        res.json(updatedWeather);
    } catch (error) {
        res.status(500).json({ error: 'Error updating weather data' });
    }
});

router.delete('/delete/:city', ensureAuthenticated, async (req, res) => {
    try {
        const deletedWeather = await Weather.findOneAndDelete({ city: req.params.city });
        if (!deletedWeather) return res.status(404).json({ error: 'Weather data not found' });
        res.json({ message: 'Weather data deleted', data: deletedWeather });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting weather data' });
    }
});

module.exports = router;
