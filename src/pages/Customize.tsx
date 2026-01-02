import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Type, Palette, RotateCcw, ShoppingBag, 
  Shirt, Coffee, Frame, Smartphone, Image, Gift,
  Sparkles, Check, X
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import ProductViewer3D from '@/components/3d/ProductViewer3D';

const productTypes = [
  { id: 'tshirt', name: 'T-Shirt', icon: Shirt, price: 29.99 },
  { id: 'mug', name: 'Mug', icon: Coffee, price: 19.99 },
  { id: 'frame', name: 'Frame', icon: Frame, price: 34.99 },
  { id: 'phone', name: 'Phone Cover', icon: Smartphone, price: 24.99 },
  { id: 'poster', name: 'Poster', icon: Image, price: 14.99 },
  { id: 'combo', name: 'Gift Combo', icon: Gift, price: 79.99 },
] as const;

const productColors = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Forest', value: '#166534' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Gold', value: '#ca8a04' },
];

const fonts = [
  { name: 'Modern', value: 'Poppins, sans-serif' },
  { name: 'Classic', value: 'Georgia, serif' },
  { name: 'Script', value: 'cursive' },
  { name: 'Bold', value: 'Impact, sans-serif' },
];

const textColors = [
  '#ffffff', '#000000', '#dc2626', '#2563eb', 
  '#16a34a', '#ca8a04', '#9333ea', '#ec4899'
];

type ProductType = typeof productTypes[number]['id'];

const Customize = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('tshirt');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState(fonts[0].value);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const currentProduct = productTypes.find(p => p.id === selectedProduct)!;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: `custom-${selectedProduct}-${Date.now()}`,
      name: `Custom ${currentProduct.name}`,
      price: currentProduct.price,
      quantity: 1,
      image: '/placeholder.svg',
      customization: {
        text: customText,
        imageUrl: uploadedImage || undefined,
        color: selectedColor,
      },
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      openCart();
    }, 1500);
  };

  const resetCustomization = () => {
    setCustomText('');
    setTextColor('#000000');
    setSelectedFont(fonts[0].value);
    setUploadedImage(null);
    setSelectedColor('#ffffff');
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 md:py-12"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Design Studio</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-bold">
              Create Your <span className="text-gradient-accent">Masterpiece</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Upload your photos, add text, and watch your design come to life in 3D
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left Sidebar - Product Selection */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass-card p-4 rounded-2xl sticky top-24">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  Select Product
                </h3>
                <div className="space-y-2">
                  {productTypes.map((product) => {
                    const Icon = product.icon;
                    return (
                      <motion.button
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedProduct === product.id
                            ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                            : 'bg-muted/50 hover:bg-muted text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className={`text-xs ${selectedProduct === product.id ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                            ${product.price}
                          </p>
                        </div>
                        {selectedProduct === product.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Center - 3D Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="glass-card p-4 md:p-6 rounded-3xl">
                <div className="aspect-square relative">
                  <ProductViewer3D
                    productType={selectedProduct}
                    color={selectedColor}
                    customImage={uploadedImage}
                    customText={customText}
                    textColor={textColor}
                    fontFamily={selectedFont}
                  />
                </div>
                
                {/* Color Selection */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Product Color
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {productColors.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.value
                            ? 'border-accent scale-110 shadow-lg'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <Check className={`w-4 h-4 mx-auto ${color.value === '#ffffff' || color.value === '#ca8a04' ? 'text-black' : 'text-white'}`} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Sidebar - Customization Controls */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Image Upload */}
              <div className="glass-card p-5 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-accent" />
                  Upload Your Photo
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="w-full aspect-video object-contain rounded-xl bg-muted/50"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg bg-accent text-accent-foreground"
                      >
                        <Upload className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={removeImage}
                        className="p-2 rounded-lg bg-destructive text-destructive-foreground"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-foreground font-medium">
                      Click to upload your image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </motion.button>
                )}
              </div>

              {/* Text Customization */}
              <div className="glass-card p-5 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-accent" />
                  Add Custom Text
                </h3>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your message..."
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  maxLength={40}
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {customText.length}/40 characters
                </p>

                {/* Font Selection */}
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.map((font) => (
                      <motion.button
                        key={font.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedFont(font.value)}
                        className={`p-3 rounded-xl text-sm transition-all ${
                          selectedFont === font.value
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Text Color</label>
                  <div className="flex flex-wrap gap-2">
                    {textColors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          textColor === color
                            ? 'border-accent scale-110'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-2xl font-bold text-gradient-accent">
                      ${currentProduct.price}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetCustomization}
                    className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    title="Reset Design"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={showSuccess}
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
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Customize;
