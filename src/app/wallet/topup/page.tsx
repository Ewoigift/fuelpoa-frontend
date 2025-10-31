// src/app/wallet/topup/page.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; 
import MainLayout from '@/components/MainLayout';

export default function TopUpPage() {
    const { user, apiCall, loading: authLoading, logout } = useAuth();
    const [amount, setAmount] = useState<string>('');
    const [phone, setPhone] = useState<string>(user?.phone || '');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    if (authLoading || !user) {
        // useAuth hook handles redirection, we show a basic state here
        return <div className="p-8 text-center text-xl">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const numericAmount = parseFloat(amount);

        // Client-side validation
        if (numericAmount <= 0 || isNaN(numericAmount)) {
            setStatus('error');
            setMessage('Please enter a valid amount.');
            return;
        }

        if (!phone || phone.length < 10) {
            setStatus('error');
            setMessage('Invalid phone number.');
            return;
        }

        try {
            setStatus('processing');
            setMessage('Initiating M-Pesa STK Push...');

            // Endpoint: POST /api/v1/payments/stk_push (Assumed from API documentation)
            const response = await apiCall('/api/v1/payments/stk_push', 'POST', {
                amount: numericAmount,
                phone: phone, // This phone should be the one receiving the STK prompt
                // userId is typically extracted from the JWT on the backend
            });
            
            setStatus('success');
            setMessage(
                `STK Push initiated successfully! Please check your phone (${phone}) and enter your M-Pesa PIN to complete the payment.`,
            );

            // Optional: You could start polling the backend here to check for confirmation
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'STK Push failed. Please try again.');
        }
    };

    const isProcessing = status === 'processing';
    
    return (
        <MainLayout title="Wallet Top-Up" onLogout={logout} userName={user.name}>
            <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
                <h1 className="text-3xl font-bold text-green-700 mb-6">M-Pesa Wallet Top-Up</h1>
                <p className="text-gray-600 mb-6">Fund your FUELPOA wallet instantly via M-Pesa STK Push.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="10"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., 500.00"
                            disabled={isProcessing}
                        />
                    </div>
                    
                    {/* Phone Number Input (Pre-filled with user's number) */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                        <input
                            id="phone"
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-gray-50"
                            placeholder="e.g., 2547XXXXXXXX"
                            disabled={isProcessing}
                        />
                        <p className="mt-1 text-xs text-gray-500">Ensure this is the number receiving the prompt.</p>
                    </div>

                    {/* Status Message Area */}
                    {status !== 'idle' && (
                        <div className={`p-4 rounded-lg font-medium ${
                            status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            status === 'success' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition duration-150 flex items-center justify-center"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Waiting for Prompt...
                            </>
                        ) : 'Top Up Wallet Now'}
                    </button>
                </form>
            </div>
        </MainLayout>
    );
}