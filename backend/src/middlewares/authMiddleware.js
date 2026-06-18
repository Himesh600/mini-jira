const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;
  // Check if the request has an authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token (format is "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];
      
      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user in the database and attach them to the request
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      next(); // Move on to the actual route (e.g., create issue)
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };