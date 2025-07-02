// server/controllers/paymentController.js

const { paypalClient } = require('../utils/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

exports.createOrder = async (req, res) => {
  const { amount, currency = 'EUR', adId } = req.body;

  if (!amount || !adId) {
    return res.status(400).json({ error: 'Amount and adId are required.' });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: adId,
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
      },
    ],
  });

  try {
    const order = await paypalClient().execute(request);
    res.status(201).json({ orderID: order.result.id });
  } catch (error) {
    console.error('PayPal createOrder error:', error);
    res.status(500).json({ error: 'Could not create PayPal order.' });
  }
};
