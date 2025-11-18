// This middleware checks if a user is logged in
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // User is logged in, proceed
    }
    // User is not logged in
    res.status(401).json({ message: 'Unauthorized: You must be logged in' });
  };