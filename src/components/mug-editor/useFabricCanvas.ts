import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { MugVariant, CanvasExportOptions } from './types';

// Types for Fabric.js (loaded dynamically)
type FabricCanvas = any;
type FabricRect = any;
type FabricImage = any;
type FabricModule = typeof import('fabric');

interface UseFabricCanvasOptions {
  variant: MugVariant;
  onCanvasUpdate: (dataUrl: string) => void;
}

interface UseFabricCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isReady: boolean;
  hasImage: boolean;
  addImage: (imageUrl: string) => Promise<void>;
  removeSelected: () => void;
  clearCanvas: () => void;
  centerSelected: () => void;
  rotateSelected: (degrees: number) => void;
  scaleSelected: (factor: number) => void;
  exportCanvas: (options?: Partial<CanvasExportOptions>) => string | null;
  getPrintReadyExport: () => string | null;
  getCanvasDisplaySize: () => { width: number; height: number };
}

export function useFabricCanvas({ variant, onCanvasUpdate }: UseFabricCanvasOptions): UseFabricCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fabricModuleRef = useRef<FabricModule | null>(null);
  const initializingRef = useRef(false);
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
  }, [variant.printArea]);

  // Memoize the display size
  const displaySize = useMemo(() => getCanvasDisplaySize(), [getCanvasDisplaySize]);

  // Internal export function
  const exportCanvasInternal = useCallback((
    canvas: FabricCanvas, 
    multiplier: number = 1,
    options?: Partial<CanvasExportOptions>
  ): string => {
    // Temporarily hide the border for export
    const objects = canvas.getObjects();
    const border = objects.find((obj: any) => obj.__isPrintAreaBorder === true);
    if (border) {
      border.visible = false;
    }

    const dataUrl = canvas.toDataURL({
      format: options?.format || 'png',
      quality: options?.quality || 1,
      multiplier: Math.min(multiplier, 4),
    });

    if (border) {
      border.visible = true;
    }

    return dataUrl;
  }, []);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current || initializingRef.current) return;
    
    initializingRef.current = true;
    let mounted = true;
    let canvas: FabricCanvas | null = null;

    const initFabric = async () => {
      try {
        // Dynamic import to avoid React context conflicts
        const fabricModule = await import('fabric');
        
        if (!mounted || !canvasRef.current) {
          initializingRef.current = false;
          return;
        }

        fabricModuleRef.current = fabricModule;
        const { width, height } = displaySize;
        
        // Create fabric canvas
        canvas = new fabricModule.Canvas(canvasRef.current, {
          width,
          height,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true,
        });

        // Add print area visual indicators
        const safeMargin = 10; // Safe margin inside border
        
        // Main print area border (outer edge)
        const printAreaBorder = new fabricModule.Rect({
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
        (printAreaBorder as any).__isPrintAreaBorder = true;
        
        // Safe zone border (inner recommended area)
        const safeZone = new fabricModule.Rect({
          left: safeMargin,
          top: safeMargin,
          width: width - (safeMargin * 2),
          height: height - (safeMargin * 2),
          fill: 'transparent',
          stroke: '#22c55e',
          strokeWidth: 1,
          strokeDashArray: [4, 4],
          selectable: false,
          evented: false,
          opacity: 0.6,
        });
        (safeZone as any).__isPrintAreaBorder = true;

        // Corner markers for visual guidance
        const cornerSize = 20;
        const cornerStroke = '#3b82f6';
        const corners = [
          // Top-left
          { points: [0, cornerSize, 0, 0, cornerSize, 0] },
          // Top-right  
          { points: [width - cornerSize, 0, width, 0, width, cornerSize] },
          // Bottom-left
          { points: [0, height - cornerSize, 0, height, cornerSize, height] },
          // Bottom-right
          { points: [width - cornerSize, height, width, height, width, height - cornerSize] },
        ];

        corners.forEach(({ points }) => {
          const cornerLine = new fabricModule.Polyline(
            [
              { x: points[0], y: points[1] },
              { x: points[2], y: points[3] },
              { x: points[4], y: points[5] },
            ],
            {
              fill: 'transparent',
              stroke: cornerStroke,
              strokeWidth: 3,
              selectable: false,
              evented: false,
            }
          );
          (cornerLine as any).__isPrintAreaBorder = true;
          canvas.add(cornerLine);
        });

        // Add all border elements
        canvas.add(printAreaBorder);
        canvas.add(safeZone);

        fabricRef.current = canvas;

        // Export canvas on any change
        const handleChange = () => {
          if (fabricRef.current && mounted) {
            const multiplier = variant.printArea.width / displaySize.width;
            const dataUrl = exportCanvasInternal(fabricRef.current, multiplier);
            onCanvasUpdate(dataUrl);
          }
        };

        canvas.on('object:modified', handleChange);
        canvas.on('object:added', handleChange);
        canvas.on('object:removed', handleChange);

        if (mounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize Fabric canvas:', error);
        initializingRef.current = false;
      }
    };

    initFabric();

    return () => {
      mounted = false;
      if (canvas) {
        canvas.dispose();
      }
      fabricRef.current = null;
      initializingRef.current = false;
      setIsReady(false);
      setHasImage(false);
    };
  }, [displaySize, variant.printArea.width, exportCanvasInternal, onCanvasUpdate]);

  // Export canvas as data URL
  const exportCanvas = useCallback((options?: Partial<CanvasExportOptions>): string | null => {
    if (!fabricRef.current) return null;
    
    const multiplier = options?.multiplier || (variant.printArea.width / displaySize.width);
    const dataUrl = exportCanvasInternal(fabricRef.current, multiplier, options);
    onCanvasUpdate(dataUrl);
    return dataUrl;
  }, [variant.printArea.width, displaySize.width, exportCanvasInternal, onCanvasUpdate]);

  // Add image to canvas
  const addImage = useCallback(async (imageUrl: string): Promise<void> => {
    if (!fabricRef.current || !fabricModuleRef.current) return;

    const fabricModule = fabricModuleRef.current;
    const canvas = fabricRef.current;
    const { width, height } = displaySize;

    try {
      const img = await fabricModule.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      
      // Calculate scale to fit within print area while maintaining aspect ratio
      const imgAspect = img.width! / img.height!;
      const canvasAspect = width / height;
      
      let scale: number;
      if (imgAspect > canvasAspect) {
        scale = (width * 0.9) / img.width!;
      } else {
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
      canvas.getObjects().forEach((obj: any) => {
        if (obj.type === 'image') {
          canvas.remove(obj);
        }
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setHasImage(true);
      
      // Trigger export
      const multiplier = variant.printArea.width / displaySize.width;
      const dataUrl = exportCanvasInternal(canvas, multiplier);
      onCanvasUpdate(dataUrl);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }, [displaySize, variant.printArea.width, exportCanvasInternal, onCanvasUpdate]);

  // Remove selected object
  const removeSelected = useCallback(() => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject && (activeObject as any).__isPrintAreaBorder !== true) {
      fabricRef.current.remove(activeObject);
      fabricRef.current.renderAll();
      
      // Check if any images remain
      const hasImages = fabricRef.current.getObjects().some((obj: any) => obj.type === 'image');
      setHasImage(hasImages);
      
      const multiplier = variant.printArea.width / displaySize.width;
      const dataUrl = exportCanvasInternal(fabricRef.current, multiplier);
      onCanvasUpdate(dataUrl);
    }
  }, [variant.printArea.width, displaySize.width, exportCanvasInternal, onCanvasUpdate]);

  // Clear canvas (except border)
  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;

    const objects = [...fabricRef.current.getObjects()];
    objects.forEach((obj: any) => {
      if (obj.__isPrintAreaBorder !== true) {
        fabricRef.current!.remove(obj);
      }
    });
    fabricRef.current.renderAll();
    setHasImage(false);
    
    const multiplier = variant.printArea.width / displaySize.width;
    const dataUrl = exportCanvasInternal(fabricRef.current, multiplier);
    onCanvasUpdate(dataUrl);
  }, [variant.printArea.width, displaySize.width, exportCanvasInternal, onCanvasUpdate]);

  // Center selected object
  const centerSelected = useCallback(() => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      const { width, height } = displaySize;
      activeObject.set({
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center'
      });
      fabricRef.current.renderAll();
      
      const multiplier = variant.printArea.width / displaySize.width;
      const dataUrl = exportCanvasInternal(fabricRef.current, multiplier);
      onCanvasUpdate(dataUrl);
    }
  }, [displaySize, variant.printArea.width, exportCanvasInternal, onCanvasUpdate]);

  // Rotate selected object
  const rotateSelected = useCallback((degrees: number) => {
    if (!fabricRef.current) return;

    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.rotate(currentAngle + degrees);
      fabricRef.current.renderAll();
      
      const multiplier = variant.printArea.width / displaySize.width;
      const dataUrl = exportCanvasInternal(fabricRef.current, multiplier);
      onCanvasUpdate(dataUrl);
    }
  }, [variant.printArea.width, displaySize.width, exportCanvasInternal, onCanvasUpdate]);

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
      
      const multiplier = variant.printArea.width / displaySize.width;
      const dataUrl = exportCanvasInternal(fabricRef.current, multiplier);
      onCanvasUpdate(dataUrl);
    }
  }, [variant.printArea.width, displaySize.width, exportCanvasInternal, onCanvasUpdate]);

  // Get print-ready export
  const getPrintReadyExport = useCallback((): string | null => {
    return exportCanvas({
      format: 'png',
      quality: 1,
      multiplier: variant.printArea.width / displaySize.width
    });
  }, [exportCanvas, variant.printArea.width, displaySize.width]);

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
