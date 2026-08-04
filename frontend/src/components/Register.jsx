import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      alert('✅ Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      alert('❌ Registration failed: ' + err.response?.data?.error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Join Us! 🎉</h2>
        <p style={subtitleStyle}>Create your free account</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="👤 Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder="📧 Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="🔒 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle}>
            Register →
          </button>
        </form>
        <p style={footerStyle}>
          Already have an account? <a href="/login" style={linkStyle}>Login</a>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  padding: 'clamp(30px, 5vw, 50px)',
  borderRadius: '20px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  width: '100%',
  maxWidth: '400px'
};

const titleStyle = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '10px',
  fontSize: 'clamp(24px, 5vw, 32px)'
};

const subtitleStyle = {
  textAlign: 'center',
  color: '#7f8c8d',
  marginBottom: '30px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  marginBottom: '15px',
  fontSize: '16px',
  border: '1px solid #ddd',
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px'
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '20px',
  color: '#7f8c8d'
};

const linkStyle = {
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: 'bold'
};

export default Register;