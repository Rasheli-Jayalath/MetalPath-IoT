# MetalPathIoT - Product Requirements Document

## Original Problem Statement
Build a project for the metal industry to solve efficiency challenges using IoT devices on shelves to locate metal sheets. Workers can efficiently get the shortest path from their location. The app handles duplicate sheet locations. Synthetic data generation is required for pitch purposes.

## User Choices
- **Warehouse Size**: Large (30x30 grid with ~500 shelves)
- **Data Attributes**: Extended (Sheet ID, Type, Size, Weight, Location, Thickness, Material Grade, Stock Quantity, Date Added, IoT Status)
- **Visualization**: 2D Top-down warehouse map with animated path
- **Duplicate Handling**: Both options (auto-select nearest OR show all for manual selection)

## Architecture

### Backend (FastAPI + MongoDB)
- **server.py**: Main API with 11 endpoints
- **Database**: MongoDB for sheets and shelves data
- **Pathfinding**: Manhattan distance algorithm

### Frontend (React + Shadcn)
- **App.js**: Main application state management
- **WarehouseMap.jsx**: 30x30 interactive grid
- **SearchPanel.jsx**: Filters, search, duplicate handling
- **InventoryTable.jsx**: Sortable data table
- **StatsPanel.jsx**: Real-time statistics
- **SheetDetails.jsx**: Sheet detail modal

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/ | GET | Health check |
| /api/generate-data | POST | Generate 500 synthetic sheets |
| /api/sheets | GET | Get all sheets |
| /api/sheets/search | POST | Search with filters |
| /api/find-duplicates | POST | Find all sheets of a type |
| /api/calculate-path | POST | Calculate shortest path |
| /api/warehouse/map | GET | Get map data |
| /api/warehouse/stats | GET | Get statistics |
| /api/filters/options | GET | Get filter options |

## What's Been Implemented ✓
- [x] 30x30 warehouse grid visualization - March 28, 2026
- [x] Synthetic data generation (500 sheets) - March 28, 2026
- [x] IoT status indicators (active/inactive/maintenance) - March 28, 2026
- [x] Search and filter functionality - March 28, 2026
- [x] Duplicate detection and listing - March 28, 2026
- [x] Shortest path calculation (Manhattan distance) - March 28, 2026
- [x] Auto-select nearest duplicate option - March 28, 2026
- [x] Worker position management - March 28, 2026
- [x] Inventory table with sorting - March 28, 2026
- [x] Sheet detail modal - March 28, 2026
- [x] Zoom controls for map - March 28, 2026
- [x] Dark industrial theme - March 28, 2026

## User Personas
1. **Warehouse Worker**: Needs to quickly locate metal sheets and find optimal path
2. **Inventory Manager**: Oversees stock levels, IoT status, duplicate management
3. **Pitch Presenter**: Demonstrates synthetic data and pathfinding capabilities

## Core Requirements (Static)
- Large warehouse grid (30x30 = 900 cells)
- ~500 metal sheet locations with extended attributes
- Real-time path visualization
- IoT device status tracking
- Duplicate handling with distance calculation

## Prioritized Backlog

### P0 (Completed)
- [x] Core MVP functionality

### P1 (Next Phase)
- [ ] Path animation with step-by-step visualization
- [ ] Worker position drag-and-drop on map
- [ ] Real-time IoT status updates (WebSocket)
- [ ] Export inventory to CSV/PDF

### P2 (Future)
- [ ] Multiple worker tracking
- [ ] Route optimization for multiple destinations
- [ ] Historical path analytics
- [ ] Mobile responsive design improvements
- [ ] A* pathfinding with obstacle avoidance

## Next Tasks
1. Add path animation with cyan glow effect tracing the route
2. Implement worker marker drag functionality
3. Add export functionality for inventory data
4. Enhance mobile responsiveness
