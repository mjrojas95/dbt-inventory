"use client";

import { useState } from 'react';
import { FileSpreadsheet, Filter, Search } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";

interface Product {
  itemId: string;
  description: string;
  status: string;
  volume: string;
  primarySupplier: string;
  leadTime: string;
  orderFrequency: string;
  locationId: string;
  dc: string;
  min: number;
  max: number;
  previousMax: number;
  maxVariance: number;
}

const sampleData: Product[] = [
  {
    itemId: 'A123',
    description: 'Premium Widget Type A',
    status: 'Active',
    volume: 'High',
    primarySupplier: 'Acme Supply Co',
    leadTime: '14 days',
    orderFrequency: 'Weekly',
    locationId: 'DC-001',
    dc: 'Northeast',
    min: 100,
    max: 300,
    previousMax: 250,
    maxVariance: 20
  },
  {
    itemId: 'B456',
    description: 'Standard Widget Type B',
    status: 'Active',
    volume: 'Medium',
    primarySupplier: 'Global Parts Inc',
    leadTime: '21 days',
    orderFrequency: 'Bi-weekly',
    locationId: 'DC-002',
    dc: 'Southwest',
    min: 50,
    max: 150,
    previousMax: 180,
    maxVariance: -16.7
  },
  {
    itemId: 'C789',
    description: 'Economy Widget Type C',
    status: 'Active',
    volume: 'Low',
    primarySupplier: 'Budget Supplies Ltd',
    leadTime: '30 days',
    orderFrequency: 'Monthly',
    locationId: 'DC-001',
    dc: 'Northeast',
    min: 25,
    max: 75,
    previousMax: 60,
    maxVariance: 25
  }
];

