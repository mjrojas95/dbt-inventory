"use client";

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Filter, FileSpreadsheet } from 'lucide-react';

interface MetricData {
  current: {
    avgMonthlyInventory: number;
    inventoryTurns: number;
    gmroi: number;
    sales: number;
  };
  previous: {
    avgMonthlyInventory: number;
    inventoryTurns: number;
    gmroi: number;
    sales: number;
  };
}

// Sample filter options
const filterOptions = {
  status: ['Active', 'Inactive', 'Pending'],
  season: ['Summer', 'Winter', 'Both'],
  volume: ['High', 'Medium', 'Low'],
  locationId: ['DC-001', 'DC-002', 'DC-003'],
  dc: ['Northeast', 'Southwest', 'Southeast']
};

const timeframeData: Record<string, MetricData> = {
  month: {
    current: {
      avgMonthlyInventory: 2500000,
      inventoryTurns: 4.2,
      gmroi: 1.8,
      sales: 12500000
    },
    previous: {
      avgMonthlyInventory: 2600000,
      inventoryTurns: 4.0,
      gmroi: 1.6,
      sales: 11500000
    }
  },
  quarter: {
    current: {
      avgMonthlyInventory: 2450000,
      inventoryTurns: 4.3,
      gmroi: 1.9,
      sales: 37500000
    },
    previous: {
      avgMonthlyInventory: 2550000,
      inventoryTurns: 4.1,
      gmroi: 1.7,
      sales: 34500000
    }
  },
  sixMonth: {
    current: {
      avgMonthlyInventory: 2400000,
      inventoryTurns: 4.4,
      gmroi: 2.0,
      sales: 75000000
    },
    previous: {
      avgMonthlyInventory: 2500000,
      inventoryTurns: 4.2,
      gmroi: 1.8,
      sales: 70000000
    }
  },
  year: {
    current: {
      avgMonthlyInventory: 2350000,
      inventoryTurns: 4.5,
      gmroi: 2.1,
      sales: 150000000
    },
    previous: {
      avgMonthlyInventory: 2450000,
      inventoryTurns: 4.3,
      gmroi: 1.9,
      sales: 140000000
    }
  }
};

