import React, { useState } from 'react';
import { 
  MousePointer, 
  Crop, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Minus, 
  ArrowRight, 
  Paintbrush, 
  ChevronRight,
  Flame,
  Layers,
  Sparkles
} from 'lucide-react';
import { ToolType } from '../types/editor';
import { Language, translations } from '../utils/translations';

interface ToolboxProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddText: (presetText?: string, isHeadline?: boolean) => void;
  onOpenImageUpload: () => void;
  onAddShape: (type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow' | 'badge') => void;
  onStartCrop: () => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  lang: Language;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  activeTool,
  onSelectTool,
  onAddText,
  onOpenImageUpload,
  onAddShape,
  onStartCrop,
  isDrawingMode,
  onToggleDrawingMode,
  lang,
}) => {
  const t = translations[lang];
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showTextMenu, setShowTextMenu] = useState(false);

  return (
    <aside className="w-14 bg-[#1b1b1f] border-r border-[#2d2d34] flex flex-col items-center py-2.5 gap-1.5 z-20 shrink-0 text-gray-300">
      {/* 1. Select / Move Tool */}
      <button
        onClick={() => {
          if (isDrawingMode) onToggleDrawingMode();
          onSelectTool('select');
        }}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition group relative ${
          activeTool === 'select' && !isDrawingMode
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'hover:bg-[#282830] text-gray-400 hover:text-white'
        }`}
        title={t.toolSelect}
      >
        <MousePointer className="w-5 h-5" />
        <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          {t.toolSelect}
        </span>
      </button>

      {/* 2. Crop Tool */}
      <button
        onClick={() => {
          if (isDrawingMode) onToggleDrawingMode();
          onStartCrop();
        }}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition group relative ${
          activeTool === 'crop'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'hover:bg-[#282830] text-gray-400 hover:text-white'
        }`}
        title={t.toolCrop}
      >
        <Crop className="w-5 h-5" />
        <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          {t.toolCrop}
        </span>
      </button>

      {/* 3. Text Tool (with flyout for quick Bengali headlines) */}
      <div className="relative group">
        <button
          onClick={() => {
            if (isDrawingMode) onToggleDrawingMode();
            onAddText();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowTextMenu(!showTextMenu);
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center transition hover:bg-[#282830] text-gray-400 hover:text-white relative"
          title={t.toolText}
        >
          <Type className="w-5 h-5 text-indigo-300" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
        </button>

        {/* Hover / Tooltip label */}
        <span className="absolute left-14 top-2 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          {t.toolText}
        </span>
      </div>

      {/* 4. Add Image Tool */}
      <button
        onClick={onOpenImageUpload}
        className="w-10 h-10 rounded-lg flex items-center justify-center transition group relative hover:bg-[#282830] text-gray-400 hover:text-white"
        title={t.toolImage}
      >
        <ImageIcon className="w-5 h-5 text-cyan-300" />
        <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          {t.toolImage}
        </span>
      </button>

      {/* 5. Shapes Tool with dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowShapeMenu(!showShapeMenu)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition group relative ${
            showShapeMenu ? 'bg-[#30303a] text-white' : 'hover:bg-[#282830] text-gray-400 hover:text-white'
          }`}
          title={t.toolShapes}
        >
          <Square className="w-5 h-5 text-emerald-400" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
            {t.toolShapes}
          </span>
        </button>

        {/* Shapes Menu Flyout */}
        {showShapeMenu && (
          <div 
            className="absolute left-12 top-0 w-44 bg-[#232328] border border-[#3e3e48] rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs"
            onMouseLeave={() => setShowShapeMenu(false)}
          >
            <span className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1">শেপ যুক্ত করুন</span>
            <button
              onClick={() => { onAddShape('rectangle'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-gray-200 transition text-left"
            >
              <Square className="w-4 h-4 text-emerald-400" />
              <span>{t.toolRect}</span>
            </button>
            <button
              onClick={() => { onAddShape('circle'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-gray-200 transition text-left"
            >
              <Circle className="w-4 h-4 text-sky-400" />
              <span>{t.toolCircle}</span>
            </button>
            <button
              onClick={() => { onAddShape('triangle'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-gray-200 transition text-left"
            >
              <Triangle className="w-4 h-4 text-amber-400" />
              <span>{t.toolTriangle}</span>
            </button>
            <button
              onClick={() => { onAddShape('star'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-gray-200 transition text-left"
            >
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{t.toolStar}</span>
            </button>
            <button
              onClick={() => { onAddShape('line'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-gray-200 transition text-left"
            >
              <Minus className="w-4 h-4 text-purple-400" />
              <span>{t.toolLine}</span>
            </button>
            <button
              onClick={() => { onAddShape('arrow'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-gray-200 transition text-left"
            >
              <ArrowRight className="w-4 h-4 text-rose-400" />
              <span>{t.toolArrow}</span>
            </button>
            <div className="h-px bg-[#3e3e48] my-1" />
            <button
              onClick={() => { onAddShape('badge'); setShowShapeMenu(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-rose-500/20 text-rose-300 transition text-left font-medium"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>ব্রেকিং নিউজ ব্যাজ</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Brush / Draw Tool */}
      <button
        onClick={onToggleDrawingMode}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition group relative ${
          isDrawingMode
            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
            : 'hover:bg-[#282830] text-gray-400 hover:text-white'
        }`}
        title={t.toolDraw}
      >
        <Paintbrush className="w-5 h-5" />
        <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          {t.toolDraw}
        </span>
      </button>

      <div className="w-8 h-px bg-[#2d2d34] my-1" />

      {/* Quick Bengali text buttons */}
      <button
        onClick={() => onAddText('আজকের সংবাদ', true)}
        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-[#282830] text-gray-300 hover:text-white transition group relative"
        title="বড় বাংলা শিরোনাম যোগ করুন"
      >
        <span className="text-xs font-bold font-['Hind_Siliguri'] text-indigo-400">শীর্ষক</span>
        <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          বড় বাংলা শিরোনাম
        </span>
      </button>

      <button
        onClick={() => onAddText('এখানে বিস্তারিত বিবরণ লিখুন...', false)}
        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center hover:bg-[#282830] text-gray-300 hover:text-white transition group relative"
        title="বাংলা সাবটাইটেল বা বিবরণ"
      >
        <span className="text-[11px] font-medium font-['Noto_Sans_Bengali'] text-emerald-400">বিবরণ</span>
        <span className="absolute left-14 bg-black/90 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-lg">
          বাংলা সাবটাইটেল বা প্যারাগ্রাফ
        </span>
      </button>
    </aside>
  );
};
