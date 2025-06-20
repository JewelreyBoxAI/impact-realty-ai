"use client"

import React, { useState } from 'react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="bg-[#1A1F2E] rounded-lg border border-[#2A3441] p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">AI</span>
          </div>
          <h1 className="text-2xl font-bold font-orbitron neon-text">AgentOS</h1>
        </div>
        <p className="text-gray-400">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-[#0C0F1A] border border-[#2A3441] rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-[#0C0F1A] border border-[#2A3441] rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
            placeholder="Enter your password"
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-[#0C0F1A] border border-[#2A3441] rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="Confirm your password"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-cyan-400 text-black font-medium py-3 rounded-lg hover:bg-cyan-300 transition-colors"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      {/* Toggle */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>

      {/* Placeholder Notice */}
      <div className="mt-8 p-4 bg-[#0C0F1A] rounded-lg border border-[#2A3441]">
        <p className="text-xs text-gray-500 text-center">
          🔧 Placeholder Auth UI - Will be wired to Supabase later
        </p>
      </div>
    </div>
  )
} 