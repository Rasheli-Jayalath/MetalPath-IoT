import React from 'react';
import { X, Navigation, Package, Ruler, Scale, Layers, Calendar, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const SheetDetails = ({ sheet, onClose, onNavigate }) => {
  if (!sheet) return null;

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid="sheet-details-modal"
    >
      <div 
        className="bg-zinc-900 border border-zinc-700 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-cyan-500" />
            <div>
              <h3 className="font-heading font-bold text-lg">{sheet.sheet_id}</h3>
              <p className="text-xs text-zinc-500">{sheet.type}</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 hover:bg-zinc-800"
            data-testid="close-details-btn"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Location */}
          <div className="bg-zinc-950 p-4 border border-zinc-800">
            <div className="data-label mb-2">Location</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl text-white">
                ({sheet.location_x}, {sheet.location_y})
              </span>
              {getIotBadge(sheet.iot_status)}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 p-3 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-3 h-3 text-zinc-500" />
                <span className="data-label">Size</span>
              </div>
              <div className="font-mono text-white">{sheet.size}</div>
            </div>

            <div className="bg-zinc-950 p-3 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-3 h-3 text-zinc-500" />
                <span className="data-label">Weight</span>
              </div>
              <div className="font-mono text-white">{sheet.weight} kg</div>
            </div>

            <div className="bg-zinc-950 p-3 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-3 h-3 text-zinc-500" />
                <span className="data-label">Thickness</span>
              </div>
              <div className="font-mono text-white">{sheet.thickness} mm</div>
            </div>

            <div className="bg-zinc-950 p-3 border border-zinc-800">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-3 h-3 text-zinc-500" />
                <span className="data-label">Stock</span>
              </div>
              <div className="font-mono text-white">{sheet.stock_quantity} units</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-zinc-950 p-3 border border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-3 h-3 text-zinc-500" />
              <span className="data-label">Material Grade</span>
            </div>
            <div className="font-mono text-white">{sheet.material_grade}</div>
          </div>

          <div className="bg-zinc-950 p-3 border border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-zinc-500" />
              <span className="data-label">Date Added</span>
            </div>
            <div className="font-mono text-white">{formatDate(sheet.date_added)}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <Button
            onClick={() => onNavigate(sheet)}
            className="w-full btn-primary h-10"
            data-testid="navigate-to-sheet-btn"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate to This Sheet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SheetDetails;
