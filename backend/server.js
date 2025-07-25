process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

dotenv.config();
const app = express();

(async () => {
  await connectDB();

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config
  require('./controllers/authController').passport = passport;

  app.use('/api/auth', authRoutes);

  app.get('/', (req, res) => {
    res.send('Backend server is running');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

 