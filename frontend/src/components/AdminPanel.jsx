import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: '', stock: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role === 'admin') {
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await fetchProducts();
    await fetchOrders();
    await fetchUsers();
    await fetchStats();
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://omni-market-backend.onrender.com/api/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Products error:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('https://omni-market-backend.onrender.com/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Orders error:', err);
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://omni-market-backend.onrender.com/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Users error:', err);
      setUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('https://omni-market-backend.onrender.com/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data || {});
    } catch (err) {
      console.error('Stats error:', err);
      setStats({});
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://omni-market-backend.onrender.com/api/admin/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Product added successfully!');
      setNewProduct({ name: '', price: '', type: '', stock: '' });
      fetchProducts();
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      await axios.delete(`https://omni-market-backend.onrender.com/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      fetchStats();
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`https://omni-market-backend.onrender.com/api/admin/orders/${orderId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Order status updated to ${status}`);
      fetchOrders();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error updating order');
    }
  };

  const handleResetUserPassword = async (userId) => {
    const newPassword = prompt('Enter new password for user:');
    if (newPassword && newPassword.length >= 6) {
      try {
        await axios.post(`https://omni-market-backend.onrender.com/api/admin/users/${userId}/reset-password`,
          { password: newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage(`✅ Password reset successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Error resetting password');
      }
    } else {
      alert('Password must be at least 6 characters');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user? This cannot be undone!')) {
      await axios.delete(`https://omni-market-backend.onrender.com/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      fetchStats();
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#ffc107', color: '#856404' },
      paid: { background: '#17a2b8', color: 'white' },
      shipped: { background: '#007bff', color: 'white' },
      delivered: { background: '#28a745', color: 'white' },
      cancelled: { background: '#dc3545', color: 'white' }
    };
    const style = styles[status] || styles.pending;
    return <span style={{ ...badgeStyle, ...style }}>{status.toUpperCase()}</span>;
  };

  if (user.role !== 'admin') {
    return (
      <div style={accessDeniedStyle}>
        <h2>⚠️ Admin Access Only</h2>
        <p>You need administrator privileges to access this page.</p>
        <a href="/">Go to Home</a>
      </div>
    );
  }

  if (loading) {
    return <div style={loadingStyle}>Loading admin dashboard...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🛠️ Admin Dashboard</h1>
      
      {message && <div style={messageStyle}>{message}</div>}

      {/* Stats Cards */}
      <div style={statsContainer}>
        <div style={statCard}>
          <div style={statIcon}>📦</div>
          <div style={statNumber}>{stats.totalProducts || products.length}</div>
          <div style={statLabel}>Total Products</div>
        </div>
        <div style={statCard}>
          <div style={statIcon}>🛒</div>
          <div style={statNumber}>{stats.totalOrders || orders.length}</div>
          <div style={statLabel}>Total Orders</div>
        </div>
        <div style={statCard}>
          <div style={statIcon}>👥</div>
          <div style={statNumber}>{stats.totalUsers || users.length}</div>
          <div style={statLabel}>Total Users</div>
        </div>
        <div style={statCard}>
          <div style={statIcon}>💰</div>
          <div style={statNumber}>${stats.totalRevenue || 0}</div>
          <div style={statLabel}>Total Revenue</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={tabContainer}>
        <button onClick={() => setActiveTab('products')} style={{...tabStyle, background: activeTab === 'products' ? '#2c3e50' : '#ecf0f1', color: activeTab === 'products' ? 'white' : '#2c3e50'}}>📦 Products ({products.length})</button>
        <button onClick={() => setActiveTab('orders')} style={{...tabStyle, background: activeTab === 'orders' ? '#2c3e50' : '#ecf0f1', color: activeTab === 'orders' ? 'white' : '#2c3e50'}}>📋 Orders ({orders.length})</button>
        <button onClick={() => setActiveTab('users')} style={{...tabStyle, background: activeTab === 'users' ? '#2c3e50' : '#ecf0f1', color: activeTab === 'users' ? 'white' : '#2c3e50'}}>👥 Users ({users.length})</button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={formCard}>
            <h2>➕ Add New Product</h2>
            <form onSubmit={handleAddProduct} style={formStyle}>
              <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required style={inputStyle} />
              <input type="number" step="0.01" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required style={inputStyle} />
              <input type="text" placeholder="Type" value={newProduct.type} onChange={(e) => setNewProduct({...newProduct, type: e.target.value})} style={inputStyle} />
              <input type="number" placeholder="Stock" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} style={inputStyle} />
              <button type="submit" style={submitBtn}>Add Product →</button>
            </form>
          </div>

          <div style={tableCard}>
            <h2>📦 Products List</h2>
            {products.length === 0 ? (
              <p>No products found. Add your first product above.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeader}>
                    <th>Name</th><th>Price</th><th>Type</th><th>Stock</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={tableRow}>
                      <td style={tableCell}>{p.name}</td>
                      <td style={tableCell}>${p.price}</td>
                      <td style={tableCell}>{p.type}</td>
                      <td style={tableCell}>{p.stock}</td>
                      <td style={tableCell}><button onClick={() => handleDeleteProduct(p.id)} style={deleteBtn}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={tableCard}>
          <h2>📋 All Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found. Place some orders first.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeader}>
                  <th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={tableRow}>
                    <td style={tableCell}>{o.id}</td>
                    <td style={tableCell}>{o.customer_name || o.customer_id}</td>
                    <td style={tableCell}>${parseFloat(o.total).toFixed(2)}</td>
                    <td style={tableCell}>{getStatusBadge(o.status)}</td>
                    <td style={tableCell}>
                      <select onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} defaultValue={o.status} style={statusSelect}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={tableCard}>
          <h2>👥 Registered Users</h2>
          {users.length === 0 ? (
            <p>No users found. Register some users first.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeader}>
                  <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={tableRow}>
                    <td style={tableCell}>{u.name}</td>
                    <td style={tableCell}>{u.email}</td>
                    <td style={tableCell}>{u.role === 'admin' ? '👑 Admin' : '👤 Customer'}</td>
                    <td style={tableCell}>
                      <button onClick={() => handleResetUserPassword(u.id)} style={editBtn}>Reset Password</button>
                      {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} style={deleteBtn}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' };
const titleStyle = { textAlign: 'center', marginBottom: '30px', color: '#2c3e50' };
const loadingStyle = { textAlign: 'center', padding: '50px', fontSize: '20px', color: '#2c3e50' };
const statsContainer = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' };
const statCard = { background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const statIcon = { fontSize: '40px', marginBottom: '10px' };
const statNumber = { fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' };
const statLabel = { color: '#7f8c8d', marginTop: '5px' };
const tabContainer = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const tabStyle = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const formCard = { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const tableCard = { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflowX: 'auto' };
const formStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' };
const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '5px' };
const submitBtn = { padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtn = { background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginLeft: '5px' };
const editBtn = { background: '#ffc107', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { background: '#2c3e50', color: 'white', padding: '12px', textAlign: 'left' };
const tableRow = { borderBottom: '1px solid #ddd' };
const tableCell = { padding: '12px' };
const badgeStyle = { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' };
const statusSelect = { padding: '5px', borderRadius: '5px', border: '1px solid #ddd' };
const messageStyle = { background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' };
const accessDeniedStyle = { textAlign: 'center', padding: '50px', background: '#f8f9fa', minHeight: '60vh' };

export default AdminPanel;