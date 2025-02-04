"use client";

import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { LayoutGrid, TrendingUp, Menu } from 'lucide-react';

const sampleChartData = Array.from({ length: 10 }, (_, i) => ({
  value: Math.random() * 100 + 50
}));

export default function DesignPreview() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-[#00B8F0] to-[#0096C3] text-white transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-xl ${isSidebarCollapsed ? 'hidden' : 'block'}`}>InventoryIQ</h1>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 hover:bg-white/10 rounded-lg">
            <Menu size={24} />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-lg mb-2 hover:bg-white/20 transition-colors">
            <LayoutGrid size={24} />
            <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Min/Max</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <TrendingUp size={24} />
            <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Performance</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sample Metric Card with new design */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 group">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-500 font-medium mb-2">GMROI</h3>
              <div className="text-4xl font-bold text-[#00B8F0] mb-2">2.8</div>
              <div className="flex items-center text-emerald-500 font-medium">
                <span>+7.7%</span>
                <span className="text-gray-400 ml-2">vs prev</span>
              </div>
              
              {/* Micro Chart */}
              <div className="w-full h-16 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleChartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00B8F0"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Add more sample cards here if you want to see more */}
        </div>
      </div>
    </div>
  );
}