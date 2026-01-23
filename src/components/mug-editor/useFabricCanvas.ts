import { useRef, useEffect, useCallback, useState } from 'react';
import * as fabric from 'fabric';
import { MugVariant, CanvasExportOptions } from './types';

interface UseFabricCanvasOptions {
  variant: MugVariant;
  onCanvasUpdate: (dataUrl: string) => void;
}

export function useFabricCanvas({ variant, onCanvasUpdate }: UseFabricCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  // Calculate canvas display size (fit within container while maintaining aspect ratio)
  const getCanvasDisplaySize = useCallback(() => {
    const maxWidth = 500;
    const maxHeight = 350;
    const { aspectRatio } = variant.printArea;
    
    let width = maxWidth;
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width, height };
  }, [variant]);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const { width, height } = getCanvasDisplaySize();
    
    // Create fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    // Add print-safe area border visualization
    const printAreaBorder = new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    });
    // Use custom property to identify the border
    (printAreaBorder as any).__isPrintAreaBorder = true;
    canvas.add(printAreaBorder);

    fabricRef.current = canvas;
    setIsReady(true);

    // Export canvas on any change
    const handleChange = () => {
      exportCanvas();
    };

    canvas.on('object:modified', handleChange);
    canvas.on('object:added', handleChange);
    canvas.on('object:removed', handleChange);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      setIsReady(false);
    };
  }, [variant, getCanvasDisplaySize]);

  // Export canvas as data URL
  const exportCanvas = useCallback((options?: Partial<CanvasExportOptions>) => {
    if (!fabricRef.current) return null;

    const { width, height } = getCanvasDisplaySize();
    const multiplier = options?.multiplier || (variant.printArea.width / width); // Scale to print resolution

    // Temporarily hide the border for export
    const objects = fabricRef.current.getObjects();
    const border = objects.find(obj => (obj as any).__isPrintAreaBorder === true);
    if (border) {
      border.visible = false;
    }

    const dataUrl = fabricRef.current.toDataURL({
      format: options?.format || 'png',
      quality: options?.quality || 1,
      multiplier: Math.min(multiplier, 4), // Cap at 4x to prevent memory issues
    });

    if (border) {
      border.visible = true;
    }

    onCanvasUpdate(dataUrl);
    return dataUrl;
  }, [variant, getCanvasDisplaySize, onCanvasUpdate]);

  // Add image to canvas
  const addImage = useCallback(async (imageUrl: string) => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    const { width, height } = getCanvasDisplaySize();

    try {
      const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      
      // Calculate scale to fit within print area while maintaining aspect ratio
      const imgAspect = img.width! / img.height!;
      const canvasAspect = width / height;
      
      let scale: number;
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        scale = (width * 0.9) / img.width!;
      } else {
        // Image is taller than canvas
        scale = (height * 0.9) / img.height!;
      }

      img.set({
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        cornerSize: 12,
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#ffffff',
        borderColor: '#3b82f6',
        transparentCorners: false,
        borderScaleFactor: 2,
      });

      // Remove any existing images
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'image') {
          canvas.remove(obj);
        }
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setHasImage(true);
      exportCanvas();
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }, [getCanvasDisplaySize, exportCanvas]);

  // Remove selected object
  const removeSelected = useCallback(() => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject && (activeObject as any).__isPrintAreaBorder !== true) {
      fabricRef.current.remove(activeObject);
      fabricRef.current.renderAll();
      
      // Check if any images remain
      const hasImages = fabricRef.current.getObjects().some(obj => obj.type === 'image');
      setHasImage(hasImages);
      exportCanvas();
    }
  }, [exportCanvas]);

  // Clear canvas (except border)
  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;

    const objects = [...fabricRef.current.getObjects()];
    objects.forEach(obj => {
      if ((obj as any).__isPrintAreaBorder !== true) {
        fabricRef.current!.remove(obj);
      }
    });
    fabricRef.current.renderAll();
    setHasImage(false);
    exportCanvas();
  }, [exportCanvas]);

  // Center selected object
  const centerSelected = useCallback(() => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      const { width, height } = getCanvasDisplaySize();
      activeObject.set({
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center'
      });
      fabricRef.current.renderAll();
      exportCanvas();
    }
  }, [getCanvasDisplaySize, exportCanvas]);

  // Rotate selected object
  const rotateSelected = useCallback((degrees: number) => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.rotate(currentAngle + degrees);
      fabricRef.current.renderAll();
      exportCanvas();
    }
  }, [exportCanvas]);

  // Scale selected object
  const scaleSelected = useCallback((factor: number) => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      const currentScaleX = activeObject.scaleX || 1;
      const currentScaleY = activeObject.scaleY || 1;
      activeObject.set({
        scaleX: currentScaleX * factor,
        scaleY: currentScaleY * factor
      });
      fabricRef.current.renderAll();
      exportCanvas();
    }
  }, [exportCanvas]);

  // Get print-ready export
  const getPrintReadyExport = useCallback(() => {
    return exportCanvas({
      format: 'png',
      quality: 1,
      multiplier: variant.printArea.width / getCanvasDisplaySize().width
    });
  }, [exportCanvas, variant, getCanvasDisplaySize]);

  return {
    canvasRef,
    isReady,
    hasImage,
    addImage,
    removeSelected,
    clearCanvas,
    centerSelected,
    rotateSelected,
    scaleSelected,
    exportCanvas,
    getPrintReadyExport,
    getCanvasDisplaySize
  };
}
