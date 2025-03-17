"use client";

declare global {
  interface Window {
    fs: {
      readFile(path: string): Promise<Uint8Array>;
    };
    XLSX: any;
  }
}

import { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, Filter, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import * as XLSX from 'xlsx';

interface Product {
  itemId: string;
  description: string;
  status: string;
  season: string;
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
  const [editingRow, setEditingRow] = useState<{itemId: string, locationId: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [volumeFilter, setVolumeFilter] = useState('');
  const [primarySupplierFilter, setPrimarySupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dcFilter, setDcFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null
  });
  const [lastUpdated] = useState("January 13, 2025 at 9:00 AM");
  const [editingNotes, setEditingNotes] = useState<{itemId: string, locationId: string} | null>(null);
  const [noteText, setNoteText] = useState('');
  const [productNotes, setProductNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const loadData = async () => {
      console.log("1. Function started");
      try {
        console.log("2. About to read file");
        const response = await fetch('/2025.01.31_RE Supply_Max Review_For upload.xlsx?v=' + Date.now());
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
        console.log("Raw variance values:", data.slice(0, 5).map((row: any) => row['Variance ']));
        console.log("5. Data extracted:", data.slice(0, 2));
        console.log("Excel columns:", Object.keys(data[0] as object));
        console.log("Season column data:", data.slice(0, 5).map((row: any) => row['Season']));
  
        const transformedData: Product[] = data.map((row: any) => ({
          itemId: row['Item ID'] || '',
          description: row['Description'] || '',
          status: row['Status'] || '',
          season: row['Season'] || '',
          volume: row['Volume'] || '',
          primarySupplier: row['Primary Supplier'] || '',
          leadTime: String(row['Lead Time'] || ''),
          orderFrequency: row['Order Frequency'] || '',
          locationId: String(row['Location ID'] || ''),
          dc: row['DC'] || '',
          min: Number(row['Min']) || 0,
          max: Number(row['Max']) || 0,
          previousMax: Number(row['Prev Max']) || 0,
          maxVariance: Number(row['Variance ']) || 0  // Already in percentage form
        }));
  
        console.log("First 5 transformed items with season data:", transformedData.slice(0, 5).map(item => ({
          itemId: item.itemId,
          season: item.season
        })));

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
    const values = [...new Set(products.map(item => String(item[field])))];
    return values.sort();
  };

  const handleStartEdit = (product: Product) => {
    setEditingRow({ itemId: product.itemId, locationId: product.locationId });
    setEditValue(product.max.toString());
  };

  const handleSaveEdit = (productId: string, locationId: string) => {
    const newValue = parseInt(editValue);
    if (isNaN(newValue)) return;

    setProducts(products.map(product => {
      if (product.itemId === productId && product.locationId === locationId) {
        const variance = (newValue - product.previousMax) / product.previousMax;
        return {
          ...product,
          max: newValue,
          maxVariance: variance
        };
      }
      return product;
    }));
    setEditingRow(null);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditValue('');
  };

  const handleStartNotes = (product: Product) => {
    setEditingNotes({ itemId: product.itemId, locationId: product.locationId });
    // Get existing note or empty string
    const noteKey = `${product.itemId}-${product.locationId}`;
    setNoteText(productNotes[noteKey] || '');
  };

  const handleSaveNotes = (productId: string, locationId: string) => {
    const noteKey = `${productId}-${locationId}`;
    setProductNotes({
      ...productNotes,
      [noteKey]: noteText
    });
    setEditingNotes(null);
  };
  
  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  const exportToExcel = () => {
    const filteredData = products.filter(product => {
      const matchesSearch = product.itemId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || product.status === statusFilter;
      const matchesSeason = !seasonFilter || product.season === seasonFilter;
      const matchesVolume = !volumeFilter || product.volume === volumeFilter;
      const matchesPrimarySupplier = !primarySupplierFilter || product.primarySupplier === primarySupplierFilter;
      const matchesLocation = !locationFilter || product.locationId === locationFilter;
      const matchesDC = !dcFilter || product.dc === dcFilter;
      const matchesPriority = !showPriorityOnly || Math.abs(product.maxVariance) > 0.4;

      return matchesSearch && matchesStatus && matchesSeason && matchesVolume && matchesPrimarySupplier && 
             matchesLocation && matchesDC && matchesPriority;
    });

    let excelContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>';
    
    // Add filters info
    excelContent += '<table><tr><th colspan="4">Applied Filters</th></tr>';
    if (searchTerm) excelContent += `<tr><td>Search Term:</td><td colspan="3">${searchTerm}</td></tr>`;
    if (statusFilter) excelContent += `<tr><td>Status:</td><td colspan="3">${statusFilter}</td></tr>`;
    if (seasonFilter) excelContent += `<tr><td>Season:</td><td colspan="3">${seasonFilter}</td></tr>`;
    if (volumeFilter) excelContent += `<tr><td>Volume:</td><td colspan="3">${volumeFilter}</td></tr>`;
    if (primarySupplierFilter) excelContent += `<tr><td>Primary Supplier:</td><td colspan="3">${primarySupplierFilter}</td></tr>`;
    if (locationFilter) excelContent += `<tr><td>Location:</td><td colspan="3">${locationFilter}</td></tr>`;
    if (dcFilter) excelContent += `<tr><td>DC:</td><td colspan="3">${dcFilter}</td></tr>`;
    if (showPriorityOnly) excelContent += `<tr><td colspan="4">Showing Priority Items Only</td></tr>`;
    excelContent += '<tr><td colspan="4"></td></tr>';

    excelContent += `<tr>
      <th>Item ID</th>
      <th>Description</th>
      <th>Status</th>
      <th>Season</th>
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
        <td>${product.season}</td>
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

      // Special handling for maxVariance to sort by percentage value
      if (sortConfig.key === 'maxVariance') {
        const aPercentage = Number(aValue) * 100;
        const bPercentage = Number(bValue) * 100;
        return sortConfig.direction === 'asc' ? aPercentage - bPercentage : bPercentage - aPercentage;
      }

      // For other numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // For string values
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

  const filteredData = useMemo(() => {
    // Add this debug log
    if (products.length > 0) {
      console.log("Sample of products in state:", products.slice(0, 3).map(p => ({
        itemId: p.itemId,
        season: p.season
      })));
    }

    return products.filter(product => {
      const matchesSearch = product.itemId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || product.status === statusFilter;
      const matchesSeason = !seasonFilter || product.season === seasonFilter;
      const matchesVolume = !volumeFilter || product.volume === volumeFilter;
      const matchesPrimarySupplier = !primarySupplierFilter || product.primarySupplier === primarySupplierFilter;
      const matchesLocation = !locationFilter || product.locationId === locationFilter;
      const matchesDC = !dcFilter || product.dc === dcFilter;
      const matchesPriority = !showPriorityOnly || Math.abs(product.maxVariance) > 0.4;

      return matchesSearch && matchesStatus && matchesSeason && matchesVolume && matchesPrimarySupplier && 
             matchesLocation && matchesDC && matchesPriority;
    });
  }, [products, searchTerm, statusFilter, seasonFilter, volumeFilter, primarySupplierFilter, locationFilter, dcFilter, showPriorityOnly]);

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col gap-1 bg-white rounded-2xl shadow-lg p-6"> 
        <div className="relative h-24">
          <div>
            <h2 className="text-xl font-bold text-[#00B8F0]">Min/Max Recommendations</h2>
            <p className="text-base text-gray-500 mt-1">Last updated: {lastUpdated}</p>
          </div>

          <div className="relative flex items-center mt-4">
            {/* Search bar with Filters button to its right */}
            <div className="relative w-2/5">
              <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Item ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B8F0] transition-all text-base"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-[#00B8F0] text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          <div className="absolute bottom-0 right-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex items-center justify-center gap-1 text-base"
                >
                  Approve
                </Button>
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
          <div className="flex flex-row space-x-2 pt-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 text-sm"
            >
              <option value="">All Status</option>
              {getUniqueValues('status').map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>

            <Select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="w-40 text-sm"
            >
              <option value="">All Seasons</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Both">Both</option>
            </Select>

            <Select
              value={volumeFilter}
              onChange={(e) => setVolumeFilter(e.target.value)}
              className="w-40 text-sm"
            >
              <option value="">All Volumes</option>
              {getUniqueValues('volume').map(volume => (
                <option key={volume} value={volume}>{volume}</option>
              ))}
            </Select>

            <Select
              value={primarySupplierFilter}
              onChange={(e) => setPrimarySupplierFilter(e.target.value)}
              className="w-40 text-sm"
            >
              <option value="">All Suppliers</option>
              {getUniqueValues('primarySupplier').map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </Select>

            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-40 text-sm"
            >
              <option value="">All Locations</option>
              {getUniqueValues('locationId').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </Select>

            <Select
              value={dcFilter}
              onChange={(e) => setDcFilter(e.target.value)}
              className="w-40 text-sm"
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
                  onClick={() => handleSort('season')}
                >
                  Season {getSortIcon('season')}
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
              {sortProducts(filteredData).map((product) => (
                editingNotes?.itemId === product.itemId && editingNotes?.locationId === product.locationId ? (
                  // Notes editing row
                  <tr key={`${product.itemId}-${product.locationId}-notes`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2 text-xs text-gray-600">{product.itemId}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">
                      {product.description}
                      {productNotes[`${product.itemId}-${product.locationId}`] && (
                        <span title="Has notes" className="ml-1 text-xs text-blue-500">📝</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.status}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.season}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.volume}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.primarySupplier}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.leadTime}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.orderFrequency}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.locationId}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.dc}</td>
                    <td colSpan={5} className="px-2 py-2">
                      <div className="flex items-center space-x-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Enter notes here..."
                          className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#00B8F0] text-xs h-20"
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleSaveNotes(product.itemId, product.locationId)}
                            className="p-1 bg-green-100 text-green-600 hover:bg-green-200 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelNotes}
                            className="p-1 bg-red-100 text-red-600 hover:bg-red-200 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Normal row
                  <tr key={`${product.itemId}-${product.locationId}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-2 text-xs text-gray-600">{product.itemId}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">
                      {product.description}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.status}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.season}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.volume}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.primarySupplier}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.leadTime}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.orderFrequency}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.locationId}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{product.dc}</td>
                    <td className="w-20 px-2 py-2 text-xs font-medium text-gray-900 bg-blue-50 text-center border border-gray-200">{product.min}</td>
                    <td className="w-20 px-2 py-2 text-xs bg-blue-50 text-center border border-gray-200">
                      {editingRow?.itemId === product.itemId && editingRow?.locationId === product.locationId ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-16 px-1 py-0.5 border rounded focus:outline-none focus:ring-2 focus:ring-[#00B8F0] text-xs"
                          />
                          <button
                            onClick={() => handleSaveEdit(product.itemId, product.locationId)}
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
                        Math.abs(product.maxVariance * 100) > 40 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {Math.round(product.maxVariance * 100)}%
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs">
                      {editingRow?.itemId === product.itemId && editingRow?.locationId === product.locationId ? (
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
                            onClick={() => window.location.href = `/forecast/${product.itemId}?locationId=${product.locationId}`}
                          >
                            Forecast
                          </Button>
                          <Button 
                            size="sm"
                            variant="secondary" 
                            className={`px-2 py-1 text-xs flex items-center ${
                              productNotes[`${product.itemId}-${product.locationId}`] ? 'bg-blue-100 border-blue-300' : ''
                            }`}
                            onClick={() => handleStartNotes(product)}
                          >
                            Notes
                            {productNotes[`${product.itemId}-${product.locationId}`] && (
                              <span className="ml-1 text-xs text-blue-500">📝</span>
                            )}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}