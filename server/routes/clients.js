const express = require("express");
const router = express.Router();
const { getDB } = require("../db/conn");
const { ObjectId } = require("mongodb");

// GET /api/clients
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const clients = await db
      .collection("clients")
      .find({})
      .sort({ lastName: 1, firstName: 1 })
      .toArray();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const client = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const client = {
      ...req.body,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
      createdAt: new Date(),
    };
    const result = await db.collection("clients").insertOne(client);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    // eslint-disable-next-line no-unused-vars
    const { _id, ...rest } = req.body;
    const update = { ...rest };
    if (update.dateOfBirth) update.dateOfBirth = new Date(update.dateOfBirth);
    const result = await db
      .collection("clients")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id -- blocked if the client still has accounts
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const clientId = new ObjectId(req.params.id);

    const accountCount = await db
      .collection("accounts")
      .countDocuments({ clientId });
    if (accountCount > 0) {
      return res.status(400).json({
        error:
          "Cannot delete client with existing accounts. Remove their accounts first, or set status to inactive/deceased instead.",
      });
    }

    const result = await db.collection("clients").deleteOne({ _id: clientId });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
