import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Loader2,
  ArrowLeft,
  Package,
  MessageSquare,
  BookMarked,
  Check
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart, appliedCoupon, getDiscount, getFinalPrice } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string | null>(null);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const subtotal = getTotalPrice();
  const discount = getDiscount();
  const discountedSubtotal = getFinalPrice();
  const shipping = appliedCoupon?.discountType === 'free_shipping' ? 0 : (subtotal > 500 ? 0 : 50);
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
      
      if (session?.user) {
        // Pre-fill email from user
        setAddress(prev => ({
          ...prev,
          fullName: session.user.user_metadata?.full_name || '',
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (data) {
        setSavedAddresses(data);
        // Auto-select default address
        const defaultAddr = data.find((a: any) => a.is_default);
        if (defaultAddr) {
          selectSavedAddress(defaultAddr);
        }
      }
    };
    fetchAddresses();
  }, [user]);

  const selectSavedAddress = (addr: any) => {
    setSelectedSavedAddress(addr.id);
    setAddress({
      fullName: addr.full_name,
      phone: '', // phone stays manual
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  useEffect(() => {
    if (!checkingAuth && !user) {
      navigate('/auth');
    }
  }, [checkingAuth, user, navigate]);

  useEffect(() => {
    if (items.length === 0 && !checkingAuth) {
      navigate('/cart');
    }
  }, [items, checkingAuth, navigate]);

  const getItemImage = (item: typeof items[0]) => {
    if (item.image && item.image !== '/placeholder.svg') {
      return item.image;
    }
    for (const [category, image] of Object.entries(categoryImages)) {
      if (item.name.toLowerCase().includes(category.replace('-', ' '))) {
        return image;
      }
    }
    return productTshirt;
  };

  const validateForm = () => {
    if (!address.fullName || !address.phone || !address.addressLine1 || 
        !address.city || !address.state || !address.pincode) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return false;
    }

    if (!/^\d{10}$/.test(address.phone)) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return false;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      toast({
        title: 'Invalid Pincode',
        description: 'Please enter a valid 6-digit pincode.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const createOrder = async () => {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user!.id,
        order_number: `ORD-${Date.now()}`,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        status: 'pending',
        notes: [appliedCoupon ? `Coupon: ${appliedCoupon.code}` : '', deliveryInstructions ? `Delivery: ${deliveryInstructions}` : ''].filter(Boolean).join(' | ') || null,
        shipping_address: {
          full_name: address.fullName,
          phone: address.phone,
          address_line1: address.addressLine1,
          address_line2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      price: item.price,
      customization: item.customization || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  };

  const handleRazorpayPayment = async (order: any) => {
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount: total, orderId: order.id, receipt: order.order_number },
    });

    if (error || data?.error) throw new Error(data?.error || error?.message || 'Failed to create Razorpay order');

    return new Promise<void>((resolve, reject) => {
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Giftoria',
        description: `Order ${order.order_number}`,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id,
              },
            });

            if (verifyError || verifyData?.error) {
              reject(new Error(verifyData?.error || 'Payment verification failed'));
              return;
            }

            resolve();
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        theme: { color: '#667eea' },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const order = await createOrder();

      if (paymentMethod === 'online') {
        await handleRazorpayPayment(order);
      }

      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (error: any) {
      console.error('Order error:', error);
      if (error.message !== 'Payment cancelled by user') {
        toast({
          title: 'Order Failed',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </button>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-gradient-accent">Checkout</span>
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <BookMarked className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-semibold">Saved Addresses</h2>
                  </div>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => selectSavedAddress(addr)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedSavedAddress === addr.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{addr.full_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          {selectedSavedAddress === addr.id && (
                            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 text-accent-foreground" />
                            </div>
                          )}
                        </div>
                        {addr.is_default && (
                          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent">Default</span>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedSavedAddress(null);
                        setAddress({ fullName: '', phone: address.phone, addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedSavedAddress === null
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <p className="font-medium text-sm">+ Enter a new address</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="10-digit phone number"
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      placeholder="House no., Building, Street"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                      placeholder="Landmark, Area (Optional)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Enter city"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="Enter state"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      className="mt-1"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Instructions */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Delivery Instructions</h2>
                    <p className="text-sm text-muted-foreground">Optional special instructions for delivery</p>
                  </div>
                </div>
                <Textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g., Leave at the door, Ring the bell twice, Call before delivery..."
                  className="min-h-[80px] resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">{deliveryInstructions.length}/200</p>
              </div>

              {/* Payment Method */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-accent" />
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay when you receive your order
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'online'
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <RadioGroupItem value="online" id="online" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-accent" />
                          <span className="font-medium">Online Payment</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay securely with Razorpay / Stripe
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-5 h-5 text-accent" />
                  <span>Free Shipping over ₹500</span>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="glass-card p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={getItemImage(item)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Discount ({appliedCoupon?.code})</span>
                      <span className="text-green-500">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon?.discountType === 'free_shipping' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-500">Free Shipping ({appliedCoupon.code})</span>
                      <span className="text-green-500">Applied</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500' : ''}>
                      {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-6 h-12 btn-luxury"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : paymentMethod === 'cod' ? (
                    'Place Order (COD)'
                  ) : (
                    'Proceed to Pay'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
