"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { ChevronDown, DollarSign, RefreshCw, FuelIcon, Download, LogOut, Users, Calendar, UserPlus, TrendingUp } from 'lucide-react';

const PRIMARY_GREEN = '#00A859';
const ACCENT_COLOR = 'rgba(0, 168, 89, 0.2)'; // Light green for the graph area

// --- INTERFACES & MOCK DATA ---
type AdminTab = 'overview' | 'attendants' | 'transactions';
type DateFilter = 'Today' | 'Yesterday' | 'This Week' | 'This Month';

interface AdminSummary {
    totalSales: number;
    salesChange: number;
    transactions: number;
    transactionsChange: number;
    litresDispensed: number;
    litresChange: number;
    loyaltyAwarded: number;
    activeAttendants: number;
}

interface Attendant {
    name: string;
    status: 'active' | 'offline';
    transactions: number;
    sales: number;
}

interface RecentTransaction {
    time: string;
    attendant: string;
    cardLast4: string;
    litres: number;
    amount: number;
}

interface FullTransaction extends RecentTransaction {
    id: string;
}

const MOCK_SUMMARY: AdminSummary = {
    totalSales: 125400,
    salesChange: 12,
    transactions: 87,
    transactionsChange: 8,
    litresDispensed: 1254,
    litresChange: 15,
    loyaltyAwarded: 340,
    activeAttendants: 3,
};

const MOCK_ATTENDANTS: Attendant[] = [
    { name: 'James Kamau', status: 'active', transactions: 32, sales: 45600 },
    { name: 'Mary Wanjiru', status: 'active', transactions: 28, sales: 38200 },
    { name: 'Peter Omondi', status: 'active', transactions: 27, sales: 41600 },
    { name: 'Grace Muthoni', status: 'offline', transactions: 0, sales: 0 },
];

const MOCK_RECENT_TXNS: RecentTransaction[] = [
    { time: '16:45', attendant: 'James Kamau', cardLast4: '1234', litres: 12, amount: 1200 },
    { time: '16:42', attendant: 'Mary Wanjiru', cardLast4: '5678', litres: 8.5, amount: 850 },
    { time: '16:38', attendant: 'Peter Omondi', cardLast4: '9012', litres: 15, amount: 1500 },
    { time: '16:35', attendant: 'James Kamau', cardLast4: '3456', litres: 9.5, amount: 950 },
    { time: '16:30', attendant: 'Mary Wanjiru', cardLast4: '7890', litres: 20, amount: 2000 },
];

const MOCK_FULL_TXNS: FullTransaction[] = [ // Extended mock data for the full log
    { id: 'tx_089', time: '16:45', attendant: 'James Kamau', cardLast4: '1234', litres: 12, amount: 1200 },
    { id: 'tx_088', time: '16:42', attendant: 'Mary Wanjiru', cardLast4: '5678', litres: 8.5, amount: 850 },
    { id: 'tx_087', time: '16:38', attendant: 'Peter Omondi', cardLast4: '9012', litres: 15, amount: 1500 },
    { id: 'tx_086', time: '16:35', attendant: 'James Kamau', cardLast4: '3456', litres: 9.5, amount: 950 },
    { id: 'tx_085', time: '16:30', attendant: 'Mary Wanjiru', cardLast4: '7890', litres: 20, amount: 2000 },
    { id: 'tx_084', time: '16:20', attendant: 'Peter Omondi', cardLast4: '1234', litres: 10, amount: 1000 },
    { id: 'tx_083', time: '16:15', attendant: 'James Kamau', cardLast4: '5678', litres: 5, amount: 500 },
    { id: 'tx_082', time: '16:05', attendant: 'Mary Wanjiru', cardLast4: '9012', litres: 18, amount: 1800 },
    { id: 'tx_081', time: '15:58', attendant: 'Peter Omondi', cardLast4: '3456', litres: 11, amount: 1100 },
    { id: 'tx_080', time: '15:50', attendant: 'James Kamau', cardLast4: '7890', litres: 14, amount: 1400 },
];

// --- ADMIN-SPECIFIC COMPONENTS ---

/**
 * Global Header for the Admin Portal
 */
const AdminHeader: React.FC<{ adminName: string; stationName: string; onLogout: () => void }> = ({ adminName, stationName, onLogout }) => (
    <div className="flex justify-between items-center py-4 px-6 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
            <FuelIcon className={`w-8 h-8 text-[${PRIMARY_GREEN}]`} />
            <div>
                <h1 className="text-xl font-bold text-gray-800">{stationName}</h1>
                <p className="text-sm text-gray-500">Station Admin Portal</p>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">Admin</span>
            <span className="font-semibold text-gray-800">{adminName}</span>
            <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition ml-2">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    </div>
);

/**
 * Card component for displaying key metrics.
 */
