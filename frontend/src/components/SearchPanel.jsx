import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Navigation, RotateCcw, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

export const SearchPanel = ({
  filterOptions,
  onSearch,
  onFindDuplicates,
  onClearPath,
  workerPosition,
  onWorkerPositionChange,
  searchResults,
  duplicates,
  selectedSheet,
  onSelectSheet,
  pathInfo,
  autoSelectNearest,
  onAutoSelectChange,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [workerX, setWorkerX] = useState(workerPosition?.x || 0);
  const [workerY, setWorkerY] = useState(workerPosition?.y || 0);

  useEffect(() => {
    if (workerPosition) {
      setWorkerX(workerPosition.x);
      setWorkerY(workerPosition.y);
    }
  }, [workerPosition]);

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      type: selectedType && selectedType !== 'all' ? selectedType : undefined,
      material_grade: selectedGrade && selectedGrade !== 'all' ? selectedGrade : undefined,
      size: selectedSize && selectedSize !== 'all' ? selectedSize : undefined
    });
  };

  const handleFindDuplicates = () => {
    if (selectedType && selectedType !== 'all') {
      onFindDuplicates(selectedType, selectedGrade !== 'all' ? selectedGrade : undefined);
    }
  };

  const handleWorkerUpdate = () => {
    const x = Math.max(0, Math.min(29, parseInt(workerX, 10) || 0));
    const y = Math.max(0, Math.min(29, parseInt(workerY, 10) || 0));
    onWorkerPositionChange({ x, y });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedGrade('');
    setSelectedSize('');
    onClearPath();
  };

  return (
    <div className="sidebar-panel" data-testid="search-panel">
      <div className="sidebar-grid">
        <div className="sidebar-block">
          <div className="sidebar-block-title">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="data-label">Worker Location</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500">X Position</Label>
              <Input
                type="number"
                min={0}
                max={29}
                value={workerX}
                onChange={(e) => setWorkerX(e.target.value)}
                onBlur={handleWorkerUpdate}
                className="input-industrial h-11"
                data-testid="worker-x-input"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500">Y Position</Label>
              <Input
                type="number"
                min={0}
                max={29}
                value={workerY}
                onChange={(e) => setWorkerY(e.target.value)}
                onBlur={handleWorkerUpdate}
                className="input-industrial h-11"
                data-testid="worker-y-input"
              />
            </div>
          </div>
        </div>

        <div className="sidebar-block">
          <div className="sidebar-block-title">
            <Search className="w-4 h-4 text-cyan-500" />
            <span className="data-label">Search Sheets</span>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Search by ID or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-industrial h-11"
              data-testid="search-input"
            />
            <Button
              onClick={handleSearch}
              className="w-full btn-primary min-h-[44px]"
              disabled={loading}
              data-testid="search-btn"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <div className="sidebar-block span-2">
          <div className="sidebar-block-title">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="data-label">Filters</span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Metal Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="input-industrial h-11" data-testid="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions?.types?.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Material Grade</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="input-industrial h-11" data-testid="grade-filter">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all">All Grades</SelectItem>
                  {filterOptions?.material_grades?.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-500">Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="input-industrial h-11" data-testid="size-filter">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="all">All Sizes</SelectItem>
                  {filterOptions?.sizes?.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="sidebar-block">
          <div className="sidebar-block-title">
            <Layers className="w-4 h-4 text-purple-500" />
            <span className="data-label">Duplicate Handling</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-3">
              <Label className="text-sm text-zinc-400">Auto-select Nearest</Label>
              <Switch
                checked={autoSelectNearest}
                onCheckedChange={onAutoSelectChange}
                data-testid="auto-select-toggle"
              />
            </div>

            <Button
              onClick={handleFindDuplicates}
              className="w-full btn-secondary min-h-[44px]"
              disabled={!selectedType || selectedType === 'all' || loading}
              data-testid="find-duplicates-btn"
            >
              <Layers className="w-4 h-4 mr-2" />
              Find Duplicates
            </Button>
          </div>
        </div>

        {pathInfo && (
          <div className="sidebar-block">
            <div className="path-info" data-testid="path-info">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span className="data-label text-cyan-400">Path Calculated</span>
              </div>
              <div className="path-distance">{pathInfo.distance} steps</div>
              <div className="text-xs text-zinc-400 font-mono mt-2">
                ({pathInfo.start.x}, {pathInfo.start.y}) → ({pathInfo.target.x}, {pathInfo.target.y})
              </div>
            </div>
          </div>
        )}

        {duplicates && duplicates.length > 0 && (
          <div className="sidebar-block span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="data-label">Found {duplicates.length} locations</span>
            </div>
            <div className="search-results" data-testid="duplicates-list">
              {duplicates.map((sheet, idx) => (
                <div
                  key={sheet.id}
                  className={`result-item ${selectedSheet?.id === sheet.id ? 'selected' : ''}`}
                  onClick={() => onSelectSheet(sheet)}
                  data-testid={`duplicate-item-${idx}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-mono text-sm text-white">{sheet.sheet_id}</div>
                      <div className="text-xs text-zinc-500">
                        Position: ({sheet.location_x}, {sheet.location_y})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-cyan-400">{sheet.distance} steps</div>
                      <div className="text-xs text-zinc-500">Qty: {sheet.stock_quantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults && searchResults.length > 0 && !duplicates?.length && (
          <div className="sidebar-block span-2">
            <span className="data-label">Search Results ({searchResults.length})</span>
            <div className="search-results mt-3" data-testid="search-results">
              {searchResults.slice(0, 20).map((sheet, idx) => (
                <div
                  key={sheet.id}
                  className={`result-item ${selectedSheet?.id === sheet.id ? 'selected' : ''}`}
                  onClick={() => onSelectSheet(sheet)}
                  data-testid={`search-result-${idx}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-mono text-sm text-white">{sheet.sheet_id}</div>
                      <div className="text-xs text-zinc-500">{sheet.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">({sheet.location_x}, {sheet.location_y})</div>
                      <div className="text-xs text-zinc-500">{sheet.material_grade}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-block span-2">
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full btn-secondary min-h-[44px]"
            data-testid="clear-filters-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;