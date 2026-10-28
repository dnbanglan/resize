import React, { useState, useEffect, useRef } from 'react';
import { Crop as CropIcon, X, Check, RotateCw } from 'lucide-react';
import { fabric } from 'fabric';
import { Language, translations } from '../utils/translations';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetObject: any | null; // active fabric.Image or null for canvas
  onApplyCrop: (cropData: { left: number; top: number; width: number; height: number }) => void;
  lang: Language;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  targetObject,
  onApplyCrop,
  lang,
}) => {
  const t = translations[lang];
  const [aspectRatio, setAspectRatio] = useState<'free' | '16:9' | '1:1' | '4:3' | '9:16'>('free');
  const [cropBox, setCropBox] = useState({ left: 10, top: 10, width: 80, height: 80 }); // percentage
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && targetObject) {
      if (targetObject.type === 'image' && targetObject.getElement) {
        const el = targetObject.getElement();
        if (el && el.src) {
          setImgUrl(el.src);
        }
      }
    }
  }, [isOpen, targetObject]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!targetObject) {
      onClose();
      return;
    }

    const origW = targetObject.width || 800;
    const origH = targetObject.height || 600;

    const realCrop = {
      left: Math.round((cropBox.left / 100) * origW),
      top: Math.round((cropBox.top / 100) * origH),
      width: Math.round((cropBox.width / 100) * origW),
      height: Math.round((cropBox.height / 100) * origH),
    };

    onApplyCrop(realCrop);
    onClose();
  };

  const setRatio = (ratio: 'free' | '16:9' | '1:1' | '4:3' | '9:16') => {
    setAspectRatio(ratio);
    if (ratio === '1:1') {
      setCropBox({ left: 15, top: 15, width: 70, height: 70 });
    } else if (ratio === '16:9') {
      setCropBox({ left: 10, top: 20, width: 80, height: 45 });
    } else if (ratio === '4:3') {
      setCropBox({ left: 10, top: 15, width: 80, height: 60 });
    } else if (ratio === '9:16') {
      setCropBox({ left: 25, top: 10, width: 50, height: 80 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-[#202024] border border-[#38383f] w-full max-w-xl rounded-xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#323238] bg-[#27272c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <CropIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                ছবি ক্রপ করুন (Crop Image)
              </h2>
              <p className="text-xs text-gray-400">অনুপাত নির্বাচন করে পছন্দমতো অংশ কেটে নিন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Presets */}
        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {(['free', '16:9', '1:1', '4:3', '9:16'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRatio(r)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                aspectRatio === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#282830] hover:bg-[#343440] text-gray-300'
              }`}
            >
              {r === 'free' ? 'মুক্ত (Free)' : r}
            </button>
          ))}
        </div>

        {/* Preview Area with interactive box */}
        <div className="p-5 flex items-center justify-center">
          <div className="relative max-w-md max-h-72 bg-black/40 border border-[#3e3e48] rounded-lg overflow-hidden flex items-center justify-center p-2">
            {imgUrl ? (
              <div className="relative">
                <img 
                  src={imgUrl} 
                  alt="Crop Target" 
                  className="max-h-64 object-contain select-none"
                />
                {/* Crop Overlay Mask */}
                <div 
                  className="absolute border-2 border-indigo-400 bg-indigo-500/20 shadow-lg pointer-events-none"
                  style={{
                    left: `${cropBox.left}%`,
                    top: `${cropBox.top}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                >
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-indigo-300/40">
                    <div className="border-r border-b border-indigo-300/30" />
                    <div className="border-r border-b border-indigo-300/30" />
                    <div className="border-b border-indigo-300/30" />
                    <div className="border-r border-b border-indigo-300/30" />
                    <div className="border-r border-b border-indigo-300/30" />
                    <div className="border-b border-indigo-300/30" />
                    <div className="border-r border-indigo-300/30" />
                    <div className="border-r border-indigo-300/30" />
                    <div />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-gray-400 text-xs">
                প্রথমে ক্যানভাসে একটি ছবি নির্বাচন করুন ক্রপ করার জন্য।
              </div>
            )}
          </div>
        </div>

        {/* Sliders for fine-tuning crop percentage */}
        {imgUrl && (
          <div className="px-5 py-2 grid grid-cols-2 gap-3 bg-[#18181c] border-t border-[#323238] text-xs">
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>প্রস্থ (Width)</span>
                <span>{cropBox.width}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={cropBox.width}
                onChange={(e) => setCropBox({ ...cropBox, width: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#32323b] rounded accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>উচ্চতা (Height)</span>
                <span>{cropBox.height}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={cropBox.height}
                onChange={(e) => setCropBox({ ...cropBox, height: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#32323b] rounded accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-[#323238] bg-[#27272c]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white bg-[#282830] rounded-lg transition"
          >
            {t.cancelBtn}
          </button>
          <button
            onClick={handleApply}
            disabled={!imgUrl}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg shadow transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ক্রপ প্রয়োগ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