export default function MinMaxDashboard() {
  const [products, setProducts] = useState<Product[]>(sampleData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
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

  const getUniqueValues = (field: keyof Product) => {
    return [...new Set(products.map(item => item[field]))];
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.itemId);
    setEditValue(product.max.toString());
  };

  const handleSaveEdit = (productId: string) => {
    const newValue = parseInt(editValue);
    if (isNaN(newValue)) return;

    setProducts(products.map(product => {
      if (product.itemId === productId) {
        const oldMax = product.max;
        const variance = Number(((newValue - oldMax) / oldMax * 100).toFixed(1));
        return {
          ...product,
          previousMax: oldMax,
          max: newValue,
          maxVariance: variance
        };
      }
      return product;
    }));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const exportToExcel = () => {
    const filteredData = products.filter(product => {
      const matchesSearch = product.itemId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || product.status === statusFilter;
      const matchesVolume = !volumeFilter || product.volume === volumeFilter;
      const matchesLocation = !locationFilter || product.locationId === locationFilter;
      const matchesDC = !dcFilter || product.dc === dcFilter;
      const matchesPriority = !showPriorityOnly || Math.abs(product.maxVariance) > 15;

      return matchesSearch && matchesStatus && matchesVolume && 
             matchesLocation && matchesDC && matchesPriority;
    });

    let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>';
    
    // Add filters info
    excelContent += '<table><tr><th colspan="4">Applied Filters</th></tr>';
    if (searchTerm) excelContent += `<tr><td>Search Term:</td><td colspan="3">${searchTerm}</td></tr>`;
    if (statusFilter) excelContent += `<tr><td>Status:</td><td colspan="3">${statusFilter}</td></tr>`;
    if (volumeFilter) excelContent += `<tr><td>Volume:</td><td colspan="3">${volumeFilter}</td></tr>`;
    if (locationFilter) excelContent += `<tr><td>Location:</td><td colspan="3">${locationFilter}</td></tr>`;
    if (dcFilter) excelContent += `<tr><td>DC:</td><td colspan="3">${dcFilter}</td></tr>`;
    if (showPriorityOnly) excelContent += `<tr><td colspan="4">Showing Priority Items Only</td></tr>`;
    excelContent += '<tr><td colspan="4"></td></tr>';

    excelContent += `<tr>
      <th>Item ID</th>
      <th>Description</th>
      <th>Status</th>
      <th>Volume</th>
      <th>Primary Supplier</th>
      <th>Lead Time</th>
      <th>Order Frequency</th>
      <th>Location ID</th>
      <th>DC</th>
      <th>Min</th>
      <th>Max</th>
      <th>Previous Max</th>
      <th>Max Variance</th>
    </tr>`;

    filteredData.forEach(product => {
      excelContent += `<tr>
        <td>${product.itemId}</td>
        <td>${product.description}</td>
        <td>${product.status}</td>
        <td>${product.volume}</td>
        <td>${product.primarySupplier}</td>
        <td>${product.leadTime}</td>
        <td>${product.orderFrequency}</td>
        <td>${product.locationId}</td>
        <td>${product.dc}</td>
        <td>${product.min}</td>
        <td>${product.max}</td>
        <td>${product.previousMax}</td>
        <td>${product.maxVariance}%</td>
      </tr>`;
    });

    excelContent += '</table></body></html>';

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `min-max-recommendations-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col gap-3 bg-white rounded-2xl shadow-lg p-6"> 
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#00B8F0]">Min/Max Recommendations</h2>
            <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Filter size={16} />
                Filters
              </Button>
              <Button
                onClick={exportToExcel}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <FileSpreadsheet size={16} />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Priority Toggle */}
        <div className="flex items-center gap-8 justify-between">
          <div className="relative w-2/5">
            <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0] transition-all text-sm"
            />
          </div>
          <Button
            onClick={() => setShowPriorityOnly(!showPriorityOnly)}
            variant={showPriorityOnly ? "secondary" : "destructive"}
            className="text-sm font-semibold px-6 py-2 text-white"
            style={{
              backgroundColor: showPriorityOnly ? '#4B5563' : '#DC2626'
            }}
          >
            {showPriorityOnly ? "Show All Items" : "View Priority Items"}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-3 border-t border-gray-100">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Status"
            >
              <option value="">All Status</option>
              {getUniqueValues('status').map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>

            <Select
              value={volumeFilter}
              onChange={(e) => setVolumeFilter(e.target.value)}
              placeholder="All Volumes"
            >
              <option value="">All Volumes</option>
              {getUniqueValues('volume').map(volume => (
                <option key={volume} value={volume}>{volume}</option>
              ))}
            </Select>

            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="All Locations"
            >
              <option value="">All Locations</option>
              {getUniqueValues('locationId').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </Select>

            <Select
              value={dcFilter}
              onChange={(e) => setDcFilter(e.target.value)}
              placeholder="All DCs"
            >
              <option value="">All DCs</option>
              {getUniqueValues('dc').map(dc => (
                <option key={dc} value={dc}>{dc}</option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Item ID</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Description</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Volume</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Primary Supplier</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Lead Time</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Order Freq.</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Location ID</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">DC</th>
                <th className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200">Min</th>
                <th className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200">Max</th>
                <th className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200">Prev Max</th>
                <th className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200">Variance</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.itemId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-2 text-xs text-gray-600">{product.itemId}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.description}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.status}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.volume}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.primarySupplier}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.leadTime}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.orderFrequency}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.locationId}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">{product.dc}</td>
                  <td className="w-20 px-2 py-2 text-xs font-medium text-gray-900 bg-blue-50 text-center border border-gray-200">{product.min}</td>
                  <td className="w-20 px-2 py-2 text-xs bg-blue-50 text-center border border-gray-200">
                    {editingId === product.itemId ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-16 px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-[#00B8F0] text-xs"
                        />
                        <button
                          onClick={() => handleSaveEdit(product.itemId)}
                          className="p-0.5 text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-0.5 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{product.max}</span>
                    )}
                  </td>
                  <td className="w-20 px-2 py-2 text-xs font-medium text-gray-900 bg-blue-50 text-center border border-gray-200">{product.previousMax}</td>
                  <td className="w-20 px-2 py-2 text-xs bg-blue-50 text-center border border-gray-200">
                    <span className={`font-medium ${
                      Math.abs(product.maxVariance) > 15 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                    }`}>
                      {product.maxVariance}%
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    {editingId === product.itemId ? (
                      null
                    ) : (
                      <div className="flex space-x-1">
                        <Button 
                          size="sm"
                          className="px-2 py-1 text-xs"
                          onClick={() => handleStartEdit(product)}
                        >
                          Override
                        </Button>
                        <Button 
                          size="sm"
                          variant="secondary"
                          className="px-2 py-1 text-xs"
                          onClick={() => window.location.href = `/forecast/${product.itemId}`}
                        >
                          Forecast
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}