const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");
const { ObjectId } = require("mongodb");

// GET /api/accounts
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db.collection("accounts").find({}).toArray();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accounts/client/:clientId/summary -- accounts with current year RMD record
router.get("/client/:clientId/summary", async (req, res) => {
  try {
    const db = getDB();
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const accounts = await db
      .collection("accounts")
      .aggregate([
        { $match: { clientId: new ObjectId(req.params.clientId) } },
        {
          $lookup: {
            from: "rmdRecords",
            let: { accountId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$accountId", "$$accountId"] },
                      { $eq: ["$year", year] },
                    ],
                  },
                },
              },
            ],
            as: "rmdRecord",
          },
        },
        {
          $addFields: {
            rmdRecord: { $arrayElemAt: ["$rmdRecord", 0] },
          },
        },
      ])
      .toArray();

    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accounts/client/:clientId
router.get("/client/:clientId", async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db
      .collection("accounts")
      .find({ clientId: new ObjectId(req.params.clientId) })
      .toArray();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accounts/byCompany?year=2026 -- all accounts grouped by company with RMD record
router.get("/byCompany", async (req, res) => {
  try {
    const db = getDB();
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const accounts = await db
      .collection("accounts")
      .aggregate([
        { $match: { status: { $in: ["active", "inherited"] } } },
        {
          $lookup: {
            from: "rmdRecords",
            let: { accountId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$accountId", "$$accountId"] },
                      { $eq: ["$year", year] },
                    ],
                  },
                },
              },
            ],
            as: "rmdRecord",
          },
        },
        {
          $addFields: {
            rmdRecord: { $arrayElemAt: ["$rmdRecord", 0] },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        { $sort: { company: 1, "client.lastName": 1 } },
      ])
      .toArray();

    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accounts/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const account = await db
      .collection("accounts")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const account = {
      ...req.body,
      clientId: new ObjectId(req.body.clientId),
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    };
    const result = await db.collection("accounts").insertOne(account);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/accounts/:id/verify -- mark auto distribution as verified
router.put("/:id/verify", async (req, res) => {
  try {
    const db = getDB();
    const { verifiedBy } = req.body;
    const result = await db.collection("accounts").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          autoDistVerifiedBy: verifiedBy,
          autoDistVerifiedAt: new Date(),
          lastUpdatedBy: verifiedBy,
          lastUpdatedAt: new Date(),
        },
      },
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Auto distribution verified" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/accounts/:id
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { _id, ...rest } = req.body;
    const update = { ...rest, lastUpdatedAt: new Date() };
    if (update.clientId) update.clientId = new ObjectId(update.clientId);
    const result = await db
      .collection("accounts")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Account updated" });
  } catch (err) {
    console.error("Account PUT error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("accounts")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
