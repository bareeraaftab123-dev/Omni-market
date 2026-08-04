const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./omni-market.db');

const products = [
  ['PRD-010', 'iPhone 15', 999.99, 'electronics', 50],
  ['PRD-011', 'Samsung TV', 499.99, 'electronics', 20],
  ['PRD-012', 'Coffee Maker', 79.99, 'home', 35],
  ['PRD-013', 'Running Shoes', 89.99, 'sports', 50],
  ['PRD-014', 'Wireless Headphones', 79.99, 'audio', 100],
  ['PRD-015', 'Smart Watch', 199.99, 'wearables', 50],
  ['PRD-016', 'Tablet', 329.99, 'electronics', 30],
  ['PRD-017', 'Backpack', 49.99, 'accessories', 200],
  ['PRD-018', 'Desk Chair', 249.99, 'furniture', 25],
  ['PRD-019', 'Laptop Stand', 39.99, 'accessories', 150],
  ['PRD-020', 'Webcam', 89.99, 'electronics', 60],
  ['PRD-021', 'Microphone', 129.99, 'audio', 40],
  ['PRD-022', 'Ring Light', 59.99, 'accessories', 80],
  ['PRD-023', 'Gaming Mouse', 49.99, 'electronics', 120],
  ['PRD-024', 'USB Hub', 29.99, 'accessories', 300]
];

console.log('📦 Adding products to database...\n');

const stmt = db.prepare('INSERT INTO products (id, name, price, type, stock) VALUES (?, ?, ?, ?, ?)');

let count = 0;
for (let product of products) {
  stmt.run(product, (err) => {
    if (err) {
      console.log('❌ Error:', err.message);
    } else {
      count++;
      console.log(`✅ Added: ${product[1]}`);
    }
  });
}

stmt.finalize();

setTimeout(() => {
  db.all('SELECT COUNT(*) as count FROM products', [], (err, rows) => {
    console.log(`\n📊 Total products in database: ${rows[0].count}`);
    db.close();
  });
}, 2000);