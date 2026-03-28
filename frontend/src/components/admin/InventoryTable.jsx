import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Eye, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

export const InventoryTable = ({ sheets, onSelectSheet, onNavigateTo, selectedSheet }) => {
  const [sortField, setSortField] = useState('sheet_id');
  const [sortDirection, setSortDirection] = useState('asc');

  const sortedSheets = useMemo(() => {
    if (!sheets) return [];
    
    return [...sheets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [sheets, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const getIotBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Maintenance</Badge>;
      default:
        return null;
    }
  };

  if (!sheets || sheets.length === 0) {
    return (
      <div className="inventory-section" data-testid="inventory-table">
        <h3 className="font-heading text-lg font-bold mb-4">Inventory</h3>
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>No sheets in inventory. Generate synthetic data to populate the warehouse.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-section" data-testid="inventory-table">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold">Inventory</h3>
        <span className="text-sm text-zinc-500 font-mono">{sheets.length} items</span>
      </div>
      
      <ScrollArea className="h-[400px]">
        <table className="inventory-table">
          <thead>
            <tr>
              <th 
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort('sheet_id')}
              >
                Sheet ID <SortIcon field="sheet_id" />
              </th>
              <th 
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort('type')}
              >
                Type <SortIcon field="type" />
              </th>
              <th 
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort('material_grade')}
              >
                Grade <SortIcon field="material_grade" />
              </th>
              <th 
                className="cursor-pointer hover:text-white"
                onClick={() => handleSort('size')}
              >
                Size <SortIcon field="size" />
              </th>
              <th 
                className="cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('weight')}
              >
                Weight (kg) <SortIcon field="weight" />
              </th>
              <th 
                className="cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('thickness')}
              >
                Thickness (mm) <SortIcon field="thickness" />
              </th>
              <th 
                className="cursor-pointer hover:text-white text-right"
                onClick={() => handleSort('stock_quantity')}
              >
                Qty <SortIcon field="stock_quantity" />
              </th>
              <th>Location</th>
              <th>IoT Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSheets.slice(0, 100).map((sheet) => (
              <tr 
                key={sheet.id}
                className={selectedSheet?.id === sheet.id ? 'bg-cyan-500/10' : ''}
                data-testid={`inventory-row-${sheet.sheet_id}`}
              >
                <td className="text-cyan-400">{sheet.sheet_id}</td>
                <td>{sheet.type}</td>
                <td>{sheet.material_grade}</td>
                <td>{sheet.size}</td>
                <td className="text-right">{sheet.weight}</td>
                <td className="text-right">{sheet.thickness}</td>
                <td className="text-right">{sheet.stock_quantity}</td>
                <td>
                  <span className="text-zinc-400">
                    ({sheet.location_x}, {sheet.location_y})
                  </span>
                </td>
                <td>{getIotBadge(sheet.iot_status)}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-zinc-800"
                      onClick={() => onSelectSheet(sheet)}
                      data-testid={`view-sheet-${sheet.sheet_id}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-cyan-500/20 hover:text-cyan-400"
                      onClick={() => onNavigateTo(sheet)}
                      data-testid={`navigate-to-${sheet.sheet_id}`}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sheets.length > 100 && (
          <div className="text-center py-4 text-sm text-zinc-500">
            Showing 100 of {sheets.length} items
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default InventoryTable;
