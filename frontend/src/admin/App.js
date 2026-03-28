import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import '@/App.css';

import Header from './components/Header';
import SearchPanel from './components/SearchPanel';
import WarehouseMap from './components/WarehouseMap';
import StatsPanel from './components/StatsPanel';
import InventoryTable from './components/InventoryTable';
import SheetDetails from './components/SheetDetails';

const REACT_APP_BACKEND_URL = "http://localhost:8000";
const BACKEND_URL = REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  // State
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  
  // Search & Navigation
  const [workerPosition, setWorkerPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState(null);
  const [pathCells, setPathCells] = useState([]);
  const [pathInfo, setPathInfo] = useState(null);
  
  // Results
  const [searchResults, setSearchResults] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [duplicatePositions, setDuplicatePositions] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Settings
  const [autoSelectNearest, setAutoSelectNearest] = useState(true);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [mapRes, sheetsRes, statsRes, filtersRes] = await Promise.all([
        axios.get(`${API}/warehouse/map`),
        axios.get(`${API}/sheets`),
        axios.get(`${API}/warehouse/stats`),
        axios.get(`${API}/filters/options`)
      ]);
      
      setMapData(mapRes.data);
      setSheets(sheetsRes.data.sheets || []);
      setStats(statsRes.data);
      setFilterOptions(filtersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate synthetic data
  const handleGenerateData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate-data?count=500`);
      toast.success(`Generated ${response.data.sheets_generated} metal sheets!`, {
        description: `${response.data.shelves_generated} shelves populated in 30x30 grid`,
        className: 'bg-zinc-900 border-zinc-700'
      });
      
      // Refresh all data
      await fetchData();
      
      // Clear any existing path/selection
      clearPath();
    } catch (error) {
      console.error('Error generating data:', error);
      toast.error('Failed to generate data', {
        className: 'bg-zinc-900 border-zinc-700'
      });
    } finally {
      setLoading(false);
    }
  };

  // Search sheets
  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/sheets/search`, filters);
      setSearchResults(response.data.sheets || []);
      setDuplicates([]);
      setDuplicatePositions([]);
      
      if (response.data.sheets?.length === 0) {
        toast.info('No sheets found matching your criteria', {
          className: 'bg-zinc-900 border-zinc-700'
        });
      } else {
        toast.success(`Found ${response.data.sheets.length} sheets`, {
          className: 'bg-zinc-900 border-zinc-700'
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed', {
        className: 'bg-zinc-900 border-zinc-700'
      });
    } finally {
      setLoading(false);
    }
  };

  // Find duplicates
  const handleFindDuplicates = async (type, materialGrade) => {
    setLoading(true);
    try {
      let url = `${API}/find-duplicates?type=${encodeURIComponent(type)}&worker_x=${workerPosition.x}&worker_y=${workerPosition.y}`;
      if (materialGrade) {
        url += `&material_grade=${encodeURIComponent(materialGrade)}`;
      }
      
      const response = await axios.post(url);
      const foundSheets = response.data.sheets || [];
      
      setDuplicates(foundSheets);
      setSearchResults([]);
      
      // Set duplicate positions for highlighting
      setDuplicatePositions(foundSheets.map(s => ({
        x: s.location_x,
        y: s.location_y
      })));
      
      if (foundSheets.length === 0) {
        toast.info(`No ${type} sheets found`, {
          className: 'bg-zinc-900 border-zinc-700'
        });
      } else {
        toast.success(`Found ${foundSheets.length} ${type} sheets`, {
          description: autoSelectNearest && response.data.nearest 
            ? `Nearest at (${response.data.nearest.location_x}, ${response.data.nearest.location_y}) - ${response.data.nearest_distance} steps`
            : 'Select a sheet to navigate',
          className: 'bg-zinc-900 border-zinc-700'
        });
        
        // Auto-select nearest if enabled
        if (autoSelectNearest && response.data.nearest) {
          handleSelectSheet(response.data.nearest);
        }
      }
    } catch (error) {
      console.error('Error finding duplicates:', error);
      toast.error('Failed to find duplicates', {
        className: 'bg-zinc-900 border-zinc-700'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate path to sheet
  const calculatePath = async (sheet) => {
    try {
      const response = await axios.post(`${API}/calculate-path`, {
        start_x: workerPosition.x,
        start_y: workerPosition.y,
        target_x: sheet.location_x,
        target_y: sheet.location_y
      });
      
      setPathCells(response.data.path || []);
      setPathInfo(response.data);
      setTargetPosition({ x: sheet.location_x, y: sheet.location_y });
      
      toast.success(`Path calculated: ${response.data.distance} steps`, {
        className: 'bg-zinc-900 border-zinc-700'
      });
    } catch (error) {
      console.error('Error calculating path:', error);
      toast.error('Failed to calculate path', {
        className: 'bg-zinc-900 border-zinc-700'
      });
    }
  };

  // Select a sheet
  const handleSelectSheet = (sheet) => {
    setSelectedSheet(sheet);
    calculatePath(sheet);
  };

  // View sheet details
  const handleViewDetails = (sheet) => {
    setSelectedSheet(sheet);
    setShowDetails(true);
  };

  // Navigate to sheet from table
  const handleNavigateTo = (sheet) => {
    handleSelectSheet(sheet);
    setDuplicates([]);
    setDuplicatePositions([]);
  };

  // Handle cell click on map
  const handleCellClick = (x, y, cellType, sheetInfo) => {
    if (cellType === 'shelf' || cellType === 'duplicate') {
      if (sheetInfo) {
        // Find full sheet data
        const fullSheet = sheets.find(s => s.id === sheetInfo.id);
        if (fullSheet) {
          handleSelectSheet(fullSheet);
        }
      }
    } else if (cellType === 'aisle' || cellType === 'empty') {
      // Update worker position by clicking on aisle/empty cell
      handleWorkerDrag({ x, y });
    }
  };

  // Handle worker position change (via drag or click)
  const handleWorkerDrag = (newPosition) => {
    setWorkerPosition(newPosition);
    toast.info(`Worker moved to (${newPosition.x}, ${newPosition.y})`, {
      className: 'bg-zinc-900 border-zinc-700'
    });
    
    // Recalculate path if target exists
    if (selectedSheet) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        calculatePathFromPosition(newPosition, selectedSheet);
      }, 100);
    }
  };

  // Calculate path from a specific position
  const calculatePathFromPosition = async (fromPosition, sheet) => {
    try {
      const response = await axios.post(`${API}/calculate-path`, {
        start_x: fromPosition.x,
        start_y: fromPosition.y,
        target_x: sheet.location_x,
        target_y: sheet.location_y
      });
      
      setPathCells(response.data.path || []);
      setPathInfo(response.data);
      setTargetPosition({ x: sheet.location_x, y: sheet.location_y });
    } catch (error) {
      console.error('Error calculating path:', error);
    }
  };

  // Clear path and selections
  const clearPath = () => {
    setTargetPosition(null);
    setPathCells([]);
    setPathInfo(null);
    setSearchResults([]);
    setDuplicates([]);
    setDuplicatePositions([]);
    setSelectedSheet(null);
  };

  return (
    <div className="app-container" data-testid="app-container">
      <Toaster 
        position="bottom-right" 
        theme="dark"
        toastOptions={{
          style: {
            background: '#18181B',
            border: '1px solid #27272A',
            color: '#FFFFFF'
          }
        }}
      />
      
      {/* Header */}
      <Header 
        onGenerateData={handleGenerateData}
        loading={loading}
        hasData={sheets.length > 0}
      />
      
      {/* Stats Panel */}
      <div className="px-4 py-4 md:px-6 lg:px-8">
        <StatsPanel stats={stats} />
      </div>
      
      {/* Main Content */}
      <div className="main-grid px-4 md:px-6 lg:px-8 pb-8">
        {/* Search Panel */}
        <SearchPanel
          filterOptions={filterOptions}
          onSearch={handleSearch}
          onFindDuplicates={handleFindDuplicates}
          onClearPath={clearPath}
          workerPosition={workerPosition}
          onWorkerPositionChange={setWorkerPosition}
          searchResults={searchResults}
          duplicates={duplicates}
          selectedSheet={selectedSheet}
          onSelectSheet={handleSelectSheet}
          pathInfo={pathInfo}
          autoSelectNearest={autoSelectNearest}
          onAutoSelectChange={setAutoSelectNearest}
          loading={loading}
        />
        
        {/* Warehouse Map */}
        <WarehouseMap
          mapData={mapData}
          workerPosition={workerPosition}
          targetPosition={targetPosition}
          pathCells={pathCells}
          duplicatePositions={duplicatePositions}
          onCellClick={handleCellClick}
          onWorkerDrag={handleWorkerDrag}
          loading={loading}
        />
      </div>
      
      {/* Inventory Table */}
      <div className="px-4 md:px-6 lg:px-8 pb-8">
        <InventoryTable
          sheets={sheets}
          onSelectSheet={handleViewDetails}
          onNavigateTo={handleNavigateTo}
          selectedSheet={selectedSheet}
        />
      </div>
      
      {/* Sheet Details Modal */}
      {showDetails && selectedSheet && (
        <SheetDetails
          sheet={selectedSheet}
          onClose={() => setShowDetails(false)}
          onNavigate={(sheet) => {
            setShowDetails(false);
            handleNavigateTo(sheet);
          }}
        />
      )}
    </div>
  );
}

export default App;
