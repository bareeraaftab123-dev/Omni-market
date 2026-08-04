const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./omni-market.db');

// CHANGE THIS TO YOUR EMAIL
const email = 'admin123@gmail.com';

console.log(`Setting admin for email: ${email}`);

db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
  if (err) {
    console.log('Database error:', err.message);
    db.close();
    return;
  }
  
  if (!user) {
    console.log(`❌ User with email "${email}" not found!`);
    console.log('Available users:');
    db.all('SELECT email, role FROM users', [], (err, users) => {
      if (users && users.length > 0) {
        users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
      } else {
        console.log('   No users found. Please register first.');
      }
      db.close();
    });
    return;
  }
  
  console.log(`Found user: ${user.email} (current role: ${user.role})`);
  
  db.run(`UPDATE users SET role = 'admin' WHERE email = ?`, [email], function(err) {
    if (err) {
      console.log('Error updating:', err.message);
    } else {
      console.log(`✅ ${this.changes} user(s) updated to admin`);
      console.log(`🎉 ${email} is now an ADMIN!`);
    }
    db.close();
  });
});