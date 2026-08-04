const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./omni-market.db');

console.log('Adding image column...');

db.run(`ALTER TABLE products ADD COLUMN image TEXT`, (err) => {
  if (err && err.message.includes('duplicate')) {
    console.log('Column already exists');
  } else if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Column added');
  }
  
  const updates = [
    ['PRD-1', 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=200'],
    ['PRD-2', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200'],
    ['PRD-3', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'],
    ['PRD-4', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200'],
    ['PRD-5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200']
  ];
  
  let count = 0;
  const stmt = db.prepare('UPDATE products SET image = ? WHERE id = ?');
  
  updates.forEach(([id, url]) => {
    stmt.run(url, id, (err) => {
      if (err) console.log(`Error: ${id}`);
      else {
        count++;
        console.log(`✅ ${id} image added`);
      }
    });
  });
  
  stmt.finalize();
  
  setTimeout(() => {
    console.log(`\n✅ ${count} products updated!`);
    db.close();
  }, 2000);
});