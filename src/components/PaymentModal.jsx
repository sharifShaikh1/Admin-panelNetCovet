import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaymentForm from './PaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from '../lib/utils';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentModal = ({ isOpen, onCancel, ticket, token }) => {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (isOpen && ticket) {
            const createPaymentIntent = async () => {
                try {
                    const { clientSecret } = await apiRequest('post', '/payment/create-payment-intent', { ticketId: ticket._id }, token);
                    setClientSecret(clientSecret);
                } catch (err) {
                    toast.error("Failed to initialize payment", { description: err.message });
                    onCancel();
                }
            };
            createPaymentIntent();
        }
    }, [isOpen, ticket, token, onCancel]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
        },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Payment for Ticket {ticket?.ticketId}</DialogTitle>
                </DialogHeader>
                {clientSecret && (
                    <Elements stripe={stripePromise} options={options}>
                        <PaymentForm ticket={ticket} onCancel={onCancel} />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
