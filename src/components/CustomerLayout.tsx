// src/components/CustomerLayout.tsx

"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut, Fuel } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CustomerLayoutProps {
    children: ReactNode;
    title: string;
    userName: string;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, title, userName }) => {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header: Full green background, matching the specs */}
            <header className="bg-[#00A859] text-white shadow-md h-20 flex items-center px-8 sticky top-0 z-10">
                
                {/* Left side: Icon, Welcome Text, User Name */}
                <div className="flex items-center space-x-3">
                    <Fuel className="w-8 h-8" /> 
                    <div>
                        <p className="text-sm font-light">Welcome back,</p>
                        <p className="text-xl font-bold tracking-tight">{userName}</p>
                    </div>
                </div>

                {/* Right side: Logout button (subtle) */}
                <button 
                    onClick={logout}
                    className="ml-auto flex items-center space-x-1 text-sm font-medium hover:text-gray-200 transition"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </header>

            {/* Main Content Area: Centered container (max-width: 1100px) */}
            <main className="flex-grow max-w-5xl xl:max-w-[1100px] mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
                {children}
            </main>
        </div>
    );
};

export default CustomerLayout;