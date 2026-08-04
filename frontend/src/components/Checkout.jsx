import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Payment from './Payment';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  const handleSuccess = () => {
    navigate('/orders');
  };

  if (!orderId) {
    return <div>No order found</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Checkout</h1>
      <p>Order ID: {orderId}</p>
      <p>Total Amount: ${total}</p>
      <Payment orderId={orderId} amount={total} onSuccess={handleSuccess} />
    </div>
  );
}

export default Checkout;