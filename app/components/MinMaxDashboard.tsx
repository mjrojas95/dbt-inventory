"use client";

import { useState } from 'react';
import { FileSpreadsheet, Filter, Search } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";

// Keep your existing Product interface and sampleData

export default function MinMaxDashboard() {
  // Keep your existing state declarations and functions

  return (
    <div className="space-y-4 max-w-full">
      {/* Header and Actions */}
      <div className="flex flex-col gap-3 bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Min/Max Recommendations</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "primary" : "secondary"}
              className="flex items-center gap-1"
            >
              <Filter size={16} />
              Filters
            </Button>
            <Button
              onClick={exportToExcel}
              variant="primary"
              className="flex items-center gap-1"
            >
              <FileSpreadsheet size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Priority Toggle */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
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
            variant={showPriorityOnly ? "destructive" : "secondary"}
            className="text-sm"
          >
            {showPriorityOnly ? "Show All" : "Priority Review"}
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
              {getUniqueValues('status').map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>

            <Select
              value={volumeFilter}
              onChange={(e) => setVolumeFilter(e.target.value)}
              placeholder="All Volumes"
            >
              {getUniqueValues('volume').map(volume => (
                <option key={volume} value={volume}>{volume}</option>
              ))}
            </Select>

            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="All Locations"
            >
              {getUniqueValues('locationId').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </Select>

            <Select
              value={dcFilter}
              onChange={(e) => setDcFilter(e.target.value)}
              placeholder="All DCs"
            >
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
                <th className="px-2 py-3 text-left text-xs font-semibold text-[#00B8F0] bg-blue-50">Min</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-[#00B8F0] bg-blue-50">Max</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-[#00B8F0] bg-blue-50">Prev Max</th>
                <th className="px-2 py-3 text-left text-xs font-semibold text-[#00B8F0] bg-blue-50">Variance</th>
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
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 bg-blue-50">{product.min}</td>
                  <td className="px-2 py-2 text-xs bg-blue-50">
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
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 bg-blue-50">{product.previousMax}</td>
                  <td className="px-2 py-2 text-xs bg-blue-50">
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