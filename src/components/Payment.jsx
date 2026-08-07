import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payment({ orderId, amount, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [barcodeProduct, setBarcodeProduct] = useState(null);

  // Fetch payment methods from backend
  useEffect(() => {
    axios.get('https://omni-market-backend.onrender.com/api/payment/methods')
      .then(res => {
        const methods = Object.entries(res.data).map(([id, method]) => ({
          id: id,
          name: method.name,
          icon: method.icon,
          fee: method.fee,
          color: '#2c3e50',
          bg: '#f0f0f0'
        }));
        setPaymentMethods(methods);
      })
      .catch(err => console.error('Error fetching payment methods:', err));
  }, []);

  // Handle barcode scan
  const handleBarcodeScan = async () => {
    if (!barcodeValue) {
      alert('Please enter or scan barcode');
      return;
    }
    
    try {
      const res = await axios.get(`https://omni-market-backend.onrender.com/api/products/barcode/${barcodeValue}`);
      if (res.data) {
        setBarcodeProduct(res.data);
        alert(`✅ Product found: ${res.data.name} - $${res.data.price}`);
      }
    } catch (err) {
      alert('❌ Product not found for this barcode');
      setBarcodeProduct(null);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://omni-market-backend.onrender.com/api/payment/process', {
        amount,
        method: selectedMethod,
        orderId,
        barcode: barcodeValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        alert(`✅ Payment successful! ${res.data.message}`);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  if (paymentMethods.length === 0) {
    return <div style={loadingStyle}>Loading payment methods...</div>;
  }

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>
        <span style={titleIconStyle}>💳</span> Payment Method
      </h3>
      
      {/* Payment Methods Grid */}
      <div style={methodsContainer}>
        {paymentMethods.map((method, index) => (
          <div 
            key={method.id || index}
            onClick={() => setSelectedMethod(method.id)}
            style={{
              ...methodStyle,
              border: selectedMethod === method.id ? '3px solid #fbbf24' : '1px solid #d0d0d0',
              backgroundColor: selectedMethod === method.id ? '#fef3c7' : '#ffffff',
              boxShadow: selectedMethod === method.id ? '0 4px 15px rgba(251, 191, 36, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <span style={iconStyle}>{method.icon || '💳'}</span>
            <div style={{ flex: 1 }}>
              <span style={methodNameStyle}>{method.name || 'Unknown'}</span>
              {method.fee > 0 && <span style={feeStyle}> (Fee: {method.fee}%)</span>}
            </div>
            {selectedMethod === method.id && <span style={checkMark}>✓</span>}
          </div>
        ))}
      </div>

      {/* Barcode Scanner Section */}
      <div style={barcodeSection}>
        <h4 style={barcodeTitle}>📷 Scan Barcode (Optional)</h4>
        <div style={barcodeContainer}>
          <input
            type="text"
            placeholder="Enter barcode number"
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            style={barcodeInput}
          />
          <button onClick={handleBarcodeScan} style={scanBtn}>
            🔍 Scan
          </button>
        </div>
        {barcodeProduct && (
          <div style={barcodeResult}>
            ✅ Found: {barcodeProduct.name} - ${barcodeProduct.price}
          </div>
        )}
      </div>

      {/* Total Amount & Pay Button */}
      <div style={totalContainer}>
        <div style={totalRow}>
          <span style={totalLabel}>Total Amount</span>
          <span style={totalValue}>${amount}</span>
        </div>
        <button 
          onClick={handlePayment} 
          disabled={processing}
          style={buttonStyle}
        >
          {processing ? 'Processing...' : `Pay $${amount}`}
        </button>
      </div>
    </div>
  );
}

// ===== ALL STYLES - EVERYTHING VISIBLE =====

// Main container - LIGHT background
const containerStyle = { 
  padding: '30px', 
  maxWidth: '550px', 
  margin: '0 auto',
  background: '#f0f2f5',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  border: '1px solid rgba(0,0,0,0.06)'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '50px',
  color: '#333333',
  fontSize: '18px'
};

// ===== TITLE - DARK BLUE =====
const titleStyle = { 
  textAlign: 'center', 
  marginBottom: '25px', 
  color: '#1a1a4e',
  fontSize: '26px',
  fontWeight: 700
};

const titleIconStyle = {
  marginRight: '10px'
};

const methodsContainer = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '12px', 
  marginBottom: '25px' 
};

// ===== METHOD CARD - WHITE BACKGROUND =====
const methodStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '15px', 
  padding: '16px 20px', 
  borderRadius: '14px', 
  cursor: 'pointer', 
  transition: 'all 0.3s ease',
  position: 'relative',
  backgroundColor: '#ffffff',  // ← WHITE background
  border: '1px solid #d0d0d0'
};

// ===== METHOD NAME - DARK TEXT =====
const methodNameStyle = {
  color: '#1a1a4e',  // ← DARK BLUE - CLEARLY VISIBLE
  fontSize: '16px',
  fontWeight: 600
};

const iconStyle = { 
  fontSize: '32px', 
  width: '50px',
  textAlign: 'center'
};

// ===== FEE TEXT - DARK GRAY =====
const feeStyle = { 
  color: '#666666',
  marginLeft: '5px',
  fontSize: '13px'
};

// ===== CHECK MARK - DARK =====
const checkMark = { 
  position: 'absolute', 
  right: '15px', 
  color: '#1a1a4e',
  fontWeight: 'bold', 
  fontSize: '20px' 
};

// ===== BARCODE SECTION - WHITE BACKGROUND =====
const barcodeSection = {
  background: '#ffffff',
  padding: '18px',
  borderRadius: '12px',
  marginBottom: '20px',
  border: '1px solid #e0e0e0'
};

// ===== BARCODE TITLE - DARK =====
const barcodeTitle = {
  marginBottom: '12px',
  color: '#1a1a4e',
  fontSize: '16px',
  fontWeight: 600
};

const barcodeContainer = {
  display: 'flex',
  gap: '10px'
};

// ===== BARCODE INPUT - DARK TEXT =====
const barcodeInput = {
  flex: 1,
  padding: '12px 16px',
  border: '1px solid #d0d0d0',
  borderRadius: '10px',
  fontSize: '14px',
  background: '#f8f9fa',
  color: '#333333',
  transition: 'all 0.3s ease'
};

// ===== SCAN BUTTON - DARK BLUE =====
const scanBtn = {
  padding: '12px 24px',
  background: '#1a1a4e',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontWeight: 500
};

// ===== BARCODE RESULT - DARK GREEN TEXT =====
const barcodeResult = {
  marginTop: '12px',
  padding: '12px',
  background: '#d4edda',
  borderRadius: '10px',
  color: '#155724',
  fontSize: '14px',
  border: '1px solid #c3e6cb',
  fontWeight: 500
};

const totalContainer = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0'
};

// ===== TOTAL ROW - DARK TEXT =====
const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

// ===== TOTAL LABEL - DARK =====
const totalLabel = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 500
};

// ===== TOTAL VALUE - DARK BLUE =====
const totalValue = {
  color: '#1a1a4e',
  fontSize: '28px',
  fontWeight: 800
};

// ===== PAY BUTTON - GOLD =====
const buttonStyle = { 
  width: '100%', 
  padding: '16px', 
  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  color: '#0f0c29',
  border: 'none', 
  borderRadius: '12px', 
  fontSize: '18px', 
  cursor: 'pointer', 
  fontWeight: 700,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
};

export default Payment;