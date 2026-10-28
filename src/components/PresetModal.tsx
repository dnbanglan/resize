import React, { useState } from 'react';
import { Layout, X, Check } from 'lucide-react';
import { CanvasDimensions } from '../types/editor';
import { Language } from '../utils/translations';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDimensions: CanvasDimensions;
  onSelectPreset: (dimensions: CanvasDimensions) => void;
  lang: Language;
}

const PRESET_LIST: CanvasDimensions[] = [
  { name: 'Full HD 1080p (ডিফল্ট ফ্রেম)', width: 1920, height: 1080 },
  { name: 'HD 720p / YouTube থাম্বনেইল', width: 1280, height: 720 },
  { name: 'বর্গাকার পোস্ট (1:1 Square)', width: 1080, height: 1080 },
  { name: 'ফেসবুক কভার ফটো', width: 1640, height: 924 },
  { name: 'নিউজ ফটোকার্ড (Social Share)', width: 1200, height: 630 },
  { name: 'স্টোরি / শর্টস / রিলস (9:16)', width: 1080, height: 1920 },
  { name: 'ইনস্টাগ্রাম পোর্ট্রেট (4:5)', width: 1080, height: 1350 },
  { name: '4K Ultra HD', width: 3840, height: 2160 },
];

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  currentDimensions,
  onSelectPreset,
  lang,
}) => {
  const [customW, setCustomW] = useState(currentDimensions.width);
  const [customH, setCustomH] = useState(currentDimensions.height);

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customW > 100 && customH > 100) {
      onSelectPreset({
        name: `কাস্টম (${customW}×${customH})`,
        width: customW,
        height: customH,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#202024] border border-[#38383f] w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#323238] bg-[#27272c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide">
                ক্যানভাস সাইজ প্রিসেট
              </h2>
              <p className="text-xs text-gray-400">বর্তমান আকার: {currentDimensions.width} × {currentDimensions.height} px</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            {PRESET_LIST.map((preset) => {
              const isSelected = preset.width === currentDimensions.width && preset.height === currentDimensions.height;
              return (
                <button
                  key={`${preset.width}x${preset.height}`}
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xs'
                      : 'bg-[#18181c] border-[#34343c] hover:bg-[#26262d] text-gray-300'
                  }`}
                >
                  <div>
                    <span className="font-medium text-sm block">{preset.name}</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {preset.width} × {preset.height} px ({((preset.width * preset.height) / 1000000).toFixed(1)} MP)
                    </span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {/* Custom Size Form */}
          <form onSubmit={handleApplyCustom} className="pt-3 border-t border-[#323238] space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300 block">
              কাস্টম ক্যানভাস সাইজ
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">প্রস্থ (px)</label>
                <input
                  type="number"
                  min="200"
                  max="7680"
                  value={customW}
                  onChange={(e) => setCustomW(parseInt(e.target.value) || 1920)}
                  className="w-full px-2.5 py-1.5 bg-[#18181c] border border-[#3e3e46] rounded-md text-xs font-mono text-white outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">উচ্চতা (px)</label>
                <input
                  type="number"
                  min="200"
                  max="4320"
                  value={customH}
                  onChange={(e) => setCustomH(parseInt(e.target.value) || 1080)}
                  className="w-full px-2.5 py-1.5 bg-[#18181c] border border-[#3e3e46] rounded-md text-xs font-mono text-white outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
            >
              কাস্টম সাইজ প্রয়োগ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
