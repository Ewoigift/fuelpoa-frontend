// src/app/dashboard/page.tsx (Updated to include HistoryContent)

"use client";

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomerLayout from '@/components/CustomerLayout';
import TopUpModal from '@/components/TopUpModal'; 
import ActivateCardModal from '@/components/ActivateCardModal'; 
import CardComponent from '@/components/CardComponent';
// Icon imports
import { CreditCardIcon, GiftIcon, FuelIcon, Plus, WalletIcon, TrendingUp, Car, Download } from 'lucide-react'; // Added Download icon

// --- INTERFACES & MOCK DATA (Extended/Updated) ---
type CurrentTab = 'overview' | 'cards' | 'history';

interface WalletStats {
    balance: number;
    loyalty_points: number;
    total_litres_consumed: number;
    active_cards: number;
}

interface Transaction {
    id: string;
    type: 'Fuel Purchase' | 'Wallet Top-Up';
    date: string;
    description: string;
    amount: number;
    status: 'completed' | 'failed';
    litres?: number;
    cardLast4?: string;
    earnedPoints?: number; 
}

// NOTE: MOCK_TRANSACTIONS now includes the transactions needed for the History tab
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', type: 'Fuel Purchase', date: 'Oct 22', description: 'Shell Westlands', amount: -850, litres: 8.5, cardLast4: '1234', status: 'completed', earnedPoints: 0 },
    { id: '2', type: 'Wallet Top-Up', date: 'Oct 22', description: 'RKL3XYAMN9', amount: 2000, status: 'completed' },
    { id: '3', type: 'Fuel Purchase', date: 'Oct 21', description: 'Total Kilimani', amount: -1200, litres: 12.0, cardLast4: '5678', status: 'completed', earnedPoints: 10 }, 
    { id: '4', type: 'Wallet Top-Up', date: 'Oct 21', description: 'RKL2ABSCD8', amount: 1500, status: 'completed' },
    { id: '5', type: 'Fuel Purchase', date: 'Oct 20', description: 'Rubis Karen', amount: -600, litres: 6.0, cardLast4: '1234', status: 'completed', earnedPoints: 0 },
    { id: '6', type: 'Fuel Purchase', date: 'Oct 20', description: 'Shell Westlands', amount: -950, litres: 9.5, cardLast4: '1234', status: 'completed', earnedPoints: 0 },
    { id: '7', type: 'Wallet Top-Up', date: 'Oct 19', description: 'RKL1MN3PQ7', amount: 3000, status: 'completed' },
];

const MOCK_CARDS = [
    { id: '1', color: 'green', numberLast4: '1234', dailyLimit: 5000, usedToday: 1250, status: 'ACTIVE' },
    { id: '2', color: 'blue', numberLast4: '5678', dailyLimit: 3000, usedToday: 0, status: 'ACTIVE' },
];

const PRIMARY_GREEN = '#00A859';

// --- SHARED COMPONENTS (Simplified/Copied for completeness) ---

