const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");
const { ObjectId } = require("mongodb");
const { computeRmdStatus } = require("../db/rmdStatus");

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

// POST /api/rmdRecords/newYear -- generate RMD records for a new year
router.post("/newYear", async (req, res) => {
  try {
    const db = getDB();
    const year = parseInt(req.body.year) || new Date().getFullYear();

    // get all active and inherited accounts
    const accounts = await db
      .collection("accounts")
      .find({
        status: { $in: ["active", "inherited"] },
      })
      .toArray();

    const newRecords = [];

    for (const account of accounts) {
      // check if a record already exists for this account and year
      const existing = await db.collection("rmdRecords").findOne({
        accountId: account._id,
        year,
      });

      if (!existing) {
        newRecords.push({
          accountId: account._id,
          clientId: account.clientId,
          year,
          rmdAmount: 0,
          amountTakenOrProjected: 0,
          distributionStatus: computeRmdStatus({
            rmdAmount: 0,
            amountTakenOrProjected: 0,
            autoDistribution: account.autoDistribution,
            fixedAmount: account.fixedAmount,
            fixedSchedule: account.fixedSchedule,
          }),
          autoDistribution: account.autoDistribution,
          fixedAmount: account.fixedAmount,
          fixedSchedule: account.fixedSchedule,
          federalWithholding: account.federalWithholding,
          stateWithholding: account.stateWithholding,
          verified: false,
          verifiedBy: null,
          verifiedAt: null,
          lastUpdatedBy: null,
          lastUpdatedAt: new Date(),
          notes: "",
        });
      }
    }

    if (newRecords.length === 0) {
      return res.json({ message: `RMD records for ${year} already exist` });
    }

    const result = await db.collection("rmdRecords").insertMany(newRecords);
    res.status(201).json({
      message: `Created ${result.insertedCount} new RMD records for ${year}`,
    });
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
    const record = {
      ...req.body,
      accountId: new ObjectId(req.body.accountId),
      clientId: new ObjectId(req.body.clientId),
      year: parseInt(req.body.year),
      rmdAmount: parseFloat(req.body.rmdAmount) || 0,
      amountTakenOrProjected: parseFloat(req.body.amountTakenOrProjected) || 0,
      distributionStatus: computeRmdStatus({
        ...req.body,
        rmdAmount: parseFloat(req.body.rmdAmount) || 0,
        amountTakenOrProjected:
          parseFloat(req.body.amountTakenOrProjected) || 0,
      }),
      rmdAmountEnteredBy: req.body.rmdAmountEnteredBy || null,
      rmdAmountEnteredAt: req.body.rmdAmount ? new Date() : null,
      lastUpdatedAt: new Date(),
    };
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
    // eslint-disable-next-line no-unused-vars
    const { _id, ...rest } = req.body;
    const updated = { ...rest, lastUpdatedAt: new Date() };
    updated.year = parseInt(updated.year);
    updated.rmdAmount = parseFloat(updated.rmdAmount) || 0;
    updated.amountTakenOrProjected =
      parseFloat(updated.amountTakenOrProjected) || 0;
    updated.distributionStatus = computeRmdStatus(updated);
    if (rest.rmdAmount !== undefined) {
      updated.rmdAmountEnteredAt = new Date();
    }
    const result = await db
      .collection("rmdRecords")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updated });
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
