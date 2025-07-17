import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from '../lib/utils';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const PaymentForm = ({ ticketId, amount, token, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      const { clientSecret } = await apiRequest(
        'post',
        '/payment/create-payment-intent',
        { amount, currency: 'inr' },
        token
      );

      const { paymentIntent, error } = await stripe.confirmUpiPayment(
        clientSecret,
        { 
          payment_method: { 
            type: 'upi',
            upi: elements.getElement(CardElement),
          },
          return_url: window.location.origin + '/payment-success',
        }
      );

      if (error) {
        toast.error("Payment Failed", { description: error.message });
      } else if (paymentIntent.status === 'succeeded') {
        await apiRequest(
          'put',
          `/tickets/${ticketId}/payment-status`,
          { paymentIntentId: paymentIntent.id, paymentStatus: 'Paid' },
          token
        );
        toast.success("Payment Successful!");
        onPaymentSuccess();
      } else {
        toast.info("Payment Status", { description: `Payment status: ${paymentIntent.status}` });
      }
    } catch (err) {
      toast.error("Payment Error", { description: err.message });
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