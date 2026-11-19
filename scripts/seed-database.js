require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });
  try {
    const sql = fs.readFileSync(path.join(__dirname, "../database/seed.sql"), "utf8");
    await connection.query(sql);
    console.log("Seed products inserted/updated.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Database seeding failed:", error.message);
  process.exitCode = 1;
});
