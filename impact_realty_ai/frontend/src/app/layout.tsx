import React from 'react';
import '@/styles/globals.css';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { UserActionsProvider } from '@/features/userActions/UserActionsContext';

const Footer = dynamic(() => import('@/components/Footer'));

export const metadata: Metadata = {
  title: {
    default: 'Impact Realty AI - Advanced Real Estate Intelligence',
    template: '%s | Impact Realty AI'
  },
  description: 'Advanced AI-powered real estate platform with multi-agent systems for recruitment, compliance, and intelligent assistance.'
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full`}>
      <body className="min-h-screen bg-background flex flex-col">
        <UserActionsProvider>
          <Navbar />
          <main className="flex-grow flex flex-col justify-start bg-background">
            {children}
          </main>
          <Footer />
        </UserActionsProvider>
      </body>
    </html>
  );
}
