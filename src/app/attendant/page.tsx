// src/app/attendant/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import CustomerLayout from '@/components/CustomerLayout';
import { CreditCardIcon, FuelIcon, DollarSign, RefreshCw, LogOut, ScanEye, TrendingUp, Car } from 'lucide-react';

const PRIMARY_GREEN = '#00A859';
const ACCENT_BLUE = '#1A73E8'; // Not used in this version but kept for reference
const TEXT_GREY = '#4A5568';
const BACKGROUND_GREY = '#F7FAFC';

interface AttendantDailySummary {
    transactionsToday: number;
    totalSales: number;
    litresDispensed: number;
}

// --- ATTENDANT-SPECIFIC COMPONENTS (Updated Colors) ---

// 1. Header Component
const AttendantHeader: React.FC<{ attendantName: string; stationName: string; onLogout: () => void }> = ({ attendantName, stationName, onLogout }) => (
    <div className="flex justify-between items-center py-4 px-6 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
            <FuelIcon className={`w-8 h-8 text-[${PRIMARY_GREEN}]`} />
            <div>
                <h1 className="text-xl font-bold text-gray-800">FuelPoa PDQ Terminal</h1>
                {/* STATION NAME IS NOW GREEN */}
                <p className={`text-sm font-semibold text-[${PRIMARY_GREEN}]`}>{stationName}</p>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Attendant</span>
            <span className="font-semibold text-gray-800">{attendantName}</span>
            <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition ml-2">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    </div>
);


