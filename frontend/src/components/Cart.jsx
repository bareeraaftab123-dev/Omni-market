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

  // ✅ ADD THIS FUNCTION - Maps product names to their real images
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

      const res = await axios.post('http://localhost:5000/api/orders', 
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
      await axios.post('http://localhost:5000/api/payment/process', {
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
    { id: 'visa', name: 'Visa', icon: '💳', color: '#1a1f71', bg: '#e8ecf1' },
    { id: 'paypal', name: 'PayPal', icon: '💰', color: '#003087', bg: '#e8f0fe' },
    { id: 'apple_pay', name: 'Apple Pay', icon: '📱', color: '#000000', bg: '#f0f0f0' },
    { id: 'google_pay', name: 'Google Pay', icon: '🤖', color: '#4285f4', bg: '#e8f0fe' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', color: '#2e7d32', bg: '#e8f5e9' }
  ];

  if (cartItems.length === 0 && step === 'cart') {
    return (
      <div style={emptyStyle}>
        <div style={emptyIcon}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items yet</p>
        <a href="/" style={shopBtn}>Continue Shopping →</a>
      </div>
    );
  }

  // Cart View
  if (step === 'cart') {
    return (
      <div style={containerStyle}>
        <div style={progressBar}>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>1. Cart</div>
          <div style={progressStep}>2. Shipping</div>
          <div style={progressStep}>3. Payment</div>
          <div style={progressStep}>4. Confirm</div>
        </div>

        <h1 style={titleStyle}>Shopping Cart</h1>
        
        <div style={cartLayout}>
          <div style={cartItemsContainer}>
            {cartItems.map(item => (
              <div key={item.id} style={cartItemCard}>
                {/* ✅ FIXED: Using real product images instead of random */}
                <img 
                  src={getProductImage(item.name)} 
                  alt={item.name}
                  style={itemImage}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/100/100?random=1';
                  }}
                />
                <div style={itemDetails}>
                  <h3>{item.name}</h3>
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
            <h3>Order Summary</h3>
            <div style={summaryRow}>
              <span>Subtotal</span>
              <span>${getSubtotal().toFixed(2)}</span>
            </div>
            <div style={summaryRow}>
              <span>Shipping</span>
              <span>{getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}</span>
            </div>
            <div style={summaryRow}>
              <span>Tax (10%)</span>
              <span>${getTax().toFixed(2)}</span>
            </div>
            <div style={{...summaryRow, borderTop: '2px solid #ddd', paddingTop: '15px', marginTop: '15px', fontWeight: 'bold', fontSize: '20px'}}>
              <span>Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <button onClick={() => setStep('shipping')} style={checkoutBtn}>
              Proceed to Shipping →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Shipping View (same as before)
  if (step === 'shipping') {
    return (
      <div style={containerStyle}>
        <div style={progressBar}>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>✓ Cart</div>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>2. Shipping</div>
          <div style={progressStep}>3. Payment</div>
          <div style={progressStep}>4. Confirm</div>
        </div>

        <h1 style={titleStyle}>Shipping Information</h1>
        
        <div style={shippingContainer}>
          <form onSubmit={handleShippingSubmit} style={shippingForm}>
            <div style={formGroup}>
              <label>Full Name *</label>
              <input type="text" value={shippingDetails.fullName} onChange={(e) => setShippingDetails({...shippingDetails, fullName: e.target.value})} required style={inputStyle} />
            </div>
            <div style={formRow}>
              <div style={formGroup}>
                <label>Email *</label>
                <input type="email" value={shippingDetails.email} onChange={(e) => setShippingDetails({...shippingDetails, email: e.target.value})} required style={inputStyle} />
              </div>
              <div style={formGroup}>
                <label>Phone *</label>
                <input type="tel" value={shippingDetails.phone} onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})} required style={inputStyle} />
              </div>
            </div>
            <div style={formGroup}>
              <label>Address *</label>
              <input type="text" value={shippingDetails.address} onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})} required style={inputStyle} />
            </div>
            <div style={formRow}>
              <div style={formGroup}>
                <label>City *</label>
                <input type="text" value={shippingDetails.city} onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})} required style={inputStyle} />
              </div>
              <div style={formGroup}>
                <label>Postal Code</label>
                <input type="text" value={shippingDetails.postalCode} onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})} style={inputStyle} />
              </div>
            </div>
            <div style={formGroup}>
              <label>Country</label>
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
            <h3>Order Summary</h3>
            <div style={summaryRow}>
              <span>Items ({cartItems.length})</span>
              <span>${getSubtotal().toFixed(2)}</span>
            </div>
            <div style={summaryRow}>
              <span>Shipping</span>
              <span>{getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}</span>
            </div>
            <div style={{...summaryRow, fontWeight: 'bold', fontSize: '18px'}}>
              <span>Total</span>
              <span>${getTotal().toFixed(2)}</span>
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
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>✓ Cart</div>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>✓ Shipping</div>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>3. Payment</div>
          <div style={progressStep}>4. Confirm</div>
        </div>

        <h1 style={titleStyle}>Payment Method</h1>
        
        <div style={paymentContainer}>
          <div style={paymentMethodsGrid}>
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                style={{
                  ...paymentCard,
                  border: selectedPayment === method.id ? `2px solid ${method.color}` : '1px solid #ddd',
                  background: selectedPayment === method.id ? method.bg : 'white'
                }}
              >
                <div style={{...paymentIcon, background: method.color}}>{method.icon}</div>
                <div>
                  <div style={{fontWeight: 'bold'}}>{method.name}</div>
                </div>
                {selectedPayment === method.id && <div style={checkMark}>✓</div>}
              </div>
            ))}
          </div>
          
          <div style={paymentSummary}>
            <div style={summaryRow}>
              <span>Total Amount</span>
              <span style={{fontSize: '24px', fontWeight: 'bold', color: '#2c3e50'}}>${getTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={createOrder} 
              disabled={!selectedPayment || processing}
              style={{...checkoutBtn, opacity: (!selectedPayment || processing) ? 0.6 : 1}}
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
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>✓ Cart</div>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>✓ Shipping</div>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>✓ Payment</div>
          <div style={{...progressStep, background: '#2c3e50', color: 'white'}}>4. Confirm</div>
        </div>

        <div style={confirmationContainer}>
          <div style={successIcon}>🎉</div>
          <h1 style={{color: '#2c3e50'}}>Order Confirmed!</h1>
          <p style={{color: '#7f8c8d'}}>Thank you for your purchase</p>
          
          <div style={orderDetails}>
            <h3>Order #{currentOrder.id}</h3>
            <div style={detailRow}><strong>Name:</strong> {currentOrder.shipping.fullName}</div>
            <div style={detailRow}><strong>Email:</strong> {currentOrder.shipping.email}</div>
            <div style={detailRow}><strong>Phone:</strong> {currentOrder.shipping.phone}</div>
            <div style={detailRow}><strong>Address:</strong> {currentOrder.shipping.address}, {currentOrder.shipping.city}</div>
            <div style={detailRow}><strong>Payment:</strong> {paymentMethods.find(m => m.id === selectedPayment)?.name}</div>
            <div style={{...detailRow, fontSize: '20px', marginTop: '15px'}}><strong>Total Paid:</strong> ${currentOrder.total.toFixed(2)}</div>
          </div>
          
          <button onClick={confirmOrder} style={confirmBtn}>Place Order →</button>
        </div>
      </div>
    );
  }

  return null;
}

