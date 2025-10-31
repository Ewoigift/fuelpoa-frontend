// src/app/attendant/login/page.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function AttendantLoginPage() {
    const { login } = useAuth();
    const [employeeId, setEmployeeId] = useState(''); // Attendant ID instead of phone
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // NOTE: The login function in useAuth is designed to check the role 
            // and redirect to the correct dashboard (e.g., /attendant/transaction).
            
            // We pass the EmployeeId as the identifier (assuming backend handles this)
            await login({ identifier: employeeId, password }); 
        
        } catch (err: any) {
            setError(err.message || 'Login failed. Check your ID and password.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-teal-600">Attendant Portal</h1>
                    <p className="text-gray-500 mt-2">Log in to process fuel transactions.</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Employee ID Input */}
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <input
                            id="employeeId"
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            placeholder="A-1001"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-lg text-lg font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition duration-150 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </>
                        ) : 'Login to POS'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Go to Customer Login
                    </Link>
                </div>
            </div>
        </div>
    );
}