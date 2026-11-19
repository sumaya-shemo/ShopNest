USE shopnest_db;

INSERT INTO products (name, sku, description, price, stock, category, image_url)
VALUES
('Mechanical Keyboard', 'KB-MECH-001', 'Hot-swappable mechanical keyboard with RGB lighting.', 79.99, 25, 'Accessories', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'),
('Wireless Mouse', 'MS-WIRE-002', 'Ergonomic wireless mouse with adjustable DPI.', 29.50, 40, 'Accessories', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'),
('USB-C Hub', 'HUB-USBC-003', 'Seven-port USB-C hub for laptops and tablets.', 44.00, 18, 'Adapters', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800'),
('27-inch Monitor', 'MON-27-004', 'QHD IPS monitor for productivity and design.', 249.00, 12, 'Displays', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3aced?w=800'),
('Laptop Stand', 'STAND-005', 'Adjustable aluminum laptop stand.', 35.75, 30, 'Office', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800')
AS incoming
ON DUPLICATE KEY UPDATE
  name = incoming.name,
  description = incoming.description,
  price = incoming.price,
  stock = incoming.stock,
  category = incoming.category,
  image_url = incoming.image_url;
