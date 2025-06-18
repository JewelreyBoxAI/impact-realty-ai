import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import '../styles/globals.css'
import React from 'react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'AgentOS - Impact Realty AI',
  description: 'LangGraph-powered multi-agent system for real estate operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-[#0C0F1A] text-white antialiased">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 