"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Filter, FileSpreadsheet } from 'lucide-react';

interface MetricData {
  current: {
    gmroi: number;
    inventoryTurns: number;
    inventoryDays: number;
    sales: number;
  };
  previous: {
    gmroi: number;
    inventoryTurns: number;
    inventoryDays: number;
    sales: number;
  };
}

// Sample filter options
const filterOptions = {
  status: ['Active', 'Inactive', 'Pending'],
  volume: ['High', 'Medium', 'Low'],
  locationId: ['DC-001', 'DC-002', 'DC-003'],
  dc: ['Northeast', 'Southwest', 'Southeast']
};

const timeframeData: Record<string, MetricData> = {
  month: {
    current: {
      gmroi: 2.8,
      inventoryTurns: 4.2,
      inventoryDays: 86,
      sales: 1250000
    },
    previous: {
      gmroi: 2.6,
      inventoryTurns: 4.0,
      inventoryDays: 91,
      sales: 1150000
    }
  },
  quarter: {
    current: {
      gmroi: 2.9,
      inventoryTurns: 4.3,
      inventoryDays: 84,
      sales: 3750000
    },
    previous: {
      gmroi: 2.7,
      inventoryTurns: 4.1,
      inventoryDays: 89,
      sales: 3450000
    }
  },
  sixMonth: {
    current: {
      gmroi: 3.0,
      inventoryTurns: 4.4,
      inventoryDays: 82,
      sales: 7500000
    },
    previous: {
      gmroi: 2.8,
      inventoryTurns: 4.2,
      inventoryDays: 87,
      sales: 7000000
    }
  },
  year: {
    current: {
      gmroi: 3.1,
      inventoryTurns: 4.5,
      inventoryDays: 81,
      sales: 15000000
    },
    previous: {
      gmroi: 2.9,
      inventoryTurns: 4.3,
      inventoryDays: 85,
      sales: 14000000
    }
  }
};
const trendData = {
    gmroi: Array.from({ length: 24 }, (_, i) => ({
      month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
      value: 2.5 + Math.random() * 0.8
    })),
    inventoryTurns: Array.from({ length: 24 }, (_, i) => ({
      month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
      value: 4.0 + Math.random() * 0.8
    })),
    inventoryDays: Array.from({ length: 24 }, (_, i) => ({
      month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
      value: 80 + Math.random() * 15
    })),
    sales: Array.from({ length: 24 }, (_, i) => ({
      month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
      value: 1000000 + Math.random() * 500000
    }))
  };
  
  export default function PerformanceReview() {
    const [timeframe, setTimeframe] = useState('month');
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [volumeFilter, setVolumeFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [dcFilter, setDcFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [lastUpdated] = useState(new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  
    const formatValue = (value: number, metric: string) => {
      if (metric === 'sales') return `$${(value / 1000000).toFixed(1)}M`;
      return value.toFixed(2);
    };
  
    const getPercentageChange = (current: number, previous: number) => {
      return ((current - previous) / previous * 100).toFixed(1);
    };
  
    const exportToExcel = () => {
      const data = {
        metrics: {
          current: timeframeData[timeframe].current,
          previous: timeframeData[timeframe].previous,
          percentageChanges: {
            gmroi: getPercentageChange(timeframeData[timeframe].current.gmroi, timeframeData[timeframe].previous.gmroi),
            inventoryTurns: getPercentageChange(
              timeframeData[timeframe].current.inventoryTurns, 
              timeframeData[timeframe].previous.inventoryTurns
            ),
            inventoryDays: getPercentageChange(
              timeframeData[timeframe].current.inventoryDays, 
              timeframeData[timeframe].previous.inventoryDays
            ),
            sales: getPercentageChange(timeframeData[timeframe].current.sales, timeframeData[timeframe].previous.sales)
          }
        },
        trend: selectedMetric ? (trendData as any)[selectedMetric] : null,
        filters: {
          timeframe,
          status: statusFilter,
          volume: volumeFilter,
          location: locationFilter,
          dc: dcFilter,
          searchTerm
        }
      };
  
      let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head><body>`;
      
      excelContent += '<table><tr><th>Metric</th><th>Current</th><th>Previous</th><th>Change (%)</th></tr>';
      Object.entries(data.metrics.current).forEach(([metric, value]) => {
        excelContent += `<tr>
          <td>${metric}</td>
          <td>${formatValue(value, metric)}</td>
          <td>${formatValue((data.metrics.previous as any)[metric], metric)}</td>
          <td>${(data.metrics.percentageChanges as any)[metric]}%</td>
        </tr>`;
      });
      excelContent += '</table>';
  
      if (data.trend) {
        excelContent += '<br/><table><tr><th>Month</th><th>Value</th></tr>';
        data.trend.forEach((point: { month: string; value: number }) => {
          excelContent += `<tr><td>${point.month}</td><td>${point.value}</td></tr>`;
        });
        excelContent += '</table>';
      }
  
      excelContent += '</body></html>';
  
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-metrics-${timeframe}-${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    return (
        <div className="space-y-4">
          {/* Header and Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex flex-col gap-4">
              {/* Title and Export */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#00B8F0]">Performance Review</h2>
                  <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      showFilters 
                        ? 'bg-[#00B8F0] text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00B8F0] text-white rounded-lg hover:bg-[#0096C3] transition-colors"
                  >
                    <FileSpreadsheet size={16} />
                    Export
                  </button>
                </div>
              </div>
    
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Product ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0] transition-all"
                />
              </div>
    
              {/* Time Period Selector */}
              <div className="flex gap-2">
                {['Month', 'Quarter', '6 Months', 'Year'].map((period) => {
                  const value = period === '6 Months' ? 'sixMonth' : period.toLowerCase();
                  return (
                    <button
                      key={period}
                      onClick={() => setTimeframe(value)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        timeframe === value 
                          ? 'bg-[#00B8F0] text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {period}
                    </button>
                  );
                })}
              </div>
    
              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Status</option>
                    {filterOptions.status.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={volumeFilter}
                    onChange={(e) => setVolumeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Volumes</option>
                    {filterOptions.volume.map(volume => (
                      <option key={volume} value={volume}>{volume}</option>
                    ))}
                  </select>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Locations</option>
                    {filterOptions.locationId.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  <select
                    value={dcFilter}
                    onChange={(e) => setDcFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All DCs</option>
                    {filterOptions.dc.map(dc => (
                      <option key={dc} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* GMROI Card */}
        <div 
          className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
            selectedMetric === 'gmroi' ? 'ring-2 ring-[#00B8F0]' : ''
          }`}
          onClick={() => setSelectedMetric(selectedMetric === 'gmroi' ? null : 'gmroi')}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-base font-medium text-gray-500 mb-2">GMROI</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(timeframeData[timeframe].current.gmroi, 'gmroi')}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-base font-medium ${
                Number(getPercentageChange(
                  timeframeData[timeframe].current.gmroi,
                  timeframeData[timeframe].previous.gmroi
                )) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getPercentageChange(
                  timeframeData[timeframe].current.gmroi,
                  timeframeData[timeframe].previous.gmroi
                )}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs prev</span>
            </div>
          </div>
        </div>

        {/* Inventory Turns Card */}
        <div 
          className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
            selectedMetric === 'inventoryTurns' ? 'ring-2 ring-[#00B8F0]' : ''
          }`}
          onClick={() => setSelectedMetric(selectedMetric === 'inventoryTurns' ? null : 'inventoryTurns')}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-base font-medium text-gray-500 mb-2">Inventory Turns</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(timeframeData[timeframe].current.inventoryTurns, 'inventoryTurns')}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-base font-medium ${
                Number(getPercentageChange(
                  timeframeData[timeframe].current.inventoryTurns,
                  timeframeData[timeframe].previous.inventoryTurns
                )) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getPercentageChange(
                  timeframeData[timeframe].current.inventoryTurns,
                  timeframeData[timeframe].previous.inventoryTurns
                )}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs prev</span>
            </div>
          </div>
        </div>

        {/* Inventory Days Card */}
        <div 
          className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
            selectedMetric === 'inventoryDays' ? 'ring-2 ring-[#00B8F0]' : ''
          }`}
          onClick={() => setSelectedMetric(selectedMetric === 'inventoryDays' ? null : 'inventoryDays')}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-base font-medium text-gray-500 mb-2">Inventory Days</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(timeframeData[timeframe].current.inventoryDays, 'inventoryDays')}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-base font-medium ${
                Number(getPercentageChange(
                  timeframeData[timeframe].current.inventoryDays,
                  timeframeData[timeframe].previous.inventoryDays
                )) <= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getPercentageChange(
                  timeframeData[timeframe].current.inventoryDays,
                  timeframeData[timeframe].previous.inventoryDays
                )}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs prev</span>
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div 
          className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
            selectedMetric === 'sales' ? 'ring-2 ring-[#00B8F0]' : ''
          }`}
          onClick={() => setSelectedMetric(selectedMetric === 'sales' ? null : 'sales')}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-base font-medium text-gray-500 mb-2">Sales</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(timeframeData[timeframe].current.sales, 'sales')}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-base font-medium ${
                Number(getPercentageChange(
                  timeframeData[timeframe].current.sales,
                  timeframeData[timeframe].previous.sales
                )) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getPercentageChange(
                  timeframeData[timeframe].current.sales,
                  timeframeData[timeframe].previous.sales
                )}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs prev</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {selectedMetric && (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {selectedMetric.toUpperCase()} - 24 Month Trend
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <LineChart
                data={(trendData as Record<string, any>)[selectedMetric]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => selectedMetric === 'sales' 
                    ? `$${(value / 1000000).toFixed(1)}M`
                    : value.toFixed(1)
                  }
                />
                <Tooltip 
                  formatter={(value) => selectedMetric === 'sales'
                    ? `$${(Number(value) / 1000000).toFixed(1)}M`
                    : Number(value).toFixed(2)
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00B8F0"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  name={selectedMetric.toUpperCase()}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}