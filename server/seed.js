require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// helper to pick a random item from an array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// helper to generate a random number between min and max
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// helper to generate a random date between two years
const randDate = (startYear, endYear) => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Barbara", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah", "Thomas", "Karen", "Charles", "Lisa"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Allen", "King"];
const advisors = ["Sarah Mitchell", "James Thornton", "Emily Rhodes", "David Chen"];
const companies = ["Fidelity", "Vanguard", "Schwab", "T. Rowe Price", "American Funds", "BlackRock", "TIAA", "Putnam"];
const accountTypes = ["Traditional IRA", "Roth IRA", "Inherited IRA", "403b", "401k", "SEP IRA"];
const autoDistOptions = ["none", "full-recalculated", "fixed"];
const scheduleOptions = ["monthly", "annual"];
const statuses = ["pending", "on-track", "fulfilled", "at-risk"];

async function seed() {
  try {
    await client.connect();
    const db = client.db("rmd-tracker");

    // clear existing data
    await db.collection("clients").deleteMany({});
    await db.collection("accounts").deleteMany({});
    await db.collection("rmdRecords").deleteMany({});

    // --- CLIENTS ---
    const clientDocs = [];
    for (let i = 0; i < 100; i++) {
      const firstName = pick(firstNames);
      const lastName = pick(lastNames);
      // clients should be retirement age -- DOB between 1935 and 1958
      const dob = randDate(1935, 1958);
      clientDocs.push({
        firstName,
        lastName,
        dateOfBirth: dob,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `207-${randInt(100,999)}-${randInt(1000,9999)}`,
        advisorName: pick(advisors),
        status: pick(["active", "active", "active", "inactive", "deceased"]),
        notes: "",
        createdAt: new Date(),
      });
    }
    const clientResult = await db.collection("clients").insertMany(clientDocs);
    const clientIds = Object.values(clientResult.insertedIds);
    console.log(`Inserted ${clientIds.length} clients`);

    // --- ACCOUNTS ---
    const accountDocs = [];
    for (const clientId of clientIds) {
      // each client gets 2-5 accounts
      const numAccounts = randInt(2, 5);
      for (let j = 0; j < numAccounts; j++) {
        const accountType = pick(accountTypes);
        const isInherited = accountType === "Inherited IRA";
        const autoDist = pick(autoDistOptions);
        const dateOfDeath = isInherited ? randDate(2010, 2024) : null;

        accountDocs.push({
          clientId,
          company: pick(companies),
          primaryAccountNumber: `BD-${randInt(100000, 999999)}`,
          secondaryAccountNumber: Math.random() > 0.4 ? `${randInt(10000000, 99999999)}` : null,
          accountType,
          status: isInherited ? "inherited" : pick(["active", "active", "active", "inactive"]),
          // inherited IRA fields
          originalOwnerName: isInherited ? `${pick(firstNames)} ${pick(lastNames)}` : null,
          originalOwnerDOB: isInherited ? randDate(1930, 1955) : null,
          dateOfDeath,
          beneficiaryRelationship: isInherited ? pick(["spouse", "non-spouse"]) : null,
          preSecureAct: isInherited ? (dateOfDeath && dateOfDeath < new Date("2020-01-01")) : null,
          originalOwnerRMDStarted: isInherited ? pick([true, false]) : null,
          // auto distribution
          autoDistribution: autoDist,
          fixedAmount: autoDist === "fixed" ? randInt(500, 5000) : null,
          fixedSchedule: autoDist === "fixed" ? pick(scheduleOptions) : null,
          federalWithholding: pick([0, 10, 12, 15, 20]),
          stateWithholding: pick([0, 5, 8]),
          notes: "",
          lastUpdatedBy: pick(advisors),
          lastUpdatedAt: new Date(),
          createdAt: new Date(),
        });
      }
    }
    const accountResult = await db.collection("accounts").insertMany(accountDocs);
    const accountIds = Object.values(accountResult.insertedIds);
    console.log(`Inserted ${accountIds.length} accounts`);

    // --- RMD RECORDS ---
    // fetch accounts with their clientIds to build records
    const accounts = await db.collection("accounts").find({}).toArray();
    const rmdDocs = [];
    const years = [2024, 2025, 2026];

    for (const account of accounts) {
      for (const year of years) {
        const rmdAmount = randInt(3000, 25000);
        const autoDist = account.autoDistribution;
        const amountTaken = autoDist === "full-recalculated"
          ? rmdAmount
          : autoDist === "fixed"
          ? (account.fixedSchedule === "monthly" ? account.fixedAmount * 12 : account.fixedAmount)
          : randInt(0, rmdAmount);
        const fulfilled = amountTaken >= rmdAmount;

        rmdDocs.push({
          accountId: account._id,
          clientId: account.clientId,
          year,
          rmdAmount,
          amountTakenOrProjected: amountTaken,
          distributionStatus: fulfilled ? "fulfilled" : pick(statuses),
          autoDistribution: autoDist,
          fixedAmount: account.fixedAmount,
          fixedSchedule: account.fixedSchedule,
          federalWithholding: account.federalWithholding,
          stateWithholding: account.stateWithholding,
          verified: fulfilled,
          verifiedBy: fulfilled ? pick(advisors) : null,
          verifiedAt: fulfilled ? new Date() : null,
          lastUpdatedBy: pick(advisors),
          lastUpdatedAt: new Date(),
          notes: "",
        });
      }
    }
    const rmdResult = await db.collection("rmdRecords").insertMany(rmdDocs);
    console.log(`Inserted ${rmdResult.insertedCount} RMD records`);
    console.log("Seeding complete!");

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();