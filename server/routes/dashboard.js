const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");

// GET /api/dashboard?year=2026
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const summary = await db
      .collection("clients")
      .aggregate([
        {
          $lookup: {
            from: "rmdRecords",
            let: { clientId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$clientId", "$$clientId"] },
                      { $eq: ["$year", year] },
                    ],
                  },
                },
              },
            ],
            as: "records",
          },
        },
        {
          $addFields: {
            totalObligation: { $sum: "$records.rmdAmount" },
            totalTaken: { $sum: "$records.amountTakenOrProjected" },
            statuses: "$records.distributionStatus",
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
                  // total taken >= total obligation (and there is an obligation) -> fulfilled
                  {
                    case: {
                      $and: [
                        { $gt: ["$totalObligation", 0] },
                        { $gte: ["$totalTaken", "$totalObligation"] },
                      ],
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
          $project: {
            _id: 1,
            totalObligation: 1,
            totalTaken: 1,
            clientStatus: 1,
            client: {
              firstName: "$firstName",
              lastName: "$lastName",
              advisorName: "$advisorName",
              status: "$status",
            },
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
