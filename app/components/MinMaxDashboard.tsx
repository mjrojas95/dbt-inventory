"use client";

declare global {
  interface Window {
    fs: {
      readFile(path: string): Promise<Uint8Array>;
    };
    XLSX: any;
  }
}

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Filter, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import * as XLSX from 'xlsx';

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

type SortDirection = 'asc' | 'desc' | null;
type SortConfig = {
  key: keyof Product | null;
  direction: SortDirection;
};

export default function MinMaxDashboard() {
  console.log("Component mounted");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [volumeFilter, setVolumeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dcFilter, setDcFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null
  });
  const [lastUpdated] = useState(new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));

  useEffect(() => {
    const loadData = async () => {
      console.log("1. Function started");
      try {
        console.log("2. About to read file");
        const response = await fetch('/2025.01.31_RE Supply_Max Review_For upload.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        console.log("3. File read completed");
        
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          cellStyles: true,
          cellFormula: true,
          cellDates: true,
          cellNF: true,
          sheetStubs: true
        });
        console.log("4. Workbook created");
        console.log("Workbook content:", workbook);
  
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        console.log("5. Data extracted:", data.slice(0, 2));
  
        const transformedData: Product[] = data.map((row: any) => ({
          itemId: row['Item ID'] || '',
          description: row['Description'] || '',
          status: row['Status'] || '',
          volume: row['Volume'] || '',
          primarySupplier: row['Primary Supplier'] || '',
          leadTime: String(row['Lead Time'] || ''),
          orderFrequency: row['Order Frequency'] || '',
          locationId: String(row['Location ID'] || ''),
          dc: row['DC'] || '',
          min: Number(row['Min']) || 0,
          max: Number(row['Max']) || 0,
          previousMax: Number(row['Prev Max']) || 0,
          maxVariance: Number(row['Variance ']) || 0
        }));
  
        setProducts(transformedData);
        console.log("6. Data transformed and state updated");
  
      } catch (err: any) {
        console.log("Error occurred:", err);
        console.log("Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    };
  
    loadData();
  }, []);

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

  const sortProducts = (items: Product[]): Product[] => {
    if (!sortConfig.key || !sortConfig.direction) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aString.localeCompare(bString);
      }
      return bString.localeCompare(aString);
    });
  };

  const handleSort = (key: keyof Product) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: keyof Product) => {
    if (sortConfig.key !== columnKey) return null;
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : sortConfig.direction === 'desc' ? (
      <ChevronDown size={14} className="inline ml-1" />
    ) : null;
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col gap-1 bg-white rounded-2xl shadow-lg p-6"> 
        <div className="relative h-24">
          <div>
            <h2 className="text-xl font-bold text-[#00B8F0]">Min/Max Recommendations</h2>
            <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
          </div>

          <div className="relative w-2/5 mt-4">
            {/* search bar here */}
            <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0] transition-all text-sm"
            />
          </div>

          <div className="absolute bottom-0 right-0">
            <div className="flex flex-col gap-1.5">
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
                <Button
                  onClick={exportToExcel}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-1 text-base"
                >
                  <FileSpreadsheet size={16} />
                  Export
                </Button>
              </div>
              <Button
                onClick={() => setShowPriorityOnly(!showPriorityOnly)}
                variant={showPriorityOnly ? "secondary" : "destructive"}
                className="text-base px-6 py-2 text-white"
                style={{
                  backgroundColor: showPriorityOnly ? '#4B5563' : '#DC2626'
                }}
              >
                {showPriorityOnly ? "Show All Items" : "View Priority Items"}
              </Button>
            </div>
          </div>
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
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('itemId')}
                >
                  Item ID {getSortIcon('itemId')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('description')}
                >
                  Description {getSortIcon('description')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('volume')}
                >
                  Volume {getSortIcon('volume')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('primarySupplier')}
                >
                  Primary Supplier {getSortIcon('primarySupplier')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('leadTime')}
                >
                  Lead Time {getSortIcon('leadTime')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderFrequency')}
                >
                  Order Freq. {getSortIcon('orderFrequency')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('locationId')}
                >
                  Location ID {getSortIcon('locationId')}
                </th>
                <th 
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dc')}
                >
                  DC {getSortIcon('dc')}
                </th>
                <th 
                  className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('min')}
                >
                  Min {getSortIcon('min')}
                </th>
                <th 
                  className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('max')}
                >
                  Max {getSortIcon('max')}
                </th>
                <th 
                  className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('previousMax')}
                >
                  Prev Max {getSortIcon('previousMax')}
                </th>
                <th 
                  className="w-20 px-2 py-3 text-center text-xs font-semibold text-[#00B8F0] bg-blue-50 border border-gray-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('maxVariance')}
                >
                  Variance {getSortIcon('maxVariance')}
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortProducts(products).map((product) => (
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