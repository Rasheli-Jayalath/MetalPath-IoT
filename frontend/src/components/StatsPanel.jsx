import React from 'react';
import { Package, Layers, Wifi, WifiOff, AlertTriangle, Database } from 'lucide-react';

export const StatsPanel = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid" data-testid="stats-panel">
      <div className="stat-card">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="w-5 h-5 text-cyan-500" />
        </div>
        <div className="stat-value" data-testid="total-sheets">
          {stats.total_sheets || 0}
        </div>
        <div className="stat-label">Total Sheets</div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Database className="w-5 h-5 text-blue-500" />
        </div>
        <div className="stat-value" data-testid="total-stock">
          {stats.total_stock?.toLocaleString() || 0}
        </div>
        <div className="stat-label">Total Stock</div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wifi className="w-5 h-5 text-green-500" />
        </div>
        <div className="stat-value text-green-500" data-testid="active-iot">
          {stats.active_iot_nodes || 0}
        </div>
        <div className="stat-label">IoT Active</div>
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-center gap-2 mb-2">
          <WifiOff className="w-5 h-5 text-zinc-500" />
        </div>
        <div className="stat-value text-zinc-400" data-testid="inactive-iot">
          {stats.inactive_nodes || 0}
        </div>
        <div className="stat-label">IoT Inactive</div>
      </div>
    </div>
  );
};

export default StatsPanel;
