const express = require("express");
const productRoutes = require("./routes/productRoutes");
const pool = require("../config/database");

const app = express();
app.locals.db = pool;

app.use(express.json());
app.use(express.static("public"));

app.get("/health", async (_req, res) => {
  try {
    await app.locals.db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (_error) {
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/products", productRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
