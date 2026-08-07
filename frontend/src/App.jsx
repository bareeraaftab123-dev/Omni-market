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
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.length);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // ===== STYLES =====
  const navStyle = {
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    padding: '1rem 3rem',
    boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '3px solid rgba(123, 104, 238, 0.3)',
    width: '100%',
    maxWidth: '100%',
    gap: '1.5rem'
  };

  // ===== LOGO STYLES =====
  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    textDecoration: 'none',
    flexShrink: 0
  };

  const logoIconStyle = {
    fontSize: '2.4rem',
    color: '#fbbf24',
    filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.3))',
    animation: 'pulse 3s ease-in-out infinite'
  };

  const logoTextStyle = {
    fontFamily: 'Segoe UI, Poppins, sans-serif',
    fontSize: '2rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
    animation: 'gradientShift 3s ease-in-out infinite'
  };

  const logoTextSpan = {
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed, #a78bfa)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'gradientShift 3s ease-in-out infinite 0.5s'
  };

  const logoTaglineStyle = {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    paddingLeft: '0.8rem',
    fontWeight: 400
  };

  // ===== NAV LINKS - FIXED SPACING =====
  const navLinksStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3rem', /* ← GOOD SPACING between nav links */
    listStyle: 'none',
    alignItems: 'center',
    margin: 0,
    padding: 0
  };

  const linkStyle = {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1.05rem',
    padding: '0.6rem 0.8rem',
    position: 'relative',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
    borderRadius: '8px'
  };

  // Active link style
  const activeLinkStyle = {
    ...linkStyle,
    color: '#ffffff',
    background: 'rgba(251, 191, 36, 0.15)'
  };

  // ===== CART LINK =====
  const cartLinkStyle = {
    ...linkStyle,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    position: 'relative'
  };

  const cartBadgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-14px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    fontSize: '0.6rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '50px',
    border: '2px solid rgba(255,255,255,0.2)',
    minWidth: '22px',
    textAlign: 'center',
    boxShadow: '0 2px 15px rgba(239,68,68,0.4)',
    animation: 'badgePulse 2s ease-in-out infinite'
  };

  // ===== AUTH BUTTONS =====
  const navActionsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.2rem',
    alignItems: 'center'
  };

  const loginBtnStyle = {
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '0.6rem 2rem',
    borderRadius: '50px',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const registerBtnStyle = {
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#0f0c29',
    border: '1px solid #fbbf24',
    padding: '0.6rem 2rem',
    borderRadius: '50px',
    fontWeight: 700,
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'
  };

  // ===== USER INFO =====
  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
    color: 'white'
  };

  const userNameStyle = {
    fontWeight: 500,
    background: 'rgba(255,255,255,0.08)',
    padding: '0.5rem 1.5rem',
    borderRadius: '50px',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.9)'
  };

  const logoutBtnStyle = {
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '0.5rem 1.8rem',
    borderRadius: '50px',
    fontWeight: 500,
    fontSize: '0.85rem',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  // ===== ANIMATIONS =====
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.05) rotate(5deg); }
      }
      @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      /* Hover effects */
      .nav-link-hover:hover {
        color: #ffffff !important;
        background: rgba(251, 191, 36, 0.1);
        transform: translateY(-2px);
      }
      .login-btn-hover:hover {
        background: rgba(255,255,255,0.15) !important;
        border-color: rgba(255,255,255,0.3) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255,255,255,0.05);
      }
      .register-btn-hover:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 30px rgba(251, 191, 36, 0.4) !important;
      }
      .logout-btn-hover:hover {
        background: #ef4444 !important;
        border-color: #ef4444 !important;
        color: white !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
      }
      /* Underline animation for nav links */
      .nav-link-underline {
        position: relative;
      }
      .nav-link-underline::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #fbbf24, #a78bfa);
        transition: all 0.3s ease;
        border-radius: 10px;
        transform: translateX(-50%);
      }
      .nav-link-underline:hover::after {
        width: 60%;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <nav style={navStyle}>
      {/* ===== LOGO ===== */}
      <Link to="/" style={logoStyle}>
        <i className="fas fa-store" style={logoIconStyle}></i>
        <span style={logoTextStyle}>Omni<span style={logoTextSpan}>Market</span></span>
        <span style={logoTaglineStyle}>E-COMMERCE</span>
      </Link>

      {/* ===== NAV LINKS - WELL SPACED ===== */}
      <ul style={navLinksStyle}>
        <li>
          <Link 
            to="/" 
            style={linkStyle} 
            className="nav-link-underline nav-link-hover"
          >
            <i className="fas fa-th-large" style={{ marginRight: '6px' }}></i>
            Products
          </Link>
        </li>
        <li>
          <Link 
            to="/cart" 
            style={cartLinkStyle} 
            className="nav-link-underline nav-link-hover"
          >
            <i className="fas fa-shopping-cart"></i> 
            Cart
            {cartCount > 0 && (
              <span style={cartBadgeStyle}>{cartCount}</span>
            )}
          </Link>
        </li>
        {user?.role === 'admin' && (
          <li>
            <Link 
              to="/admin" 
              style={{ ...linkStyle, color: '#fbbf24' }} 
              className="nav-link-underline nav-link-hover"
            >
              <i className="fas fa-tools" style={{ marginRight: '6px' }}></i>
              Admin
            </Link>
          </li>
        )}
      </ul>

      {/* ===== AUTH BUTTONS ===== */}
      <div style={navActionsStyle}>
        {user ? (
          <div style={userInfoStyle}>
            <span style={userNameStyle}>
              <i className="fas fa-user-circle" style={{ color: '#fbbf24' }}></i> 
              {user.name}
            </span>
            <button 
              onClick={handleLogout} 
              style={logoutBtnStyle}
              className="logout-btn-hover"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        ) : (
          <>
            <Link 
              to="/login" 
              style={loginBtnStyle}
              className="login-btn-hover"
            >
              <i className="fas fa-user"></i> Login
            </Link>
            <Link 
              to="/register" 
              style={registerBtnStyle}
              className="register-btn-hover"
            >
              <i className="fas fa-user-plus"></i> Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', width: '100%' }}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;