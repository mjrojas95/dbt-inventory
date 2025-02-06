"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  month: string;
  sales: number | null;
  forecast: number | null;
}

export default function ForecastPage() {
  const params = useParams();
  const id = params.id as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data: ForecastData[] = [
    { month: 'Jan 2024', sales: 120, forecast: null },
    { month: 'Feb 2024', sales: 135, forecast: null },
    { month: 'Mar 2024', sales: 142, forecast: null },
    { month: 'Apr 2024', sales: 128, forecast: null },
    { month: 'May 2024', sales: 144, forecast: null },
    { month: 'Jun 2024', sales: 156, forecast: null },
    { month: 'Jul 2024', sales: 168, forecast: null },
    { month: 'Aug 2024', sales: 172, forecast: null },
    { month: 'Sep 2024', sales: 158, forecast: null },
    { month: 'Oct 2024', sales: 162, forecast: null },
    { month: 'Nov 2024', sales: 170, forecast: null },
    { month: 'Dec 2024', sales: 185, forecast: 185 },
    { month: 'Jan 2025', sales: null, forecast: 178 },
    { month: 'Feb 2025', sales: null, forecast: 182 },
    { month: 'Mar 2025', sales: null, forecast: 186 },
    { month: 'Apr 2025', sales: null, forecast: 190 },
    { month: 'May 2025', sales: null, forecast: 188 },
    { month: 'Jun 2025', sales: null, forecast: 192 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00B8F0]/10 to-sky-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#00B8F0]">Forecast Details</h1>
              <p className="text-gray-600">Product ID: {id}</p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-[#00B8F0] text-white rounded-lg hover:bg-[#0096C3] transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div style={{ width: '100%', height: 600 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Units', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#00B8F0" 
                  name="Actual Sales"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#9333EA" 
                  name="Forecast"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}