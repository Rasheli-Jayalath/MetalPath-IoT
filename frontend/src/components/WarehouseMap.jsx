import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Crosshair, ZoomIn, ZoomOut, RotateCcw, LocateFixed, MapPinned } from 'lucide-react';
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
  const mapBodyRef = useRef(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.7));
  const handleResetZoom = () => setZoom(1);

  const getCellType = useCallback((x, y) => {
    const key = `${x},${y}`;

    if (workerPosition && workerPosition.x === x && workerPosition.y === y) {
      return 'worker';
    }

    if (targetPosition && targetPosition.x === x && targetPosition.y === y) {
      return 'target';
    }

    if (pathCells && pathCells.some((p) => p.x === x && p.y === y)) {
      return 'path';
    }

    if (duplicatePositions && duplicatePositions.some((p) => p.x === x && p.y === y)) {
      return 'duplicate';
    }

    if (x % 5 === 0 || y % 5 === 0) {
      return 'aisle';
    }

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
      case 'shelf': {
        let shelfClass = baseClass + 'cell-shelf';
        if (sheetInfo?.iot_status === 'active') shelfClass += ' iot-active';
        else if (sheetInfo?.iot_status === 'inactive') shelfClass += ' iot-inactive';
        else if (sheetInfo?.iot_status === 'maintenance') shelfClass += ' iot-maintenance';
        return shelfClass;
      }
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
    onWorkerDrag && onWorkerDrag({ x, y });
  };

  const centerOnPosition = useCallback((position) => {
    if (!position || !mapBodyRef.current) return;

    const cell = mapBodyRef.current.querySelector(
      `[data-testid="grid-cell-${position.x}-${position.y}"]`
    );

    if (!cell) return;

    const container = mapBodyRef.current;
    const cellLeft = cell.offsetLeft * zoom;
    const cellTop = cell.offsetTop * zoom;
    const cellWidth = cell.offsetWidth * zoom;
    const cellHeight = cell.offsetHeight * zoom;

    const targetScrollLeft = cellLeft - container.clientWidth / 2 + cellWidth / 2;
    const targetScrollTop = cellTop - container.clientHeight / 2 + cellHeight / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });
  }, [zoom]);

  const getRandomWalkablePosition = useCallback(() => {
    const candidates = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const cellType = getCellType(x, y);
        if (cellType === 'aisle' || cellType === 'empty') {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }, [getCellType]);

  const handleRandomLocate = () => {
    const randomPosition = getRandomWalkablePosition();
    if (!randomPosition) return;

    onWorkerDrag && onWorkerDrag(randomPosition);

    setTimeout(() => {
      centerOnPosition(randomPosition);
    }, 120);
  };

  const handleResetAndFocusWorker = () => {
    setZoom(1);

    setTimeout(() => {
      centerOnPosition(workerPosition);
    }, 120);
  };

  useEffect(() => {
    if (workerPosition) {
      const timer = setTimeout(() => {
        centerOnPosition(workerPosition);
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [workerPosition, centerOnPosition]);

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
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-700 p-3">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-cyan-400">{sheetInfo.sheet_id}</div>
                <div className="text-zinc-400">
                  Type: <span className="text-white">{sheetInfo.type}</span>
                </div>
                <div className="text-zinc-400">
                  Stock: <span className="text-white">{sheetInfo.stock_quantity}</span>
                </div>
                <div className="text-zinc-400">
                  Position: <span className="text-white">({x}, {y})</span>
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        cells.push(renderCell(x, y));
      }
    }
    return cells;
  };

  return (
    <div className="map-container" data-testid="warehouse-map">
      <div className="map-header">
        <div>
          <h2 className="font-heading text-lg font-bold">Warehouse Floor Plan</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            {GRID_SIZE}x{GRID_SIZE} Grid | {mapData?.total_shelves || 0} Active Shelves
          </p>
        </div>

        <div className="map-actions">
          <div className="current-location-chip">
            <MapPinned className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono text-zinc-300">
              Current: ({workerPosition?.x ?? 0}, {workerPosition?.y ?? 0})
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleRandomLocate}
            className="map-action-btn bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="random-locate-btn"
          >
            <LocateFixed className="h-4 w-4 mr-2" />
            Locate Me
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="h-10 w-10 bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="zoom-out-btn"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-xs font-mono text-zinc-400 w-14 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="h-10 w-10 bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="zoom-in-btn"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleResetAndFocusWorker}
            className="h-10 w-10 bg-transparent border-zinc-700 hover:bg-zinc-800"
            data-testid="reset-focus-btn"
            title="Reset and focus worker"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}

      <div className="map-help-text">
        Tap shelves to select. Tap aisles to move worker. Use <strong>Locate Me</strong> to place the worker in a random valid location.
      </div>

      <div className="map-body" ref={mapBodyRef}>
        <div
          className="map-grid-frame"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          <div className="warehouse-grid" data-testid="warehouse-grid">
            {renderGrid()}
          </div>
        </div>
      </div>

      <div className="legend">
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
        <div className="legend-note">
          Best on iPad: use 100% zoom for normal work and 120%–140% for close inspection.
        </div>
      </div>
    </div>
  );
};

export default WarehouseMap;