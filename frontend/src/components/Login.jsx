import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all users for dropdown
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://omni-market-backend.onrender.com/api/users');

      // Load saved passwords from localStorage
      const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '{}');

      // Load list of emails the user has explicitly removed from the dropdown
      const removedEmails = JSON.parse(localStorage.getItem('removedEmails') || '[]');

      // Add saved password to each user, and filter out removed ones
      const usersWithPasswords = res.data
        .filter(user => !removedEmails.includes(user.email))
        .map(user => ({
          ...user,
          savedPassword: savedPasswords[user.email] || ''
        }));

      setUsers(usersWithPasswords);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://omni-market-backend.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('✅ Login successful!');
      window.location.href = '/';
    } catch (err) {
      alert('❌ Login failed: ' + err.response?.data?.error);
    }
  };

  const selectUser = (selectedUser) => {
    setEmail(selectedUser.email);
    // Auto-fill password from saved password
    if (selectedUser.savedPassword) {
      setPassword(selectedUser.savedPassword);
    } else {
      setPassword('');
    }
    setShowDropdown(false);
  };

  const savePasswordForCurrentUser = () => {
    if (email && password) {
      // Get existing saved passwords
      const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '{}');

      // Save password for this email
      savedPasswords[email] = password;

      // Save back to localStorage
      localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));

      // If this email was previously removed, un-remove it since the user is saving it again
      const removedEmails = JSON.parse(localStorage.getItem('removedEmails') || '[]');
      if (removedEmails.includes(email)) {
        const updatedRemoved = removedEmails.filter(e => e !== email);
        localStorage.setItem('removedEmails', JSON.stringify(updatedRemoved));
      }

      // Update users state
      setUsers(prevUsers => prevUsers.map(user =>
        user.email === email ? { ...user, savedPassword: password } : user
      ));

      alert(`✅ Password saved for ${email}! Next time select user and password will auto-fill.`);
    } else {
      alert('Please enter email and password first');
    }
  };

  // Remove a user's saved password AND hide them from the dropdown permanently
  const removeUser = (e, userEmail) => {
    e.stopPropagation(); // don't trigger selectUser when clicking the ×

    if (!window.confirm(`Remove ${userEmail} from the saved list? This cannot be undone.`)) {
      return;
    }

    // Delete their saved password
    const savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '{}');
    delete savedPasswords[userEmail];
    localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));

    // Add to the permanently-removed list so they don't reappear on next fetch
    const removedEmails = JSON.parse(localStorage.getItem('removedEmails') || '[]');
    if (!removedEmails.includes(userEmail)) {
      removedEmails.push(userEmail);
      localStorage.setItem('removedEmails', JSON.stringify(removedEmails));
    }

    // Update state immediately so the UI reflects the removal
    setUsers(prevUsers => prevUsers.filter(user => user.email !== userEmail));

    // If the removed user was the one currently typed in, clear the fields
    if (email === userEmail) {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* ===== UPDATED TITLE WITH GRADIENT ===== */}
        <h2 style={titleStyle}>
          <span style={titleIconStyle}></span> 
          Welcome <span style={highlightStyle}>Back!</span>
        </h2>
        <p style={subtitleStyle}>Login to your account</p>

        {/* User Selection Dropdown */}
        <div style={dropdownContainer}>
          <label style={labelStyle}>Select User</label>
          <div style={dropdownWrapper}>
            <input
              type="text"
              placeholder="Click to select user..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              style={inputStyle}
            />
            {showDropdown && users.length > 0 && (
              <div style={dropdownList}>
                {users.filter(u => u.email.toLowerCase().includes(email.toLowerCase())).map(user => (
                  <div key={user.id} onClick={() => selectUser(user)} style={dropdownItem}>
                    <span>
                      <strong>{user.name}</strong> - {user.email}
                      {user.savedPassword && <span style={savedIndicator}> 🔑 Password saved</span>}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => removeUser(e, user.email)}
                      style={removeBtnStyle}
                      title={`Remove ${user.email}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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

          <button
            type="button"
            onClick={savePasswordForCurrentUser}
            style={saveBtnStyle}
          >
            💾 Save Password (so you don't have to type again)
          </button>

          <button type="submit" style={buttonStyle}>
            Login →
          </button>
        </form>

        <p style={footerStyle}>
          New here? <a href="/register" style={linkStyle}>Create Account</a>
        </p>
      </div>
    </div>
  );
}

// ===== STYLES - MATCHING HEADER COLORS =====
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

const dropdownContainer = {
  marginBottom: '15px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  color: 'rgba(255,255,255,0.7)',
  fontSize: '14px',
  fontWeight: 500
};

const dropdownWrapper = {
  position: 'relative'
};

const dropdownList = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'rgba(30, 27, 75, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 1000,
  boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
};

const dropdownItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 15px',
  cursor: 'pointer',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  transition: 'background 0.2s',
  color: 'rgba(255,255,255,0.85)'
};

const savedIndicator = {
  color: '#fbbf24',
  marginLeft: '8px',
  fontSize: '12px'
};

const removeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#ef4444',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '2px 8px',
  borderRadius: '50%',
  transition: 'all 0.3s ease'
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

inputStyle[':focus'] = {
  borderColor: '#fbbf24',
  boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.1)',
  background: 'rgba(255,255,255,0.08)'
};

const saveBtnStyle = {
  width: '100%',
  padding: '10px',
  background: 'rgba(251, 191, 36, 0.15)',
  color: '#fbbf24',
  border: '1px solid rgba(251, 191, 36, 0.2)',
  borderRadius: '10px',
  fontSize: '14px',
  cursor: 'pointer',
  marginBottom: '10px',
  transition: 'all 0.3s ease',
  fontWeight: 500
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .dropdown-item:hover {
    background: rgba(251, 191, 36, 0.1);
  }
  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(1.2);
  }
  .input-field:focus {
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
    background: rgba(255,255,255,0.08);
  }
  .save-btn:hover {
    background: rgba(251, 191, 36, 0.25);
    transform: translateY(-2px);
  }
  .login-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(251, 191, 36, 0.3);
  }
  .link-hover:hover {
    color: #fcd34d;
  }
`;
document.head.appendChild(style);

export default Login;