const trendData = {
  avgMonthlyInventory: Array.from({ length: 24 }, (_, i) => ({
    month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
    value: 2000000 + Math.random() * 1000000
  })),
  inventoryTurns: Array.from({ length: 24 }, (_, i) => ({
    month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
    value: 4.0 + Math.random() * 0.8
  })),
  gmroi: Array.from({ length: 24 }, (_, i) => ({
    month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
    value: 1.5 + Math.random() * 0.8
  })),
  sales: Array.from({ length: 24 }, (_, i) => ({
    month: `${2023 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`,
    value: 10000000 + Math.random() * 5000000
  }))
};
  
  export default function PerformanceReview() {
    const [timeframe, setTimeframe] = useState('month');
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [seasonFilter, setSeasonFilter] = useState('');
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
      switch(metric) {
        case 'avgMonthlyInventory':
          return `$${(value / 1000000).toFixed(1)}M`;
        case 'inventoryTurns':
          return value.toFixed(2);
        case 'gmroi':
          return value.toFixed(2);
        case 'sales':
          return `$${(value / 1000000).toFixed(1)}M`;
        default:
          return value.toFixed(2);
      }
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
            avgMonthlyInventory: getPercentageChange(
              timeframeData[timeframe].current.avgMonthlyInventory, 
              timeframeData[timeframe].previous.avgMonthlyInventory
            ),
            inventoryTurns: getPercentageChange(
              timeframeData[timeframe].current.inventoryTurns, 
              timeframeData[timeframe].previous.inventoryTurns
            ),
            gmroi: getPercentageChange(
              timeframeData[timeframe].current.gmroi, 
              timeframeData[timeframe].previous.gmroi
            ),
            sales: getPercentageChange(
              timeframeData[timeframe].current.sales, 
              timeframeData[timeframe].previous.sales
            )
          }
        },
        trend: selectedMetric ? (trendData as any)[selectedMetric] : null,
        filters: {
          timeframe,
          status: statusFilter,
          season: seasonFilter,
          volume: volumeFilter,
          location: locationFilter,
          dc: dcFilter,
          searchTerm
        }
      };
    
      let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head><body>`;
      
      // Add metric data
      excelContent += '<table><tr><th>Metric</th><th>Current</th><th>Previous</th><th>Change (%)</th></tr>';
      const metricDisplayNames = {
        avgMonthlyInventory: 'Avg. Monthly Inventory',
        inventoryTurns: 'Inventory Turns',
        gmroi: 'GMROI',
        sales: 'Sales'
      };
      
      Object.entries(data.metrics.current).forEach(([metric, value]) => {
        const formattedCurrent = formatValue(value, metric);
        const formattedPrevious = formatValue((data.metrics.previous as any)[metric], metric);
        excelContent += `<tr>
          <td>${(metricDisplayNames as any)[metric]}</td>
          <td>${formattedCurrent}</td>
          <td>${formattedPrevious}</td>
          <td>${(data.metrics.percentageChanges as any)[metric]}%</td>
        </tr>`;
      });
      excelContent += '</table>';
    
      // Add trend data if selected
      if (data.trend) {
        excelContent += '<br/><table><tr><th>Month</th><th>Value</th></tr>';
        data.trend.forEach((point: { month: string; value: number }) => {
          excelContent += `<tr>
            <td>${point.month}</td>
            <td>${formatValue(point.value, selectedMetric || '')}</td>
          </tr>`;
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
          {/* Data Disclaimer Banner */}
          <div className="bg-blue-50 border-l-4 border-[#00B8F0] p-2 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Example Data - Not Actuals</p>
          </div>
          
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
                <div className="flex flex-row space-x-2 pt-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-63 text-base px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Status</option>
                    {filterOptions.status.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  
                  <select
                    value={seasonFilter}
                    onChange={(e) => setSeasonFilter(e.target.value)}
                    className="w-63 text-base px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Seasons</option>
                    {filterOptions.season.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                  
                  <select
                    value={volumeFilter}
                    onChange={(e) => setVolumeFilter(e.target.value)}
                    className="w-63 text-base px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Volumes</option>
                    {filterOptions.volume.map(volume => (
                      <option key={volume} value={volume}>{volume}</option>
                    ))}
                  </select>
                  
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-63 text-base px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
                  >
                    <option value="">All Locations</option>
                    {filterOptions.locationId.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  
                  <select
                    value={dcFilter}
                    onChange={(e) => setDcFilter(e.target.value)}
                    className="w-63 text-base px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0]"
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
        {/* Avg. Monthly Inventory Card */}
        <div 
          className={`bg-white rounded-2xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
            selectedMetric === 'avgMonthlyInventory' ? 'ring-2 ring-[#00B8F0]' : ''
          }`}
          onClick={() => setSelectedMetric(selectedMetric === 'avgMonthlyInventory' ? null : 'avgMonthlyInventory')}
        >
          <div className="flex flex-col items-center">
            <h3 className="text-base font-medium text-gray-500 mb-2">Avg. Monthly Inventory</h3>
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(timeframeData[timeframe].current.avgMonthlyInventory, 'avgMonthlyInventory')}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-base font-medium ${
                Number(getPercentageChange(
                  timeframeData[timeframe].current.avgMonthlyInventory,
                  timeframeData[timeframe].previous.avgMonthlyInventory
                )) <= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getPercentageChange(
                  timeframeData[timeframe].current.avgMonthlyInventory,
                  timeframeData[timeframe].previous.avgMonthlyInventory
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
          <h3 className="text-lg font-medium text-gray-800 mb-4 underline">
            {selectedMetric === 'avgMonthlyInventory' ? 'Avg. Monthly Inventory' :
            selectedMetric === 'inventoryTurns' ? 'Inventory Turns' :
            selectedMetric === 'gmroi' ? 'GMROI' :
            selectedMetric === 'sales' ? 'Sales' : ''}
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
                  tickFormatter={(value) => {
                    switch(selectedMetric) {
                      case 'avgMonthlyInventory':
                        return `$${(value / 1000000).toFixed(1)}M`;
                      case 'inventoryTurns':
                        return value.toFixed(2);
                      case 'gmroi':
                        return value.toFixed(2);
                      case 'sales':
                        return `$${(value / 1000000).toFixed(1)}M`;
                      default:
                        return value.toFixed(2);
                    }
                  }}
                />
                <Tooltip 
                  formatter={(value) => {
                    switch(selectedMetric) {
                      case 'avgMonthlyInventory':
                        return [`$${(Number(value) / 1000000).toFixed(1)}M`, 'Avg. Monthly Inventory'];
                      case 'inventoryTurns':
                        return [Number(value).toFixed(2), 'Inventory Turns'];
                      case 'gmroi':
                        return [Number(value).toFixed(2), 'GMROI'];
                      case 'sales':
                        return [`$${(Number(value) / 1000000).toFixed(1)}M`, 'Sales'];
                      default:
                        return [Number(value).toFixed(2), ''];
                    }
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00B8F0"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  name={selectedMetric === 'avgMonthlyInventory' ? 'Avg. Monthly Inventory' :
                        selectedMetric === 'inventoryTurns' ? 'Inventory Turns' :
                        selectedMetric === 'gmroi' ? 'GMROI' :
                        selectedMetric === 'sales' ? 'Sales' : ''}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}