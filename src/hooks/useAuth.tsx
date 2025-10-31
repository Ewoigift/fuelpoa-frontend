// src/hooks/useAuth.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    role: 'customer' | 'attendant' | 'admin';
    [key: string]: any; // Allows for additional properties like phone, station, etc.
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (formData: any) => Promise<void>;
    logout: () => void;
    apiCall: (endpoint: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// BASE_URL is set to localhost:3000 based on the API documentation
const BASE_URL = 'http://localhost:3000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * Generic function to make API calls, including the temporary mocking layer.
     */
    const apiCall = useCallback(async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body: any = null): Promise<any> => {
        
        // ===============================================
        //           *** UI MOCKING BLOCK START ***
        // ===============================================
        
        // --- Mock Authentication (Login/Register/Onboard) ---
        if (endpoint.includes('/login') || endpoint.includes('/onboard') || endpoint.includes('/register')) {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

            // MOCK SUCCESS
            const role = body?.role || 'Customer';
            
            let mockUser: User;
            if (role === 'Customer') {
                 mockUser = { id: 'C1001', name: 'John Doe Customer', role: 'customer', phone: body.identifier };
            } else if (role === 'Fuel Attendant') {
                 mockUser = { id: 'A201', name: 'Jane Smith Attendant', role: 'attendant', station: 'Nairobi West' };
            } else {
                 mockUser = { id: 'ADM301', name: `${role} User`, role: 'admin' };
            }

            // 1. Mock Login Success
            if (endpoint.includes('/login')) {
                localStorage.setItem('fuelpoa_jwt', 'mock_jwt_token_for_ui_testing'); 
                setUser(mockUser);
                return {
                    token: 'mock_jwt_token_for_ui_testing',
                    user: mockUser,
                };
            }
            
            // 2. Mock Registration/Onboard Success
            if (endpoint.includes('/onboard') || endpoint.includes('/register')) {
                return { message: 'Action successful! Proceed to login.' };
            }
        }
        
        // --- Mock Customer Protected Routes (Dashboard Data) ---
        if (endpoint.includes('/dashboard/stats') && method === 'GET') {
            console.log('MOCK: Intercepted dashboard stats call. Returning mock data.');
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                balance: 15000.50,
                loyalty_points: 350,
                total_litres_consumed: 125.8,
                active_cards: 2,
            };
        }

        // --- Mock Attendant Card Lookup ---
        if (endpoint.includes('/cards/lookup') && method === 'GET') {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                customer_id: 'C1001',
                customer_name: 'John Doe',
                wallet_balance: 15000.50,
                daily_limit: 5000.00,
                status: 'active',
            };
        }
        
        // For all other mocked actions:
        if (method !== 'GET') {
             await new Promise(resolve => setTimeout(resolve, 300));
             return { 
                 message: 'Mock API Success',
                 newBalance: 17000.50, 
             };
        }
        
        // ===============================================
        //            *** UI MOCKING BLOCK END ***
        // ===============================================

        // ----------------------------------------------------------------------------------
        // ACTUAL API CALLING LOGIC (If mocking fails or is removed)
        // ----------------------------------------------------------------------------------
        try {
            // ... (Actual fetch logic remains the same) ...
            const fetchOptions: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const token = localStorage.getItem('fuelpoa_jwt');
            if (token) {
                fetchOptions.headers = {
                    ...fetchOptions.headers,
                    'Authorization': `Bearer ${token}`,
                };
            }

            if (body) {
                fetchOptions.body = JSON.stringify(body);
            }

            const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

            if (!response.ok) {
                const errorData = await response.text(); 
                console.error("API Error: ", response.status, errorData);
                
                let errorDetails;
                try {
                    errorDetails = JSON.parse(errorData);
                } catch (e) {
                    errorDetails = { message: 'Server error or invalid response (Not JSON)' };
                }

                throw new Error(errorDetails.message || `API call failed with status ${response.status}`);
            }

            const responseText = await response.text();
            if (!responseText) return {};
            
            const data = JSON.parse(responseText);
            return data;

        } catch (error) {
            console.error('API Call Failed:', error);
            throw new Error((error as Error).message || 'Network error or server unreachable.');
        }
    }, []);

    const login = async (credentials: any) => {
        setLoading(true);
        try {
            const endpoint = credentials.endpoint || '/api/v1/auth/login';
            
            const data = await apiCall(endpoint, 'POST', { 
                identifier: credentials.identifier, 
                password: credentials.password,
                role: credentials.role 
            });
            
            const loggedInUser = data.user || { 
                id: 'mock', 
                name: 'Mock User', 
                role: credentials.role.toLowerCase(),
                ...data 
            };
            
            setUser(loggedInUser);
            
            // Redirect based on role
            if (loggedInUser.role === 'customer') {
                router.push('/dashboard');
            } else if (loggedInUser.role === 'attendant') {
                router.push('/attendant/transaction');
            } else {
                router.push('/admin/dashboard'); 
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData: any) => {
        setLoading(true);
        try {
            // API Endpoint: POST /api/v1/customers/onboard
            const data = await apiCall('/api/v1/customers/onboard', 'POST', formData);
            
            router.push('/login');
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('fuelpoa_jwt');
        setUser(null);
        router.push('/login');
    }, [router]);

    // Initial check for stored token on mount
    useEffect(() => {
        // --- VISUALIZATION DEBUG FIX START ---
        // Force a mock customer user if not on the login/register pages.
        // This ensures the dashboard's useEffect gets a user object to start fetching data.
        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
             console.log('DEBUG: Forcing mock customer login for visualization.');
             setUser({ id: 'C1001', name: 'Debug User', role: 'customer' });
        }
        // --- VISUALIZATION DEBUG FIX END ---
        
        // This must be the last line in this useEffect
        setLoading(false); 
    }, []);

    // Redirect unauthenticated users from protected routes
    useEffect(() => {
        if (!loading && !user && window.location.pathname !== '/login' && window.location.pathname !== '/register' && !window.location.pathname.startsWith('/attendant/login')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, apiCall }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};