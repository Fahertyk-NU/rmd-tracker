import "dotenv/config";
import { connectDB } from "./db/conn.js";
import express from "express";
import session from "express-session";
import passport from "./passport.js";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

import authRouter from "./routes/auth.js";
import accountsRouter from "./routes/accounts.js";
import rmdRecordsRouter from "./routes/rmdRecords.js";
import dashboardRouter from "./routes/dashboard.js";
import clientsRouter from "./routes/clients.js";

app.use("/api/auth", authRouter);
app.use("/api/accounts", requireAuth, accountsRouter);
app.use("/api/rmdRecords", requireAuth, rmdRecordsRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);
app.use("/api/clients", requireAuth, clientsRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });