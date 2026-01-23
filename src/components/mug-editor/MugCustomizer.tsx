import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Check, ShoppingBag, Palette, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fabric2DEditor } from './Fabric2DEditor';
import { MugPreview3D } from './MugPreview3D';
import { MUG_VARIANTS, MugVariant } from './types';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

const MUG_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Forest', value: '#166534' },
  { name: 'Purple', value: '#7c3aed' },
];

interface MugCustomizerProps {
  onAddToCart?: () => void;
}

export function MugCustomizer({ onAddToCart }: MugCustomizerProps) {
  const [selectedVariant, setSelectedVariant] = useState<MugVariant>(MUG_VARIANTS[0]);
  const [canvasTexture, setCanvasTexture] = useState<string | null>(null);
  const [mugColor, setMugColor] = useState('#ffffff');
  const [showSuccess, setShowSuccess] = useState(false);
  const [printReadyFile, setPrintReadyFile] = useState<string | null>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { toast } = useToast();

  const handleCanvasUpdate = useCallback((dataUrl: string) => {
    console.log('MugCustomizer: Canvas updated, dataUrl length:', dataUrl?.length);
    setCanvasTexture(dataUrl);
  }, []);

  const handleExportReady = useCallback((dataUrl: string) => {
    setPrintReadyFile(dataUrl);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `mug-design-${selectedVariant.id}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    toast({
      title: "Design Exported",
      description: "Your print-ready file has been downloaded (300 DPI)"
    });
  }, [selectedVariant.id, toast]);

  const handleAddToCart = useCallback(() => {
    if (!canvasTexture) {
      toast({
        title: "No Design",
        description: "Please upload an image to customize your mug",
        variant: "destructive"
      });
      return;
    }

    addItem({
      productId: `custom-mug-${selectedVariant.id}-${Date.now()}`,
      name: `Custom ${selectedVariant.name} Mug`,
      price: selectedVariant.price,
      quantity: 1,
      image: canvasTexture,
      customization: {
        variant: selectedVariant.id,
        color: mugColor,
        designUrl: canvasTexture
      }
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      openCart();
      onAddToCart?.();
    }, 1500);
  }, [canvasTexture, selectedVariant, mugColor, addItem, openCart, onAddToCart, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10">
            <Coffee className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Magic Cup Designer</h2>
            <p className="text-sm text-muted-foreground">Create your custom printed mug</p>
          </div>
        </div>
        
        {/* Variant Selection */}
        <div className="flex gap-2">
          {MUG_VARIANTS.map((variant) => (
            <Button
              key={variant.id}
              variant={selectedVariant.id === variant.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVariant(variant)}
              className="gap-2"
            >
              <Coffee className="w-4 h-4" />
              {variant.name}
              <span className="text-xs opacity-70">₹{variant.price}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: 2D Editor */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            2D Design Editor
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <Fabric2DEditor
              variant={selectedVariant}
              onCanvasUpdate={handleCanvasUpdate}
              onExportReady={handleExportReady}
            />
          </div>
        </div>

        {/* Right: 3D Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coffee className="w-4 h-4" />
            3D Live Preview
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <MugPreview3D
              canvasTexture={canvasTexture}
              variant={selectedVariant}
              mugColor={mugColor}
            />
          </div>

          {/* Color Selection */}
          <div className="glass-card p-4 rounded-2xl">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Mug Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {MUG_COLORS.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMugColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    mugColor === color.value
                      ? 'border-accent scale-110 shadow-lg'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {mugColor === color.value && (
                    <Check className={`w-4 h-4 mx-auto ${color.value === '#ffffff' ? 'text-black' : 'text-white'}`} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold text-gradient-accent">
                  ₹{selectedVariant.price}
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={showSuccess || !canvasTexture}
              className="w-full btn-luxury flex items-center justify-center gap-3 py-4 disabled:opacity-70"
            >
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
