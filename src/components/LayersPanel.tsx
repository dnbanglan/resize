import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Copy, 
  Trash2, 
  ChevronsUp, 
  ChevronsDown, 
  ChevronUp, 
  ChevronDown, 
  Image as ImageIcon, 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Paintbrush, 
  Shapes,
  Edit2,
  Check
} from 'lucide-react';
import { LayerItem } from '../types/editor';
import { Language, translations } from '../utils/translations';

interface LayersPanelProps {
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onRenameLayer: (id: string, newName: string) => void;
  lang: Language;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDuplicateLayer,
  onDeleteLayer,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onRenameLayer,
  lang,
}) => {
  const t = translations[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'i-text':
      case 'textbox':
      case 'text':
        return <Type className="w-3.5 h-3.5 text-indigo-400" />;
      case 'rect':
        return <Square className="w-3.5 h-3.5 text-emerald-400" />;
      case 'circle':
        return <Circle className="w-3.5 h-3.5 text-sky-400" />;
      case 'triangle':
        return <Triangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'path':
      case 'brush':
        return <Paintbrush className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Shapes className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const handleStartRename = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const handleFinishRename = (id: string) => {
    if (editName.trim()) {
      onRenameLayer(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] text-gray-200">
      {/* Action Toolbar for selected layer */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#25252d] border-b border-[#32323a] text-xs">
        <span className="font-semibold text-gray-300 flex items-center gap-1.5">
          <span>{t.layers}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#353540] text-[10px] text-gray-400 font-mono">
            {layers.length}
          </span>
        </span>

        {/* Ordering & Duplicate & Delete buttons */}
        {selectedLayerId && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onBringToFront(selectedLayerId)}
              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition"
              title={t.bringToFront}
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onBringForward(selectedLayerId)}
              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition"
              title={t.bringForward}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSendBackward(selectedLayerId)}
              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition"
              title={t.sendBackward}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSendToBack(selectedLayerId)}
              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition"
              title={t.sendToBack}
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-[#3e3e48] mx-1" />

            <button
              onClick={() => onDuplicateLayer(selectedLayerId)}
              className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition"
              title={t.duplicateLayer}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteLayer(selectedLayerId)}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition"
              title={t.deleteLayer}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Layer List (Top layer is at top of stack, rendered reversed) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-center text-gray-500 text-xs px-4">
            <Shapes className="w-8 h-8 stroke-1 text-gray-600 mb-2" />
            <span>{t.noLayerSelected}</span>
            <span className="text-[10px] mt-1 text-gray-600">ছবি, টেক্সট বা শেপ যোগ করলে লেয়ার এখানে দেখাবে</span>
          </div>
        ) : (
          [...layers].reverse().map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-xs'
                    : 'bg-[#18181e] border-[#2c2c34] hover:bg-[#23232b] text-gray-300'
                } ${!layer.visible ? 'opacity-40' : ''}`}
              >
                {/* Left: Icon & Name */}
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                  <div className="p-1 rounded bg-[#272730] shrink-0">
                    {getLayerIcon(layer.type)}
                  </div>

                  {editingId === layer.id ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinishRename(layer.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="w-full bg-[#111115] border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white outline-hidden"
                      />
                      <button
                        onClick={() => handleFinishRename(layer.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span 
                      onDoubleClick={(e) => handleStartRename(layer, e)}
                      className="truncate font-medium flex-1"
                      title={layer.name}
                    >
                      {layer.name}
                    </span>
                  )}
                </div>

                {/* Right: Quick Controls (Visibility, Lock, Rename) */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleVisibility(layer.id)}
                    className={`p-1 rounded hover:bg-white/10 transition ${
                      layer.visible ? 'text-gray-400 hover:text-white' : 'text-gray-600'
                    }`}
                    title={layer.visible ? t.hideLayer : t.showLayer}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onToggleLock(layer.id)}
                    className={`p-1 rounded hover:bg-white/10 transition ${
                      layer.locked ? 'text-amber-400' : 'text-gray-500 hover:text-white'
                    }`}
                    title={layer.locked ? t.unlockLayer : t.lockLayer}
                  >
                    {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => handleStartRename(layer, e)}
                    className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition hidden sm:block"
                    title={t.renameLayer}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
