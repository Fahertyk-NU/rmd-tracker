const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");

// GET /api/dashboard?year=2026
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const summary = await db
      .collection("rmdRecords")
      .aggregate([
        { $match: { year } },
        {
          $group: {
            _id: "$clientId",
            totalObligation: { $sum: "$rmdAmount" },
            totalTaken: { $sum: "$amountTakenOrProjected" },
            statuses: { $push: "$distributionStatus" },
          },
        },
        {
          $addFields: {
            clientStatus: {
              $switch: {
                branches: [
                  // any action-required -> action-required
                  {
                    case: { $in: ["action-required", "$statuses"] },
                    then: "action-required",
                  },
                  // total taken >= total obligation -> fulfilled
                  {
                    case: {
                      $gte: ["$totalTaken", "$totalObligation"],
                    },
                    then: "fulfilled",
                  },
                  // any on-track and no action-required -> on-track
                  {
                    case: { $in: ["on-track", "$statuses"] },
                    then: "on-track",
                  },
                ],
                default: "pending",
              },
            },
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
            clientStatus: 1,
            "client.firstName": 1,
            "client.lastName": 1,
            "client.advisorName": 1,
            "client.status": 1,
          },
        },
        {
          $sort: {
            clientStatus: 1,
            totalObligation: -1,
          },
        },
      ])
      .toArray();

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
