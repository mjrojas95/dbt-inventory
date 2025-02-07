"use client";

import { useState } from 'react';
import MinMaxDashboard from '@/app/components/MinMaxDashboard';
import PerformanceReview from '@/app/components/PerformanceReview';
import { LayoutGrid, TrendingUp, Menu } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('minmax');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-52'} bg-gradient-to-b from-[#00B8F0] to-[#0096C3] text-white transition-all duration-300 ease-in-out flex flex-col`}>
        <div className="p-2 flex items-center justify-between">
          {!isSidebarCollapsed && <h1 className="font-bold text-lg">DBT</h1>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-1.5 hover:bg-white/10 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          <button 
            onClick={() => setActiveTab('minmax')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg mb-1 transition-colors ${
              activeTab === 'minmax' 
                ? 'bg-white/10' 
                : 'hover:bg-white/10'
            }`}
          >
            <LayoutGrid size={22} />
            {!isSidebarCollapsed && (
              <span className="text-base font-medium leading-tight text-left">Min/Max</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
              activeTab === 'performance' 
                ? 'bg-white/10' 
                : 'hover:bg-white/10'
            }`}
          >
            <TrendingUp size={22} />
            {!isSidebarCollapsed && (
              <span className="text-base font-medium leading-tight text-left">Performance</span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {activeTab === 'minmax' ? (
          <MinMaxDashboard />
        ) : (
          <PerformanceReview />
        )}
      </div>
    </div>
  );
}