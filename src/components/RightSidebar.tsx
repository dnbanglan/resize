import React, { useState } from 'react';
import { Layers, Sliders, ChevronRight, ChevronLeft } from 'lucide-react';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { LayerItem, CanvasDimensions, ImageFilters } from '../types/editor';
import { Language, translations } from '../utils/translations';

interface RightSidebarProps {
  layers: LayerItem[];
  selectedLayerId: string | null;
  activeObject: any | null;
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

export const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const { lang, layers, selectedLayerId } = props;
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto switch to properties tab if an object is selected
  React.useEffect(() => {
    if (selectedLayerId && activeTab === 'layers' && window.innerWidth >= 1024) {
      // In large desktop, we can keep user preference or auto-switch
    }
  }, [selectedLayerId]);

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[#1b1b1f] border-l border-[#2d2d34] flex flex-col items-center py-3 z-20 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg bg-[#282830] hover:bg-[#34343e] text-gray-300 hover:text-white transition shadow-sm"
          title="সাইডবার খুলুন"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 sm:w-80 bg-[#1b1b1f] border-l border-[#2d2d34] flex flex-col z-20 shrink-0 h-full overflow-hidden text-gray-200">
      {/* Top Tab Headers */}
      <div className="flex items-center justify-between bg-[#151518] border-b border-[#2d2d34] px-2 pt-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'layers'
                ? 'bg-[#1e1e24] text-white border-indigo-500'
                : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.layers}</span>
            <span className="text-[10px] px-1 bg-[#282832] rounded text-gray-400">
              {layers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'properties'
                ? 'bg-[#1e1e24] text-white border-indigo-500'
                : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.properties}</span>
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
          title="সাইডবার বন্ধ করুন"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'layers' ? (
          <LayersPanel
            layers={props.layers}
            selectedLayerId={props.selectedLayerId}
            onSelectLayer={props.onSelectLayer}
            onToggleVisibility={props.onToggleVisibility}
            onToggleLock={props.onToggleLock}
            onDuplicateLayer={props.onDuplicateLayer}
            onDeleteLayer={props.onDeleteLayer}
            onBringForward={props.onBringForward}
            onSendBackward={props.onSendBackward}
            onBringToFront={props.onBringToFront}
            onSendToBack={props.onSendToBack}
            onRenameLayer={props.onRenameLayer}
            lang={props.lang}
          />
        ) : (
          <PropertiesPanel
            activeObject={props.activeObject}
            onUpdateTransform={props.onUpdateTransform}
            onUpdateTextProps={props.onUpdateTextProps}
            onUpdateShapeProps={props.onUpdateShapeProps}
            onUpdateImageFilters={props.onUpdateImageFilters}
            onResetImageFilters={props.onResetImageFilters}
            currentFilters={props.currentFilters}
            canvasBgColor={props.canvasBgColor}
            onChangeCanvasBg={props.onChangeCanvasBg}
            canvasDimensions={props.canvasDimensions}
            onCenterObject={props.onCenterObject}
            lang={props.lang}
          />
        )}
      </div>
    </aside>
  );
};