const MainBalanceButtonCard: React.FC<{ balance: number; onTopUpClick: () => void }> = ({ balance, onTopUpClick }) => (
    <div className="bg-[#00A859] text-white p-6 rounded-xl shadow-xl flex justify-between items-center h-28">
        <div>
            <p className="text-sm font-light opacity-90">Wallet Balance</p>
            <p className="text-4xl font-extrabold mt-1">
                KES {balance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
        </div>
        <button 
            onClick={onTopUpClick}
            className="flex items-center space-x-1 bg-white text-[#00A859] px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-gray-100 transition"
        >
            <Plus className="w-5 h-5" />
            <span>Top Up</span>
        </button>
    </div>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-start justify-center h-28 border border-gray-100">
        <div className="flex justify-between w-full items-center mb-3">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="text-2xl">
                {icon}
            </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

const TransactionRow: React.FC<{ txn: Transaction }> = ({ txn }) => {
    const isCredit = txn.amount > 0;
    const amountClass = isCredit ? `text-[${PRIMARY_GREEN}]` : 'text-gray-800';
    const Icon = isCredit ? WalletIcon : Car;
    const statusColor = txn.status === 'completed' ? `text-[${PRIMARY_GREEN}]` : 'text-red-500';

    return (
        <div className="flex justify-between items-start p-3 bg-white hover:bg-gray-50 transition duration-150 rounded-lg border border-gray-100">
            <div className="flex items-start space-x-3">
                <div className={`p-2 mt-1 rounded-full ${isCredit ? 'bg-green-100' : 'bg-blue-100'} text-[${PRIMARY_GREEN}]`}>
                    <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex flex-col">
                    <p className="font-semibold text-gray-800">{txn.type} - {txn.description}</p>
                    
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                        <span>{txn.date}</span>
                        {txn.litres && 
                            <>
                                <span className="text-xs font-semibold">|</span>
                                <span>{txn.litres}L</span>
                            </>
                        }
                        {txn.cardLast4 && 
                            <>
                                <span className="text-xs font-semibold">|</span>
                                <span>Card ****{txn.cardLast4}</span>
                            </>
                        }
                        {txn.earnedPoints && txn.earnedPoints > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full">
                                +{txn.earnedPoints} pts
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-right">
                <p className={`text-base font-bold ${amountClass}`}>
                    {isCredit ? '+' : '-'}KES {Math.abs(txn.amount).toLocaleString('en-KE')}
                </p>
                <p className={`text-xs mt-0.5 ${statusColor}`}>{txn.status}</p>
            </div>
        </div>
    );
};

// --- NEW VIEW RENDERING FUNCTIONS ---

/** Renders the content for the History tab */
const HistoryContent: React.FC = () => {
    const totalTransactions = MOCK_TRANSACTIONS.length;

    const handleExport = () => {
        alert('Exporting transaction history...');
        // In a real app, this would trigger an API call to generate a CSV/PDF.
    };

    return (
        <div className="space-y-6">
            {/* Header and Export Button */}
            <div className="flex justify-between items-start pb-2 border-b border-gray-200">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Transaction History</h1>
                    <p className="text-sm text-gray-500">All your fuel purchases and wallet top-ups</p>
                </div>
                
                <button 
                    onClick={handleExport}
                    className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-100 transition text-sm"
                >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                </button>
            </div>

            {/* Transaction Count */}
            <p className="text-sm font-medium text-gray-600">
                Showing {totalTransactions} transactions
            </p>

            {/* List of Transactions */}
            <div className="space-y-4">
                {MOCK_TRANSACTIONS.map(txn => (
                    <TransactionRow key={txn.id} txn={txn} />
                ))}
            </div>
        </div>
    );
};

// ... (OverviewContent and MyCardsContent functions would be placed here) ...

// Renders the full content for the default Dashboard Overview tab (Copied for completeness)
const OverviewContent = ({ 
    walletStats, 
    currentBalance, 
    loyaltyProgress, 
    litresNeededForNextPoint, 
    setIsTopUpModalOpen, 
    setIsActivateCardModalOpen 
}: any) => (
    // Explicitly using space-y-6 to guarantee spacing between the main dashboard sections.
    <div className="space-y-6"> 
        
        {/* 1. Wallet Summary Card */}
        <MainBalanceButtonCard 
            balance={currentBalance}
            onTopUpClick={() => setIsTopUpModalOpen(true)}
        />

        {/* 2. Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
            <StatCard 
                title="Loyalty Points" 
                value={walletStats ? walletStats.loyalty_points.toLocaleString() : '45'}
                icon={<GiftIcon className='text-yellow-500' />}
            />
            <StatCard 
                title="Total Litres" 
                value={walletStats ? walletStats.total_litres_consumed.toFixed(1) + 'L' : '87.5L'}
                icon={<FuelIcon className='text-blue-500' />}
            />
            <StatCard 
                title="Active Cards" 
                value={walletStats ? walletStats.active_cards.toString() : '2'}
                icon={<CreditCardIcon className={`text-[${PRIMARY_GREEN}]`} />}
            />
        </div>

        {/* 3. Loyalty Rewards Progress Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex justify-between items-center">
                Loyalty Rewards <TrendingUp className="w-5 h-5 text-gray-500" />
            </h2>
            <p className={`text-sm font-bold text-[${PRIMARY_GREEN}] my-2`}>
                {litresNeededForNextPoint.toFixed(1)}L more to earn 10 points!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className={`bg-[${PRIMARY_GREEN}] h-2.5 rounded-full`}
                    style={{ width: `${loyaltyProgress}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>Earn 10 loyalty points for every 100 litres of fuel purchased.</span>
                <span className="font-semibold text-gray-700">{loyaltyProgress.toFixed(0)}% / 100L</span>
            </p>
        </div>

        {/* 5. Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => setIsTopUpModalOpen(true)}
                className={`flex items-center justify-center py-3 bg-[${PRIMARY_GREEN}] text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition`}
            >
                <WalletIcon className="w-5 h-5 mr-2" /> Top Up Wallet
            </button>
            <button 
                onClick={() => setIsActivateCardModalOpen(true)}
                className="flex items-center justify-center py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold shadow-md hover:bg-gray-50 transition"
            >
                <CreditCardIcon className="w-5 h-5 mr-2" /> Activate New Card
            </button>
        </div>


        {/* 6. Recent Activity Section */}
        <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            {MOCK_TRANSACTIONS.slice(0, 5).map(txn => (
                <TransactionRow key={txn.id} txn={txn} />
            ))}
            
            {/* 7. Bottom Section: View All Transactions link */}
            <div className="pt-4 mt-4 text-center">
                <button 
                    onClick={() => setCurrentTab('history')}
                    className={`text-[${PRIMARY_GREEN}] font-semibold hover:text-green-700 transition text-sm`}
                >
                    View All Transactions
                </button>
            </div>
        </div>
    </div>
);

/** Renders the content for the My Cards tab (only the cards list) */
const MyCardsContent = ({ setIsActivateCardModalOpen }: any) => (
    <div className="space-y-6"> {/* Ensure My Cards content also uses vertical spacing */}
        {/* Header and Activate Card Button */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div>
                <h1 className="text-xl font-bold text-gray-800">My Fuel Cards</h1>
                <p className="text-sm text-gray-500">Manage your FuelPoa smart cards</p>
            </div>
            
            <button 
                onClick={() => setIsActivateCardModalOpen(true)}
                className={`flex items-center space-x-2 bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-200 transition`}
            >
                <Plus className="w-5 h-5" />
                <span>Activate Card</span>
            </button>
        </div>

        {/* List of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {MOCK_CARDS.map(card => (
                <CardComponent
                    key={card.id}
                    color={card.color as 'green' | 'blue'}
                    cardNumberLast4={card.numberLast4}
                    dailyLimit={card.dailyLimit}
                    usedToday={card.usedToday}
                    status={card.status as 'ACTIVE' | 'INACTIVE'}
                />
            ))}
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
    
    const { user, loading: authLoading, apiCall } = useAuth();
    const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    
    const [currentTab, setCurrentTab] = useState<CurrentTab>('overview'); // Tab state

    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [isActivateCardModalOpen, setIsActivateCardModalOpen] = useState(false); 


    // Placeholder for mock submissions (Rest of the component remains largely the same)
    const handleTopUpSubmit = (amount: number, phone: string) => {
        console.log(`[MOCK PAYMENT] Initiating KES ${amount} top-up to ${phone}.`);
        alert(`Initiating KES ${amount.toLocaleString()} top-up to ${phone}. (Mock Success)`);
    };
    
    const handleActivateCardSubmit = (cardId: string, pin: string) => {
        console.log(`[MOCK CARD] Attempting activation for Card ID: ${cardId}, PIN: ****`);
        alert(`Card ID ${cardId} submitted for activation. (Mock Success)`);
    };


    // Data Fetching logic (Existing)
    useEffect(() => {
        let isMounted = true; 
        const fetchWalletStats = async () => {
            if (!user) { if (isMounted) setDataLoading(false); return; }
            if (isMounted) setDataLoading(true);
            try {
                // Mock API call remains
                const data = await new Promise(resolve => setTimeout(() => resolve({
                    balance: 2500.00,
                    loyalty_points: 45,
                    total_litres_consumed: 87.5,
                    active_cards: 2,
                }), 500)); 
                if (isMounted) {
                    setWalletStats(data as WalletStats);
                }
            } catch (err: any) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                if (isMounted) {
                    setDataLoading(false);
                }
            }
        };
        fetchWalletStats();
        return () => { isMounted = false; }; 
    }, [user]);

    // CONDITIONAL EARLY RETURNS
    if (authLoading || dataLoading) {
        return <p className="text-center p-8 text-lg font-medium">Loading your FuelPoa Dashboard...</p>;
    }
    
    if (!user || user.role !== 'customer') {
        redirect('/login');
    }

    // Formatting and Loyalty Logic
    const currentBalance = walletStats?.balance || 2500.00; 
    const currentLitres = walletStats?.total_litres_consumed || 87.5; 
    const litresThreshold = 100;
    const litresProgress = currentLitres % litresThreshold;
    const litresNeededForNextPoint = litresThreshold - litresProgress;
    const loyaltyProgress = (litresProgress / litresThreshold) * 100;


    return (
        <CustomerLayout title="Dashboard" userName={user.name || 'Demo User'}> 
            <div className="space-y-6">
                
                {/* 4. Tabs Section (Always visible) */}
                <div className="border-b border-gray-200 pt-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button 
                            onClick={() => setCurrentTab('overview')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
                                currentTab === 'overview'
                                    ? `border-[${PRIMARY_GREEN}] text-[${PRIMARY_GREEN}]`
                                    : 'border-transparent text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setCurrentTab('cards')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
                                currentTab === 'cards'
                                    ? `border-[${PRIMARY_GREEN}] text-[${PRIMARY_GREEN}]`
                                    : 'border-transparent text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            My Cards
                        </button>
                        <button 
                            onClick={() => setCurrentTab('history')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
                                currentTab === 'history'
                                    ? `border-[${PRIMARY_GREEN}] text-[${PRIMARY_GREEN}]`
                                    : 'border-transparent text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            History
                        </button>
                    </nav>
                </div>

                {/* --- Conditional Content Rendering Area --- */}
                <div className="pt-2"> 
                    {currentTab === 'overview' && (
                        <OverviewContent 
                            walletStats={walletStats}
                            currentBalance={currentBalance}
                            loyaltyProgress={loyaltyProgress}
                            litresNeededForNextPoint={litresNeededForNextPoint}
                            setIsTopUpModalOpen={setIsTopUpModalOpen}
                            setIsActivateCardModalOpen={setIsActivateCardModalOpen}
                        />
                    )}
                    
                    {currentTab === 'cards' && (
                        <MyCardsContent
                            setIsActivateCardModalOpen={setIsActivateCardModalOpen}
                        />
                    )}
                    
                    {currentTab === 'history' && (
                         <HistoryContent /> // Render the new history component
                    )}
                </div>


            </div>
            
            {/* 🚀 Render Modals */}
            <TopUpModal 
                currentBalance={currentBalance}
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                onSubmit={handleTopUpSubmit}
            />
            
            <ActivateCardModal 
                isOpen={isActivateCardModalOpen}
                onClose={() => setIsActivateCardModalOpen(false)}
                onSubmit={handleActivateCardSubmit}
            />
        </CustomerLayout>
    );
}