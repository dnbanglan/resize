import React, { useRef } from 'react';
import { 
  FolderOpen, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Languages, 
  Trash2, 
  Layout, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CanvasDimensions } from '../types/editor';
import { Language, translations } from '../utils/translations';

interface HeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomReset: () => void;
  onOpenImageUpload: () => void;
  onOpenExportModal: () => void;
  onOpenPresetModal: () => void;
  onClearCanvas: () => void;
  currentDimensions: CanvasDimensions;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomReset,
  onOpenImageUpload,
  onOpenExportModal,
  onOpenPresetModal,
  onClearCanvas,
  currentDimensions,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <header className="h-14 bg-[#1b1b1f] border-b border-[#2d2d34] px-3 sm:px-4 flex items-center justify-between select-none z-30 shrink-0 text-gray-200">
      {/* Left section: App Brand & Primary File Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PS Pro Brand Badge */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#34343d]">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md text-xs tracking-wider">
            Ps
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide leading-tight">
              Photoshop Pro
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">v1.0 MVP</span>
          </div>
        </div>

        {/* Open Image Button */}
        <button
          onClick={onOpenImageUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2a2a32] hover:bg-[#34343e] text-white rounded-lg border border-[#3e3e4a] transition cursor-pointer"
          title="ছবি আপলোড করুন (JPG, PNG, WebP)"
        >
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">{t.openImage}</span>
        </button>

        {/* Canvas Size Preset Button */}
        <button
          onClick={onOpenPresetModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-[#24242c] hover:bg-[#2e2e38] text-gray-300 rounded-lg border border-[#383844] transition cursor-pointer"
          title="ক্যানভাস সাইজ পরিবর্তন করুন"
        >
          <Layout className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline text-[11px] font-mono">
            {currentDimensions.width}×{currentDimensions.height}
          </span>
          <span className="lg:hidden text-[11px] font-medium">সাইজ</span>
        </button>

        <div className="h-5 w-px bg-[#32323b] mx-0.5 hidden sm:block" />

        {/* Undo & Redo */}
        <div className="flex items-center bg-[#24242c] rounded-lg border border-[#383844] p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition"
            title={t.undo}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[#3a3a46]" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition"
            title={t.redo}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Section: Zoom Controls */}
      <div className="flex items-center bg-[#24242c] rounded-lg border border-[#383844] p-1 gap-1">
        <button
          onClick={onZoomOut}
          className="p-1 rounded hover:bg-white/10 text-gray-300 transition"
          title={t.zoomOut}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onZoomReset}
          className="px-1.5 py-0.5 text-[11px] font-mono text-indigo-300 hover:text-white rounded hover:bg-white/10 min-w-11 text-center"
          title={t.resetZoom}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={onZoomIn}
          className="p-1 rounded hover:bg-white/10 text-gray-300 transition"
          title={t.zoomIn}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-[#3a3a46] mx-0.5 hidden sm:block" />

        <button
          onClick={onZoomFit}
          className="p-1 rounded hover:bg-white/10 text-gray-300 transition hidden sm:block"
          title={t.fitScreen}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Section: Language, Clear & Export */}
      <div className="flex items-center gap-2">
        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="px-2 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-[#24242c] hover:bg-[#2f2f3a] rounded-lg border border-[#383844] transition flex items-center gap-1.5"
          title="ভাষা পরিবর্তন করুন"
        >
          <Languages className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{lang === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/30 transition"
          title={t.clearCanvas}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Save / Export Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm shadow-indigo-600/30 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t.export}</span>
        </button>
      </div>
    </header>
  );
};
