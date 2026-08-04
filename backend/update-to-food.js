const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./omni-market.db');

// Clear existing products
db.run('DELETE FROM products', (err) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('✅ Old products deleted');
  }
});

// Insert your food products
const foodProducts = [
  ['PRD-1', 'Pizza', 12.99, 'food', 50],
  ['PRD-2', 'Burger', 8.99, 'food', 100],
  ['PRD-3', 'Mac N Cheese', 10.99, 'food', 30],
  ['PRD-4', 'matcha latte', 5.99, 'drink', 40],
  ['PRD-5', 'Cookies', 4.99, 'dessert', 200]
];

const stmt = db.prepare('INSERT INTO products (id, name, price, type, stock) VALUES (?, ?, ?, ?, ?)');

foodProducts.forEach(product => {
  stmt.run(product, (err) => {
    if (err) {
      console.log('❌ Error adding:', product[1]);
    } else {
      console.log('✅ Added:', product[1]);
    }
  });
});

stmt.finalize();

// Verify
setTimeout(() => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    console.log('\n📦 Current products in database:');
    rows.forEach(row => {
      console.log(`   ${row.id} - ${row.name} - $${row.price} - ${row.type}`);
    });
    db.close();
  });
}, 1000);