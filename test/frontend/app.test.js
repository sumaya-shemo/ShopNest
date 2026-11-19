const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const html = fs.readFileSync(path.join(__dirname, "../../public/index.html"), "utf8");
const script = fs.readFileSync(path.join(__dirname, "../../public/app.js"), "utf8");

const fixtures = [
  {
    id: 1,
    name: "Wireless Mouse",
    sku: "MOU-001",
    description: "Bluetooth mouse",
    price: 25.99,
    stock: 12,
    category: "Accessories",
    image_url: ""
  },
  {
    id: 2,
    name: "27-inch Monitor",
    sku: "MON-001",
    description: "IPS display",
    price: 199.99,
    stock: 5,
    category: "Electronics",
    image_url: ""
  }
];

async function createPage({ status = 200, data = fixtures } = {}) {
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
  dom.window.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ count: data.length, data })
  });
  dom.window.eval(script);
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
  return dom;
}

test("frontend loads product cards from the products API", async () => {
  const dom = await createPage();

  assert.equal(dom.window.document.querySelectorAll(".product").length, 2);
  assert.equal(dom.window.document.querySelector(".product h2").textContent, "Wireless Mouse");
  assert.equal(dom.window.document.querySelector("#status").textContent, "2 product(s)");
  dom.window.close();
});

test("search input filters the rendered product cards", async () => {
  const dom = await createPage();
  const search = dom.window.document.querySelector("#search");

  search.value = "monitor";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

  assert.equal(dom.window.document.querySelectorAll(".product").length, 1);
  assert.equal(dom.window.document.querySelector(".product h2").textContent, "27-inch Monitor");
  dom.window.close();
});

test("category selection filters the rendered product cards", async () => {
  const dom = await createPage();
  const category = dom.window.document.querySelector("#category");

  category.value = "Accessories";
  category.dispatchEvent(new dom.window.Event("change", { bubbles: true }));

  assert.equal(dom.window.document.querySelectorAll(".product").length, 1);
  assert.equal(dom.window.document.querySelector(".product h2").textContent, "Wireless Mouse");
  dom.window.close();
});

test("frontend displays an API error when products cannot be loaded", async () => {
  const dom = await createPage({ status: 500 });

  assert.equal(dom.window.document.querySelector("#status").textContent, "Could not load products");
  assert.equal(dom.window.document.querySelectorAll(".product").length, 0);
  dom.window.close();
});
