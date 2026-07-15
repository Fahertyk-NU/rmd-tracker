require("dotenv").config();

const { connectDB } = require("./db/conn");
const express = require("express");
const session = require("express-session");
const passport = require("./passport");
const path = require("path");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

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

// API routes
const authRouter = require("./routes/auth");
const accountsRouter = require("./routes/accounts");
const rmdRecordsRouter = require("./routes/rmdRecords");
const dashboardRouter = require("./routes/dashboard");
const clientsRouter = require("./routes/clients");

app.use("/api/auth", authRouter);
app.use("/api/accounts", requireAuth, accountsRouter);
app.use("/api/rmdRecords", requireAuth, rmdRecordsRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);
app.use("/api/clients", requireAuth, clientsRouter);

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
