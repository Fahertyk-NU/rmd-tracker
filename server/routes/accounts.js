const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");
const { ObjectId } = require("mongodb");
const { computeRmdStatus } = require("../db/rmdStatus");

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

    // calculate client totals
    const totalObligation = accounts.reduce(
      (sum, a) => sum + (a.rmdRecord?.rmdAmount || 0),
      0,
    );
    const totalTaken = accounts.reduce(
      (sum, a) => sum + (a.rmdRecord?.amountTakenOrProjected || 0),
      0,
    );

    // projected total includes rmd amounts for auto dist accounts
    const totalProjected = accounts.reduce((sum, a) => {
      const record = a.rmdRecord;
      if (!record) return sum;
      // for full-recalculated, project the full rmd amount
      if (record.autoDistribution === "full-recalculated") {
        return sum + (record.rmdAmount || 0);
      }
      // for fixed where projected covers rmd, project the rmd amount
      if (record.autoDistribution === "fixed" && record.fixedAmount) {
        const annualProjected =
          record.fixedSchedule === "monthly"
            ? record.fixedAmount * 12
            : record.fixedAmount;
        if (annualProjected >= record.rmdAmount) {
          return sum + (record.rmdAmount || 0);
        }
      }
      // for everything else use actual amount taken
      return sum + (record.amountTakenOrProjected || 0);
    }, 0);

    // client is on-track if projected total >= obligation
    const clientOnTrack =
      totalObligation > 0 && totalProjected >= totalObligation;
    // client is fulfilled if actual taken >= obligation
    const clientFulfilled =
      totalObligation > 0 && totalTaken >= totalObligation;

    const result = accounts.map((account) => {
      if (account.rmdRecord) {
        if (clientFulfilled) {
          account.rmdRecord.distributionStatus = "fulfilled";
        } else if (
          clientOnTrack &&
          account.rmdRecord.distributionStatus === "action-required"
        ) {
          // if client is on-track overall, bump action-required accounts to on-track
          account.rmdRecord.distributionStatus = "on-track";
        } else {
          account.rmdRecord.distributionStatus = computeRmdStatus(
            account.rmdRecord,
          );
        }
      }
      return account;
    });

    res.json(result);
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
    // eslint-disable-next-line no-unused-vars
    const { _id, ...rest } = req.body;
    const update = { ...rest, lastUpdatedAt: new Date() };
    if (update.clientId) update.clientId = new ObjectId(update.clientId);
    if (req.user) update.lastUpdatedBy = req.user.email;
    const result = await db
      .collection("accounts")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Account updated" });
  } catch (err) {
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
