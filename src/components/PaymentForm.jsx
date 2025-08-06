import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const PaymentForm = ({ ticket, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/admin/tickets/Closed`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            toast.error("Payment failed", { description: error.message });
        } else {
            toast.error("An unexpected error occurred.");
        }

        setLoading(false);
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