const MetricCard: React.FC<{ title: string; value: string | number; change: number; icon: React.ReactNode; iconBgColor: string }> = ({ title, value, change, icon, iconBgColor }) => {
    const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';
    const changeSign = change >= 0 ? '+' : '';

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-gray-900">
                    {value.toLocaleString()}
                </p>
                <div className={`p-2 rounded-full ${iconBgColor}`}>
                    {icon}
                </div>
            </div>
            <p className={`text-xs mt-1 ${changeColor}`}>
                {changeSign}{change}% from yesterday
            </p>
        </div>
    );
};

/**
 * Renders the table of recent transactions on the Overview tab.
 */
const RecentTransactionsTable: React.FC<{ txns: RecentTransaction[] }> = ({ txns }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <p className="text-gray-500 mb-6">Latest fuel purchases at your station</p>

        {/* Table Header */}
        <div className="grid grid-cols-5 py-2 border-b-2 border-gray-200 text-sm font-semibold text-gray-600">
            <div>Time</div>
            <div>Attendant</div>
            <div>Card</div>
            <div>Litres</div>
            <div className="text-right">Amount</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
            {txns.map((txn, index) => (
                <div key={index} className="grid grid-cols-5 py-3 border-b border-gray-100 text-sm hover:bg-gray-50 transition">
                    <div className="text-gray-600 font-medium">{txn.time}</div>
                    <div className="text-gray-800">{txn.attendant}</div>
                    <div className="text-gray-600">****{txn.cardLast4}</div>
                    <div className="text-gray-800 font-medium">{txn.litres}L</div>
                    <div className="text-right font-bold text-gray-800">KES {txn.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
                </div>
            ))}
        </div>
    </div>
);

/**
 * Renders the Attendant Management tab content.
 */
const AttendantManagement: React.FC<{ attendants: Attendant[] }> = ({ attendants }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Fuel Attendants</h2>
                <p className="text-gray-500 text-sm">Manage your station attendants</p>
            </div>
            <button
                className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-700 transition"
            >
                <UserPlus className="w-4 h-4" />
                <span>Add Attendant</span>
            </button>
        </div>

        {/* Attendants Table */}
        <div className="overflow-x-auto">
            <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-5 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600">
                    <div className="col-span-1">Name</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Transactions</div>
                    <div className="col-span-1">Sales</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Table Body */}
                {attendants.map((attendant, index) => (
                    <div key={index} className="grid grid-cols-5 py-4 border-b border-gray-100 text-sm hover:bg-gray-50 transition items-center">
                        <div className="col-span-1 text-gray-800 font-medium">{attendant.name}</div>
                        <div className="col-span-1">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                attendant.status === 'active'
                                    ? `bg-green-100 text-[${PRIMARY_GREEN}]`
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {attendant.status}
                            </span>
                        </div>
                        <div className="col-span-1 text-gray-600">{attendant.transactions}</div>
                        <div className="col-span-1 text-gray-800">KES {attendant.sales.toLocaleString()}</div>
                        <div className="col-span-1 text-right">
                            <button className={`text-[${PRIMARY_GREEN}] hover:text-green-700 font-medium text-sm transition`}>
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Renders the Full Transaction Log for the Transactions tab.
 */
const FullTransactionLog: React.FC<{ txns: FullTransaction[], filter: DateFilter }> = ({ txns, filter }) => {
    const totalTransactions = MOCK_SUMMARY.transactions; // Use the summary count for a realistic view

    const handleExport = () => {
        alert(`Exporting ${filter} Full Transaction Log to CSV...`);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">All Transactions</h2>
                    <p className="text-gray-500 text-sm">Complete transaction history for {filter.toLowerCase()}</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-100 transition text-sm"
                >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Showing {totalTransactions} transactions</p>

            {/* Transaction Log Table */}
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 py-2 border-b-2 border-gray-200 text-sm font-semibold text-gray-600">
                        <div>Transaction ID</div>
                        <div>Time</div>
                        <div>Attendant</div>
                        <div>Card</div>
                        <div>Litres</div>
                        <div className="text-right">Amount</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {txns.map((txn, index) => (
                            <div key={index} className="grid grid-cols-6 py-3 border-b border-gray-100 text-sm hover:bg-gray-50 transition items-center">
                                <div className="text-gray-600 font-medium">{txn.id}</div>
                                <div className="text-gray-600">{txn.time}</div>
                                <div className="text-gray-800">{txn.attendant}</div>
                                <div className="text-gray-600">****{txn.cardLast4}</div>
                                <div className="text-gray-800 font-medium">{txn.litres}L</div>
                                <div className="text-right font-bold text-gray-800">KES {txn.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Simple Pagination Placeholder */}
            <div className="mt-4 text-center text-gray-500 text-sm">
                ... Scroll to load more ...
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function AdminDashboardPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const [summary, setSummary] = useState<AdminSummary>(MOCK_SUMMARY);
    const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
    const [dataFilter, setDataFilter] = useState<DateFilter>('Today');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Authentication check
    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50"><p className="text-center p-8 text-lg font-medium text-gray-700">Loading Station Admin Portal...</p></div>;
    }

    // Redirect if not authenticated or not an admin
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        redirect('/login');
        return null;
    }

    const handleLogout = () => {
        logout();
        // Redirection handled by useAuth hook
    };

    const handleFilterChange = (filter: DateFilter) => {
        setDataFilter(filter);
        setIsFilterOpen(false);
        // In a real app, this would trigger a data refetch
    };

    // Placeholder component for the Sales Trend Chart
    const SalesTrendChartPlaceholder: React.FC<{ filter: DateFilter }> = ({ filter }) => (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Trend - {filter}</h2>
            <p className="text-gray-500 mb-6">Hourly sales and fuel dispensed trend</p>
            <div className="h-64 bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-4 relative overflow-hidden rounded-lg">
                <TrendingUp className="w-12 h-12 text-gray-300 absolute" />
                <p className='text-sm font-medium z-10'>[Interactive Chart Placeholder]</p>
                <div className='w-full h-full absolute top-0 left-0'>
                    {/* Simple visual mock of a chart */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: PRIMARY_GREEN, stopOpacity: 0.5}} />
                                <stop offset="100%" style={{stopColor: PRIMARY_GREEN, stopOpacity: 0.0}} />
                            </linearGradient>
                        </defs>
                        <polyline
                            fill={`url(#chartGradient)`}
                            stroke={PRIMARY_GREEN}
                            strokeWidth="1"
                            points="0,80 10,70 20,60 30,75 40,50 50,40 60,30 70,20 80,45 90,35 100,50 100,100 0,100"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-100">
            <AdminHeader
                adminName={user?.name || 'Demo Admin'}
                stationName="Shell Westlands"
                onLogout={handleLogout}
            />

            <div className="container mx-auto px-6 py-8 space-y-8">

                {/* Top Bar: Data Filter and Export */}
                <div className="flex justify-between items-center">
                    <div className="relative inline-block text-left">
                        {/* Dropdown Button */}
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition"
                        >
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{dataFilter}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Dropdown Content */}
                        {isFilterOpen && (
                            <div className="absolute z-10 mt-2 w-40 origin-top-left rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {(['Today', 'Yesterday', 'This Week', 'This Month'] as DateFilter[]).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => handleFilterChange(filter)}
                                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition ${
                                            dataFilter === filter ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => alert(`Exporting ${dataFilter} Summary Report...`)}
                        className={`flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-100 transition text-sm`}
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                    </button>
                </div>

                {/* 1. Key Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Sales"
                        value={`KES ${summary.totalSales.toLocaleString()}`}
                        change={summary.salesChange}
                        icon={<DollarSign className="w-6 h-6 text-green-600" />}
                        iconBgColor="bg-green-100"
                    />
                    <MetricCard
                        title="Transactions"
                        value={summary.transactions}
                        change={summary.transactionsChange}
                        icon={<RefreshCw className="w-6 h-6 text-indigo-600" />}
                        iconBgColor="bg-indigo-100"
                    />
                    <MetricCard
                        title="Litres Dispensed"
                        value={`${summary.litresDispensed}L`}
                        change={summary.litresChange}
                        icon={<FuelIcon className="w-6 h-6 text-purple-600" />}
                        iconBgColor="bg-purple-100"
                    />
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
                        <p className="text-sm font-medium text-gray-500 mb-2">Loyalty Awarded</p>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-bold text-gray-900">{summary.loyaltyAwarded} pts</p>
                            <div className="text-sm text-gray-600">
                                <Users className="w-4 h-4 inline mr-1" />
                                {summary.activeAttendants} active attendants
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Tabs Section */}
                <div className="border-b border-gray-200">
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
                            onClick={() => setCurrentTab('attendants')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
                                currentTab === 'attendants'
                                    ? `border-[${PRIMARY_GREEN}] text-[${PRIMARY_GREEN}]`
                                    : 'border-transparent text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            Attendants
                        </button>
                        <button
                            onClick={() => setCurrentTab('transactions')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition ${
                                currentTab === 'transactions'
                                    ? `border-[${PRIMARY_GREEN}] text-[${PRIMARY_GREEN}]`
                                    : 'border-transparent text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            Transactions
                        </button>
                    </nav>
                </div>

                {/* --- Conditional Content Rendering Area --- */}
                <div className="pt-2">
                    {currentTab === 'overview' && (
                        <div className="space-y-8">
                            <SalesTrendChartPlaceholder filter={dataFilter} />
                            <RecentTransactionsTable txns={MOCK_RECENT_TXNS} />
                        </div>
                    )}

                    {currentTab === 'attendants' && (
                         <AttendantManagement attendants={MOCK_ATTENDANTS} />
                    )}

                    {currentTab === 'transactions' && (
                         <FullTransactionLog txns={MOCK_FULL_TXNS} filter={dataFilter} />
                    )}
                </div>
            </div>
        </div>
    );
}
