import React, { useState, useEffect } from 'react';
import { Download, X, Image as ImageIcon, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { ExportFormat, ExportSettings } from '../types/editor';
import { generateAutoFileName, sanitizeFileName, estimateFileSize, isWebPSupported } from '../utils/exportImage';
import { Language, translations } from '../utils/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings) => Promise<{ success: boolean; error?: string }>;
  defaultWidth: number;
  defaultHeight: number;
  currentBgColor: string;
  lang: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  defaultWidth,
  defaultHeight,
  currentBgColor,
  lang,
}) => {
  const t = translations[lang];

  const [format, setFormat] = useState<ExportFormat>('png');
  const [fileNameInput, setFileNameInput] = useState<string>('');
  const [quality, setQuality] = useState<number>(0.92);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [height, setHeight] = useState<number>(defaultHeight);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [webpSupported, setWebpSupported] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(defaultWidth / defaultHeight);

  // Initialize auto filename on open
  useEffect(() => {
    if (isOpen) {
      const autoName = generateAutoFileName(format);
      // Strip extension for input display
      const baseName = autoName.replace(/\.[^/.]+$/, '');
      setFileNameInput(baseName);
      setWidth(defaultWidth);
      setHeight(defaultHeight);
      setAspectRatio(defaultWidth / defaultHeight);
      
      isWebPSupported().then(supported => setWebpSupported(supported));
    }
  }, [isOpen, defaultWidth, defaultHeight]);

  if (!isOpen) return null;

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect && aspectRatio > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect && aspectRatio > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const finalSanitizedName = sanitizeFileName(fileNameInput || 'photo-design', format);
  const estimatedSize = estimateFileSize(width, height, format, quality);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    const settings: ExportSettings = {
      fileName: fileNameInput,
      format,
      quality,
      width,
      height,
      maintainAspectRatio: maintainAspect,
      transparentBackground: transparentBg && format !== 'jpg',
      backgroundColor: currentBgColor || '#ffffff',
    };

    const res = await onExport(settings);
    setIsExporting(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-[#202024] border border-[#38383f] w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden text-gray-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#323238] bg-[#27272c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                {t.exportModalTitle}
              </h2>
              <p className="text-xs text-gray-400">Photoshop Pro 1.0 High-Res Export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* File Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              {t.fileNameLabel}
            </label>
            <div className="flex rounded-lg overflow-hidden border border-[#3e3e46] focus-within:border-indigo-500 bg-[#18181c]">
              <input
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                placeholder="যেমন: আজকের_সংবাদ অথবা my-photo"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-hidden font-sans placeholder-gray-500"
                autoFocus
              />
              <span className="px-3 py-2 text-xs font-mono text-gray-400 bg-[#25252b] border-l border-[#3e3e46] flex items-center">
                .{format}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
              <span>চূড়ান্ত নাম: <code className="text-indigo-300 font-mono">{finalSanitizedName}</code></span>
              <span className="text-emerald-400 font-medium">{estimatedSize}</span>
            </p>
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              {t.fileFormatLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormat('png');
                  if (transparentBg === undefined) setTransparentBg(false);
                }}
                className={`py-2 px-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-0.5 transition ${
                  format === 'png'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                    : 'bg-[#18181c] border-[#383840] text-gray-300 hover:bg-[#25252b]'
                }`}
              >
                <span className="font-semibold">PNG</span>
                <span className="text-[10px] text-gray-400">লসল্যাস ও স্বচ্ছতা</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormat('jpg');
                  setTransparentBg(false);
                }}
                className={`py-2 px-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-0.5 transition ${
                  format === 'jpg'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                    : 'bg-[#18181c] border-[#383840] text-gray-300 hover:bg-[#25252b]'
                }`}
              >
                <span className="font-semibold">JPG</span>
                <span className="text-[10px] text-gray-400">ছোট ফাইল সাইজ</span>
              </button>

              <button
                type="button"
                disabled={!webpSupported}
                onClick={() => setFormat('webp')}
                className={`py-2 px-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-0.5 transition ${
                  format === 'webp'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                    : 'bg-[#18181c] border-[#383840] text-gray-300 hover:bg-[#25252b]'
                } ${!webpSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="font-semibold">WebP</span>
                <span className="text-[10px] text-gray-400">আধুনিক ওয়েব ফরম্যাট</span>
              </button>
            </div>
          </div>

          {/* Quality slider for JPG / WebP */}
          {format !== 'png' && (
            <div className="bg-[#18181c] p-3 rounded-lg border border-[#383840] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300">{t.qualityLabel}</span>
                <span className="text-indigo-400 font-mono font-medium">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#323238] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>ছোট আকার (Low)</span>
                <span>উচ্চ মান (High Quality)</span>
              </div>
            </div>
          )}

          {/* Transparency Option (PNG and WebP only) */}
          {format !== 'jpg' ? (
            <label className="flex items-center gap-3 p-3 bg-[#18181c] rounded-lg border border-[#383840] cursor-pointer hover:border-gray-500 transition">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="w-4 h-4 rounded-sm border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-[#25252b]"
              />
              <div className="text-xs">
                <span className="font-medium text-white block">{t.transparentBgLabel}</span>
                <span className="text-gray-400 text-[11px]">ব্যাকগ্রাউন্ড রঙ বাদ দিয়ে শুধুমাত্র অবজেক্ট সংরক্ষণ হবে</span>
              </div>
            </label>
          ) : (
            <div className="flex items-start gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>JPG ফরম্যাট স্বচ্ছতা সাপোর্ট করে না। স্বয়ংক্রিয়ভাবে সাদা/নির্বাচিত ব্যাকগ্রাউন্ড যুক্ত হবে।</span>
            </div>
          )}

          {/* Export Dimensions */}
          <div className="bg-[#18181c] p-3 rounded-lg border border-[#383840] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-300">{t.dimensionsLabel}</span>
              <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="rounded-sm text-indigo-600 bg-[#25252b] border-gray-600 w-3 h-3"
                />
                <span>অনুপাত বজায় রাখুন (Lock Aspect)</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">প্রস্থ (Width px)</label>
                <input
                  type="number"
                  min="64"
                  max="7680"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                  className="w-full px-2.5 py-1.5 bg-[#25252b] border border-[#3e3e46] rounded-md text-xs font-mono text-white outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">উচ্চতা (Height px)</label>
                <input
                  type="number"
                  min="64"
                  max="4320"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                  className="w-full px-2.5 py-1.5 bg-[#25252b] border border-[#3e3e46] rounded-md text-xs font-mono text-white outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setWidth(1920);
                  setHeight(1080);
                }}
                className="text-[10px] px-2 py-0.5 rounded-sm bg-[#2c2c34] hover:bg-[#383842] text-gray-300 border border-[#44444e]"
              >
                1920×1080 FHD
              </button>
              <button
                type="button"
                onClick={() => {
                  setWidth(1280);
                  setHeight(720);
                }}
                className="text-[10px] px-2 py-0.5 rounded-sm bg-[#2c2c34] hover:bg-[#383842] text-gray-300 border border-[#44444e]"
              >
                1280×720 HD
              </button>
              <button
                type="button"
                onClick={() => {
                  setWidth(1080);
                  setHeight(1080);
                }}
                className="text-[10px] px-2 py-0.5 rounded-sm bg-[#2c2c34] hover:bg-[#383842] text-gray-300 border border-[#44444e]"
              >
                1080×1080 Square
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#323238]">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-[#282830] hover:bg-[#32323c] rounded-lg transition"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>এক্সপোর্ট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t.downloadBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
