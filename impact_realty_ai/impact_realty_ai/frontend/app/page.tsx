'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [activeAgent, setActiveAgent] = useState('supervisor');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Impact Realty AI
          </h1>
          <p className="text-xl text-gray-600">
            Intelligent Agent System for Real Estate Operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AgentCard
            title="Supervisor Agent"
            description="Orchestrates recruitment and compliance operations"
            status="active"
            onClick={() => setActiveAgent('supervisor')}
          />
          <AgentCard
            title="Kevin's Assistant"
            description="Personal assistant for email, calendar, and advisory"
            status="active"
            onClick={() => setActiveAgent('kevin')}
          />
          <AgentCard
            title="Recruitment Dept"
            description="Sourcing, qualification, and engagement"
            status="active"
            onClick={() => setActiveAgent('recruitment')}
          />
        </div>
      </div>
    </div>
  );
}

function AgentCard({ title, description, status, onClick }: {
  title: string;
  description: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          {status}
        </span>
      </div>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
} 