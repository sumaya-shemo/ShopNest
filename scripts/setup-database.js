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
    multipleStatements: true
  });
  try {
    const sql = fs.readFileSync(path.join(__dirname, "../database/schema.sql"), "utf8");
    await connection.query(sql);
    console.log("Database and products table created.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
});
