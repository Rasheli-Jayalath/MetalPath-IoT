import React from 'react';
import { Boxes, Zap, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const Header = ({ onGenerateData, loading, hasData }) => {
  return (
    <header
      className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-md sticky top-0 z-30"
      data-testid="app-header"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Boxes className="h-6 w-6 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="font-heading truncate text-lg font-black tracking-tight sm:text-xl">
              MetalPath<span className="text-cyan-400">IoT</span>
            </h1>
            <p className="hidden text-xs text-zinc-500 sm:block md:text-sm">
              Warehouse Sheet Locator & Navigation System
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-green-500" />
            <span className="font-mono">System Online</span>
          </div>

          <Button
            onClick={onGenerateData}
            disabled={loading}
            className={`btn-primary min-h-[44px] px-4 ${loading ? 'opacity-50' : ''}`}
            data-testid="generate-data-btn"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {hasData ? 'Regenerate Data' : 'Generate Synthetic Data'}
            </span>
            <span className="sm:hidden">
              {hasData ? 'Regenerate' : 'Generate'}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;