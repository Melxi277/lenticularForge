import React from 'react';
import { Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Layers className="text-blue-500 w-7 h-7" />
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            光栅工坊 (LenticularForge)
          </h1>
        </div>
      </div>
      <div className="text-sm text-gray-500 font-mono">
        v1.0.0
      </div>
    </header>
  );
};