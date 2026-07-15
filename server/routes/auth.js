const express = require("express");
const router = express.Router();
const passport = require("passport");

// POST /api/auth/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ error: info?.message || "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ user: { email: user.email, name: user.name } });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out" });
  });
});

// GET /api/auth/me -- check current session
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: { email: req.user.email, name: req.user.name } });
  } else {
    res.status(401).json({ user: null });
  }
});

module.exports = router;
