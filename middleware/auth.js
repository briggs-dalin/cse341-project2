// Authentication Middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');  // Redirect to login if not authenticated
};
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized access' });

module.exports = { ensureAuthenticated };