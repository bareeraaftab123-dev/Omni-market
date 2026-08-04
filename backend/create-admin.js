const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./omni-market.db');

const email = 'admin123@gmail.com';
const password = 'admin123';
const name = 'Admin User';

bcrypt.hash(password, 10, async (err, hashed) => {
  if (err) {
    console.log('Error hashing password');
    return;
  }
  
  const id = 'ADM-' + Date.now();
  
  db.run(`INSERT OR REPLACE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [id, name, email, hashed, 'admin'],
    function(err) {
      if (err) {
        console.log('Error:', err.message);
      } else {
        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email: admin123@gmail.com');
        console.log('   Password: admin123');
        console.log('   Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      db.close();
    });
});