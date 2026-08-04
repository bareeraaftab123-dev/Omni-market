import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Payment from './components/Payment';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={navContainer}>
        <Link to="/" style={logoStyle}>🛍️ OmniMarket</Link>
        <div style={navLinks}>
          <Link to="/" style={linkStyle}>Products</Link>
          <Link to="/cart" style={linkStyle}>Cart 🛒</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={adminLinkStyle}>🛠️ Admin</Link>
          )}
          {user ? (
            <>
              <span style={userStyle}>👋 {user.name}</span>
              <button onClick={handleLogout} style={logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={loginBtn}>Login</Link>
              <Link to="/register" style={registerBtn}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '15px 0',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1000
};

const navContainer = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const logoStyle = {
  color: 'white',
  fontSize: '24px',
  fontWeight: 'bold',
  textDecoration: 'none'
};

const navLinks = {
  display: 'flex',
  gap: '15px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '8px'
};

const adminLinkStyle = {
  color: '#ffd700',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: 'bold',
  border: '1px solid #ffd700'
};

const loginBtn = {
  color: '#667eea',
  background: 'white',
  textDecoration: 'none',
  padding: '8px 20px',
  borderRadius: '8px',
  fontWeight: 'bold'
};

const registerBtn = {
  color: 'white',
  background: 'rgba(255,255,255,0.2)',
  textDecoration: 'none',
  padding: '8px 20px',
  borderRadius: '8px'
};

const userStyle = {
  color: 'white',
  fontWeight: 'bold'
};

const logoutBtn = {
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer'
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;