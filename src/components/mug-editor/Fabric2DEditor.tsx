import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Trash2, RotateCcw, RotateCw, 
  ZoomIn, ZoomOut, Move, Download, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFabricCanvas } from './useFabricCanvas';
import { MugVariant } from './types';

interface Fabric2DEditorProps {
  variant: MugVariant;
  onCanvasUpdate: (dataUrl: string) => void;
  onExportReady?: (dataUrl: string) => void;
}

export function Fabric2DEditor({ 
  variant, 
  onCanvasUpdate,
  onExportReady 
}: Fabric2DEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    canvasRef,
    isReady,
    hasImage,
    addImage,
    removeSelected,
    clearCanvas,
    centerSelected,
    rotateSelected,
    scaleSelected,
    getPrintReadyExport,
    getCanvasDisplaySize
  } = useFabricCanvas({ variant, onCanvasUpdate });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addImage(dataUrl);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  }, [addImage]);

  const handleExport = useCallback(() => {
    const dataUrl = getPrintReadyExport();
    if (dataUrl && onExportReady) {
      onExportReady(dataUrl);
    }
  }, [getPrintReadyExport, onExportReady]);

  const { width, height } = getCanvasDisplaySize();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => rotateSelected(-15)}
          disabled={!hasImage}
          title="Rotate Left"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => rotateSelected(15)}
          disabled={!hasImage}
          title="Rotate Right"
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => scaleSelected(1.1)}
          disabled={!hasImage}
          title="Scale Up"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scaleSelected(0.9)}
          disabled={!hasImage}
          title="Scale Down"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={centerSelected}
          disabled={!hasImage}
          title="Center Image"
        >
          <Move className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={removeSelected}
          disabled={!hasImage}
          title="Remove Selected"
          className="text-destructive hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={clearCanvas}
          disabled={!hasImage}
          title="Clear All"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={!hasImage}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export Print File
        </Button>
      </div>

      {/* Canvas Container */}
      <div className="relative flex justify-center items-center p-4 bg-muted/30 rounded-xl min-h-[400px]">
        {/* Print Area Info */}
        <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
          Print Area: {variant.printArea.width / 300}"×{variant.printArea.height / 300}" @ 300 DPI
        </div>
        
        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isReady ? 1 : 0.5, scale: 1 }}
          className="relative shadow-lg rounded-lg overflow-hidden"
          style={{ width, height }}
        >
          <canvas ref={canvasRef} />
          
          {/* Upload Overlay (when no image) */}
          {!hasImage && isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <p className="text-foreground font-medium">Click to upload your image</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
            </motion.div>
          )}
        </motion.div>

        {/* Guidelines */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center">
          <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
            Drag to position • Corners to resize • Rotate handle on top
          </p>
        </div>
      </div>
    </div>
  );
}
