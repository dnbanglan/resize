import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { CanvasDimensions, LayerItem, ToolType, ImageFilters } from '../types/editor';
import { Language, translations } from '../utils/translations';
import { saveProjectToStorage } from '../utils/storage';

interface CanvasAreaProps {
  dimensions: CanvasDimensions;
  backgroundColor: string;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onLayersChange: (layers: LayerItem[]) => void;
  onActiveObjectChange: (obj: any | null) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  registerCanvasRef: (canvas: fabric.Canvas | null) => void;
  isDrawingMode: boolean;
  lang: Language;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  undoTrigger: number;
  redoTrigger: number;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  dimensions,
  backgroundColor,
  zoom,
  onZoomChange,
  onLayersChange,
  onActiveObjectChange,
  onHistoryChange,
  registerCanvasRef,
  isDrawingMode,
  lang,
  onShowToast,
  undoTrigger,
  redoTrigger,
}) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  // Undo / Redo history stacks
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryLockedRef = useRef<boolean>(false);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Sync layers list from canvas objects
  const syncLayers = useCallback(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const objs = canvas.getObjects();
    const activeObj = canvas.getActiveObject();

    const layerItems: LayerItem[] = objs.map((obj: any, idx: number) => {
      if (!obj.__layerId) {
        obj.__layerId = `layer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      }
      if (!obj.__layerName) {
        if (obj.type === 'image') obj.__layerName = `ছবি ${idx + 1}`;
        else if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
          const preview = obj.text ? obj.text.slice(0, 14) : 'টেক্সট';
          obj.__layerName = `${preview}`;
        } else if (obj.type === 'rect') obj.__layerName = `আয়তক্ষেত্র ${idx + 1}`;
        else if (obj.type === 'circle') obj.__layerName = `বৃত্ত ${idx + 1}`;
        else if (obj.type === 'triangle') obj.__layerName = `ত্রিভুজ ${idx + 1}`;
        else if (obj.type === 'path') obj.__layerName = `ব্রাশ স্ট্রোক ${idx + 1}`;
        else obj.__layerName = `লেয়ার ${idx + 1}`;
      }

      return {
        id: obj.__layerId,
        name: obj.__layerName,
        type: obj.type || 'object',
        visible: obj.visible !== false,
        locked: !obj.selectable,
        opacity: obj.opacity ?? 1,
        selected: activeObj === obj,
      };
    });

    onLayersChange(layerItems);
  }, [onLayersChange]);

  // Save state to history
  const saveStateToHistory = useCallback(() => {
    if (!fabricRef.current || isHistoryLockedRef.current) return;
    const canvas = fabricRef.current;
    
    // Custom properties to serialize
    const json = JSON.stringify(
      canvas.toJSON(['__layerId', '__layerName', 'selectable', 'evented', 'lockMovementX', 'lockMovementY', 'strokeUniform'])
    );

    // If current index is behind the end, discard redo future
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Don't save duplicate identical states
    if (newHistory.length > 0 && newHistory[newHistory.length - 1] === json) {
      return;
    }

    newHistory.push(json);

    // Limit history stack size to 30 states to conserve memory
    if (newHistory.length > 30) {
      newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;

    onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1);

    // Also persist for auto-recovery in background
    saveProjectToStorage({
      version: '1.0',
      updatedAt: new Date().toISOString(),
      canvasDimensions: dimensions,
      backgroundColor: backgroundColor,
      json: json,
    });
  }, [dimensions, backgroundColor, onHistoryChange]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current <= 0) return;
    const canvas = fabricRef.current;
    isHistoryLockedRef.current = true;

    historyIndexRef.current -= 1;
    const targetState = historyRef.current[historyIndexRef.current];

    canvas.loadFromJSON(JSON.parse(targetState), () => {
      canvas.renderAll();
      syncLayers();
      onActiveObjectChange(canvas.getActiveObject());
      isHistoryLockedRef.current = false;
      onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1);
      onShowToast(t.undo, 'info');
    });
  }, [syncLayers, onActiveObjectChange, onHistoryChange, onShowToast, t.undo]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
    const canvas = fabricRef.current;
    isHistoryLockedRef.current = true;

    historyIndexRef.current += 1;
    const targetState = historyRef.current[historyIndexRef.current];

    canvas.loadFromJSON(JSON.parse(targetState), () => {
      canvas.renderAll();
      syncLayers();
      onActiveObjectChange(canvas.getActiveObject());
      isHistoryLockedRef.current = false;
      onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1);
      onShowToast(t.redo, 'info');
    });
  }, [syncLayers, onActiveObjectChange, onHistoryChange, onShowToast, t.redo]);

  // Watch undo/redo triggers from toolbar or shortcut
  useEffect(() => {
    if (undoTrigger > 0) handleUndo();
  }, [undoTrigger, handleUndo]);

  useEffect(() => {
    if (redoTrigger > 0) handleRedo();
  }, [redoTrigger, handleRedo]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = canvas;
    registerCanvasRef(canvas);

    // Initial history snapshot
    saveStateToHistory();

    // Event listeners
    const handleObjectModified = () => {
      saveStateToHistory();
      syncLayers();
      onActiveObjectChange(canvas.getActiveObject());
    };

    const handleObjectAdded = () => {
      syncLayers();
      saveStateToHistory();
    };

    const handleObjectRemoved = () => {
      syncLayers();
      saveStateToHistory();
      onActiveObjectChange(canvas.getActiveObject());
    };

    const handleSelectionChange = () => {
      syncLayers();
      onActiveObjectChange(canvas.getActiveObject() || null);
    };

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('selection:created', handleSelectionChange);
    canvas.on('selection:updated', handleSelectionChange);
    canvas.on('selection:cleared', () => {
      syncLayers();
      onActiveObjectChange(null);
    });

    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt) => {
      const evt = opt.e;
      evt.preventDefault();
      evt.stopPropagation();

      const delta = evt.deltaY;
      let newZoom = canvas.getZoom() * (delta > 0 ? 0.92 : 1.08);

      if (newZoom > 6) newZoom = 6;
      if (newZoom < 0.08) newZoom = 0.08;

      const point = new fabric.Point(evt.offsetX, evt.offsetY);
      canvas.zoomToPoint(point, newZoom);
      onZoomChange(newZoom);
    });

    // Panning with space key or middle click
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (evt.button === 1 || isSpacePressed) { // Middle click or space+click
        isPanningRef.current = true;
        canvas.selection = false;
        lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanningRef.current) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - lastMousePosRef.current.x;
          vpt[5] += evt.clientY - lastMousePosRef.current.y;
          canvas.requestRenderAll();
          lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
        }
      }
    });

    canvas.on('mouse:up', () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        canvas.selection = !isDrawingMode;
      }
    });

    // Initial fit to screen
    const fitTimer = setTimeout(() => {
      if (containerRef.current) {
        const cW = containerRef.current.clientWidth - 80;
        const cH = containerRef.current.clientHeight - 80;
        const scaleX = cW / dimensions.width;
        const scaleY = cH / dimensions.height;
        const initialScale = Math.min(scaleX, scaleY, 0.9);

        canvas.setZoom(initialScale);
        onZoomChange(initialScale);

        // Center viewport
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] = (containerRef.current.clientWidth - dimensions.width * initialScale) / 2;
          vpt[5] = (containerRef.current.clientHeight - dimensions.height * initialScale) / 2;
          canvas.requestRenderAll();
        }
      }
    }, 150);

    return () => {
      clearTimeout(fitTimer);
      canvas.dispose();
      fabricRef.current = null;
      registerCanvasRef(null);
    };
  }, [dimensions.width, dimensions.height]);

  // Update canvas background color
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    if (backgroundColor === 'transparent') {
      canvas.setBackgroundColor('', canvas.renderAll.bind(canvas));
    } else {
      canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
    }
  }, [backgroundColor]);

  // Update drawing mode
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.isDrawingMode = isDrawingMode;
    if (isDrawingMode) {
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.width = 6;
      canvas.freeDrawingBrush.color = '#3b82f6';
    }
  }, [isDrawingMode]);

  // Update zoom from outside (e.g. Header buttons)
  useEffect(() => {
    if (!fabricRef.current || !containerRef.current) return;
    const canvas = fabricRef.current;
    const currentZ = canvas.getZoom();
    if (Math.abs(currentZ - zoom) > 0.005) {
      // Zoom to center
      const center = new fabric.Point(
        containerRef.current.clientWidth / 2,
        containerRef.current.clientHeight / 2
      );
      canvas.zoomToPoint(center, zoom);
    }
  }, [zoom]);

  // Space key listener for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSpacePressed(true);
        if (fabricRef.current) fabricRef.current.defaultCursor = 'grab';
      }

      // Keyboard shortcuts
      if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (fabricRef.current) {
            const active = fabricRef.current.getActiveObject();
            if (active && !(active as any).isEditing) {
              fabricRef.current.remove(active);
              fabricRef.current.discardActiveObject();
              fabricRef.current.renderAll();
              onShowToast('অবজেক্ট মুছে ফেলা হয়েছে', 'info');
            }
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          if (fabricRef.current) {
            const active = fabricRef.current.getActiveObject();
            if (active) {
              active.clone((cloned: any) => {
                cloned.set({
                  left: (active.left || 0) + 25,
                  top: (active.top || 0) + 25,
                  __layerId: `layer_${Date.now()}`,
                  __layerName: `${(active as any).__layerName || 'অবজেক্ট'} (কপি)`,
                });
                fabricRef.current?.add(cloned);
                fabricRef.current?.setActiveObject(cloned);
                fabricRef.current?.renderAll();
                onShowToast('লেয়ার ডুপ্লিকেট করা হয়েছে', 'success');
              });
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (fabricRef.current) fabricRef.current.defaultCursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, handleUndo, handleRedo, onShowToast]);

  // Drag and drop image upload onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        onShowToast('অনুগ্রহ করে JPG, PNG বা WebP ছবি আপলোড করুন', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (f) => {
        const dataUrl = f.target?.result as string;
        fabric.Image.fromURL(dataUrl, (img) => {
          if (!fabricRef.current) return;
          const canvas = fabricRef.current;

          // Auto scale if larger than canvas
          if ((img.width || 0) > dimensions.width || (img.height || 0) > dimensions.height) {
            const scale = Math.min(
              (dimensions.width * 0.8) / (img.width || 1),
              (dimensions.height * 0.8) / (img.height || 1)
            );
            img.scale(scale);
          }

          // Center in canvas
          img.set({
            left: (dimensions.width - (img.width || 0) * (img.scaleX || 1)) / 2,
            top: (dimensions.height - (img.height || 0) * (img.scaleY || 1)) / 2,
            __layerId: `layer_${Date.now()}`,
            __layerName: file.name.replace(/\.[^/.]+$/, ''),
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          onShowToast(`ছবি "${file.name}" যুক্ত হয়েছে`, 'success');
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 h-full relative overflow-hidden bg-[#121214] flex items-center justify-center select-none"
      style={{
        cursor: isSpacePressed ? 'grab' : isDrawingMode ? 'crosshair' : 'default',
      }}
    >
      {/* Visual Canvas Drop Shadow Frame Wrapper */}
      <div 
        className="relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-[#34343d] rounded-xs"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Checkerboard backdrop behind transparent canvas */}
        <div className="absolute inset-0 canvas-checkerboard pointer-events-none" />

        {/* Fabric Canvas Element */}
        <canvas ref={canvasElRef} />
      </div>

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-indigo-950/80 border-4 border-dashed border-indigo-400 z-50 flex flex-col items-center justify-center backdrop-blur-xs text-white p-6">
          <div className="p-4 bg-indigo-600/30 rounded-full mb-3 animate-bounce">
            <span className="text-3xl">📥</span>
          </div>
          <h3 className="text-xl font-bold font-['Hind_Siliguri']">{t.dropToUpload}</h3>
          <p className="text-sm text-indigo-300 mt-1">JPG, PNG, WebP ফরম্যাট সমর্থিত</p>
        </div>
      )}
    </main>
  );
};
