const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

// Passport JWT strategy setup
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: '1d' }
  );
};

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    const token = signToken(newUser);
    res.status(201).json({ token, user: { id: newUser._id, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up user', error: err.message });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.status(200).json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Error signing in user', error: err.message });
  }
};

exports.protectedRoute = (req, res) => {
  res.json({ message: 'You have accessed a protected route!', user: req.user });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password field
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
