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
      const res = await axios.get('http://localhost:5000/api/users');

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
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
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
        <h2 style={titleStyle}>Welcome Back! 👋</h2>
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

// Styles
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

const dropdownContainer = {
  marginBottom: '15px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  color: '#333',
  fontSize: '14px'
};

const dropdownWrapper = {
  position: 'relative'
};

const dropdownList = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '10px',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 1000,
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};

const dropdownItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 15px',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
  transition: 'background 0.2s'
};

const savedIndicator = {
  color: '#28a745',
  marginLeft: '8px',
  fontSize: '12px'
};

const removeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#dc3545',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '2px 8px',
  borderRadius: '50%'
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

const saveBtnStyle = {
  width: '100%',
  padding: '10px',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '14px',
  cursor: 'pointer',
  marginBottom: '10px'
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
  cursor: 'pointer'
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

export default Login;