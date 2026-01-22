const adminAuth = (req, res, next) => {
    // First ensure user is authenticated (this should be done by the authenticateToken middleware)
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "Access denied. No user information found." });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    next();
};

module.exports = adminAuth;