import React, { useState, useEffect, useCallback } from 'react';
import { Crosshair, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const GRID_SIZE = 30;

export const WarehouseMap = ({
  mapData,
  workerPosition,
  targetPosition,
  pathCells,
  duplicatePositions,
  onCellClick,
  onWorkerDrag,
  loading
}) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  const getCellType = useCallback((x, y) => {
    const key = `${x},${y}`;
    
    // Check if worker position
    if (workerPosition && workerPosition.x === x && workerPosition.y === y) {
      return 'worker';
    }
    
    // Check if target position
    if (targetPosition && targetPosition.x === x && targetPosition.y === y) {
      return 'target';
    }
    
    // Check if in path
    if (pathCells && pathCells.some(p => p.x === x && p.y === y)) {
      return 'path';
    }
    
    // Check if duplicate position
    if (duplicatePositions && duplicatePositions.some(p => p.x === x && p.y === y)) {
      return 'duplicate';
    }
    
    // Check if aisle (every 5th row/column)
    if (x % 5 === 0 || y % 5 === 0) {
      return 'aisle';
    }
    
    // Check if shelf with sheet
    if (mapData?.positions && mapData.positions[key]) {
      return 'shelf';
    }
    
    return 'empty';
  }, [mapData, workerPosition, targetPosition, pathCells, duplicatePositions]);

  const getSheetInfo = useCallback((x, y) => {
    const key = `${x},${y}`;
    return mapData?.positions?.[key] || null;
  }, [mapData]);

  const getCellClass = (cellType, sheetInfo) => {
    let baseClass = 'grid-cell ';
    
    switch (cellType) {
      case 'worker':
        return baseClass + 'cell-worker';
      case 'target':
        return baseClass + 'cell-target';
      case 'path':
        return baseClass + 'cell-path';
      case 'duplicate':
        return baseClass + 'cell-duplicate';
      case 'shelf':
        let shelfClass = baseClass + 'cell-shelf';
        if (sheetInfo?.iot_status === 'active') shelfClass += ' iot-active';
        else if (sheetInfo?.iot_status === 'inactive') shelfClass += ' iot-inactive';
        else if (sheetInfo?.iot_status === 'maintenance') shelfClass += ' iot-maintenance';
        return shelfClass;
      case 'aisle':
        return baseClass + 'cell-aisle';
      default:
        return baseClass + 'cell-empty';
    }
  };

  const handleCellClick = (x, y) => {
    const cellType = getCellType(x, y);
    const sheetInfo = getSheetInfo(x, y);
    onCellClick && onCellClick(x, y, cellType, sheetInfo);
  };

  const handleRightClick = (e, x, y) => {
    e.preventDefault();
    // Right-click to set worker position on any cell
    onWorkerDrag && onWorkerDrag({ x, y });
  };

  const renderCell = (x, y) => {
    const cellType = getCellType(x, y);
    const sheetInfo = getSheetInfo(x, y);
    const cellClass = getCellClass(cellType, sheetInfo);
    const key = `${x}-${y}`;

    return (
      <TooltipProvider key={key} delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              data-testid={`grid-cell-${x}-${y}`}
              className={cellClass}
              onClick={() => handleCellClick(x, y)}
              onContextMenu={(e) => handleRightClick(e, x, y)}
              onMouseEnter={() => setHoveredCell({ x, y })}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                animationDelay: cellType === 'path' ? `${(x + y) * 30}ms` : '0ms'
              }}
            >
              {cellType === 'shelf' && sheetInfo && (
                <div className={`iot-indicator ${sheetInfo.iot_status}`} />
              )}
              {cellType === 'worker' && (
                <Crosshair className="w-3 h-3 text-white" />
              )}
            </div>
          </TooltipTrigger>
          {(cellType === 'shelf' || cellType === 'target' || cellType === 'duplicate') && sheetInfo && (
            <TooltipContent 
              side="top" 
              className="bg-zinc-900 border-zinc-700 p-3"
            >
              <div className="space-y-1 text-xs">
                <div className="font-bold text-cyan-400">{sheetInfo.sheet_id}</div>
                <div className="text-zinc-400">Type: <span className="text-white">{sheetInfo.type}</span></div>
                <div className="text-zinc-400">Stock: <span className="text-white">{sheetInfo.stock_quantity}</span></div>
                <div className="text-zinc-400">Position: <span className="text-white">({x}, {y})</span></div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        cells.push(renderCell(x, y));
      }
    }
    return cells;
  };

  return (
    <div className="map-container" data-testid="warehouse-map">
      {/* Map Header */}
      <div className="map-header">
        <div>
          <h2 className="font-heading text-lg font-bold">Warehouse Floor Plan</h2>
          <p className="text-xs text-zinc-500 font-mono">
            {GRID_SIZE}x{GRID_SIZE} Grid | {mapData?.total_shelves || 0} Active Shelves
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="h-8 w-8 bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="zoom-out-btn"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono text-zinc-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="h-8 w-8 bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="zoom-in-btn"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetZoom}
            className="h-8 w-8 bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="reset-zoom-btn"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}

      {/* Grid */}
      <div 
        className="p-4 overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <div 
          className="warehouse-grid"
          data-testid="warehouse-grid"
        >
          {renderGrid()}
        </div>
      </div>

      {/* Legend */}
      <div className="legend m-4 mt-0">
        <div className="legend-item">
          <div className="legend-color cell-worker" />
          <span>Worker</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-target" />
          <span>Target</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-path" />
          <span>Path</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-duplicate" />
          <span>Duplicate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-shelf" />
          <span>Shelf</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cell-aisle" />
          <span>Aisle</span>
        </div>
        <div className="ml-auto text-xs text-zinc-500 italic">
          💡 Left-click aisle to move worker • Right-click anywhere to place worker
        </div>
      </div>
    </div>
  );
};

export default WarehouseMap;
