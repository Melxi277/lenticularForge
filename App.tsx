import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { CanvasGenerator } from './components/CanvasGenerator';
import { LenticularSettings, SourceImage } from './types';

const App: React.FC = () => {
  const [images, setImages] = useState<SourceImage[]>([]);
  const [settings, setSettings] = useState<LenticularSettings>({
    lpi: 60,
    widthInches: 4,
    heightInches: 6,
    dpi: 300,
    orientation: 'vertical',
  });

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200 font-sans">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[340px] bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 z-10">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                1. 图片来源 (Sources)
              </h2>
              <div className="h-72">
                 <ImageUploader images={images} onImagesChange={setImages} />
              </div>
            </section>

            <section className="border-t border-gray-800 pt-8">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                2. 参数配置 (Configuration)
              </h2>
              <ControlPanel settings={settings} onSettingsChange={setSettings} />
            </section>
            
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 p-6 bg-gray-950 overflow-hidden flex flex-col">
            <CanvasGenerator images={images} settings={settings} />
        </section>
      </main>
    </div>
  );
};

export default App;