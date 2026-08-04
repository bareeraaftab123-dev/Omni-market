const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./omni-market.db');

db.all('SELECT id, name, price, type, stock FROM products', [], (err, rows) => {
  if (err) {
    console.log('Error:', err.message);
  } else if (rows.length === 0) {
    console.log('No products found in database!');
  } else {
    console.log(`\n📦 ${rows.length} products in database:\n`);
    rows.forEach(p => {
      console.log(`   ${p.id} - ${p.name} - $${p.price} - Stock: ${p.stock}`);
    });
  }
  db.close();
});