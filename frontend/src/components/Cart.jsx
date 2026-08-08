import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState('cart');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan'
  });
  const [selectedPayment, setSelectedPayment] = useState('');
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Maps product names to their real images
  const getProductImage = (name) => {
    const images = {
      'Margherita Pizza': 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?w=100',
      'Classic Burger': 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?w=100',
      'Creamy Pasta': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=100',
      'Greek Salad': 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=100',
      'Grilled Chicken': 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?w=100',
      'Seafood Paella': 'https://images.pexels.com/photos/16743485/pexels-photo-16743485.jpeg?w=100',
      'Chocolate Cake': 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?w=100',
      'Matcha Latte': 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=100',
      'Fresh Orange Juice': 'https://images.pexels.com/photos/4958852/pexels-photo-4958852.jpeg?w=100',
      'Garlic Bread': 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?w=100'
    };
    return images[name];
  };

  useEffect(() => {
    loadCart();
    if (user.email) {
      setShippingDetails(prev => ({ ...prev, email: user.email, fullName: user.name || '' }));
    }
  }, []);

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  };

  const updateQuantity = (id, change) => {
    const items = cartItems.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean);
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const removeItem = (id) => {
    const items = cartItems.filter(item => item.id !== id);
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    if (subtotal > 50) return 0;
    return 5.99;
  };

  const getTax = () => {
    return getSubtotal() * 0.1;
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax();
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.city) {
      alert('Please fill all shipping details');
      return;
    }
    setStep('payment');
  };

  const createOrder = async () => {
    setProcessing(true);
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const res = await axios.post('https://omni-market-backend.onrender.com/api/orders', 
        { items: orderItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentOrder({
        id: res.data.orderId,
        total: getTotal(),
        shipping: shippingDetails,
        paymentMethod: selectedPayment
      });
      setStep('confirmation');
    } catch (err) {
      alert('Error creating order: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const confirmOrder = async () => {
    try {
      await axios.post('https://omni-market-backend.onrender.com/api/payment/process', {
        amount: currentOrder.total,
        method: selectedPayment,
        orderId: currentOrder.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.removeItem('cart');
      alert('🎉 Order placed successfully! Thank you for shopping!');
      window.location.href = '/';
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const paymentMethods = [
    { id: 'visa', name: 'Visa', icon: '💳', color: '#1a1f71', bg: 'rgba(26, 31, 113, 0.15)' },
    { id: 'paypal', name: 'PayPal', icon: '💰', color: '#003087', bg: 'rgba(0, 48, 135, 0.15)' },
    { id: 'apple_pay', name: 'Apple Pay', icon: '📱', color: '#000000', bg: 'rgba(0, 0, 0, 0.15)' },
    { id: 'google_pay', name: 'Google Pay', icon: '🤖', color: '#4285f4', bg: 'rgba(66, 133, 244, 0.15)' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.15)' }
  ];

  if (cartItems.length === 0 && step === 'cart') {
    return (
      <div style={emptyStyle}>
        <div style={emptyIcon}>🛒</div>
        <h2 style={{ color: '#ffffff' }}>Your cart is empty</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Looks like you haven't added any items yet</p>
        <a href="/" style={shopBtn}>Continue Shopping →</a>
      </div>
    );
  }

  // Cart View
  if (step === 'cart') {
    return (
      <div style={containerStyle}>
        <div style={progressBar}>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>1. Cart</div>
          <div style={progressStep}>2. Shipping</div>
          <div style={progressStep}>3. Payment</div>
          <div style={progressStep}>4. Confirm</div>
        </div>

        <h1 style={titleStyle}>🛒 Shopping Cart</h1>
        
        <div style={cartLayout}>
          <div style={cartItemsContainer}>
            {cartItems.map(item => (
              <div key={item.id} style={cartItemCard}>
                <img 
                  src={getProductImage(item.name)} 
                  alt={item.name}
                  style={itemImage}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/100/100?random=1';
                  }}
                />
                <div style={itemDetails}>
                  <h3 style={productNameStyle}>{item.name}</h3>
                  <p style={itemPrice}>${item.price.toFixed(2)}</p>
                </div>
                <div style={itemActions}>
                  <div style={quantityControl}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={qtyBtn}>-</button>
                    <span style={qtyValue}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={qtyBtn}>+</button>
                  </div>
                  <div style={itemTotalPrice}>${(item.price * item.quantity).toFixed(2)}</div>
                  <button onClick={() => removeItem(item.id)} style={removeIcon}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={orderSummary}>
            <h3 style={summaryTitleStyle}>Order Summary</h3>
            <div style={summaryRow}>
              <span style={summaryLabelStyle}>Subtotal</span>
              <span style={summaryValueStyle}>${getSubtotal().toFixed(2)}</span>
            </div>
            <div style={summaryRow}>
              <span style={summaryLabelStyle}>Shipping</span>
              <span style={summaryValueStyle}>{getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}</span>
            </div>
            <div style={summaryRow}>
              <span style={summaryLabelStyle}>Tax (10%)</span>
              <span style={summaryValueStyle}>${getTax().toFixed(2)}</span>
            </div>
            <div style={totalRow}>
              <span style={totalLabelStyle}>Total</span>
              <span style={totalValueStyle}>${getTotal().toFixed(2)}</span>
            </div>
            <button onClick={() => setStep('shipping')} style={checkoutBtn}>
              Proceed to Shipping →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Shipping View
  if (step === 'shipping') {
    return (
      <div style={containerStyle}>
        <div style={progressBar}>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>✓ Cart</div>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>2. Shipping</div>
          <div style={progressStep}>3. Payment</div>
          <div style={progressStep}>4. Confirm</div>
        </div>

        <h1 style={titleStyle}>📦 Shipping Information</h1>
        
        <div style={shippingContainer}>
          <form onSubmit={handleShippingSubmit} style={shippingForm}>
            <div style={formGroup}>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" value={shippingDetails.fullName} onChange={(e) => setShippingDetails({...shippingDetails, fullName: e.target.value})} required style={inputStyle} />
            </div>
            <div style={formRow}>
              <div style={formGroup}>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={shippingDetails.email} onChange={(e) => setShippingDetails({...shippingDetails, email: e.target.value})} required style={inputStyle} />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Phone *</label>
                <input type="tel" value={shippingDetails.phone} onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})} required style={inputStyle} />
              </div>
            </div>
            <div style={formGroup}>
              <label style={labelStyle}>Address *</label>
              <input type="text" value={shippingDetails.address} onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})} required style={inputStyle} />
            </div>
            <div style={formRow}>
              <div style={formGroup}>
                <label style={labelStyle}>City *</label>
                <input type="text" value={shippingDetails.city} onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})} required style={inputStyle} />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Postal Code</label>
                <input type="text" value={shippingDetails.postalCode} onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})} style={inputStyle} />
              </div>
            </div>
            <div style={formGroup}>
              <label style={labelStyle}>Country</label>
              <select value={shippingDetails.country} onChange={(e) => setShippingDetails({...shippingDetails, country: e.target.value})} style={inputStyle}>
                <option>Pakistan</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Canada</option>
              </select>
            </div>
            <div style={buttonGroup}>
              <button type="button" onClick={() => setStep('cart')} style={backButton}>← Back to Cart</button>
              <button type="submit" style={continueBtn}>Continue to Payment →</button>
            </div>
          </form>
          
          <div style={shippingSummary}>
            <h3 style={summaryTitleStyle}>Order Summary</h3>
            <div style={summaryRow}>
              <span style={summaryLabelStyle}>Items ({cartItems.length})</span>
              <span style={summaryValueStyle}>${getSubtotal().toFixed(2)}</span>
            </div>
            <div style={summaryRow}>
              <span style={summaryLabelStyle}>Shipping</span>
              <span style={summaryValueStyle}>{getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}</span>
            </div>
            <div style={totalRow}>
              <span style={totalLabelStyle}>Total</span>
              <span style={totalValueStyle}>${getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment View
  if (step === 'payment') {
    return (
      <div style={containerStyle}>
        <div style={progressBar}>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>✓ Cart</div>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>✓ Shipping</div>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>3. Payment</div>
          <div style={progressStep}>4. Confirm</div>
        </div>

        <h1 style={titleStyle}>💳 Payment Method</h1>
        
        <div style={paymentContainer}>
          <div style={paymentMethodsGrid}>
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                style={{
                  ...paymentCard,
                  border: selectedPayment === method.id ? `2px solid #fbbf24` : '1px solid rgba(255,255,255,0.1)',
                  background: selectedPayment === method.id ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255,255,255,0.04)'
                }}
              >
                <div style={{...paymentIcon, background: method.color}}>{method.icon}</div>
                <div>
                  <div style={paymentNameStyle}>{method.name}</div>
                </div>
                {selectedPayment === method.id && <div style={checkMark}>✓</div>}
              </div>
            ))}
          </div>
          
          <div style={paymentSummary}>
            <div style={totalRow}>
              <span style={totalLabelStyle}>Total Amount</span>
              <span style={totalValueStyle}>${getTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={createOrder} 
              disabled={!selectedPayment || processing}
              style={{...checkoutBtn, opacity: (!selectedPayment || processing) ? 0.5 : 1}}
            >
              {processing ? 'Processing...' : `Pay $${getTotal().toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation View
  if (step === 'confirmation' && currentOrder) {
    return (
      <div style={containerStyle}>
        <div style={progressBar}>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>✓ Cart</div>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>✓ Shipping</div>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>✓ Payment</div>
          <div style={{...progressStep, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#0f0c29'}}>4. Confirm</div>
        </div>

        <div style={confirmationContainer}>
          <div style={successIcon}></div>
          <h1 style={confirmTitleStyle}>Order Confirmed!</h1>
          <p style={confirmSubtitleStyle}>Thank you for your purchase</p>
          
          <div style={orderDetails}>
            <h3 style={orderIdStyle}>Order #{currentOrder.id}</h3>
            <div style={detailRow}><strong style={detailLabelStyle}>Name:</strong> <span style={detailValueStyle}>{currentOrder.shipping.fullName}</span></div>
            <div style={detailRow}><strong style={detailLabelStyle}>Email:</strong> <span style={detailValueStyle}>{currentOrder.shipping.email}</span></div>
            <div style={detailRow}><strong style={detailLabelStyle}>Phone:</strong> <span style={detailValueStyle}>{currentOrder.shipping.phone}</span></div>
            <div style={detailRow}><strong style={detailLabelStyle}>Address:</strong> <span style={detailValueStyle}>{currentOrder.shipping.address}, {currentOrder.shipping.city}</span></div>
            <div style={detailRow}><strong style={detailLabelStyle}>Payment:</strong> <span style={detailValueStyle}>{paymentMethods.find(m => m.id === selectedPayment)?.name}</span></div>
            <div style={totalDetailRow}><strong style={totalDetailLabel}>Total Paid:</strong> <span style={totalDetailValue}>${currentOrder.total.toFixed(2)}</span></div>
          </div>
          
          <button onClick={confirmOrder} style={confirmBtn}>Place Order →</button>
        </div>
      </div>
    );
  }

  return null;
}

// ===== STYLES - WITH ALL TEXT VISIBLE =====
// ===== STYLES - WITH DARK BLUE HEADINGS =====
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
  minHeight: '80vh',
  background: 'transparent'
};

const progressBar = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '40px',
  background: 'rgba(15, 12, 41, 0.6)',
  borderRadius: '15px',
  padding: '10px',
  border: '1px solid rgba(255,255,255,0.06)'
};

const progressStep = {
  flex: 1,
  textAlign: 'center',
  padding: '10px',
  borderRadius: '10px',
  color: 'rgba(255,255,255,0.6)',
  fontWeight: 'bold',
  fontSize: '14px'
};

// ===== FIXED: Dark Blue Headings =====
const titleStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#1a1a4e',  // Dark blue
  fontSize: '2.2rem',
  fontWeight: 700
};

const cartLayout = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px'
};

const cartItemsContainer = {
  background: 'rgba(15, 12, 41, 0.6)',
  borderRadius: '15px',
  padding: '20px',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(10px)'
};

const cartItemCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '15px',
  borderBottom: '1px solid rgba(255,255,255,0.06)'
};

const itemImage = {
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '12px'
};

const itemDetails = {
  flex: 2
};

const productNameStyle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '4px'
};

const itemPrice = {
  color: '#fbbf24',
  fontWeight: 'bold',
  fontSize: '16px'
};

const itemActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const quantityControl = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const qtyBtn = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#ffffff',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'all 0.3s ease'
};

const qtyValue = {
  minWidth: '30px',
  textAlign: 'center',
  color: '#ffffff',
  fontWeight: 600
};

const itemTotalPrice = {
  fontWeight: 'bold',
  minWidth: '80px',
  textAlign: 'right',
  color: '#ffffff',
  fontSize: '16px'
};

const removeIcon = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#ef4444',
  transition: 'all 0.3s ease'
};

// ===== FIXED: Dark backgrounds for ALL summaries =====
const orderSummary = {
  background: 'rgba(15, 12, 41, 0.8)',
  borderRadius: '15px',
  padding: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  height: 'fit-content',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
};

const summaryTitleStyle = {
  color: '#1a1a4e',  // ← Dark blue
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '15px'
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)'
};

const summaryLabelStyle = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: '15px'
};

const summaryValueStyle = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 500
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '15px 0 10px 0',
  borderTop: '2px solid rgba(251, 191, 36, 0.3)',
  marginTop: '5px'
};

const totalLabelStyle = {
  color: '#1a1a4e',  // ← Dark blue
  fontSize: '18px',
  fontWeight: 700
};

const totalValueStyle = {
  color: '#fbbf24',
  fontSize: '22px',
  fontWeight: 800
};

const checkoutBtn = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '15px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'
};

// ===== FIXED: Dark backgrounds =====
const shippingSummary = {
  background: 'rgba(15, 12, 41, 0.8)',
  borderRadius: '15px',
  padding: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  height: 'fit-content',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
};

const paymentSummary = {
  background: 'rgba(15, 12, 41, 0.8)',
  borderRadius: '15px',
  padding: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  height: 'fit-content',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
};

const shippingContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px'
};

const shippingForm = {
  background: 'rgba(15, 12, 41, 0.6)',
  borderRadius: '15px',
  padding: '30px',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(10px)'
};

const labelStyle = {
  color: 'rgba(255,255,255,0.9)',
  fontWeight: 500,
  fontSize: '14px',
  marginBottom: '6px',
  display: 'block'
};

const formGroup = {
  marginBottom: '18px'
};

const formRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  fontSize: '14px',
  background: 'rgba(255,255,255,0.06)',
  color: '#ffffff',
  transition: 'all 0.3s ease'
};

const buttonGroup = {
  display: 'flex',
  gap: '15px',
  marginTop: '20px'
};

const backButton = {
  padding: '12px 24px',
  background: 'rgba(255,255,255,0.06)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontWeight: 500
};

const continueBtn = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  flex: 1,
  fontWeight: 700,
  transition: 'all 0.3s ease'
};

const paymentContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '30px'
};

const paymentMethodsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '15px'
};

const paymentCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '20px',
  borderRadius: '12px',
  cursor: 'pointer',
  position: 'relative',
  border: '1px solid rgba(255,255,255,0.06)',
  transition: 'all 0.3s ease',
  background: 'rgba(15, 12, 41, 0.6)'
};

const paymentIcon = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  color: 'white'
};

const paymentNameStyle = {
  fontWeight: 'bold',
  color: '#ffffff',
  fontSize: '15px'
};

const checkMark = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#fbbf24',
  fontWeight: 'bold',
  fontSize: '20px'
};

const confirmationContainer = {
  textAlign: 'center',
  background: 'rgba(15, 12, 41, 0.7)',
  borderRadius: '15px',
  padding: '40px',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(10px)'
};

const successIcon = {
  fontSize: '80px',
  marginBottom: '20px'
};

const confirmTitleStyle = {
  color: '#1a1a4e',  // ← Dark blue
  fontSize: '32px',
  fontWeight: 700
};

const confirmSubtitleStyle = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '16px',
  marginBottom: '20px'
};

const orderDetails = {
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'left'
};

const orderIdStyle = {
  color: '#1a1a4e',  // ← Dark blue
  fontSize: '18px',
  marginBottom: '15px'
};

const detailRow = {
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  display: 'flex',
  gap: '8px'
};

const detailLabelStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontWeight: 600,
  minWidth: '80px'
};

const detailValueStyle = {
  color: '#ffffff'
};

const totalDetailRow = {
  padding: '12px 0 0 0',
  marginTop: '10px',
  borderTop: '2px solid rgba(251, 191, 36, 0.2)',
  display: 'flex',
  justifyContent: 'space-between'
};

const totalDetailLabel = {
  color: '#1a1a4e',  // ← Dark blue
  fontSize: '18px'
};

const totalDetailValue = {
  color: '#fbbf24',
  fontSize: '22px',
  fontWeight: 800
};

const confirmBtn = {
  padding: '14px 40px',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '20px',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'
};

const emptyStyle = {
  textAlign: 'center',
  padding: '80px 20px',
  minHeight: '60vh',
  background: 'transparent'
};

const emptyIcon = {
  fontSize: '80px',
  marginBottom: '20px'
};

const shopBtn = {
  display: 'inline-block',
  marginTop: '20px',
  padding: '12px 30px',
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  textDecoration: 'none',
  borderRadius: '12px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'
};

export default Cart;