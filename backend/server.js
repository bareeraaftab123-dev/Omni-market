const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key-2024';

app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database('./omni-market.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    type TEXT,
    stock INTEGER DEFAULT 0,
    barcode TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )`);

  // Add sample products
  db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
    if (row && row.count === 0) {
      const products = [
        ['PRD-1', 'Margherita Pizza', 12.99, 'food', 50, '8901234567890'],
        ['PRD-2', 'Classic Burger', 9.99, 'food', 45, '8901234567891'],
        ['PRD-3', 'Creamy Pasta', 14.99, 'food', 30, '8901234567892'],
        ['PRD-4', 'Greek Salad', 7.99, 'food', 40, '8901234567893'],
        ['PRD-5', 'Grilled Chicken', 16.99, 'food', 25, '8901234567894'],
        ['PRD-6', 'Seafood Paella', 22.99, 'food', 15, '8901234567895'],
        ['PRD-7', 'Chocolate Cake', 6.99, 'dessert', 35, '8901234567896'],
        ['PRD-8', 'Matcha Latte', 5.99, 'drink', 60, '8901234567897'],
        ['PRD-9', 'Fresh Orange Juice', 4.99, 'drink', 80, '8901234567898'],
        ['PRD-10', 'Garlic Bread', 3.99, 'appetizer', 100, '8901234567899']
      ];
      const stmt = db.prepare(`INSERT INTO products (id, name, price, type, stock, barcode) VALUES (?, ?, ?, ?, ?, ?)`);
      products.forEach(p => stmt.run(p));
      stmt.finalize();
      console.log('✅ 10 products added');
    }
  });
});

// ============ AUTH MIDDLEWARE (DEFINED FIRST) ============
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (user) return res.status(400).json({ error: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const id = 'USR-' + Date.now();
    db.run(`INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)`,
      [id, name, email, hashed],
      (err) => err ? res.status(500).json({ error: err.message }) : res.json({ message: 'Registered', user: { id, name, email } })
    );
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role || 'customer' }, SECRET_KEY);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role || 'customer' } });
  });
});

// Get all users (for login dropdown)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email FROM users ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// ============ PRODUCT ROUTES ============
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    res.json(rows || []);
  });
});

// ============ BARCODE ROUTE ============
app.get('/api/products/barcode/:barcode', (req, res) => {
  db.get('SELECT * FROM products WHERE barcode = ?', [req.params.barcode], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

// ============ ORDER ROUTES ============
app.post('/api/orders', auth, (req, res) => {
  const { items } = req.body;
  const orderId = 'ORD-' + Date.now();
  let total = 0;
  
  items.forEach(item => { total += item.price * item.quantity; });
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    db.run(`INSERT INTO orders (id, customer_id, total) VALUES (?, ?, ?)`,
      [orderId, req.user.userId, total],
      (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        let completed = 0;
        items.forEach(item => {
          db.run(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
            [orderId, item.productId, item.quantity, item.price]);
          
          db.run(`UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
            [item.quantity, item.productId, item.quantity],
            function(err) {
              if (err || this.changes === 0) {
                db.run('ROLLBACK');
                return res.status(400).json({ error: `Insufficient stock for product` });
              }
              completed++;
              if (completed === items.length) {
                db.run('COMMIT');
                res.json({ message: 'Order created', orderId, total });
              }
            });
        });
      });
  });
});

app.get('/api/orders', auth, (req, res) => {
  db.all('SELECT * FROM orders WHERE customer_id = ?', [req.user.userId], (err, rows) => {
    res.json(rows || []);
  });
});

// ============ ADMIN MIDDLEWARE ============
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ ADMIN ROUTES ============
app.post('/api/admin/set-admin', adminAuth, (req, res) => {
  const { email } = req.body;
  db.run(`UPDATE users SET role = 'admin' WHERE email = ?`, [email], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `${email} is now admin`, changes: this.changes });
  });
});

app.post('/api/admin/products', adminAuth, (req, res) => {
  const { name, price, type, stock, barcode } = req.body;
  const id = 'PRD-' + Date.now();
  const productBarcode = barcode || 'BAR-' + Date.now();
  
  db.run(`INSERT INTO products (id, name, price, type, stock, barcode) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, price, type || 'general', stock || 0, productBarcode],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product created', product: { id, name, price, type, stock, barcode: productBarcode } });
    });
});

app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted', changes: this.changes });
  });
});

// Admin Orders
app.get('/api/admin/orders', adminAuth, (req, res) => {
  db.all(`SELECT o.*, u.name as customer_name 
          FROM orders o 
          JOIN users u ON o.customer_id = u.id 
          ORDER BY o.created_at DESC`, [], (err, rows) => {
    res.json(rows || []);
  });
});

app.put('/api/admin/orders/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

// Admin Users
app.get('/api/admin/users', adminAuth, (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    res.json(rows || []);
  });
});

app.post('/api/admin/users/:id/reset-password', adminAuth, async (req, res) => {
  const { password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Password reset successful' });
  });
});

app.delete('/api/admin/users/:id', adminAuth, (req, res) => {
  db.run('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
});

// Admin Stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
  db.get('SELECT COUNT(*) as totalProducts FROM products', [], (err, productRow) => {
    db.get('SELECT COUNT(*) as totalUsers FROM users', [], (err, userRow) => {
      db.get('SELECT COUNT(*) as totalOrders, COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE status = "paid"', [], (err, orderRow) => {
        res.json({
          totalProducts: productRow?.totalProducts || 0,
          totalUsers: userRow?.totalUsers || 0,
          totalOrders: orderRow?.totalOrders || 0,
          totalRevenue: orderRow?.totalRevenue || 0
        });
      });
    });
  });
});

// ============ PAYMENT ROUTES ============
const PAYMENT_METHODS = {
  visa: { name: 'Visa', fee: 0, icon: '💳' },
  paypal: { name: 'PayPal', fee: 2.5, icon: '💰' },
  apple_pay: { name: 'Apple Pay', fee: 0, icon: '📱' },
  google_pay: { name: 'Google Pay', fee: 0, icon: '🤖' },
  cod: { name: 'Cash on Delivery', fee: 0, icon: '💵' }
};

app.get('/api/payment/methods', (req, res) => {
  res.json(PAYMENT_METHODS);
});

app.post('/api/payment/process', auth, async (req, res) => {
  const { amount, method, orderId } = req.body;
  
  const paymentProcessors = {
    visa: () => ({ success: true, transactionId: 'VISA_' + Date.now(), message: 'Visa payment successful' }),
    paypal: () => ({ success: true, transactionId: 'PP_' + Date.now(), message: 'PayPal payment successful' }),
    apple_pay: () => ({ success: true, transactionId: 'AP_' + Date.now(), message: 'Apple Pay successful' }),
    google_pay: () => ({ success: true, transactionId: 'GP_' + Date.now(), message: 'Google Pay successful' }),
    cod: () => ({ success: true, transactionId: 'COD_' + Date.now(), message: 'Cash on Delivery - Pay when delivered' })
  };
  
  const processor = paymentProcessors[method];
  if (!processor) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }
  
  const result = processor();
  
  if (result.success) {
    db.run(`UPDATE orders SET status = 'paid', payment_method = ?, payment_id = ? WHERE id = ?`,
      [method, result.transactionId, orderId], (err) => {});
  }
  
  res.json(result);
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Omni Market API is running' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Test: http://localhost:${PORT}/api/products`);
});