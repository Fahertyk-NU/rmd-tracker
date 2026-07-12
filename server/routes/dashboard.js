const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");
const { ObjectId } = require("mongodb");

// GET /api/dashboard?year=2026
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const summary = await db.collection("rmdRecords").aggregate([
      { $match: { year } },
      {
        $group: {
          _id: "$clientId",
          totalObligation: { $sum: "$rmdAmount" },
          totalTaken: { $sum: "$amountTakenOrProjected" },
        },
      },
      {
        $addFields: {
          fulfilled: { $gte: ["$totalTaken", "$totalObligation"] },
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },
      {
        $project: {
          _id: 1,
          totalObligation: 1,
          totalTaken: 1,
          fulfilled: 1,
          "client.firstName": 1,
          "client.lastName": 1,
          "client.advisorName": 1,
          "client.status": 1,
        },
      },
      { $sort: { fulfilled: 1, totalObligation: -1 } },
    ]).toArray();

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;