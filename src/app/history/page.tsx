// src/app/history/page.tsx

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth'; 
import MainLayout from '@/components/MainLayout';
import { redirect } from 'next/navigation';

// Define interface for a single transaction
interface Transaction {
    id: string;
    type: 'fuel_purchase' | 'wallet_topup' | 'loyalty_redemption';
    amount: number; // KES value
    status: 'completed' | 'pending' | 'failed';
    date: string; // ISO date string
    stationName?: string; // For fuel purchases
    reference: string; // M-Pesa or Internal Ref
}


// Utility function for readable status badges
const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
        case 'completed':
            return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Completed</span>;
        case 'pending':
            return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Pending</span>;
        case 'failed':
            return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Failed</span>;
        default:
            return <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{status}</span>;
    }
};

export default function HistoryPage() {
    const { user, apiCall, loading: authLoading, logout } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Authentication Guard
    if (authLoading) {
        return <div className="p-8 text-center text-xl">Loading authentication...</div>;
    }
    
    if (!user) {
        redirect('/login');
    }

    // Data Fetching
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setDataLoading(true);
                setError(null);
                
                // Assumed Endpoint for customer transaction history
                const data = await apiCall('/api/v1/transactions/customer?limit=50', 'GET'); 
                
                // Assume 'data.transactions' is the array of transactions from the backend
                setTransactions(data.transactions || []);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch transaction history.');
            } finally {
                setDataLoading(false);
            }
        };

        if (user) {
            fetchTransactions();
        }
    }, [user, apiCall]);

    
    const sortedTransactions = useMemo(() => {
        // Sort by date descending (most recent first)
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);


    return (
        <MainLayout title="Transaction History" onLogout={logout} userName={user?.name || 'Customer'}>
            <div className="p-4 space-y-8">
                <h1 className="text-4xl font-extrabold text-blue-800">Transaction History</h1>
                <p className="text-gray-600">Review all your wallet top-ups and fuel purchases.</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg font-medium">
                        **Error:** {error}
                    </div>
                )}

                {dataLoading ? (
                    <div className="text-center text-gray-500 p-10 text-xl animate-pulse">
                        Loading transaction records...
                    </div>
                ) : sortedTransactions.length === 0 ? (
                    <div className="text-center p-10 bg-white border border-dashed rounded-lg">
                        <p className="text-lg text-gray-500">No transactions found yet.</p>
                        <Link href="/wallet/topup" className="mt-4 inline-block text-blue-600 hover:underline">
                            Top up your wallet to get started.
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount (KES)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition duration-100">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {tx.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tx.stationName ? `at ${tx.stationName}` : `Ref: ${tx.reference}`}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.type === 'fuel_purchase' ? 'text-red-600' : 'text-green-600'}`}>
                                            {tx.type === 'fuel_purchase' ? '-' : '+'} {tx.amount.toLocaleString('en-KE')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getStatusBadge(tx.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}