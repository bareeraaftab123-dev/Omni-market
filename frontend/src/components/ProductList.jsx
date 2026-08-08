import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axios.get('https://omni-market-backend.onrender.com/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast(`✅ ${product.name} added to cart!`);
  };

  const getImage = (name) => {
    const images = {
      'Margherita Pizza': 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?w=400',
      'Classic Burger': 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=400',
      'Creamy Pasta': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400',
      'Greek Salad': 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400',
      'Grilled Chicken': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?w=400',
      'Seafood Paella': 'https://images.pexels.com/photos/16743485/pexels-photo-16743485.jpeg?w=400',
      'Chocolate Cake': 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?w=400',
      'Matcha Latte': 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=400',
      'Fresh Orange Juice': 'https://images.pexels.com/photos/4958852/pexels-photo-4958852.jpeg?w=400',
      'Garlic Bread': 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?w=400'
    };
    return images[name] || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400';
  };

  if (loading) return <div style={loadingStyle}>Loading delicious menu...</div>;

  return (
    <div style={containerStyle}>
      {/* Hero Banner Section */}
      <div style={bannerStyle}>
        <div style={bannerOverlay}>
          {/* ===== UPDATED: "Taste the" in WHITE, "Tradition" in GOLD ===== */}
          <h1 style={bannerTitle}>
            <span style={titleIconStyle}></span> 
            <span style={whiteTextStyle}>Taste the</span> 
            <span style={highlightStyle}>Tradition</span>
          </h1>
          <p style={bannerSubtitle}>Handcrafted Dishes · Fresh Ingredients · Made with Love</p>
          <button 
            style={bannerBtn} 
            onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 30px rgba(230, 126, 34, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Explore Menu
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div id="products-section" style={productsContainer}>
        <h2 style={sectionTitle}>Featured Dishes</h2>
        <div style={gridStyle}>
          {products.map(product => (
            <div key={product.id} style={cardStyle}>
              <img 
                src={getImage(product.name)} 
                alt={product.name}
                style={imageStyle}
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400';
                }}
              />
              <div style={cardContent}>
                <h3 style={productName}>{product.name}</h3>
                <p style={productDesc}>
                  {product.type === 'food' ? 'Main Course' : 
                   product.type === 'dessert' ? 'Dessert' : 
                   product.type === 'drink' ? 'Beverage' : 'Appetizer'}
                </p>
                <div style={priceRow}>
                  <span style={priceStyle}>${product.price}</span>
                  <span style={stockBadge}>In Stock: {product.stock}</span>
                </div>
                <button 
                  onClick={() => addToCart(product)} 
                  style={cartBtn}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e67e22';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2c3e50';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && <div className="toast-notification">{toast}</div>}
    </div>
  );
}

// ===== STYLES =====
const containerStyle = {
  minHeight: '100vh',
  background: '#faf8f5'
};

const bannerStyle = {
  backgroundImage: 'url("https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=1600&h=500&fit=crop")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '450px',
  position: 'relative',
  marginBottom: '50px'
};

const bannerOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  textAlign: 'center',
  padding: '0 20px'
};

// ===== UPDATED TITLE STYLES =====
const bannerTitle = {
  fontSize: '64px',
  fontWeight: 'bold',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

// Icon style
const titleIconStyle = {
  fontSize: '3.5rem',
  display: 'inline-block',
  animation: 'pulse 2s ease-in-out infinite'
};

// ===== NEW: White text for "Taste the" =====
const whiteTextStyle = {
  color: '#ffffff',  // ← White
  fontSize: 'inherit',
  fontWeight: 'inherit'
};

// Gradient highlight for "Tradition"
const highlightStyle = {
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
  backgroundSize: '200% 200%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'gradientShift 3s ease-in-out infinite',
  display: 'inline-block'
};

const bannerSubtitle = {
  fontSize: '20px',
  marginBottom: '30px',
  color: 'rgba(255,255,255,0.85)',
  fontWeight: 300,
  letterSpacing: '1px'
};

const bannerBtn = {
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  border: 'none',
  padding: '14px 40px',
  fontSize: '18px',
  borderRadius: '50px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
};

const productsContainer = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px 60px 20px'
};

const sectionTitle = {
  textAlign: 'center',
  fontSize: '38px',
  color: '#2c3e50',
  marginBottom: '50px',
  fontWeight: 700,
  position: 'relative'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', // ← add this line
  gap: '30px',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  
  padding: '0'
};

const cardStyle = {
  background: 'white',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  cursor: 'pointer',
  display: 'flex',            
  flexDirection: 'column',    
  height: '100%' 
};

// Add hover effect
cardStyle[':hover'] = {
  transform: 'translateY(-10px)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
};

const imageStyle = {
  width: '100%',
  height: '240px',
  objectFit: 'cover',
  transition: 'transform 0.5s'
};

const cardContent = {
  padding: '20px',
  display: 'flex',           
  flexDirection: 'column',    
  flex: 1
};

const productName = {
  fontSize: '20px',
  color: '#2c3e50',
  marginBottom: '8px',
  fontWeight: '600'
};

const productDesc = {
  color: '#7f8c8d',
  fontSize: '13px',
  marginBottom: '15px'
};

const priceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const priceStyle = {
  fontSize: '26px',
  color: '#e67e22',
  fontWeight: 'bold'
};

const stockBadge = {
  background: '#ecf0f1',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  color: '#2c3e50'
};

const cartBtn = {
  width: '100%',
  background: '#2c3e50',
  color: 'white',
  border: 'none',
  padding: '12px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'all 0.3s ease'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '100px',
  fontSize: '20px',
  color: '#2c3e50'
};

// Add CSS animations to the page
const style = document.createElement('style');
style.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(5deg); }
  }
  .card-hover:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
  .card-hover:hover img {
    transform: scale(1.05);
  }
`;
document.head.appendChild(style);

export default ProductList;