// 2. New Transaction Card (Updated Total Amount and Button)
const NewTransactionCard: React.FC<{
    cardId: string;
    setCardId: (id: string) => void;
    litres: number;
    setLitres: (l: number) => void;
    pricePerLitre: number;
    totalAmount: number;
    onProcessTransaction: () => void;
    isProcessing: boolean;
}> = ({ cardId, setCardId, litres, setLitres, pricePerLitre, totalAmount, onProcessTransaction, isProcessing }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 min-w-[300px]">
        <h2 className="text-lg font-bold text-gray-800 mb-4">New Transaction</h2>
        <p className="text-sm text-gray-500 mb-4">Scan or enter customer card details</p>

        <div className="mb-4">
            <label htmlFor="cardId" className="block text-sm font-medium text-gray-700 mb-1">Card ID</label>
            <input
                type="text"
                id="cardId"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="Scan or enter card number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_GREEN}] focus:border-[${PRIMARY_GREEN}] transition duration-150 ease-in-out text-gray-800"
            />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="litres" className="block text-sm font-medium text-gray-700 mb-1">Litres</label>
                <input
                    type="number"
                    id="litres"
                    value={litres.toFixed(1)}
                    onChange={(e) => setLitres(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${PRIMARY_GREEN}] focus:border-[${PRIMARY_GREEN}] transition duration-150 ease-in-out text-gray-800"
                />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price/Litre</label>
                <input
                    type="number"
                    id="price"
                    value={pricePerLitre.toFixed(2)}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-800"
                />
            </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Total Amount</p>
            {/* TOTAL AMOUNT IS NOW GREEN */}
            <p className={`text-2xl font-bold text-[${PRIMARY_GREEN}] mt-1`}>
                KES {totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
        </div>

        {/* BUTTON IS NOW PRIMARY GREEN */}
        <button
            onClick={onProcessTransaction}
            disabled={isProcessing || !cardId || litres <= 0}
            className={`w-full py-3 rounded-lg font-semibold text-white transition duration-150 ease-in-out
                ${isProcessing || !cardId || litres <= 0 ? 'bg-gray-400 cursor-not-allowed' : `bg-[${PRIMARY_GREEN}] hover:bg-green-700 shadow-md`}`}
        >
            {isProcessing ? 'Processing...' : 'Process Transaction'}
        </button>
    </div>
);

// 3. Transaction Status Card (Updated Icon Color)
const TransactionStatusCard: React.FC<{ statusMessage: string; cardIcon: React.ReactNode; isError: boolean }> = ({ statusMessage, cardIcon, isError }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex-1 min-w-[300px] flex flex-col justify-center items-center text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Transaction Status</h2>
        <p className="text-sm text-gray-500 mb-6">View transaction result and customer details</p>
        
        {/* ICON USES GREEN FOR NEUTRAL/SUCCESS, RED FOR ERROR */}
        <div className={`p-4 rounded-full ${isError ? 'bg-red-100 text-red-600' : `bg-green-100 text-[${PRIMARY_GREEN}]`} mb-4`}>
            {cardIcon}
        </div>
        <p className={`text-base font-semibold ${isError ? 'text-red-600' : 'text-gray-700'}`}>
            {statusMessage}
        </p>
    </div>
);

// 4. Daily Summary Stat Card (No color changes needed here, keeping icons neutral grey)
const DailySummaryStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-start justify-center h-28 border border-gray-100">
        <div className="flex justify-between w-full items-center mb-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="text-2xl text-gray-600">
                {icon}
            </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);


// --- MAIN ATTENDANT PAGE COMPONENT (The rest remains the same) ---
export default function AttendantDashboardPage() {
    const { user, loading: authLoading, logout, apiCall } = useAuth();
    const [cardId, setCardId] = useState<string>('');
    const [litres, setLitres] = useState<number>(0.0);
    const [pricePerLitre, setPricePerLitre] = useState<number>(100.00); // Mock price
    const [totalAmount, setTotalAmount] = useState<number>(0.0);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [transactionStatus, setTransactionStatus] = useState<string>('No transaction in progress');
    const [isStatusError, setIsStatusError] = useState<boolean>(false);
    const [dailySummary, setDailySummary] = useState<AttendantDailySummary>({
        transactionsToday: 24,
        totalSales: 45200,
        litresDispensed: 452,
    });

    // Calculate total amount whenever litres or price changes
    useEffect(() => {
        setTotalAmount(litres * pricePerLitre);
    }, [litres, pricePerLitre]);

    // Handle transaction processing
    const handleProcessTransaction = useCallback(async () => {
        if (!cardId || litres <= 0) {
            setTransactionStatus('Please enter a valid Card ID and Litres.');
            setIsStatusError(true);
            return;
        }

        setIsProcessing(true);
        setTransactionStatus('Processing transaction...');
        setIsStatusError(false);

        try {
            // Simulate API call for transaction
            const response = await new Promise((resolve) => setTimeout(() => {
                const success = Math.random() > 0.2; // 80% chance of success
                if (success) {
                    resolve({ success: true, message: 'Transaction successful!', customerName: 'John Doe', newBalance: 1500 });
                } else {
                    throw new Error('Transaction failed: Insufficient balance or invalid card.');
                }
            }, 2000)); // Simulate 2-second API call

            // Update UI on success
            setTransactionStatus((response as any).message + ` Customer: ${(response as any).customerName}`);
            setIsStatusError(false);
            // Update daily summary (mocking this for now)
            setDailySummary(prev => ({
                transactionsToday: prev.transactionsToday + 1,
                totalSales: prev.totalSales + totalAmount,
                litresDispensed: prev.litresDispensed + litres,
            }));
            // Clear inputs for next transaction
            setCardId('');
            setLitres(0.0);

        } catch (error: any) {
            setTransactionStatus(error.message);
            setIsStatusError(true);
        } finally {
            setIsProcessing(false);
        }
    }, [cardId, litres, totalAmount]);


    // Authentication check
    if (authLoading) {
        return <p className="text-center p-8 text-lg font-medium">Loading attendant terminal...</p>;
    }
    
    // Redirect if not authenticated or not an attendant
    if (!user || user.role !== 'attendant') {
        redirect('/login');
    }

    const handleLogout = () => {
        logout();
        redirect('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Custom Attendant Header */}
            <AttendantHeader 
                attendantName={user.name || 'Demo Attendant'} 
                stationName="Shell Westlands" 
                onLogout={handleLogout} 
            />

            <div className="container mx-auto px-6 py-8 space-y-8">
                {/* Top Section: New Transaction & Transaction Status */}
                <div className="flex flex-wrap lg:flex-nowrap gap-8">
                    <NewTransactionCard
                        cardId={cardId}
                        setCardId={setCardId}
                        litres={litres}
                        setLitres={setLitres}
                        pricePerLitre={pricePerLitre}
                        totalAmount={totalAmount}
                        onProcessTransaction={handleProcessTransaction}
                        isProcessing={isProcessing}
                    />
                    <TransactionStatusCard
                        statusMessage={transactionStatus}
                        cardIcon={<CreditCardIcon className="w-10 h-10" />}
                        isError={isStatusError}
                    />
                </div>

                {/* Bottom Section: Daily Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DailySummaryStatCard
                        title="Today's Transactions"
                        value={dailySummary.transactionsToday.toString()}
                        icon={<RefreshCw className="text-gray-400" />}
                    />
                    <DailySummaryStatCard
                        title="Total Sales"
                        value={`KES ${dailySummary.totalSales.toLocaleString('en-KE')}`}
                        icon={<DollarSign className="text-gray-400" />}
                    />
                    <DailySummaryStatCard
                        title="Litres Dispensed"
                        value={`${dailySummary.litresDispensed}L`}
                        icon={<FuelIcon className="text-gray-400" />}
                    />
                </div>
            </div>
        </div>
    );
}