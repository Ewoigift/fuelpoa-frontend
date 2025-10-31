// src/components/CardComponent.tsx

import React from 'react';
import { CreditCard, Zap } from 'lucide-react';

interface CardProps {
    color: 'green' | 'blue';
    cardNumberLast4: string;
    dailyLimit: number;
    usedToday: number;
    status: 'ACTIVE' | 'INACTIVE';
}

const CardComponent: React.FC<CardProps> = ({ color, cardNumberLast4, dailyLimit, usedToday, status }) => {
    
    // Define the color palette based on the prop
    const baseColor = color === 'green' ? '#00A859' : '#3B82F6'; // Primary Green or Tailwind Blue-500
    const bgColor = color === 'green' ? baseColor : '#3B82F6'; 
    const isInactive = status === 'INACTIVE';

    return (
        <div 
            className={`text-white p-6 rounded-xl shadow-lg h-52 flex flex-col justify-between transition duration-300 ${
                isInactive ? 'opacity-50 grayscale' : 'hover:shadow-xl'
            }`}
            style={{ backgroundColor: bgColor }}
        >
            {/* Top Row: Card Icon and Status */}
            <div className="flex justify-between items-start">
                <CreditCard className="w-8 h-8 opacity-80" />
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${isInactive ? 'bg-gray-700' : 'bg-white bg-opacity-20'}`}>
                    {status}
                </span>
            </div>

            {/* Card Number */}
            <div className="mt-4">
                <p className="text-sm opacity-80">Card Number</p>
                <p className="text-3xl font-bold tracking-wider">
                    **** **** {cardNumberLast4}
                </p>
            </div>

            {/* Bottom Row: Daily Limit and Used Today */}
            <div className="flex justify-between items-end text-sm mt-auto">
                <div>
                    <p className="opacity-80">Daily Limit</p>
                    <p className="font-semibold">
                        KES {dailyLimit.toLocaleString('en-KE')}
                    </p>
                </div>
                <div className="text-right">
                    <p className="opacity-80">Used Today</p>
                    <p className="font-semibold">
                        KES {usedToday.toLocaleString('en-KE')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CardComponent;