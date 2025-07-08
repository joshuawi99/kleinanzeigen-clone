import { useEffect } from 'react';

const PayPalButton = ({ adId, amount }) => {
  useEffect(() => {
    // Vorherigen Button-Container leeren
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    if (!window.paypal) return;

    window.paypal.Buttons({
      createOrder: async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, adId }),
        });

        const data = await res.json();
        return data.orderID;
      },

      onApprove: async (data) => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/payments/capture-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderID: data.orderID }),
        });

        const result = await res.json();

        if (res.ok) {
          alert('✅ Zahlung erfolgreich! Vielen Dank.');
        } else {
          alert(`❌ Fehler bei Zahlung: ${result.error}`);
        }
      },

      onError: (err) => {
        console.error('PayPal Fehler:', err);
        alert('Ein Fehler ist beim PayPal-Vorgang aufgetreten.');
      },
    }).render('#paypal-button-container');
  }, [adId, amount]);

  return <div id="paypal-button-container" className="mt-4" />;
};

export default PayPalButton;
