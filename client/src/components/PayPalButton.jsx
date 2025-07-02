// client/src/components/PayPalButton.jsx
import { useEffect } from 'react';

const PayPalButton = ({ adId, amount }) => {
  useEffect(() => {
    if (!window.paypal) return;

    window.paypal.Buttons({
      createOrder: async (data, actions) => {
        const token = localStorage.getItem('token'); // falls JWT
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, adId }),
        });
        const dataJson = await res.json();
        return dataJson.orderID;
      },
      onApprove: async (data, actions) => {
        // TODO: capture-order bauen (später)
        alert('Zahlung erfolgreich abgeschlossen!');
      },
      onError: (err) => {
        console.error('PayPal-Fehler:', err);
      },
    }).render('#paypal-button-container');
  }, [adId, amount]);

  return <div id="paypal-button-container" className="mt-4" />;
};

export default PayPalButton;
