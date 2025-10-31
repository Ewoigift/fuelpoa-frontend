// src/app/register/page.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {  UserPlus, FuelIcon } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        phone: '',
        email: '',
        accountType: 'Customer', // Default to Customer as per screenshot
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            // The register function in useAuth calls POST /api/v1/customers/onboard
            await register({
                name: formData.fullName,
                national_id: formData.idNumber,
                phone: formData.phone,
                email: formData.email,
                role: formData.accountType,
                password: formData.password,
            });
            
            setSuccess('Registration successful! Redirecting to login...');
            
            // The register function in useAuth already handles the router.push('/login')
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Light green background gradient, matching the login page
        <div className="min-h-screen flex flex-col items-center justify-center p-4" 
             style={{ background: 'linear-gradient(to bottom, #f0fff0, #d9ffdb)' }}>
            
            <div className="flex flex-col items-center mb-6">
                <FuelIcon className="w-12 h-12 text-[#00A35B] mb-2" />
                <h1 className="text-2xl font-bold text-gray-800">FuelPoa</h1>
                <p className="text-base text-[#00A35B] font-medium mt-1">Create Your Account</p>
            </div>

            {/* Registration Form Card */}
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Register</h2>
                <p className="text-gray-600 mb-6 text-sm">Join FuelPoa and start saving on fuel</p>

                {/* Status Messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm" role="alert">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>
                    
                    {/* ID Number */}
                    <div>
                        <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                        <input
                            id="idNumber"
                            name="idNumber"
                            type="text"
                            value={formData.idNumber}
                            onChange={handleChange}
                            placeholder="12345678"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0712345678"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>
                    
                    {/* Email Address */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>
                    
                    {/* Account Type (Dropdown) */}
                    <div>
                        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                        <div className="relative">
                            <select
                                id="accountType"
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm appearance-none cursor-pointer pr-10 bg-white"
                            >
                                <option value="Customer">Customer</option>
                            </select>
                            {/* Custom dropdown indicator */}
                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 6 characters"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm placeholder-gray-600 bg-gray-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition duration-200 ${
                            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-[#00A35B] hover:bg-green-700'
                        }`}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-3">🌀</span> Creating Account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5 mr-2" /> Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm">Already have an account? 
                        <Link href="/login" className="text-[#00A35B] font-semibold hover:text-green-700 ml-1">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">By signing up, you agree to our Terms & Privacy Policy</p>
        </div>
    );
}