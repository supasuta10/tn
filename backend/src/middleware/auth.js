const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/constants');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // header names are case-insensitive
    if (!authHeader) return res.status(401).json({ message: 'Access Denied: No token provided' });

    // Bearer <token>
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: Invalid token format' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Attach payload to request
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
