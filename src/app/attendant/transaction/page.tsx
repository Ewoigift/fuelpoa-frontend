// src/app/attendant/transaction/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AttendantLayout from '@/components/AttendantLayout';
import { redirect } from 'next/navigation';

// --- INTERFACES ---
interface FuelProduct {
    id: string;
    name: string;
    pricePerLiter: number;
}

interface CardDetails {
    customerId: string;
    customerName: string;
    walletBalance: number;
    dailyLimit: number;
    status: 'active' | 'inactive' | 'suspended';
}

const MOCK_PRODUCTS: FuelProduct[] = [
    { id: '1', name: 'Super Petrol', pricePerLiter: 212.00 },
    { id: '2', name: 'Diesel', pricePerLiter: 198.50 },
    { id: '3', name: 'Kerosene', pricePerLiter: 160.00 },
];

export default function AttendantTransactionPage() {
    const { user, apiCall, loading: authLoading, logout } = useAuth();
    
    // Attendant/Transaction State
    const [scanCardNumber, setScanCardNumber] = useState('');
    const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string>(MOCK_PRODUCTS[0].id);
    const [amountKES, setAmountKES] = useState('');
    const [litres, setLitres] = useState('0.00');

    // UI State
    const [status, setStatus] = useState<'idle' | 'scanning' | 'ready' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('Welcome! Swipe or enter the customer card number.');
    
    // --- AUTHENTICATION & REDIRECTION ---
    if (authLoading) {
        return <div className="p-8 text-center text-xl">Loading authentication...</div>;
    }
    
    if (!user || user.role !== 'attendant') {
        redirect('/attendant/login');
    }

    // --- HELPER LOGIC ---
    const selectedProduct = MOCK_PRODUCTS.find(p => p.id === selectedProductId) || MOCK_PRODUCTS[0];
    
    // Calculate Litres from KES Amount
    useEffect(() => {
        const price = selectedProduct.pricePerLiter;
        const amount = parseFloat(amountKES);
        if (amount > 0 && price > 0) {
            setLitres((amount / price).toFixed(2));
        } else {
            setLitres('0.00');
        }
    }, [amountKES, selectedProduct]);

    // --- API HANDLERS ---
    
    const handleCardScan = async () => {
        if (scanCardNumber.length !== 10) {
            setStatus('error');
            setMessage('Please enter a valid 10-digit card number.');
            return;
        }

        try {
            setStatus('scanning');
            setMessage(`Looking up card ${scanCardNumber}...`);

            // API Call: GET /api/v1/cards/lookup/:cardNumber (Assumed)
            const data = await apiCall(`/api/v1/cards/lookup/${scanCardNumber}`, 'GET');
            
            setCardDetails({
                customerId: data.customer_id,
                customerName: data.customer_name,
                walletBalance: data.wallet_balance,
                dailyLimit: data.daily_limit,
                status: data.status,
            });
            
            if (data.status === 'active') {
                setStatus('ready');
                setMessage(`Card found for ${data.customer_name}. Ready for transaction.`);
            } else {
                 setStatus('error');
                 setMessage(`Card is ${data.status}. Cannot process transaction.`);
            }

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Card lookup failed. Please check the number.');
            setCardDetails(null);
        }
    };
    
    const handleTransactionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(amountKES);
        const litresValue = parseFloat(litres);

        if (!cardDetails || cardDetails.status !== 'active') {
            setStatus('error');
            setMessage('Please scan and validate an active card first.');
            return;
        }
        if (amount <= 0 || isNaN(amount)) {
            setStatus('error');
            setMessage('Enter a valid amount to process.');
            return;
        }
        if (amount > cardDetails.walletBalance) {
            setStatus('error');
            setMessage(`Insufficient balance (KES ${cardDetails.walletBalance.toLocaleString()}). Transaction failed.`);
            return;
        }
        
        try {
            setStatus('processing');
            setMessage(`Processing KES ${amount.toLocaleString()} purchase...`);

            // API Call: POST /api/v1/transactions/fuel_purchase (Assumed)
            const response = await apiCall('/api/v1/transactions/fuel_purchase', 'POST', {
                cardNumber: scanCardNumber,
                productId: selectedProductId,
                amount: amount,
                litres: litresValue,
                attendantId: user.id, // User ID is the Attendant ID
                stationId: 'ST101', // Should be dynamically fetched from attendant user data
            });
            
            setStatus('success');
            setMessage(`Transaction COMPLETE! KES ${amount.toLocaleString()} deducted. New balance: KES ${response.newBalance.toLocaleString()}.`);
            
            // Reset state for next customer
            setAmountKES('');
            setLitres('0.00');
            setCardDetails(null);
            setScanCardNumber('');
            setTimeout(() => setStatus('idle'), 5000);

        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Transaction failed. Check card details and try again.');
        }
    };

    // --- UI RENDER ---

    const isProcessing = status === 'processing';

    return (
        <AttendantLayout 
            title="POS Transaction" 
            onLogout={logout} 
            userName={user.name || 'Attendant'}
            stationName={"Nairobi Central"} // Hardcoded for now
        >
            <div className="flex space-x-6">
                
                {/* LEFT COLUMN: Transaction Form */}
                <div className="w-2/3 p-8 bg-white rounded-xl shadow-2xl space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">New Fuel Transaction</h2>

                    {/* Status Message */}
                    <div className={`p-4 rounded-lg font-medium text-white ${
                        status === 'idle' ? 'bg-blue-600' :
                        status === 'scanning' || status === 'processing' ? 'bg-yellow-600' :
                        status === 'success' ? 'bg-green-600' :
                        'bg-red-600'
                    }`}>
                        {message}
                    </div>

                    {/* Card Scanning Input */}
                    <div className='flex space-x-3'>
                        <div className='flex-grow'>
                            <label htmlFor="scanCard" className="block text-sm font-medium text-gray-700">Scan/Enter Card Number</label>
                            <input
                                id="scanCard"
                                type="text"
                                value={scanCardNumber}
                                onChange={(e) => {
                                    setScanCardNumber(e.target.value);
                                    if (status !== 'idle') setStatus('idle'); // Reset status on change
                                }}
                                maxLength={10}
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 font-mono text-lg"
                                placeholder="XXXXXXXXXX"
                                disabled={isProcessing}
                            />
                        </div>
                        <button
                            onClick={handleCardScan}
                            type="button"
                            className="self-end py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition"
                            disabled={isProcessing || scanCardNumber.length !== 10 || status === 'ready'}
                        >
                            {status === 'scanning' ? 'Scanning...' : 'Scan Card'}
                        </button>
                    </div>

                    {/* Fuel Details Form */}
                    <form onSubmit={handleTransactionSubmit} className="space-y-6 pt-4 border-t">
                        
                        {/* Product Selection */}
                        <div>
                            <label htmlFor="product" className="block text-sm font-medium text-gray-700">Fuel Product</label>
                            <select
                                id="product"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                disabled={isProcessing || status !== 'ready'}
                            >
                                {MOCK_PRODUCTS.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} (KES {p.pricePerLiter.toFixed(2)}/L)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount Input */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label htmlFor="amountKES" className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                                <input
                                    id="amountKES"
                                    type="number"
                                    value={amountKES}
                                    onChange={(e) => setAmountKES(e.target.value)}
                                    min="1"
                                    required
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 font-extrabold text-xl"
                                    placeholder="e.g., 2000.00"
                                    disabled={isProcessing || status !== 'ready'}
                                />
                            </div>
                            
                            {/* Calculated Litres Output */}
                            <div>
                                <label htmlFor="litres" className="block text-sm font-medium text-gray-700">Calculated Litres</label>
                                <input
                                    id="litres"
                                    type="text"
                                    value={litres}
                                    readOnly
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-100 font-extrabold text-xl text-gray-600"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 px-4 rounded-lg text-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition duration-150 flex items-center justify-center"
                            disabled={isProcessing || status !== 'ready' || parseFloat(amountKES) <= 0}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Finalizing Sale...
                                </>
                            ) : 'PROCESS TRANSACTION'}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: Customer/Card Details */}
                <div className="w-1/3 space-y-6">
                    <div className={`p-6 rounded-xl shadow-lg h-full ${cardDetails ? 'bg-teal-50' : 'bg-gray-100'}`}>
                        <h2 className="text-xl font-bold text-gray-700 border-b pb-3 mb-4">Customer Details</h2>
                        
                        {cardDetails ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Card Status</p>
                                    <span className={`text-lg font-bold ${cardDetails.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                        {cardDetails.status.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Customer Name</p>
                                    <p className="text-xl font-extrabold text-gray-800">{cardDetails.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Wallet Balance</p>
                                    <p className="text-3xl font-extrabold text-green-700">KES {cardDetails.walletBalance.toLocaleString('en-KE')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Daily Limit</p>
                                    <p className="text-xl font-bold text-gray-700">KES {cardDetails.dailyLimit.toLocaleString('en-KE')}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic p-4 text-center">
                                Scan a fuel card to display customer information and wallet balance.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </AttendantLayout>
    );
}