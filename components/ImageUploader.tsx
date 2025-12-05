import React, { useRef } from 'react';
import { Upload, FolderInput, X, Image as ImageIcon } from 'lucide-react';
import { SourceImage } from '../types';

interface ImageUploaderProps {
  images: SourceImage[];
  onImagesChange: (images: SourceImage[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newImages: SourceImage[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          id: crypto.randomUUID(),
        });
      }
    });

    // Append to existing, sort by name to ensure sequence is correct (critical for lenticular)
    const combined = [...images, ...newImages].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    
    onImagesChange(combined);
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const clearAll = () => {
    onImagesChange([]);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-base font-medium"
        >
          <Upload size={18} />
          选择图片
        </button>
        <button
          onClick={() => folderInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-base font-medium"
        >
          <FolderInput size={18} />
          选择文件夹
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => processFiles(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={(e) => processFiles(e.target.files)}
        // @ts-ignore - directory attributes are non-standard but supported
        webkitdirectory=""
        directory=""
        className="hidden"
      />

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-400 font-bold tracking-wide">
          图片序列 ({images.length})
        </span>
        {images.length > 0 && (
          <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-300">
            清空所有
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 border border-gray-800 rounded-lg bg-gray-900/30 p-2 space-y-2">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
            <ImageIcon size={48} className="opacity-20" />
            <p className="text-base font-medium">暂无图片</p>
            <p className="text-sm text-center opacity-60 px-4 leading-relaxed">
              请上传一组序列图。<br/>文件将按名称自动排序。
            </p>
          </div>
        ) : (
          images.map((img, index) => (
            <div
              key={img.id}
              className="group flex items-center gap-3 bg-gray-800/50 p-3 rounded border border-transparent hover:border-gray-600 transition-all"
            >
              <span className="text-sm font-mono text-gray-500 w-6 flex-shrink-0">
                {index + 1}.
              </span>
              <img
                src={img.url}
                alt={img.name}
                className="w-12 h-12 object-cover rounded bg-black"
              />
              <span className="text-sm text-gray-300 truncate flex-1" title={img.name}>
                {img.name}
              </span>
              <button
                onClick={() => removeImage(img.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};