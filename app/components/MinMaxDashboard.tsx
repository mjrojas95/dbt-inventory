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

// Sample data - keep your existing sampleData here
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
  // ... rest of your sample data
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

  const getUniqueValues = (field: keyof Product) => {
    return [...new Set(sampleData.map(item => item[field]))];
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
    // ... keep your existing exportToExcel function
  };

  return (
    <div className="p-6 max-w-full">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Min/Max Recommendations</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowFilters(!showFilters)} variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button onClick={exportToExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Priority Toggle */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md"
            />
          </div>
          <Button
            onClick={() => setShowPriorityOnly(!showPriorityOnly)}
            variant={showPriorityOnly ? "destructive" : "secondary"}
          >
            {showPriorityOnly ? "Show All" : "Priority Review"}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Item ID</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Volume</th>
                <th className="px-4 py-2 text-left">Primary Supplier</th>
                <th className="px-4 py-2 text-left">Lead Time</th>
                <th className="px-4 py-2 text-left">Order Freq.</th>
                <th className="px-4 py-2 text-left">Location ID</th>
                <th className="px-4 py-2 text-left">DC</th>
                <th className="px-4 py-2 text-left bg-blue-50">Min</th>
                <th className="px-4 py-2 text-left bg-blue-50">Max</th>
                <th className="px-4 py-2 text-left bg-blue-50">Prev Max</th>
                <th className="px-4 py-2 text-left bg-blue-50">Variance</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.itemId} className="border-t">
                  <td className="px-4 py-2">{product.itemId}</td>
                  <td className="px-4 py-2">{product.description}</td>
                  <td className="px-4 py-2">{product.status}</td>
                  <td className="px-4 py-2">{product.volume}</td>
                  <td className="px-4 py-2">{product.primarySupplier}</td>
                  <td className="px-4 py-2">{product.leadTime}</td>
                  <td className="px-4 py-2">{product.orderFrequency}</td>
                  <td className="px-4 py-2">{product.locationId}</td>
                  <td className="px-4 py-2">{product.dc}</td>
                  <td className="px-4 py-2 bg-blue-50">{product.min}</td>
                  <td className="px-4 py-2 bg-blue-50">
                    {editingId === product.itemId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 border rounded"
                        />
                        <Button size="sm" onClick={() => handleSaveEdit(product.itemId)}>✓</Button>
                        <Button size="sm" variant="destructive" onClick={handleCancelEdit}>✕</Button>
                      </div>
                    ) : (
                      <span>{product.max}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 bg-blue-50">{product.previousMax}</td>
                  <td className="px-4 py-2 bg-blue-50">
                    <span className={Math.abs(product.maxVariance) > 15 ? 'text-red-600' : ''}>
                      {product.maxVariance}%
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {editingId !== product.itemId && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStartEdit(product)}>
                          Override
                        </Button>
                        <Button 
                          size="sm"
                          variant="secondary"
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