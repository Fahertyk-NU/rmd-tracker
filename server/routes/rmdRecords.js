const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");
const { ObjectId } = require("mongodb");

// GET /api/rmdRecords
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const records = await db.collection("rmdRecords").find({}).toArray();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rmdRecords/client/:clientId -- all RMD records for a specific client
router.get("/client/:clientId", async (req, res) => {
  try {
    const db = getDB();
    const records = await db
      .collection("rmdRecords")
      .find({ clientId: new ObjectId(req.params.clientId) })
      .toArray();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rmdRecords/account/:accountId -- all RMD records for a specific account
router.get("/account/:accountId", async (req, res) => {
  try {
    const db = getDB();
    const records = await db
      .collection("rmdRecords")
      .find({ accountId: new ObjectId(req.params.accountId) })
      .toArray();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rmdRecords/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const record = await db
      .collection("rmdRecords")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!record) return res.status(404).json({ error: "RMD record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rmdRecords
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const record = { ...req.body, lastUpdatedAt: new Date() };
    const result = await db.collection("rmdRecords").insertOne(record);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/rmdRecords/:id
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("rmdRecords")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...req.body, lastUpdatedAt: new Date() } },
      );
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "RMD record not found" });
    res.json({ message: "RMD record updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rmdRecords/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("rmdRecords")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "RMD record not found" });
    res.json({ message: "RMD record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
