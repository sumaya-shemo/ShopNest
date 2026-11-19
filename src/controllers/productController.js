exports.getProducts = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(name LIKE ? OR sku LIKE ? OR description LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await req.app.locals.db.execute(
      `SELECT id, name, sku, description, price, stock, category, image_url, created_at, updated_at
       FROM products ${where} ORDER BY id DESC`,
      params
    );
    res.json({ count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Product id must be a positive integer" });
    }

    const [rows] = await req.app.locals.db.execute(
      `SELECT id, name, sku, description, price, stock, category, image_url, created_at, updated_at
       FROM products WHERE id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};
