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
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading payment methods...</div>;
  }

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Select Payment Method</h3>
      
      {/* Payment Methods Grid */}
      <div style={methodsContainer}>
        {paymentMethods.map(method => (
          <div 
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            style={{
              ...methodStyle,
              border: selectedMethod === method.id ? '2px solid #28a745' : '1px solid #ddd',
              background: selectedMethod === method.id ? '#f0fff4' : 'white'
            }}
          >
            <span style={iconStyle}>{method.icon}</span>
            <div style={{ flex: 1 }}>
              <strong>{method.name}</strong>
              {method.fee > 0 && <small style={feeStyle}> (Fee: {method.fee}%)</small>}
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

      {/* Payment Button */}
      <button 
        onClick={handlePayment} 
        disabled={processing}
        style={buttonStyle}
      >
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </div>
  );
}

const containerStyle = { 
  padding: '20px', 
  maxWidth: '550px', 
  margin: '0 auto',
  background: 'white',
  borderRadius: '15px',
  boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
};

const titleStyle = { 
  textAlign: 'center', 
  marginBottom: '20px', 
  color: '#2c3e50',
  fontSize: '24px'
};

const methodsContainer = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '12px', 
  marginBottom: '25px' 
};

const methodStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '15px', 
  padding: '15px', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  transition: 'all 0.3s',
  position: 'relative'
};

const iconStyle = { 
  fontSize: '30px', 
  width: '45px',
  textAlign: 'center'
};

const feeStyle = { color: '#666', marginLeft: '5px' };
const checkMark = { position: 'absolute', right: '15px', color: '#28a745', fontWeight: 'bold', fontSize: '18px' };

const barcodeSection = {
  background: '#f8f9fa',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '20px'
};

const barcodeTitle = {
  marginBottom: '10px',
  color: '#2c3e50',
  fontSize: '16px'
};

const barcodeContainer = {
  display: 'flex',
  gap: '10px'
};

const barcodeInput = {
  flex: 1,
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px'
};

const scanBtn = {
  padding: '12px 20px',
  background: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

const barcodeResult = {
  marginTop: '10px',
  padding: '10px',
  background: '#d4edda',
  borderRadius: '8px',
  color: '#155724',
  fontSize: '14px'
};

const buttonStyle = { 
  width: '100%', 
  padding: '15px', 
  background: '#28a745', 
  color: 'white', 
  border: 'none', 
  borderRadius: '10px', 
  fontSize: '18px', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  transition: 'transform 0.2s'
};

export default Payment;