import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Eye, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

export const InventoryTable = ({ sheets, onSelectSheet, onNavigateTo, selectedSheet }) => {
  const [sortField, setSortField] = useState('sheet_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedSheets = useMemo(() => {
    if (!sheets) return [];

    return [...sheets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
      }

      if (aVal === bVal) return 0;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }

      return aVal < bVal ? 1 : -1;
    });
  }, [sheets, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedSheets.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentSheets = sortedSheets.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
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

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
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

  const visiblePages = getVisiblePages();

  return (
    <div className="inventory-section" data-testid="inventory-table">
      <div className="inventory-header">
        <div>
          <h3 className="font-heading text-lg font-bold">Inventory</h3>
          <p className="text-sm text-zinc-500">Tap a sheet to view or navigate.</p>
        </div>
      </div>

      <div className="inventory-toolbar">
        <div className="inventory-toolbar-inline">
          <span className="inventory-page-size-label">Show</span>

          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="inventory-page-select"
            data-testid="page-size-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

      
            Showing <strong>{startIndex + 1}</strong>–<strong>{Math.min(endIndex, sortedSheets.length)}</strong> of <strong>{sortedSheets.length}</strong>
      
        </div>
      </div>

      <div className="mobile-only">
        <ScrollArea className="h-[560px] pr-1">
          <div className="inventory-cards">
            {currentSheets.map((sheet) => (
              <div
                key={sheet.id}
                className={`inventory-card ${selectedSheet?.id === sheet.id ? 'selected' : ''}`}
                data-testid={`inventory-row-${sheet.sheet_id}`}
              >
                <div className="inventory-card-header">
                  <div>
                    <div className="inventory-card-title">{sheet.sheet_id}</div>
                    <div className="inventory-card-subtitle">{sheet.type}</div>
                  </div>
                  {getIotBadge(sheet.iot_status)}
                </div>

                <div className="inventory-card-grid">
                  <div className="inventory-card-meta">
                    <div className="inventory-card-label">Grade</div>
                    <div className="inventory-card-value">{sheet.material_grade}</div>
                  </div>
                  <div className="inventory-card-meta">
                    <div className="inventory-card-label">Size</div>
                    <div className="inventory-card-value">{sheet.size}</div>
                  </div>
                  <div className="inventory-card-meta">
                    <div className="inventory-card-label">Weight</div>
                    <div className="inventory-card-value">{sheet.weight} kg</div>
                  </div>
                  <div className="inventory-card-meta">
                    <div className="inventory-card-label">Thickness</div>
                    <div className="inventory-card-value">{sheet.thickness} mm</div>
                  </div>
                  <div className="inventory-card-meta">
                    <div className="inventory-card-label">Quantity</div>
                    <div className="inventory-card-value">{sheet.stock_quantity}</div>
                  </div>
                  <div className="inventory-card-meta">
                    <div className="inventory-card-label">Location</div>
                    <div className="inventory-card-value">({sheet.location_x}, {sheet.location_y})</div>
                  </div>
                </div>

                <div className="inventory-card-actions">
                  <Button
                    variant="ghost"
                    className="min-h-[44px] hover:bg-zinc-800"
                    onClick={() => onSelectSheet(sheet)}
                    data-testid={`view-sheet-${sheet.sheet_id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>

                  <Button
                    variant="ghost"
                    className="min-h-[44px] hover:bg-cyan-500/20 hover:text-cyan-400"
                    onClick={() => onNavigateTo(sheet)}
                    data-testid={`navigate-to-${sheet.sheet_id}`}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="desktop-only">
        <ScrollArea className="h-[480px]">
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="cursor-pointer hover:text-white" onClick={() => handleSort('sheet_id')}>
                    Sheet ID <SortIcon field="sheet_id" />
                  </th>
                  <th className="cursor-pointer hover:text-white" onClick={() => handleSort('type')}>
                    Type <SortIcon field="type" />
                  </th>
                  <th className="cursor-pointer hover:text-white" onClick={() => handleSort('material_grade')}>
                    Grade <SortIcon field="material_grade" />
                  </th>
                  <th className="cursor-pointer hover:text-white" onClick={() => handleSort('size')}>
                    Size <SortIcon field="size" />
                  </th>
                  <th className="cursor-pointer hover:text-white text-right" onClick={() => handleSort('weight')}>
                    Weight (kg) <SortIcon field="weight" />
                  </th>
                  <th className="cursor-pointer hover:text-white text-right" onClick={() => handleSort('thickness')}>
                    Thickness (mm) <SortIcon field="thickness" />
                  </th>
                  <th className="cursor-pointer hover:text-white text-right" onClick={() => handleSort('stock_quantity')}>
                    Qty <SortIcon field="stock_quantity" />
                  </th>
                  <th>Location</th>
                  <th>IoT Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentSheets.map((sheet) => (
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
                          className="h-8 w-8 hover:bg-zinc-800"
                          onClick={() => onSelectSheet(sheet)}
                          data-testid={`view-sheet-${sheet.sheet_id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-cyan-500/20 hover:text-cyan-400"
                          onClick={() => onNavigateTo(sheet)}
                          data-testid={`navigate-to-${sheet.sheet_id}`}
                        >
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>

      <div className="inventory-pagination">
        <Button
          variant="ghost"
          className="inventory-pagination-btn"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          data-testid="pagination-prev"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>

        <div className="inventory-pagination-pages">
          {visiblePages[0] > 1 && (
            <>
              <button
                type="button"
                className={`inventory-page-btn ${currentPage === 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              {visiblePages[0] > 2 && <span className="inventory-page-dots">…</span>}
            </>
          )}

          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              className={`inventory-page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
              data-testid={`pagination-page-${page}`}
            >
              {page}
            </button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="inventory-page-dots">…</span>
              )}
              <button
                type="button"
                className={`inventory-page-btn ${currentPage === totalPages ? 'active' : ''}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          className="inventory-pagination-btn"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          data-testid="pagination-next"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default InventoryTable;