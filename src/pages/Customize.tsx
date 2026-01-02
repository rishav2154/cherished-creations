import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Type, Palette, RotateCcw, ZoomIn, ZoomOut, Move, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { categories } from '@/data/products';
import { useCartStore } from '@/store/cartStore';

import productTshirt from '@/assets/product-tshirt.jpg';
import productMug from '@/assets/product-mug.jpg';
import productFrame from '@/assets/product-frame.jpg';
import productPhone from '@/assets/product-phone.jpg';
import productPoster from '@/assets/product-poster.jpg';
import productCombo from '@/assets/product-combo.jpg';

const categoryImages: Record<string, string> = {
  tshirts: productTshirt,
  mugs: productMug,
  frames: productFrame,
  'phone-covers': productPhone,
  posters: productPoster,
  combos: productCombo,
};

const fonts = [
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Script', value: 'cursive' },
  { name: 'Bold', value: 'Impact, sans-serif' },
];

const Customize = () => {
  const [selectedCategory, setSelectedCategory] = useState('tshirts');
  const [customText, setCustomText] = useState('Your Text Here');
  const [textColor, setTextColor] = useState('#ffffff');
  const [selectedFont, setSelectedFont] = useState(fonts[0].value);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

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
      productId: `custom-${selectedCategory}-${Date.now()}`,
      name: `Custom ${categories.find(c => c.id === selectedCategory)?.name}`,
      price: 39.99,
      quantity: 1,
      image: categoryImages[selectedCategory],
      customization: {
        text: customText,
        imageUrl: uploadedImage || undefined,
        color: textColor,
      },
    });
    openCart();
  };

  const resetCustomization = () => {
    setCustomText('Your Text Here');
    setTextColor('#ffffff');
    setSelectedFont(fonts[0].value);
    setUploadedImage(null);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-accent font-medium text-sm tracking-wider uppercase">
              Design Your Own
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">
              Customize Your <span className="text-gradient-accent">Perfect Gift</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Upload your photos, add text, and create something truly unique
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Preview Area */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-2 lg:order-1"
            >
              <div className="glass-card p-8 rounded-3xl">
                <div className="aspect-square relative rounded-2xl overflow-hidden bg-muted/30">
                  {/* Product Base Image */}
                  <img
                    src={categoryImages[selectedCategory]}
                    alt="Product preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Custom Image Overlay */}
                  {uploadedImage && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      }}
                    >
                      <img
                        src={uploadedImage}
                        alt="Custom upload"
                        className="max-w-[60%] max-h-[60%] object-contain opacity-90"
                        style={{ transform: `scale(${imageScale})` }}
                      />
                    </div>
                  )}

                  {/* Custom Text Overlay */}
                  {customText && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="text-center text-2xl md:text-3xl font-bold px-4 drop-shadow-lg"
                        style={{
                          color: textColor,
                          fontFamily: selectedFont,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        {customText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Controls */}
                {uploadedImage && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                      onClick={() => setImageScale(Math.max(0.5, imageScale - 0.1))}
                      className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImageScale(Math.min(2, imageScale + 0.1))}
                      className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImagePosition({ x: 0, y: 0 })}
                      className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Move className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-1 lg:order-2 space-y-6"
            >
              {/* Product Selection */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Select Product</h3>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedCategory === category.id
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <p className="text-xs mt-2 truncate">{category.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Your Image
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors"
                >
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-muted-foreground">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click or drag to upload your image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </>
                  )}
                </button>
              </div>

              {/* Text Customization */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Add Text
                </h3>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your text..."
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-accent focus:outline-none transition-colors mb-4"
                  maxLength={50}
                />

                {/* Font Selection */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Font Style</label>
                  <div className="grid grid-cols-4 gap-2">
                    {fonts.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setSelectedFont(font.value)}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          selectedFont === font.value
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-4">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <label className="text-sm text-muted-foreground">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-sm text-muted-foreground">{textColor}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 btn-luxury flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart - $39.99
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetCustomization}
                  className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
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
