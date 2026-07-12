require("dotenv").config();

const { connectDB } = require("./db/conn");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const accountsRouter = require("./routes/accounts");
const rmdRecordsRouter = require("./routes/rmdRecords");
const dashboardRouter = require("./routes/dashboard");

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

app.use("/api/accounts", accountsRouter);
app.use("/api/rmdRecords", rmdRecordsRouter);
app.use("/api/dashboard", dashboardRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
