// src/components/AuthContextProvider.tsx

"use client";

import { ReactNode } from 'react';
// FIX: Update the import to use the new .tsx file extension
import { AuthProvider } from '../hooks/useAuth'; 

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
};