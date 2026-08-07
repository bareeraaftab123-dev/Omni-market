import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://omni-market-backend.onrender.com/api/auth/register', { name, email, password });
      alert('✅ Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      alert('❌ Registration failed: ' + err.response?.data?.error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* ===== UPDATED TITLE WITH GRADIENT ===== */}
        <h2 style={titleStyle}>
          <span style={titleIconStyle}></span> 
          Join <span style={highlightStyle}>Us!</span>
        </h2>
        <p style={subtitleStyle}>Create your free account</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="👤 Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="📧 Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="🔒 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            className="input-field"
            required
          />
          <button type="submit" style={buttonStyle} className="register-btn">
            Register →
          </button>
        </form>
        
        <p style={footerStyle}>
          Already have an account? <a href="/login" style={linkStyle} className="link-hover">Login</a>
        </p>
      </div>
    </div>
  );
}

// ===== STYLES - MATCHING HEADER & LOGIN COLORS =====
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
  background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  padding: '20px'
};

const cardStyle = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  padding: 'clamp(30px, 5vw, 50px)',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid rgba(255,255,255,0.08)'
};

// ===== UPDATED TITLE STYLES =====
const titleStyle = {
  textAlign: 'center',
  marginBottom: '10px',
  fontSize: 'clamp(28px, 5vw, 36px)',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  color: '#ffffff'
};

const titleIconStyle = {
  fontSize: '2rem',
  display: 'inline-block'
};

const highlightStyle = {
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
  backgroundSize: '200% 200%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'gradientShift 3s ease-in-out infinite',
  display: 'inline-block'
};

const subtitleStyle = {
  textAlign: 'center',
  color: 'rgba(255,255,255,0.6)',
  marginBottom: '30px',
  fontSize: '1rem',
  fontWeight: 300
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  marginBottom: '15px',
  fontSize: '16px',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  transition: 'all 0.3s ease'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '20px',
  color: 'rgba(255,255,255,0.5)'
};

const linkStyle = {
  color: '#fbbf24',
  textDecoration: 'none',
  fontWeight: 'bold',
  transition: 'color 0.3s ease'
};

// Add CSS animations and hover effects
const style = document.createElement('style');
style.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .input-field:focus {
    border-color: #fbbf24 !important;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
    background: rgba(255,255,255,0.08) !important;
  }
  
  .register-btn:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 8px 30px rgba(251, 191, 36, 0.3) !important;
  }
  
  .link-hover:hover {
    color: #fcd34d !important;
  }
  
  /* Input autofill style override */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.06) inset !important;
    -webkit-text-fill-color: white !important;
    border-color: rgba(251, 191, 36, 0.3) !important;
  }
`;
document.head.appendChild(style);

export default Register;