require('dotenv').config();
// Prefer IPv4 first to avoid Windows IPv6 DNS issues causing HTTPS timeouts
try {
  require('dns').setDefaultResultOrder('ipv4first');
} catch {}
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();


const passport = require('passport');
const User = require('./models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport config
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value
    });
  }
  return done(null, user);
}));

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Routes
app.get('/', (req, res) => res.send('Mini CRM Platform Backend Running'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/ai', require('./routes/ai'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
