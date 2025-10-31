// src/components/TopUpModal.tsx (Revised for a slightly wider size: max-w-sm)

"use client";

import React, { useState } from 'react';
import { X, WalletIcon } from 'lucide-react';

interface TopUpModalProps {
    currentBalance: number;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, phone: string) => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];
const PRIMARY_GREEN = '#00A859'; // Consistent use of the app's green color
const DARK_MODAL_BACKDROP = 'rgba(23, 23, 23, 0.9)'; // Dark, near-opaque background

const TopUpModal: React.FC<TopUpModalProps> = ({ currentBalance, isOpen, onClose, onSubmit }) => {
    const [amount, setAmount] = useState<string>('');
    const [phone, setPhone] = useState<string>('0712345678'); 

    if (!isOpen) return null;

    const handleQuickSelect = (value: number) => {
        setAmount(value.toString());
    };

    const handleInitiatePayment = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (phone.length !== 10) { 
            alert('Please enter a valid 10-digit M-Pesa phone number.');
            return;
        }
        
        onSubmit(numericAmount, phone);
        setAmount('');
        onClose();
    };

    return (
        // Modal Backdrop: Darker, more opaque background
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: DARK_MODAL_BACKDROP }} // Custom dark overlay
        >
            
            {/* Modal Content Card: Wider max-width (max-w-sm) */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto"> 
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Top Up Wallet</h2>
                        <p className="text-xs text-gray-500">Add funds to your FuelPoa wallet via M-Pesa</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleInitiatePayment} className="p-5 space-y-4">
                    
                    {/* Current Balance Display (Light Green Card) */}
                    <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-gray-700">Current Balance</p>
                        <p className="text-2xl font-extrabold text-[#00A859] mt-1">
                            KES {currentBalance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Quick Select Buttons */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
                        <div className="grid grid-cols-3 gap-3">
                            {QUICK_AMOUNTS.map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => handleQuickSelect(amt)}
                                    className={`py-2 rounded-lg text-sm font-semibold transition duration-150 ${
                                        parseInt(amount) === amt
                                            ? `bg-[${PRIMARY_GREEN}] text-white`
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                    style={parseInt(amount) === amt ? { backgroundColor: PRIMARY_GREEN } : {}}
                                >
                                    {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (KES)
                        </label>
                        <input
                            id="amount"
                            type="number"
                            name="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>

                    {/* M-Pesa Phone Number Input */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            M-Pesa Phone Number
                        </label>
                        <div className="relative">
                            <WalletIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="07XXXXXXXX"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                            />
                        </div>
                    </div>

                    {/* Footer Buttons (Order: Initiate Payment, Cancel) */}
                    <div className="flex justify-end space-x-3 pt-2">
                        {/* Initiate Payment Button (Primary Green) */}
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition`}
                            style={{ backgroundColor: PRIMARY_GREEN }}
                        >
                            Initiate Payment
                        </button>
                        {/* Cancel Button (Plain White, text-gray-700) */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TopUpModal;