import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const API_URL = 'http://localhost:8021/api';

const PaymentForm = ({ ticketId, amount, token, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded. Make sure to disable form submission until Stripe.js has loaded.
      setLoading(false);
      return;
    }

    try {
      // 1. Create Payment Intent on your backend
      const { data: { clientSecret } } = await axios.post(
        `${API_URL}/payment/create-payment-intent`,
        { amount, currency: 'inr' }, // Assuming INR for UPI
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Confirm UPI payment
      const { paymentIntent, error } = await stripe.confirmUpiPayment(
        clientSecret,
        { 
          payment_method: { 
            type: 'upi',
            upi: elements.getElement(CardElement), // CardElement is used for UPI details input
          },
          return_url: window.location.origin + '/payment-success', // Replace with your actual success URL
        }
      );

      if (error) {
        toast.error("Payment Failed", { description: error.message });
      } else if (paymentIntent.status === 'succeeded') {
        // 3. Update ticket status on your backend
        await axios.put(
          `${API_URL}/tickets/${ticketId}/payment-status`,
          { paymentIntentId: paymentIntent.id, paymentStatus: 'Paid' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Payment Successful!");
        onPaymentSuccess();
      } else {
        toast.info("Payment Status", { description: `Payment status: ${paymentIntent.status}` });
      }
    } catch (err) {
      toast.error("Payment Error", { description: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border p-4 rounded-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID / Virtual Payment Address</label>
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={!stripe || loading}>Pay ₹{amount}</Button>
      </div>
    </form>
  );
};

export default PaymentForm;