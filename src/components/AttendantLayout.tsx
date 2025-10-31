// src/components/AttendantLayout.tsx

"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface AttendantLayoutProps {
    children: ReactNode;
    title: string;
    userName: string;
    stationName: string; // Attendant's current station
    onLogout: () => void;
}

const AttendantLayout: React.FC<AttendantLayoutProps> = ({ children, title, userName, stationName, onLogout }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Navbar */}
            <header className="bg-green-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/attendant/transaction" className="text-2xl font-bold tracking-tight hover:text-green-200 transition">
                            FUELPOA POS
                        </Link>
                        
                        <div className="flex items-center space-x-6">
                            <span className="text-sm hidden sm:inline font-medium">
                                Station: <strong className="font-extrabold">{stationName}</strong>
                            </span>
                            <span className="text-sm hidden sm:inline font-medium">
                                Attendant: {userName.split(' ')[0]}
                            </span>
                            
                            <button
                                onClick={onLogout}
                                className="px-3 py-1 bg-red-600 rounded-full text-sm font-medium hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default AttendantLayout;