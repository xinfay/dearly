import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function GetPayment({ onPaymentComplete, setIsPaymentComplete, setSubmitPayment }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsPaymentComplete(false);
    setSubmitPayment(() => handlePayment);
  }, [stripe, elements]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    } else {
      onPaymentComplete(paymentMethod);
      setLoading(false);
      return true;
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Card Details
      </label>
      <div className="p-3 border border-gray-300 rounded-lg bg-white">
        <CardElement
          options={{ style: { base: { fontSize: '16px' } } }}
          onChange={(event) => {
            setIsPaymentComplete(event.complete);
          }}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
