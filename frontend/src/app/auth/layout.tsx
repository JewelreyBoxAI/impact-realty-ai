import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0C0F1A] text-white">
      {/* Auth-specific layout - no header/sidebar */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
} 