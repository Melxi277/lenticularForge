import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LenticularSettings, SourceImage } from '../types';
import { Download, Loader2, ZoomIn, AlertTriangle } from 'lucide-react';

interface CanvasGeneratorProps {
  images: SourceImage[];
  settings: LenticularSettings;
}

export const CanvasGenerator: React.FC<CanvasGeneratorProps> = ({ images, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (images.length === 0 || !canvasRef.current) return;
    
    setIsGenerating(true);
    setDownloadUrl(null);
    setError(null);

    try {
      // Small timeout to allow UI to update to "Generating..." state
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!ctx) throw new Error('无法获取 Canvas 上下文');

      const widthPx = Math.ceil(settings.widthInches * settings.dpi);
      const heightPx = Math.ceil(settings.heightInches * settings.dpi);

      // Validate dimensions
      if (widthPx > 16000 || heightPx > 16000) {
        throw new Error(`尺寸过大 (${widthPx}x${heightPx})。最大支持约 16000px。请降低 DPI 或尺寸。`);
      }

      canvas.width = widthPx;
      canvas.height = heightPx;

      // Clear
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, widthPx, heightPx);

      // Load all images
      const loadedImages = await Promise.all(
        images.map(src => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`无法加载图片: ${src.name}`));
            img.src = src.url;
          });
        })
      );

      // Calculate lenticular parameters
      const numImages = loadedImages.length;
      const lensPitchPx = settings.dpi / settings.lpi; // Width of one lens in pixels
      const stripWidthPx = lensPitchPx / numImages; // Width of one image slice

      // To improve performance, we can draw offscreen resize of images first
      const offscreenCanvas = new OffscreenCanvas(widthPx, heightPx);
      const offCtx = offscreenCanvas.getContext('2d');
      if (!offCtx) throw new Error("浏览器不支持 Offscreen Canvas");
      
      const scaledImages: ImageBitmap[] = [];

      for (const img of loadedImages) {
        // Draw image to full size on offscreen canvas
        offCtx.drawImage(img, 0, 0, widthPx, heightPx);
        // Save as bitmap for faster access
        const bitmap = await createImageBitmap(offscreenCanvas);
        scaledImages.push(bitmap);
        // Clear for next
        offCtx.clearRect(0, 0, widthPx, heightPx);
      }

      // Interlacing Logic
      const totalLenses = Math.ceil((settings.orientation === 'vertical' ? widthPx : heightPx) / lensPitchPx);

      if (settings.orientation === 'vertical') {
        // Vertical lenses (Left-Right effect / 3D) -> Vertical strips
        for (let i = 0; i < totalLenses; i++) {
          const lensStartX = i * lensPitchPx;
          
          for (let j = 0; j < numImages; j++) {
             const stripStartX = lensStartX + (j * stripWidthPx);
             
             // The image source is the j-th image
             const img = scaledImages[j];
             
             // Draw Vertical Strip
             ctx.drawImage(
               img,
               stripStartX, 0, stripWidthPx, heightPx, // Source: x, y, w, h
               stripStartX, 0, stripWidthPx, heightPx  // Dest: x, y, w, h
             );
          }
        }
      } else {
        // Horizontal lenses (Top-Down effect / Flip) -> Horizontal strips
        for (let i = 0; i < totalLenses; i++) {
          const lensStartY = i * lensPitchPx;
          
          for (let j = 0; j < numImages; j++) {
             const stripStartY = lensStartY + (j * stripWidthPx);
             const img = scaledImages[j];
             
             // Draw Horizontal Strip
             ctx.drawImage(
               img,
               0, stripStartY, widthPx, stripWidthPx,
               0, stripStartY, widthPx, stripWidthPx
             );
          }
        }
      }

      // Cleanup bitmaps
      scaledImages.forEach(b => b.close());
      
      // Create download blob
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png', 1.0));
      if (blob) {
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }

    } catch (e: any) {
      console.error(e);
      setError(e.message || "生成过程中发生未知错误");
    } finally {
      setIsGenerating(false);
    }
  }, [images, settings]);

  // Cleanup blob urls
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
      {/* Toolbar */}
      <div className="h-16 bg-gray-800/50 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
          预览与导出
        </h2>
        <div className="flex items-center gap-3">
           <button
            onClick={generate}
            disabled={isGenerating || images.length < 2}
            className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold tracking-wide transition-all ${
              isGenerating || images.length < 2
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            {isGenerating ? '处理中...' : '生成光栅图'}
          </button>
          
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`lenticular_${settings.widthInches}x${settings.heightInches}_${settings.lpi}lpi.png`}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-bold tracking-wide transition-all shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-4 h-4" />
              下载 PNG
            </a>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto relative bg-[#121212] p-8 flex items-center justify-center checkered-bg">
        
        {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-3 rounded shadow-lg flex items-center gap-2 text-base">
                <AlertTriangle size={20} />
                {error}
            </div>
        )}

        <div className={`relative shadow-2xl ${isGenerating ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all duration-300`}>
           {/* We scale the canvas visually with CSS to fit the screen, but keep internal resolution high */}
           <canvas
            ref={canvasRef}
            className="max-w-full max-h-[70vh] object-contain bg-white"
            style={{ 
                // Basic responsiveness
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 200px)' 
            }}
           />
           {/* Overlay for empty state */}
           {images.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none">
               <div className="text-center">
                 <ZoomIn className="w-16 h-16 mx-auto mb-4 opacity-20" />
                 <p className="text-lg">请导入图片以开始预览</p>
               </div>
             </div>
           )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="h-10 bg-gray-900 border-t border-gray-800 flex items-center justify-end px-6 text-xs text-gray-500 gap-6">
          <span>
              状态: {isGenerating ? '渲染中...' : downloadUrl ? '就绪' : '等待中'}
          </span>
          {downloadUrl && canvasRef.current && (
              <span>
                  最终尺寸: {canvasRef.current.width} x {canvasRef.current.height} px
              </span>
          )}
      </div>

      <style>{`
        .checkered-bg {
          background-image:
            linear-gradient(45deg, #1f2937 25%, transparent 25%),
            linear-gradient(-45deg, #1f2937 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1f2937 75%),
            linear-gradient(-45deg, transparent 75%, #1f2937 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
};