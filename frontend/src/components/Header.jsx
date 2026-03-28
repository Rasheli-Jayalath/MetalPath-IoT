import React from 'react';
import { Boxes, Zap, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const Header = ({ onGenerateData, loading, hasData }) => {
  return (
    <header 
      className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30"
      data-testid="app-header"
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded flex items-center justify-center">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-black tracking-tight">
              MetalPath<span className="text-cyan-400">IoT</span>
            </h1>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Warehouse Sheet Locator & Navigation System
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Zap className="w-3 h-3 text-green-500" />
            <span>System Online</span>
          </div>
          
          <Button
            onClick={onGenerateData}
            disabled={loading}
            className={`btn-primary h-9 ${loading ? 'opacity-50' : ''}`}
            data-testid="generate-data-btn"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {hasData ? 'Regenerate Data' : 'Generate Synthetic Data'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
