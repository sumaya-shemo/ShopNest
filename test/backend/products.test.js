const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.DB_HOST ||= "127.0.0.1";
process.env.DB_USER ||= "ci_user";
process.env.DB_PASSWORD ||= "ci_password";
process.env.DB_NAME ||= "shopnest_ci";

const app = require("../../src/app");

const sampleProducts = [
  {
    id: 1,
    name: "Wireless Mouse",
    sku: "MOU-001",
    description: "Bluetooth mouse",
    price: 25.99,
    stock: 12,
    category: "Accessories",
    image_url: null
  },
  {
    id: 2,
    name: "27-inch Monitor",
    sku: "MON-001",
    description: "IPS display",
    price: 199.99,
    stock: 5,
    category: "Electronics",
    image_url: null
  }
];

function useDatabase({ execute, query = async () => [[{ ok: 1 }]] }) {
  app.locals.db = { execute, query };
}

test("GET /api/products returns product records from the controller", async () => {
  useDatabase({ execute: async () => [sampleProducts] });

  const response = await request(app).get("/api/products");

  assert.equal(response.status, 200);
  assert.equal(response.body.count, 2);
  assert.equal(response.body.data[0].name, "Wireless Mouse");
});

test("GET /api/products applies search and category query parameters", async () => {
  let sql;
  let params;
  useDatabase({
    execute: async (query, values) => {
      sql = query;
      params = values;
      return [[sampleProducts[0]]];
    }
  });

  const response = await request(app)
    .get("/api/products?search=mouse&category=Accessories");

  assert.equal(response.status, 200);
  assert.match(sql, /name LIKE \?/);
  assert.match(sql, /category = \?/);
  assert.deepEqual(params, ["%mouse%", "%mouse%", "%mouse%", "Accessories"]);
  assert.equal(response.body.data[0].sku, "MOU-001");
});

test("GET /api/products/:id returns a product", async () => {
  useDatabase({ execute: async () => [[sampleProducts[0]]] });

  const response = await request(app).get("/api/products/1");

  assert.equal(response.status, 200);
  assert.equal(response.body.id, 1);
  assert.equal(response.body.name, "Wireless Mouse");
});

test("GET /api/products/:id returns 400 for an invalid id", async () => {
  const response = await request(app).get("/api/products/not-a-number");

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Product id must be a positive integer");
});

test("GET /api/products/:id returns 404 when the product does not exist", async () => {
  useDatabase({ execute: async () => [[]] });

  const response = await request(app).get("/api/products/999");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Product not found");
});

test("GET /health reports a database connection", async () => {
  useDatabase({ execute: async () => [[]] });

  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok", database: "connected" });
});

test("GET /health returns 503 when the database is unavailable", async () => {
  useDatabase({ query: async () => { throw new Error("database unavailable"); }, execute: async () => [[]] });

  const response = await request(app).get("/health");

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: "error", database: "unavailable" });
});
