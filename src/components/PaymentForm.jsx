import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { apiRequest } from '../lib/utils'; // Import apiRequest

const PaymentForm = ({ ticket, token, onCancel, onPaymentSuccess }) => { // Add token to props
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            toast.error("Payment failed", { description: error.message });
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                // Inform the backend that the payment was successful
                await apiRequest(
                    'put',
                    `/tickets/${ticket._id}/payment-status`,
                    { paymentStatus: 'Paid', paymentIntentId: paymentIntent.id },
                    token
                );
                toast.success("Payment successful and status updated!");
                onPaymentSuccess(); // This will trigger the polling and UI update
            } catch (apiError) {
                toast.error("Payment succeeded but failed to update status", { description: apiError.message });
                setLoading(false);
            }
        } else {
            toast.error("An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <Button type="submit" disabled={!stripe || loading} className="mt-4 w-full">
                {loading ? "Processing..." : `Pay ${ticket.amount} INR`}
            </Button>
        </form>
    );
};

export default PaymentForm;
