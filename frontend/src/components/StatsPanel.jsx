import React from 'react';
import { Package, Wifi, WifiOff, Database } from 'lucide-react';

export const StatsPanel = ({ stats }) => {
  if (!stats) return null;

  const items = [
    {
      icon: <Package className="w-5 h-5 text-cyan-500" />,
      value: stats.total_sheets || 0,
      label: 'Total Sheets',
      testId: 'total-sheets',
      valueClass: ''
    },
    {
      icon: <Database className="w-5 h-5 text-blue-500" />,
      value: stats.total_stock?.toLocaleString() || 0,
      label: 'Total Stock',
      testId: 'total-stock',
      valueClass: ''
    },
    {
      icon: <Wifi className="w-5 h-5 text-green-500" />,
      value: stats.active_iot_nodes || 0,
      label: 'IoT Active',
      testId: 'active-iot',
      valueClass: 'text-green-500'
    },
    {
      icon: <WifiOff className="w-5 h-5 text-zinc-500" />,
      value: stats.inactive_nodes || 0,
      label: 'IoT Inactive',
      testId: 'inactive-iot',
      valueClass: 'text-zinc-400'
    }
  ];

  return (
    <div className="stats-grid" data-testid="stats-panel">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <div className="flex items-center justify-center gap-2 mb-3">
            {item.icon}
          </div>
          <div className={`stat-value ${item.valueClass}`} data-testid={item.testId}>
            {item.value}
          </div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;