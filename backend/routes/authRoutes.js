const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Signup route
router.post('/signup', authController.signup);

// Signin route
router.post('/signin', authController.signin);

// Example protected route
router.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ message: 'You have accessed a protected route!', user: req.user });
  }
);

// Get all users (admin only)
const { authorizeRoles } = require('../middleware/authMiddleware');
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('admin'),
  authController.getUsers
);

module.exports = router;
