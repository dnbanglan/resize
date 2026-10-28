import React from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline, 
  FlipHorizontal, 
  FlipVertical, 
  Sun, 
  Contrast, 
  Droplet, 
  Sparkles, 
  RotateCw, 
  Maximize, 
  Palette,
  Crosshair,
  Sliders,
  Type,
  ImageIcon
} from 'lucide-react';
import { AVAILABLE_FONTS } from '../utils/fonts';
import { Language, translations } from '../utils/translations';
import { CanvasDimensions, ImageFilters } from '../types/editor';

interface PropertiesPanelProps {
  activeObject: any | null;
  onUpdateTransform: (key: string, value: any) => void;
  onUpdateTextProps: (key: string, value: any) => void;
  onUpdateShapeProps: (key: string, value: any) => void;
  onUpdateImageFilters: (filters: Partial<ImageFilters>) => void;
  onResetImageFilters: () => void;
  currentFilters: ImageFilters;
  canvasBgColor: string;
  onChangeCanvasBg: (color: string) => void;
  canvasDimensions: CanvasDimensions;
  onCenterObject: (axis: 'both' | 'h' | 'v') => void;
  lang: Language;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeObject,
  onUpdateTransform,
  onUpdateTextProps,
  onUpdateShapeProps,
  onUpdateImageFilters,
  onResetImageFilters,
  currentFilters,
  canvasBgColor,
  onChangeCanvasBg,
  canvasDimensions,
  onCenterObject,
  lang,
}) => {
  const t = translations[lang];

  if (!activeObject) {
    // Canvas Level Properties
    return (
      <div className="p-4 space-y-4 text-xs text-gray-300">
        <div>
          <span className="font-semibold text-white block mb-1">ক্যানভাস সেটিংস (Canvas)</span>
          <p className="text-[11px] text-gray-400">
            সাইজ: <span className="font-mono text-indigo-300">{canvasDimensions.width} × {canvasDimensions.height} px</span>
          </p>
        </div>

        <div className="bg-[#18181e] p-3 rounded-lg border border-[#2c2c34] space-y-2.5">
          <label className="font-medium text-gray-300 block">ক্যানভাস ব্যাকগ্রাউন্ড রঙ</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={canvasBgColor === 'transparent' ? '#ffffff' : canvasBgColor}
              onChange={(e) => onChangeCanvasBg(e.target.value)}
              className="w-8 h-8 rounded border border-[#3e3e48] cursor-pointer bg-transparent"
            />
            <span className="font-mono text-gray-400 uppercase text-[11px]">{canvasBgColor}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => onChangeCanvasBg('#ffffff')}
              className="py-1 px-1.5 bg-white text-black font-semibold rounded text-[10px] text-center border border-gray-400"
            >
              সাদা
            </button>
            <button
              onClick={() => onChangeCanvasBg('#18181b')}
              className="py-1 px-1.5 bg-[#18181b] text-white font-semibold rounded text-[10px] text-center border border-[#3e3e48]"
            >
              ডার্ক
            </button>
            <button
              onClick={() => onChangeCanvasBg('#000000')}
              className="py-1 px-1.5 bg-black text-white font-semibold rounded text-[10px] text-center border border-[#3e3e48]"
            >
              কালো
            </button>
            <button
              onClick={() => onChangeCanvasBg('transparent')}
              className="py-1 px-1.5 bg-[#25252b] text-indigo-300 font-semibold rounded text-[10px] text-center border border-[#3e3e48]"
            >
              স্বচ্ছ
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#18181e] rounded-lg border border-[#2c2c34] text-[11px] text-gray-400 leading-relaxed">
          💡 <span className="text-gray-200 font-medium">টিপস:</span> ক্যানভাসে যেকোনো অবজেক্ট ক্লিক করলে বা বাম পাশের টুলবার থেকে ছবি, বাংলা টেক্সট বা শেপ যুক্ত করলে এর বিস্তারিত বৈশিষ্ট্য এখানে প্রদর্শিত হবে।
        </div>
      </div>
    );
  }

  const objType = activeObject.type;
  const isText = objType === 'textbox' || objType === 'i-text' || objType === 'text';
  const isImage = objType === 'image';
  const isRect = objType === 'rect';

  // Extract transform values
  const posX = Math.round(activeObject.left || 0);
  const posY = Math.round(activeObject.top || 0);
  const width = Math.round((activeObject.width || 0) * (activeObject.scaleX || 1));
  const height = Math.round((activeObject.height || 0) * (activeObject.scaleY || 1));
  const angle = Math.round(activeObject.angle || 0);
  const opacity = Math.round((activeObject.opacity ?? 1) * 100);

  return (
    <div className="p-3.5 space-y-4 text-xs text-gray-200 overflow-y-auto">
      {/* 1. Transform Section */}
      <div className="space-y-2 bg-[#18181e] p-3 rounded-lg border border-[#2c2c34]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white tracking-wide">{t.transform}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCenterObject('h')}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              title="মাঝখানে অনুভূমিকভাবে আনুন"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateTransform('flipX', !activeObject.flipX)}
              className={`p-1 rounded hover:bg-white/10 transition ${
                activeObject.flipX ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400'
              }`}
              title={t.flipH}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateTransform('flipY', !activeObject.flipY)}
              className={`p-1 rounded hover:bg-white/10 transition ${
                activeObject.flipY ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400'
              }`}
              title={t.flipV}
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Position & Dimensions Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="text-gray-400 block mb-0.5">X (px)</label>
            <input
              type="number"
              value={posX}
              onChange={(e) => onUpdateTransform('left', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-[#24242c] border border-[#383844] rounded text-white font-mono outline-hidden"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-0.5">Y (px)</label>
            <input
              type="number"
              value={posY}
              onChange={(e) => onUpdateTransform('top', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-[#24242c] border border-[#383844] rounded text-white font-mono outline-hidden"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-0.5">{t.width} (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 10;
                const scale = val / (activeObject.width || 1);
                onUpdateTransform('scaleX', scale);
              }}
              className="w-full px-2 py-1 bg-[#24242c] border border-[#383844] rounded text-white font-mono outline-hidden"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-0.5">{t.height} (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 10;
                const scale = val / (activeObject.height || 1);
                onUpdateTransform('scaleY', scale);
              }}
              className="w-full px-2 py-1 bg-[#24242c] border border-[#383844] rounded text-white font-mono outline-hidden"
            />
          </div>
        </div>

        {/* Angle & Opacity */}
        <div className="space-y-2 pt-1 border-t border-[#26262e]">
          <div>
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>{t.rotation}</span>
              <span className="font-mono text-indigo-300">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => onUpdateTransform('angle', parseInt(e.target.value))}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>{t.opacity}</span>
              <span className="font-mono text-indigo-300">{opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => onUpdateTransform('opacity', parseInt(e.target.value) / 100)}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Text Properties Section */}
      {isText && (
        <div className="space-y-3 bg-[#18181e] p-3 rounded-lg border border-[#2c2c34]">
          <span className="font-semibold text-white tracking-wide block">টেক্সট ও ফন্ট ফরম্যাটিং</span>

          {/* Text Input Content */}
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">{t.textContent}</label>
            <textarea
              rows={2}
              value={activeObject.text || ''}
              onChange={(e) => onUpdateTextProps('text', e.target.value)}
              className="w-full p-2 bg-[#24242c] border border-[#383844] rounded text-white text-xs outline-hidden focus:border-indigo-500 font-sans"
              placeholder="বাংলা বা ইংরেজি টেক্সট লিখুন..."
            />
          </div>

          {/* Font Family Selector (Bengali & English categorized) */}
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">{t.fontFamily}</label>
            <select
              value={activeObject.fontFamily || 'Hind Siliguri'}
              onChange={(e) => onUpdateTextProps('fontFamily', e.target.value)}
              className="w-full p-1.5 bg-[#24242c] border border-[#383844] rounded text-xs text-white outline-hidden focus:border-indigo-500"
            >
              <optgroup label="বাংলা ফন্টসমূহ (Bengali Fonts)">
                {AVAILABLE_FONTS.filter(f => f.category === 'bengali').map(f => (
                  <option key={f.id} value={f.family}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="ইংরেজি ও অন্যান্য (English & Display)">
                {AVAILABLE_FONTS.filter(f => f.category !== 'bengali').map(f => (
                  <option key={f.id} value={f.family}>{f.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Font Size & Styling */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[11px] text-gray-400 block mb-0.5">{t.fontSize}</label>
              <input
                type="number"
                min="8"
                max="300"
                value={Math.round(activeObject.fontSize || 32)}
                onChange={(e) => onUpdateTextProps('fontSize', parseInt(e.target.value) || 24)}
                className="w-full px-2 py-1 bg-[#24242c] border border-[#383844] rounded text-xs text-white font-mono outline-hidden"
              />
            </div>

            {/* Bold, Italic, Underline */}
            <div className="flex items-end gap-1">
              <button
                onClick={() => onUpdateTextProps('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-1.5 rounded border ${
                  activeObject.fontWeight === 'bold' 
                    ? 'bg-indigo-600/40 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-400 hover:text-white'
                }`}
                title={t.bold}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateTextProps('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`p-1.5 rounded border ${
                  activeObject.fontStyle === 'italic' 
                    ? 'bg-indigo-600/40 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-400 hover:text-white'
                }`}
                title={t.italic}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateTextProps('underline', !activeObject.underline)}
                className={`p-1.5 rounded border ${
                  activeObject.underline 
                    ? 'bg-indigo-600/40 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-400 hover:text-white'
                }`}
                title={t.underline}
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">{t.textAlignment}</label>
            <div className="flex rounded-md bg-[#24242c] border border-[#383844] p-0.5">
              <button
                onClick={() => onUpdateTextProps('textAlign', 'left')}
                className={`flex-1 py-1 flex justify-center rounded transition ${
                  activeObject.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateTextProps('textAlign', 'center')}
                className={`flex-1 py-1 flex justify-center rounded transition ${
                  activeObject.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateTextProps('textAlign', 'right')}
                className={`flex-1 py-1 flex justify-center rounded transition ${
                  activeObject.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Colors: Text & Background */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">{t.textColor}</label>
              <div className="flex items-center gap-1.5 bg-[#24242c] border border-[#383844] p-1 rounded">
                <input
                  type="color"
                  value={activeObject.fill || '#ffffff'}
                  onChange={(e) => onUpdateTextProps('fill', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-gray-300 uppercase truncate">
                  {activeObject.fill || '#fff'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">{t.textBgColor}</label>
              <div className="flex items-center gap-1.5 bg-[#24242c] border border-[#383844] p-1 rounded">
                <input
                  type="color"
                  value={activeObject.backgroundColor || '#000000'}
                  onChange={(e) => onUpdateTextProps('backgroundColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <button
                  type="button"
                  onClick={() => onUpdateTextProps('backgroundColor', '')}
                  className="text-[9px] text-rose-300 hover:underline"
                >
                  বাদ
                </button>
              </div>
            </div>
          </div>

          {/* Outline / Stroke */}
          <div className="pt-2 border-t border-[#26262e] space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-300 block">{t.textOutline}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeObject.stroke || '#000000'}
                onChange={(e) => onUpdateTextProps('stroke', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border border-[#3e3e48]"
              />
              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={activeObject.strokeWidth || 0}
                  onChange={(e) => onUpdateTextProps('strokeWidth', parseInt(e.target.value))}
                  className="flex-1 h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono w-4">{activeObject.strokeWidth || 0}</span>
              </div>
            </div>
          </div>

          {/* Text Shadow */}
          <div className="pt-2 border-t border-[#26262e] space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-300 block">{t.textShadow}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateTextProps('shadow', {
                    color: 'rgba(0,0,0,0.8)',
                    blur: 10,
                    offsetX: 4,
                    offsetY: 4
                  });
                }}
                className="py-1 px-2 bg-[#25252c] hover:bg-[#303038] text-[10px] rounded border border-[#383844] text-center"
              >
                + ড্রপ শ্যাডো
              </button>
              <button
                type="button"
                onClick={() => onUpdateTextProps('shadow', null)}
                className="py-1 px-2 bg-[#25252c] hover:bg-rose-500/20 text-rose-300 text-[10px] rounded border border-[#383844] text-center"
              >
                শ্যাডো বাদ দিন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Image Filters Section */}
      {isImage && (
        <div className="space-y-3 bg-[#18181e] p-3 rounded-lg border border-[#2c2c34]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white tracking-wide">{t.filters}</span>
            <button
              onClick={onResetImageFilters}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              {t.resetFilters}
            </button>
          </div>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> {t.brightness}</span>
              <span className="font-mono text-indigo-300">{Math.round(currentFilters.brightness * 100)}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={currentFilters.brightness}
              onChange={(e) => onUpdateImageFilters({ brightness: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><Contrast className="w-3 h-3 text-cyan-400" /> {t.contrast}</span>
              <span className="font-mono text-indigo-300">{Math.round(currentFilters.contrast * 100)}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={currentFilters.contrast}
              onChange={(e) => onUpdateImageFilters({ contrast: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><Droplet className="w-3 h-3 text-rose-400" /> {t.saturation}</span>
              <span className="font-mono text-indigo-300">{Math.round(currentFilters.saturation * 100)}</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={currentFilters.saturation}
              onChange={(e) => onUpdateImageFilters({ saturation: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Blur */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{t.blur}</span>
              <span className="font-mono text-indigo-300">{Math.round(currentFilters.blur * 100)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={currentFilters.blur}
              onChange={(e) => onUpdateImageFilters({ blur: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Hue Rotation */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{t.hue}</span>
              <span className="font-mono text-indigo-300">{Math.round(currentFilters.hue * 180)}°</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={currentFilters.hue}
              onChange={(e) => onUpdateImageFilters({ hue: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* One-click Presets */}
          <div className="pt-2 border-t border-[#26262e] space-y-1.5">
            <span className="text-[10px] font-semibold uppercase text-gray-400 block">{t.quickFilters}</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateImageFilters({ grayscale: !currentFilters.grayscale })}
                className={`py-1 px-2 rounded text-[10px] border transition ${
                  currentFilters.grayscale 
                    ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-300 hover:bg-[#2d2d36]'
                }`}
              >
                {t.grayscale}
              </button>
              <button
                type="button"
                onClick={() => onUpdateImageFilters({ sepia: !currentFilters.sepia })}
                className={`py-1 px-2 rounded text-[10px] border transition ${
                  currentFilters.sepia 
                    ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-300 hover:bg-[#2d2d36]'
                }`}
              >
                {t.sepia}
              </button>
              <button
                type="button"
                onClick={() => onUpdateImageFilters({ vintage: !currentFilters.vintage })}
                className={`py-1 px-2 rounded text-[10px] border transition ${
                  currentFilters.vintage 
                    ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-300 hover:bg-[#2d2d36]'
                }`}
              >
                {t.vintage}
              </button>
              <button
                type="button"
                onClick={() => onUpdateImageFilters({ invert: !currentFilters.invert })}
                className={`py-1 px-2 rounded text-[10px] border transition ${
                  currentFilters.invert 
                    ? 'bg-indigo-600/30 border-indigo-500 text-white' 
                    : 'bg-[#24242c] border-[#383844] text-gray-300 hover:bg-[#2d2d36]'
                }`}
              >
                {t.invert}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Shape Fill & Stroke Section */}
      {!isImage && !isText && (
        <div className="space-y-3 bg-[#18181e] p-3 rounded-lg border border-[#2c2c34]">
          <span className="font-semibold text-white tracking-wide block">শেপ কালার ও বর্ডার</span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">{t.fillColor}</label>
              <div className="flex items-center gap-1.5 bg-[#24242c] border border-[#383844] p-1 rounded">
                <input
                  type="color"
                  value={activeObject.fill || '#3b82f6'}
                  onChange={(e) => onUpdateShapeProps('fill', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-gray-300 uppercase truncate">
                  {activeObject.fill || '#3b82f6'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">{t.borderColor}</label>
              <div className="flex items-center gap-1.5 bg-[#24242c] border border-[#383844] p-1 rounded">
                <input
                  type="color"
                  value={activeObject.stroke || '#ffffff'}
                  onChange={(e) => onUpdateShapeProps('stroke', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-gray-300 uppercase truncate">
                  {activeObject.stroke || '#fff'}
                </span>
              </div>
            </div>
          </div>

          {/* Border Width */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{t.borderWidth}</span>
              <span className="font-mono text-indigo-300">{activeObject.strokeWidth || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={activeObject.strokeWidth || 0}
              onChange={(e) => onUpdateShapeProps('strokeWidth', parseInt(e.target.value))}
              className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Corner radius for rectangles */}
          {isRect && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{t.cornerRadius}</span>
                <span className="font-mono text-indigo-300">{activeObject.rx || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeObject.rx || 0}
                onChange={(e) => {
                  const r = parseInt(e.target.value);
                  onUpdateShapeProps('rx', r);
                  onUpdateShapeProps('ry', r);
                }}
                className="w-full h-1 bg-[#32323b] rounded accent-indigo-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
