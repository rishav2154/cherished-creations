import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Upload, ShoppingBag, Check, X, 
  Search, ChevronDown, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

// Phone brands and models
const PHONE_BRANDS = [
  {
    name: 'Apple',
    models: [
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
      'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
      'iPhone SE (2022)', 'iPhone SE (2020)'
    ]
  },
  {
    name: 'Samsung',
    models: [
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
      'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4',
      'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy A24', 'Galaxy A14 5G',
      'Galaxy M54 5G', 'Galaxy M34 5G', 'Galaxy F54 5G'
    ]
  },
  {
    name: 'OnePlus',
    models: [
      'OnePlus 12', 'OnePlus 12R', 'OnePlus Open',
      'OnePlus 11', 'OnePlus 11R',
      'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus 10R',
      'OnePlus Nord 3', 'OnePlus Nord CE 3', 'OnePlus Nord CE 3 Lite',
      'OnePlus Nord N30', 'OnePlus Nord N20'
    ]
  },
  {
    name: 'Google',
    models: [
      'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 9 Pro Fold',
      'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
      'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
      'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a'
    ]
  },
  {
    name: 'Xiaomi',
    models: [
      'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
      'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13',
      'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
      'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
      'Poco F5 Pro', 'Poco F5', 'Poco X5 Pro', 'Poco X5'
    ]
  },
  {
    name: 'Vivo',
    models: [
      'Vivo X100 Pro', 'Vivo X100',
      'Vivo X90 Pro', 'Vivo X90',
      'Vivo V30 Pro', 'Vivo V30', 'Vivo V29 Pro', 'Vivo V29',
      'Vivo Y100', 'Vivo Y78+', 'Vivo Y56'
    ]
  },
  {
    name: 'Oppo',
    models: [
      'Oppo Find X7 Ultra', 'Oppo Find X7',
      'Oppo Find N3', 'Oppo Find N3 Flip',
      'Oppo Reno 11 Pro', 'Oppo Reno 11', 'Oppo Reno 10 Pro+', 'Oppo Reno 10',
      'Oppo A79', 'Oppo A78', 'Oppo A58'
    ]
  },
  {
    name: 'Realme',
    models: [
      'Realme GT 5 Pro', 'Realme GT 5',
      'Realme GT Neo 5', 'Realme GT Neo 5 SE',
      'Realme 12 Pro+', 'Realme 12 Pro', 'Realme 12',
      'Realme Narzo 60 Pro', 'Realme Narzo 60', 'Realme C55'
    ]
  },
  {
    name: 'Nothing',
    models: [
      'Nothing Phone (2a)', 'Nothing Phone (2)', 'Nothing Phone (1)'
    ]
  },
  {
    name: 'Motorola',
    models: [
      'Motorola Edge 50 Pro', 'Motorola Edge 50', 'Motorola Edge 40 Pro', 'Motorola Edge 40',
      'Motorola Razr 40 Ultra', 'Motorola Razr 40',
      'Moto G84', 'Moto G54', 'Moto G34'
    ]
  }
];

const COVER_TYPES = [
  { id: 'hard', name: 'Hard Plastic Case', description: 'Durable and lightweight protection', price: 299 },
  { id: 'soft', name: 'Soft Silicone Case', description: 'Flexible grip with shock absorption', price: 249 },
  { id: 'leather', name: 'Leather Finish Case', description: 'Premium leather texture look', price: 449 },
  { id: 'clear', name: 'Clear Transparent Case', description: 'Show off your design with crystal clarity', price: 349 },
  { id: 'matte', name: 'Matte Finish Case', description: 'Anti-fingerprint with smooth texture', price: 349 },
  { id: 'rugged', name: 'Rugged Armor Case', description: 'Military-grade drop protection', price: 549 },
];

