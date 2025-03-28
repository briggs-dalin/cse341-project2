// Authentication Middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized access' });
}
module.exports = { ensureAuthenticated };