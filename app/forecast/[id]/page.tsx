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
  const locationId = "LOC-" + Math.floor(1000 + Math.random() * 9000); // Simulated location ID
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'company' | 'location'>('company');

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
        {/* Data Disclaimer Banner */}
        <div className="bg-white border-l-4 border-[#00B8F0] p-2 rounded-lg mb-6 shadow-sm">
          <p className="text-sm text-gray-700 font-medium">Example Data - Not Actuals</p>
        </div>

        {/* Header - Reduced vertical padding */}
        <div className="bg-white rounded-lg shadow mb-6 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between">
            {/* Left Side - IDs */}
            <div>
              <h1 className="text-2xl font-bold text-[#00B8F0]">Forecast Details</h1>
              <p className="text-gray-600">Item ID: {id}</p>
              <p className="text-gray-600">Location ID: {locationId}</p>
            </div>
            
            {/* Center - Toggle */}
            <div className="mx-auto order-last md:order-none mt-3 md:mt-0">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'company'
                      ? 'bg-[#00B8F0] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-200`}
                  onClick={() => setViewMode('company')}
                >
                  Company
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'location'
                      ? 'bg-[#00B8F0] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-200`}
                  onClick={() => setViewMode('location')}
                >
                  Location
                </button>
              </div>
            </div>
            
            {/* Right Side - Back Button */}
            <div>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-[#00B8F0] text-white rounded-lg hover:bg-[#0096C3] transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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

        {/* Split Tables - Smaller and Centered */}
        <div className="flex justify-center mb-6 space-x-6">
          {/* L12M YoY Sales Table */}
          <div className="bg-white rounded-lg shadow">
            <table className="divide-y divide-gray-200">
              <thead>
                <tr>
                  <th 
                    className="px-6 py-5 bg-[#00B8F0] text-center text-sm font-medium text-white uppercase tracking-wider rounded-t-lg"
                  >
                    L12M YoY Sales
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-black text-center font-medium">
                    25%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* L6M Sales Table */}
          <div className="bg-white rounded-lg shadow">
            <table className="divide-y divide-gray-200">
              <thead>
                <tr>
                  <th 
                    colSpan={2}
                    className="px-6 py-3 bg-[#00B8F0] text-center text-sm font-medium text-white uppercase tracking-wider rounded-t-lg"
                  >
                    L6M Sales
                  </th>
                </tr>
                <tr>
                  <th 
                    className="px-6 py-2 bg-[#B3E5FC] text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Summer
                  </th>
                  <th 
                    className="px-6 py-2 bg-[#B3E5FC] text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Winter
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center font-medium">
                    50%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center font-medium">
                    50%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}