// Styles (same as before)
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
  minHeight: '80vh'
};

const progressBar = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '40px',
  background: '#f0f0f0',
  borderRadius: '10px',
  padding: '10px'
};

const progressStep = {
  flex: 1,
  textAlign: 'center',
  padding: '10px',
  borderRadius: '8px',
  color: '#999',
  fontWeight: 'bold'
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#2c3e50'
};

const cartLayout = {
  display: 'grid',
  gridTemplateColumns: '1fr 350px',
  gap: '30px'
};

const cartItemsContainer = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const cartItemCard = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '15px',
  borderBottom: '1px solid #eee'
};

const itemImage = {
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '10px'
};

const itemDetails = {
  flex: 2
};

const itemPrice = {
  color: '#e67e22',
  fontWeight: 'bold'
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
  borderRadius: '5px',
  border: '1px solid #ddd',
  background: '#f8f9fa',
  cursor: 'pointer'
};

const qtyValue = {
  minWidth: '30px',
  textAlign: 'center'
};

const itemTotalPrice = {
  fontWeight: 'bold',
  minWidth: '80px',
  textAlign: 'right'
};

const removeIcon = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer'
};

const orderSummary = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  height: 'fit-content'
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0'
};

const checkoutBtn = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '15px'
};

const shippingContainer = {
  display: 'grid',
  gridTemplateColumns: '1fr 350px',
  gap: '30px'
};

const shippingForm = {
  background: 'white',
  borderRadius: '15px',
  padding: '30px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const formGroup = {
  marginBottom: '20px'
};

const formRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px'
};

const buttonGroup = {
  display: 'flex',
  gap: '15px',
  marginTop: '20px'
};

const backButton = {
  padding: '12px 24px',
  background: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

const continueBtn = {
  padding: '12px 24px',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  flex: 1
};

const shippingSummary = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  height: 'fit-content'
};

const paymentContainer = {
  display: 'grid',
  gridTemplateColumns: '1fr 350px',
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
  position: 'relative'
};

const paymentIcon = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px'
};

const checkMark = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: '#28a745',
  fontWeight: 'bold'
};

const paymentSummary = {
  background: 'white',
  borderRadius: '15px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  height: 'fit-content'
};

const confirmationContainer = {
  textAlign: 'center',
  background: 'white',
  borderRadius: '15px',
  padding: '40px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const successIcon = {
  fontSize: '80px',
  marginBottom: '20px'
};

const orderDetails = {
  background: '#f8f9fa',
  borderRadius: '10px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'left'
};

const detailRow = {
  padding: '8px 0'
};

const confirmBtn = {
  padding: '14px 40px',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
  marginTop: '20px'
};

const emptyStyle = {
  textAlign: 'center',
  padding: '80px 20px',
  background: '#f8f9fa',
  minHeight: '60vh'
};

const emptyIcon = {
  fontSize: '80px',
  marginBottom: '20px'
};

const shopBtn = {
  display: 'inline-block',
  marginTop: '20px',
  padding: '12px 30px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px'
};

export default Cart;