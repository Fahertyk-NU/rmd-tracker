function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  /**
   * res.status(401).redirect(<path to your login page here>);
   */
  res.status(401).json({ error: "Not authenticated" });
}

module.exports = { requireAuth };
