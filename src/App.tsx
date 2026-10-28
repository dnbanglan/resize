import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { Header } from './components/Header';
import { Toolbox } from './components/Toolbox';
import { CanvasArea } from './components/CanvasArea';
import { RightSidebar } from './components/RightSidebar';
import { StatusBar } from './components/StatusBar';
import { ExportModal } from './components/ExportModal';
import { PresetModal } from './components/PresetModal';
import { CropModal } from './components/CropModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { 
  CanvasDimensions, 
  ExportSettings, 
  ImageFilters, 
  LayerItem, 
  ToolType 
} from './types/editor';
import { Language, translations } from './utils/translations';
import { exportCanvasImage } from './utils/exportImage';
import { loadProjectFromStorage } from './utils/storage';

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const t = translations[lang];

  // 1920x1080 Full HD is the mandatory default frame size
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    name: 'Full HD 1080p (ডিফল্ট)',
    width: 1920,
    height: 1080,
  });

  const [canvasBgColor, setCanvasBgColor] = useState<string>('#ffffff');
  const [zoom, setZoom] = useState<number>(0.65);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);

  // Canvas & Objects
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [activeObject, setActiveObject] = useState<any | null>(null);

  // Undo / Redo
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [undoTrigger, setUndoTrigger] = useState<number>(0);
  const [redoTrigger, setRedoTrigger] = useState<number>(0);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isPresetOpen, setIsPresetOpen] = useState<boolean>(false);
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);

  // Image Filters state for active image
  const [currentFilters, setCurrentFilters] = useState<ImageFilters>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    hue: 0,
    vintage: false,
    sepia: false,
    grayscale: false,
    invert: false,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const registerCanvasRef = (canvas: fabric.Canvas | null) => {
    canvasRef.current = canvas;
  };

  // Hidden file input for uploading images
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('শুধুমাত্র JPG, PNG বা WebP ছবি আপলোড করা যাবে', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target?.result as string;
      fabric.Image.fromURL(dataUrl, (img) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        // Auto scale if larger than canvas dimensions
        if ((img.width || 0) > dimensions.width || (img.height || 0) > dimensions.height) {
          const scale = Math.min(
            (dimensions.width * 0.75) / (img.width || 1),
            (dimensions.height * 0.75) / (img.height || 1)
          );
          img.scale(scale);
        }

        // Center on canvas
        img.set({
          left: (dimensions.width - (img.width || 0) * (img.scaleX || 1)) / 2,
          top: (dimensions.height - (img.height || 0) * (img.scaleY || 1)) / 2,
          __layerId: `layer_${Date.now()}`,
          __layerName: file.name.replace(/\.[^/.]+$/, ''),
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        showToast(`ছবি "${file.name}" যুক্ত হয়েছে`, 'success');
      });
    };
    reader.readAsDataURL(file);
  };

  // Add Bangla or English Text
  const handleAddText = (presetText?: string, isHeadline: boolean = false) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const defaultContent = presetText || (isHeadline ? 'শিরোনাম লিখুন এখানে' : 'এখানে আপনার বার্তা বা বিস্তারিত বিবরণ লিখুন...');
    const fontSize = isHeadline ? 72 : 38;

    const text = new fabric.IText(defaultContent, {
      left: dimensions.width / 2 - 250,
      top: dimensions.height / 2 - (isHeadline ? 100 : 0),
      fontFamily: "'Hind Siliguri', sans-serif",
      fontSize: fontSize,
      fill: isHeadline ? '#ffffff' : '#f3f4f6',
      fontWeight: isHeadline ? 'bold' : 'normal',
      stroke: isHeadline ? '#000000' : '',
      strokeWidth: isHeadline ? 2 : 0,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.6)',
        blur: 8,
        offsetX: 2,
        offsetY: 2,
      }),
      __layerId: `layer_${Date.now()}`,
      __layerName: presetText ? presetText.slice(0, 14) : isHeadline ? 'বড় শিরোনাম' : 'টেক্সট',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    showToast('নতুন টেক্সট যোগ করা হয়েছে', 'success');
  };

  // Add Shapes
  const handleAddShape = (type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow' | 'badge') => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let shape: any;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    if (type === 'rectangle') {
      shape = new fabric.Rect({
        left: centerX - 150,
        top: centerY - 100,
        width: 300,
        height: 200,
        fill: '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 0,
        rx: 8,
        ry: 8,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'আয়তক্ষেত্র',
      });
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        left: centerX - 100,
        top: centerY - 100,
        radius: 100,
        fill: '#10b981',
        stroke: '#ffffff',
        strokeWidth: 0,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'বৃত্ত',
      });
    } else if (type === 'triangle') {
      shape = new fabric.Triangle({
        left: centerX - 100,
        top: centerY - 100,
        width: 200,
        height: 180,
        fill: '#f59e0b',
        stroke: '#ffffff',
        strokeWidth: 0,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'ত্রিভুজ',
      });
    } else if (type === 'star') {
      // 5-point star
      const points = [
        { x: 100, y: 10 },
        { x: 125, y: 70 },
        { x: 190, y: 70 },
        { x: 140, y: 110 },
        { x: 160, y: 175 },
        { x: 100, y: 135 },
        { x: 40, y: 175 },
        { x: 60, y: 110 },
        { x: 10, y: 70 },
        { x: 75, y: 70 },
      ];
      shape = new fabric.Polygon(points, {
        left: centerX - 100,
        top: centerY - 100,
        fill: '#fbbf24',
        stroke: '#d97706',
        strokeWidth: 2,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'তারা',
      });
    } else if (type === 'line') {
      shape = new fabric.Line([centerX - 150, centerY, centerX + 150, centerY], {
        stroke: '#6366f1',
        strokeWidth: 6,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'সরলরেখা',
      });
    } else if (type === 'arrow') {
      // Arrow line + arrowhead group
      const line = new fabric.Line([0, 10, 180, 10], {
        stroke: '#ef4444',
        strokeWidth: 6,
      });
      const triangle = new fabric.Triangle({
        left: 175,
        top: 0,
        angle: 90,
        width: 20,
        height: 25,
        fill: '#ef4444',
      });
      shape = new fabric.Group([line, triangle], {
        left: centerX - 100,
        top: centerY - 10,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'তীরচিহ্ন',
      });
    } else if (type === 'badge') {
      // Breaking news badge with text
      const bg = new fabric.Rect({
        width: 260,
        height: 54,
        fill: '#dc2626',
        rx: 6,
        ry: 6,
      });
      const txt = new fabric.IText('🔴 ব্রেকিং নিউজ', {
        left: 20,
        top: 8,
        fontFamily: "'Hind Siliguri', sans-serif",
        fontSize: 28,
        fontWeight: 'bold',
        fill: '#ffffff',
      });
      shape = new fabric.Group([bg, txt], {
        left: 60,
        top: 60,
        __layerId: `layer_${Date.now()}`,
        __layerName: 'ব্রেকিং নিউজ ব্যাজ',
      });
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      showToast('নতুন শেপ যোগ করা হয়েছে', 'success');
    }
  };

  // Center active object
  const handleCenterObject = (axis: 'both' | 'h' | 'v') => {
    if (!canvasRef.current || !activeObject) return;
    const canvas = canvasRef.current;
    if (axis === 'both') {
      canvas.centerObject(activeObject);
    } else if (axis === 'h') {
      canvas.centerObjectH(activeObject);
    } else if (axis === 'v') {
      canvas.centerObjectV(activeObject);
    }
    activeObject.setCoords();
    canvas.renderAll();
  };

  // Update Transform properties
  const handleUpdateTransform = (key: string, value: any) => {
    if (!canvasRef.current || !activeObject) return;
    const canvas = canvasRef.current;
    activeObject.set(key, value);
    activeObject.setCoords();
    canvas.renderAll();
    setActiveObject({ ...activeObject });
  };

  // Update Text properties
  const handleUpdateTextProps = (key: string, value: any) => {
    if (!canvasRef.current || !activeObject) return;
    const canvas = canvasRef.current;

    if (key === 'shadow') {
      if (value) {
        activeObject.set('shadow', new fabric.Shadow(value));
      } else {
        activeObject.set('shadow', null);
      }
    } else {
      activeObject.set(key, value);
    }

    activeObject.setCoords();
    canvas.renderAll();
    setActiveObject({ ...activeObject });
  };

  // Update Shape properties
  const handleUpdateShapeProps = (key: string, value: any) => {
    if (!canvasRef.current || !activeObject) return;
    const canvas = canvasRef.current;
    activeObject.set(key, value);
    activeObject.setCoords();
    canvas.renderAll();
    setActiveObject({ ...activeObject });
  };

  // Image Filters update
  const handleUpdateImageFilters = (newFilters: Partial<ImageFilters>) => {
    if (!canvasRef.current || !activeObject || activeObject.type !== 'image') return;
    const canvas = canvasRef.current;
    const updated = { ...currentFilters, ...newFilters };
    setCurrentFilters(updated);

    const fList: any[] = [];

    // Brightness
    if (updated.brightness !== 0) {
      fList.push(new (fabric.Image.filters as any).Brightness({ brightness: updated.brightness }));
    }
    // Contrast
    if (updated.contrast !== 0) {
      fList.push(new (fabric.Image.filters as any).Contrast({ contrast: updated.contrast }));
    }
    // Saturation
    if (updated.saturation !== 0) {
      fList.push(new (fabric.Image.filters as any).Saturation({ saturation: updated.saturation }));
    }
    // Blur
    if (updated.blur > 0) {
      fList.push(new (fabric.Image.filters as any).Blur({ blur: updated.blur }));
    }
    // Hue
    if (updated.hue !== 0) {
      fList.push(new (fabric.Image.filters as any).HueRotation({ rotation: updated.hue }));
    }
    // Grayscale
    if (updated.grayscale) {
      fList.push(new (fabric.Image.filters as any).Grayscale());
    }
    // Sepia
    if (updated.sepia) {
      fList.push(new (fabric.Image.filters as any).Sepia());
    }
    // Invert
    if (updated.invert) {
      fList.push(new (fabric.Image.filters as any).Invert());
    }

    activeObject.filters = fList;
    activeObject.applyFilters();
    canvas.renderAll();
  };

  const handleResetImageFilters = () => {
    const cleanFilters: ImageFilters = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      hue: 0,
      vintage: false,
      sepia: false,
      grayscale: false,
      invert: false,
    };
    setCurrentFilters(cleanFilters);
    if (canvasRef.current && activeObject && activeObject.type === 'image') {
      activeObject.filters = [];
      activeObject.applyFilters();
      canvasRef.current.renderAll();
      showToast('সব ফিল্টার রিসেট করা হয়েছে', 'info');
    }
  };

  // Apply crop to active image
  const handleApplyCrop = (cropData: { left: number; top: number; width: number; height: number }) => {
    if (!canvasRef.current || !activeObject || activeObject.type !== 'image') return;
    const canvas = canvasRef.current;

    activeObject.set({
      cropX: cropData.left,
      cropY: cropData.top,
      width: cropData.width,
      height: cropData.height,
    });
    activeObject.setCoords();
    canvas.renderAll();
    showToast('ছবি সফলভাবে ক্রপ করা হয়েছে', 'success');
  };

  // Layer Operations
  const handleSelectLayer = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      canvas.setActiveObject(target);
      canvas.renderAll();
      setActiveObject(target);
    }
  };

  const handleToggleVisibility = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      target.visible = !target.visible;
      if (!target.visible && canvas.getActiveObject() === target) {
        canvas.discardActiveObject();
      }
      canvas.renderAll();
      setLayers([...layers]);
    }
  };

  const handleToggleLock = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      const isLocked = !target.selectable;
      target.selectable = isLocked;
      target.evented = isLocked;
      target.lockMovementX = !isLocked;
      target.lockMovementY = !isLocked;
      target.lockRotation = !isLocked;
      target.lockScalingX = !isLocked;
      target.lockScalingY = !isLocked;
      canvas.renderAll();
      setLayers([...layers]);
      showToast(isLocked ? 'লেয়ার আনলক করা হয়েছে' : 'লেয়ার লক করা হয়েছে', 'info');
    }
  };

  const handleDuplicateLayer = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      target.clone((cloned: any) => {
        cloned.set({
          left: (target.left || 0) + 30,
          top: (target.top || 0) + 30,
          __layerId: `layer_${Date.now()}`,
          __layerName: `${(target as any).__layerName || 'অবজেক্ট'} (কপি)`,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        showToast('লেয়ার ডুপ্লিকেট করা হয়েছে', 'success');
      });
    }
  };

  const handleDeleteLayer = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      canvas.remove(target);
      canvas.discardActiveObject();
      canvas.renderAll();
      showToast('লেয়ার মুছে ফেলা হয়েছে', 'info');
    }
  };

  const handleBringForward = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      target.bringForward();
      canvas.renderAll();
    }
  };

  const handleSendBackward = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      target.sendBackwards();
      canvas.renderAll();
    }
  };

  const handleBringToFront = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      target.bringToFront();
      canvas.renderAll();
    }
  };

  const handleSendToBack = (id: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      target.sendToBack();
      canvas.renderAll();
    }
  };

  const handleRenameLayer = (id: string, newName: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const target = canvas.getObjects().find((o: any) => o.__layerId === id);
    if (target) {
      (target as any).__layerName = newName;
      setLayers(layers.map((l) => (l.id === id ? { ...l, name: newName } : l)));
    }
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (!canvasRef.current) return;
    if (window.confirm('আপনি কি নিশ্চিত যে ক্যানভাসের সব লেয়ার মুছে ফেলতে চান?')) {
      canvasRef.current.clear();
      canvasRef.current.setBackgroundColor(canvasBgColor, canvasRef.current.renderAll.bind(canvasRef.current));
      canvasRef.current.renderAll();
      setActiveObject(null);
      setLayers([]);
      showToast('ক্যানভাস সম্পূর্ণ পরিষ্কার করা হয়েছে', 'info');
    }
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev * 0.8, 0.1));
  };

  const handleZoomFit = () => {
    setZoom(0.65);
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  // Preset Selection
  const handleSelectPreset = (newDimensions: CanvasDimensions) => {
    setDimensions(newDimensions);
    if (canvasRef.current) {
      canvasRef.current.setWidth(newDimensions.width);
      canvasRef.current.setHeight(newDimensions.height);
      canvasRef.current.renderAll();
    }
    showToast(`ক্যানভাস সাইজ পরিবর্তিত: ${newDimensions.width}×${newDimensions.height} px`, 'success');
  };

  // Save / Export Execution
  const handleExport = async (settings: ExportSettings) => {
    if (!canvasRef.current) {
      return { success: false, error: 'Canvas not initialized' };
    }

    const res = await exportCanvasImage(canvasRef.current, settings);
    if (res.success) {
      showToast(t.exportSuccess, 'success');
    } else {
      showToast(`${t.exportError} (${res.error})`, 'error');
    }
    return res;
  };

  // Initial welcome template check: add a sample banner if completely empty on first launch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current && canvasRef.current.getObjects().length === 0) {
        // Add a tasteful sample template to immediately demonstrate 1920x1080 canvas
        const canvas = canvasRef.current;
        
        // Background banner shape
        const bannerRect = new fabric.Rect({
          left: 160,
          top: 140,
          width: 1600,
          height: 800,
          fill: '#1e1e2d',
          rx: 24,
          ry: 24,
          stroke: '#3b3b4f',
          strokeWidth: 2,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.5)',
            blur: 25,
            offsetX: 0,
            offsetY: 10,
          }),
          __layerId: `layer_${Date.now()}_bg`,
          __layerName: 'ব্যাকগ্রাউন্ড ফ্রেম',
        });

        // Headline
        const titleText = new fabric.IText('অনলাইন ফটোশপ প্রো', {
          left: 240,
          top: 260,
          fontFamily: "'Hind Siliguri', sans-serif",
          fontSize: 84,
          fontWeight: 'bold',
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2,
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.8)',
            blur: 15,
            offsetX: 4,
            offsetY: 4,
          }),
          __layerId: `layer_${Date.now()}_title`,
          __layerName: 'প্রধান শিরোনাম',
        });

        // Subtitle
        const subText = new fabric.IText('সহজেই ছবি সম্পাদনা, বাংলা ও ইংরেজি টেক্সট, ফিল্টার ও এক্সপোর্ট করুন।\nবাম পাশের টুলবার থেকে ছবি আপলোড বা নতুন টেক্সট যোগ করুন।', {
          left: 240,
          top: 400,
          fontFamily: "'Noto Sans Bengali', sans-serif",
          fontSize: 34,
          lineHeight: 1.4,
          fill: '#cbd5e1',
          __layerId: `layer_${Date.now()}_sub`,
          __layerName: 'উপ-শিরোনাম',
        });

        // Breaking badge
        const badgeBg = new fabric.Rect({
          width: 220,
          height: 48,
          fill: '#4f46e5',
          rx: 8,
          ry: 8,
        });
        const badgeTxt = new fabric.IText('✨ ভার্সন ১.০', {
          left: 24,
          top: 8,
          fontFamily: "'Hind Siliguri', sans-serif",
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#ffffff',
        });
        const badgeGroup = new fabric.Group([badgeBg, badgeTxt], {
          left: 240,
          top: 190,
          __layerId: `layer_${Date.now()}_badge`,
          __layerName: 'ভার্সন ব্যাজ',
        });

        canvas.add(bannerRect, badgeGroup, titleText, subText);
        canvas.setActiveObject(titleText);
        canvas.renderAll();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#18181b] text-gray-200">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 1. Top Header Toolbar */}
      <Header
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => setUndoTrigger((c) => c + 1)}
        onRedo={() => setRedoTrigger((c) => c + 1)}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onZoomReset={handleZoomReset}
        onOpenImageUpload={handleOpenImageUpload}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenPresetModal={() => setIsPresetOpen(true)}
        onClearCanvas={handleClearCanvas}
        currentDimensions={dimensions}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
      />

      {/* 2. Middle Body: Toolbox (Left) + Canvas Workspace (Center) + Right Sidebar (Layers & Properties) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbox */}
        <Toolbox
          activeTool={activeTool}
          onSelectTool={(tool) => setActiveTool(tool)}
          onAddText={handleAddText}
          onOpenImageUpload={handleOpenImageUpload}
          onAddShape={handleAddShape}
          onStartCrop={() => setIsCropOpen(true)}
          isDrawingMode={isDrawingMode}
          onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
          lang={lang}
        />

        {/* Center Canvas Area */}
        <CanvasArea
          dimensions={dimensions}
          backgroundColor={canvasBgColor}
          zoom={zoom}
          onZoomChange={(newZoom) => setZoom(newZoom)}
          onLayersChange={(newLayers) => setLayers(newLayers)}
          onActiveObjectChange={(obj) => setActiveObject(obj)}
          onHistoryChange={(undoable, redoable) => {
            setCanUndo(undoable);
            setCanRedo(redoable);
          }}
          registerCanvasRef={registerCanvasRef}
          isDrawingMode={isDrawingMode}
          lang={lang}
          onShowToast={showToast}
          undoTrigger={undoTrigger}
          redoTrigger={redoTrigger}
        />

        {/* Right Sidebar: Layers & Properties */}
        <RightSidebar
          layers={layers}
          selectedLayerId={activeObject?.__layerId || null}
          activeObject={activeObject}
          onSelectLayer={handleSelectLayer}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onDuplicateLayer={handleDuplicateLayer}
          onDeleteLayer={handleDeleteLayer}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onRenameLayer={handleRenameLayer}
          onUpdateTransform={handleUpdateTransform}
          onUpdateTextProps={handleUpdateTextProps}
          onUpdateShapeProps={handleUpdateShapeProps}
          onUpdateImageFilters={handleUpdateImageFilters}
          onResetImageFilters={handleResetImageFilters}
          currentFilters={currentFilters}
          canvasBgColor={canvasBgColor}
          onChangeCanvasBg={(color) => setCanvasBgColor(color)}
          canvasDimensions={dimensions}
          onCenterObject={handleCenterObject}
          lang={lang}
        />
      </div>

      {/* 3. Bottom Status Bar */}
      <StatusBar
        dimensions={dimensions}
        zoom={zoom}
        activeLayerName={activeObject?.__layerName || null}
        totalLayers={layers.length}
        lang={lang}
      />

      {/* 4. Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
        defaultWidth={dimensions.width}
        defaultHeight={dimensions.height}
        currentBgColor={canvasBgColor}
        lang={lang}
      />

      <PresetModal
        isOpen={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        currentDimensions={dimensions}
        onSelectPreset={handleSelectPreset}
        lang={lang}
      />

      <CropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        targetObject={activeObject}
        onApplyCrop={handleApplyCrop}
        lang={lang}
      />

      {/* 5. Feedback Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
