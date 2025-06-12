"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';

const HeroSection = dynamic(() => import('@/components/HeroSection'));
const AgentDashboard = dynamic(() => import('@/components/AgentDashboard'));

export default function HomePage() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemStatus() {
      try {
        const status = await api.getStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error('Error fetching system status:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSystemStatus();
  }, []);

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeroSection />
      
      {/* Agent System Status Section */}
      <section id="agents" className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            AI Agent System
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our advanced multi-agent system handles recruitment, compliance, and intelligent assistance 
            for your real estate operations.
          </p>
        </div>
        {!loading && <AgentDashboard systemStatus={systemStatus} />}
      </section>

      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  );
}
