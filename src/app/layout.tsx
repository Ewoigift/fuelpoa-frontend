// src/app/layout.tsx

import { Inter } from 'next/font/google';
import './globals.css';  // Global CSS (Tailwind)
import { AuthContextProvider } from '../components/AuthContextProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FUELPOA Customer Portal',
  description: 'Wallet and Card Management for Fueling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}