const { MongoClient } = require("mongodb");

let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("rmd-tracker");
  await db.collection("rmdRecords").createIndex({ accountId: 1, year: 1 });
   await db.collection("accounts").createIndex({ clientId: 1 });
   await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("Connected to MongoDB");
}

function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

module.exports = { connectDB, getDB };
