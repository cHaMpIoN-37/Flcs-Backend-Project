const passport = require('passport');

// Middleware to authenticate JWT token
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware to authorize based on user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
