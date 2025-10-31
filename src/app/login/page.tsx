// src/app/login/page.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WalletIcon, CreditCardIcon, LogIn, FuelIcon, TrendingUp  } from 'lucide-react';

// Defines the roles that can log in, used for the dropdown
const ROLES = ['Customer', 'Fuel Attendant', 'Station Admin', 'Super Admin'];

export default function LoginPage() {
    const { login, loading: authLoading } = useAuth();
    const [identifier, setIdentifier] = useState('0712345678'); // Default for quick login
    const [password, setPassword] = useState('password'); // Default for quick login
    const [role, setRole] = useState(ROLES[0]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ identifier, password, role });
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // The light green background gradient from the screenshot
        <div className="min-h-screen flex flex-col items-center justify-center p-4" 
             style={{ background: 'linear-gradient(to bottom, #f0fff0, #d9ffdb)' }}>
            
            <div className="flex flex-col items-center mb-8">
                {/* FuelPoa Logo Icon - Reusing the green color */}
                <FuelIcon className="w-12 h-12 text-[#00A35B] mb-2" />
                <h1 className="text-2xl font-bold text-gray-800">FuelPoa</h1>
                <p className="text-sm text-[#00A35B] font-medium mt-1">Smart Fuel Payment & Loyalty System</p>
            </div>

            {/* Feature Cards (Styling to match the dashboard's green) */}
            <div className="flex space-x-4 mb-8">
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700">
                    <WalletIcon className="w-5 h-5 text-[#00A35B]" />
                    <span>Digital Wallet</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700">
                    <TrendingUp className="w-5 h-5 text-[#00A35B]" />
                    <span>Loyalty Rewards</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700">
                    <CreditCardIcon className="w-5 h-5 text-[#00A35B]" />
                    <span>Smart Cards</span>
                </div>
            </div>

            {/* Login Form Card */}
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome Back</h2>
                <p className="text-gray-600 mb-6">Sign in to your FuelPoa account</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="0712345678"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Login As
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm appearance-none cursor-pointer"
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || authLoading}
                        className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition duration-200 ${
                            loading || authLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-[#00A35B] hover:bg-green-700'
                        }`}
                    >
                        {loading || authLoading ? (
                            <>
                                <span className="animate-spin mr-3">🌀</span> Signing In...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm">Don't have an account? 
                        <Link href="/register" className="text-[#00A35B] font-semibold hover:text-green-700 ml-1">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-500">Powered by Asekosi Credit Engine • M-Pesa Integrated</p>
        </div>
    );
}