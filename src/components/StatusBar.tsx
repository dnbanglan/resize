import React from 'react';
import { Layers, ZoomIn, Info, CheckCircle2 } from 'lucide-react';
import { CanvasDimensions } from '../types/editor';
import { Language, translations } from '../utils/translations';

interface StatusBarProps {
  dimensions: CanvasDimensions;
  zoom: number;
  activeLayerName: string | null;
  totalLayers: number;
  lang: Language;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  dimensions,
  zoom,
  activeLayerName,
  totalLayers,
  lang,
}) => {
  const t = translations[lang];

  return (
    <footer className="h-7 bg-[#161619] border-t border-[#26262c] px-3 flex items-center justify-between text-[11px] text-gray-400 select-none shrink-0 z-30">
      {/* Left: Canvas Size & Megapixels */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-gray-300 font-medium">
            {dimensions.width} × {dimensions.height} px
          </span>
          <span className="text-gray-500">
            ({((dimensions.width * dimensions.height) / 1000000).toFixed(1)} MP)
          </span>
        </span>

        <span className="hidden sm:inline text-gray-600">|</span>

        {/* Active Layer Info */}
        <span className="hidden sm:flex items-center gap-1">
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>{t.activeLayer}:</span>
          <span className="text-indigo-300 font-medium truncate max-w-44">
            {activeLayerName || t.none}
          </span>
        </span>
      </div>

      {/* Right: Zoom Level & Tips */}
      <div className="flex items-center gap-3 font-mono">
        <span className="text-gray-500 hidden md:inline font-sans">
          স্পেস কী চেপে ড্র্যাগ করে প্যান করুন
        </span>

        <span className="hidden md:inline text-gray-600">|</span>

        <span className="flex items-center gap-1 text-gray-300">
          <ZoomIn className="w-3 h-3 text-cyan-400" />
          <span>{Math.round(zoom * 100)}%</span>
        </span>
      </div>
    </footer>
  );
};
