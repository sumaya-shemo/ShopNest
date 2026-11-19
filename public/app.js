const productsElement = document.querySelector("#products");
const statusElement = document.querySelector("#status");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");

let products = [];

function render(items) {
  productsElement.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No matching products found.";
    productsElement.append(empty);
    return;
  }

  for (const product of items) {
    const article = document.createElement("article");
    article.className = "product";
    const image = document.createElement("img");
    image.src = product.image_url || "";
    image.alt = product.name;
    image.loading = "lazy";

    const content = document.createElement("div");
    content.className = "content";
    const title = document.createElement("h2");
    title.textContent = product.name;
    const sku = document.createElement("p");
    sku.className = "muted";
    sku.textContent = `SKU: ${product.sku}`;
    const description = document.createElement("p");
    description.className = "muted";
    description.textContent = product.description || "";
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(product.price));
    const category = document.createElement("span");
    category.className = "pill";
    category.textContent = product.category;
    const stock = document.createElement("p");
    stock.className = "muted";
    stock.textContent = `In stock: ${product.stock}`;

    content.append(title, sku, description, price, category, stock);
    article.append(image, content);
    productsElement.append(article);
  }
}

function filterProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const filtered = products.filter((product) =>
    (!category || product.category === category) &&
    (`${product.name} ${product.sku} ${product.description || ""}`)
      .toLowerCase()
      .includes(term)
  );
  render(filtered);
  statusElement.textContent = `${filtered.length} product(s)`;
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Could not load products");
    const result = await response.json();
    products = result.data;
    const categories = [...new Set(products.map((product) => product.category))].sort();
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.append(option);
    }
    filterProducts();
  } catch (error) {
    statusElement.textContent = error.message;
  }
}

searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);
loadProducts();
