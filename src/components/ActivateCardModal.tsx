// src/components/ActivateCardModal.tsx (Revised Alert Box Styling)

"use client";

import React, { useState } from 'react';
import { X, Info, CreditCard } from 'lucide-react';

interface ActivateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (cardId: string, pin: string) => void;
}

const PRIMARY_GREEN = '#00A859';
const DARK_MODAL_BACKDROP = 'rgba(23, 23, 23, 0.9)'; 

const ActivateCardModal: React.FC<ActivateCardModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [cardId, setCardId] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const pinRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    if (!isOpen) return null;

    const handlePinChange = (index: number, value: string) => {
        const newPin = [...pin];
        if (value.length > 1) {
            value = value.slice(-1);
        }
        newPin[index] = value;
        setPin(newPin);

        if (value && index < 3) {
            pinRefs.current[index + 1]?.focus();
        }
    };
    
    const handleActivate = (e: React.FormEvent) => {
        e.preventDefault();
        const fullPin = pin.join('');
        if (!cardId || fullPin.length !== 4) {
            alert('Please enter a valid Card ID and 4-digit PIN.');
            return;
        }
        
        onSubmit(cardId, fullPin);
        setCardId('');
        setPin(['', '', '', '']);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: DARK_MODAL_BACKDROP }}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto"> 
                
                {/* Header (No change) */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Activate Fuel Card</h2>
                        <p className="text-xs text-gray-500">Enter your card details to link it to your wallet</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleActivate} className="p-5 space-y-5">
                    
                    {/* Card ID Input (No change) */}
                    <div>
                        <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 mb-1">Card ID</label>
                        <div className="relative">
                            <input
                                id="cardId"
                                type="text"
                                value={cardId}
                                onChange={(e) => setCardId(e.target.value)}
                                placeholder="Enter card number"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition shadow-sm placeholder-gray-400"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Find this on the back of your FuelPoa card</p>
                    </div>

                    {/* Card PIN Input (No change) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card PIN</label>
                        <div className="flex justify-between space-x-2">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    type="password"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    ref={(el) => (pinRefs.current[index] = el)}
                                    required
                                    className="w-1/4 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">4-digit PIN provided with your card</p>
                    </div>

                    {/* Information Alert Box (REVISED STYLING) */}
                    {/* Using softer blue tones to match the screenshot */}
                    <div className="bg-blue-100 border border-blue-300 text-blue-900 p-3 rounded-lg flex items-start space-x-3">
                        {/* Using an inline style color for the lightbulb icon to match the blue text */}
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1e3a8a' }}/> 
                        <p className="text-xs leading-relaxed">
                            **New to FuelPoa?** Visit any FuelPoa partner station to get your smart card or contact admin to generate one.
                        </p>
                    </div>

                    {/* Footer Buttons (No change) */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="submit"
                            className={`px-6 py-2 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition`}
                            style={{ backgroundColor: PRIMARY_GREEN }}
                        >
                            Activate Card
                        </button>
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

export default ActivateCardModal;