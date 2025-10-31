// src/components/MainLayout.tsx

"use client"; // REQUIRED for App Router client components

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
    children: ReactNode;
    title: string;
    userName: string;
    onLogout: () => void;
}

const MainLayout: React.FC<LayoutProps> = ({ children, title, userName, onLogout }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Navbar */}
            <header className="bg-blue-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="text-2xl font-bold tracking-tight hover:text-green-300 transition">
                            FUELPOA Customer
                        </Link>
                        
                        <nav className="flex items-center space-x-6">
                            <Link href="/wallet/topup" className="text-sm font-medium hover:text-green-400 hidden sm:inline">Top Up</Link>
                            <Link href="/history" className="text-sm font-medium hover:text-green-400 hidden sm:inline">History</Link>
                            
                            <span className="text-sm hidden sm:inline font-medium">Hi, {userName.split(' ')[0]}</span>
                            
                            <button
                                onClick={onLogout}
                                className="px-3 py-1 bg-red-600 rounded-full text-sm font-medium hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </nav>
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

export default MainLayout;