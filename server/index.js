require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("RMD Tracker API");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