export function PhoneCoverCustomizer() {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedCoverType, setSelectedCoverType] = useState<string>('hard');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { toast } = useToast();

  const selectedBrandData = PHONE_BRANDS.find(b => b.name === selectedBrand);
  const selectedCoverData = COVER_TYPES.find(c => c.id === selectedCoverType);
  
  const filteredBrands = PHONE_BRANDS.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );
  
  const filteredModels = selectedBrandData?.models.filter(m => 
    m.toLowerCase().includes(modelSearch.toLowerCase())
  ) || [];

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 10MB",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddToCart = () => {
    if (!selectedBrand || !selectedModel) {
      toast({
        title: "Select Phone Model",
        description: "Please select your phone brand and model",
        variant: "destructive"
      });
      return;
    }
    
    if (!uploadedImage) {
      toast({
        title: "Upload Image",
        description: "Please upload an image to print on your cover",
        variant: "destructive"
      });
      return;
    }

    addItem({
      productId: `custom-phone-cover-${Date.now()}`,
      name: `Custom ${selectedModel} ${selectedCoverData?.name}`,
      price: selectedCoverData?.price || 299,
      quantity: 1,
      image: uploadedImage,
      customization: {
        brand: selectedBrand,
        model: selectedModel,
        coverType: selectedCoverType,
        designUrl: uploadedImage
      }
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      openCart();
    }, 1500);
  };

  const isComplete = selectedBrand && selectedModel && uploadedImage;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-2 lg:order-1"
        >
          <div className="glass-card p-6 rounded-3xl sticky top-24">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent" />
              Cover Preview
            </h3>
            
            {/* Phone Cover Preview */}
            <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50 rounded-3xl overflow-hidden relative flex items-center justify-center">
              {uploadedImage ? (
                <div className="w-full h-full relative">
                  <img 
                    src={uploadedImage} 
                    alt="Cover design" 
                    className="w-full h-full object-cover"
                  />
                  {/* Phone frame overlay */}
                  <div className="absolute inset-0 border-[12px] border-black/20 rounded-3xl pointer-events-none" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/30 rounded-full" />
                </div>
              ) : (
                <div className="text-center p-8">
                  <Smartphone className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Upload an image to see preview</p>
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {(selectedBrand || selectedModel) && (
              <div className="mt-4 p-4 bg-muted/30 rounded-xl space-y-2">
                {selectedBrand && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{selectedBrand}</span>
                  </div>
                )}
                {selectedModel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{selectedModel}</span>
                  </div>
                )}
                {selectedCoverData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cover Type:</span>
                    <span className="font-medium">{selectedCoverData.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Price & Add to Cart */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Price</span>
                <span className="text-3xl font-bold">₹{selectedCoverData?.price || 299}</span>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={!isComplete}
                className="w-full h-14 text-lg bg-accent-gradient hover:opacity-90"
              >
                {showSuccess ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Right: Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-1 lg:order-2 space-y-6"
        >
          {/* Step 1: Select Brand */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="font-semibold">Select Phone Brand</h3>
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setShowBrandDropdown(!showBrandDropdown);
                  setShowModelDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl hover:border-accent transition-colors"
              >
                <span className={selectedBrand ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedBrand || 'Choose brand...'}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showBrandDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search brands..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredBrands.map((brand) => (
                        <button
                          key={brand.name}
                          onClick={() => {
                            setSelectedBrand(brand.name);
                            setSelectedModel('');
                            setShowBrandDropdown(false);
                            setBrandSearch('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between ${
                            selectedBrand === brand.name ? 'bg-accent/10 text-accent' : ''
                          }`}
                        >
                          <span>{brand.name}</span>
                          <span className="text-xs text-muted-foreground">{brand.models.length} models</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Step 2: Select Model */}
          <div className={`glass-card p-6 rounded-2xl transition-opacity ${!selectedBrand ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="font-semibold">Select Phone Model</h3>
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setShowModelDropdown(!showModelDropdown);
                  setShowBrandDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border border-border rounded-xl hover:border-accent transition-colors"
              >
                <span className={selectedModel ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedModel || 'Choose model...'}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showModelDropdown && selectedBrandData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search models..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredModels.map((model) => (
                        <button
                          key={model}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelDropdown(false);
                            setModelSearch('');
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors ${
                            selectedModel === model ? 'bg-accent/10 text-accent' : ''
                          }`}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Step 3: Select Cover Type */}
          <div className={`glass-card p-6 rounded-2xl transition-opacity ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="font-semibold">Select Cover Type</h3>
            </div>
            
            <RadioGroup 
              value={selectedCoverType} 
              onValueChange={setSelectedCoverType}
              className="grid gap-3"
            >
              {COVER_TYPES.map((cover) => (
                <Label
                  key={cover.id}
                  htmlFor={cover.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCoverType === cover.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <RadioGroupItem value={cover.id} id={cover.id} />
                  <div className="flex-1">
                    <p className="font-medium">{cover.name}</p>
                    <p className="text-sm text-muted-foreground">{cover.description}</p>
                  </div>
                  <span className="font-bold text-accent">₹{cover.price}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Step 4: Upload Image */}
          <div className={`glass-card p-6 rounded-2xl transition-opacity ${!selectedModel ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">4</div>
              <h3 className="font-semibold">Upload Your Photo</h3>
            </div>
            
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
                  alt="Uploaded" 
                  className="w-full aspect-video object-contain rounded-xl bg-muted/30"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Change
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Click or drag to upload</p>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </button>
            )}
            
            <div className="mt-4 p-3 bg-accent/10 rounded-lg">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>For best results, use high-resolution images (at least 1200x1600 pixels). Your design will be printed edge-to-edge on the cover.</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
