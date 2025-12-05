import React from 'react';
import { LenticularSettings } from '../types';
import { Ruler, Printer, ScanLine, ArrowDownUp, ArrowLeftRight } from 'lucide-react';

interface ControlPanelProps {
  settings: LenticularSettings;
  onSettingsChange: (settings: LenticularSettings) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange }) => {
  const handleChange = (key: keyof LenticularSettings, value: string | number) => {
    onSettingsChange({
      ...settings,
      [key]: typeof value === 'string' && key !== 'orientation' ? parseFloat(value) || 0 : value,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h3 className="text-base text-gray-400 font-bold tracking-wide flex items-center gap-2">
          <ScanLine size={18} />
          光栅参数 (Lens Settings)
        </h3>
        
        <div>
          <label className="block text-sm text-gray-300 mb-2">光栅线数 (LPI)</label>
          <input
            type="number"
            value={settings.lpi}
            onChange={(e) => handleChange('lpi', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors text-white"
            placeholder="例如: 40, 60, 75"
          />
          <p className="text-xs text-gray-500 mt-2">
            常用数值: 40, 50, 60, 62, 75, 100
          </p>
        </div>

        <div>
           <label className="block text-sm text-gray-300 mb-2">光栅方向</label>
           <div className="grid grid-cols-2 gap-3">
             <button
                onClick={() => handleChange('orientation', 'vertical')}
                className={`flex flex-col items-center justify-center gap-2 py-3 px-3 rounded border text-sm font-medium transition-colors ${
                  settings.orientation === 'vertical' 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
             >
               <ArrowLeftRight size={20} />
               <span>竖向 (3D 立体)</span>
             </button>
             <button
                onClick={() => handleChange('orientation', 'horizontal')}
                className={`flex flex-col items-center justify-center gap-2 py-3 px-3 rounded border text-sm font-medium transition-colors ${
                  settings.orientation === 'horizontal' 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
             >
               <ArrowDownUp size={20} />
               <span>横向 (翻转/变画)</span>
             </button>
           </div>
        </div>
      </div>

      <div className="space-y-5 pt-6 border-t border-gray-800">
        <h3 className="text-base text-gray-400 font-bold tracking-wide flex items-center gap-2">
          <Printer size={18} />
          打印规格 (Print Specs)
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">打印宽度 (英寸)</label>
            <div className="relative">
              <input
                type="number"
                value={settings.widthInches}
                onChange={(e) => handleChange('widthInches', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors text-white pl-10"
              />
              <Ruler className="absolute left-3 top-3.5 text-gray-600 w-5 h-5" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">打印高度 (英寸)</label>
            <div className="relative">
              <input
                type="number"
                value={settings.heightInches}
                onChange={(e) => handleChange('heightInches', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors text-white pl-10"
              />
              <Ruler className="absolute left-3 top-3.5 text-gray-600 w-5 h-5 rotate-90" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">输出分辨率 (DPI)</label>
          <input
            type="number"
            value={settings.dpi}
            onChange={(e) => handleChange('dpi', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors text-white"
            placeholder="例如: 300, 600"
          />
          <p className="text-xs text-gray-500 mt-2">
            DPI越高文件越大。标准打印建议300，高质量建议600+。
          </p>
        </div>

        <div className="bg-gray-800/50 p-4 rounded border border-gray-800 mt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">输出信息摘要</h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400">
            <span>像素尺寸:</span>
            <span className="text-right font-mono text-blue-300">
              {Math.round(settings.widthInches * settings.dpi)} x {Math.round(settings.heightInches * settings.dpi)} px
            </span>
            <span>光栅节距 (Pitch):</span>
            <span className="text-right font-mono text-blue-300">
              {(settings.dpi / settings.lpi).toFixed(4)} px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};