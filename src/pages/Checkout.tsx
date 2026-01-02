import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, ChevronRight, Loader2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const addressSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required')
});

type Address = z.infer<typeof addressSchema> & { id?: string; is_default?: boolean };

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'stripe'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalPrice();
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });
    
    if (data) {
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      }
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = addressSchema.safeParse(newAddress);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: user?.id as string,
        ...newAddress,
        is_default: addresses.length === 0
      }])
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to save address', variant: 'destructive' });
    } else if (data) {
      setAddresses([...addresses, data as Address]);
      setSelectedAddress(data.id);
      setShowAddressForm(false);
      setNewAddress({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: ''
      });
      toast({ title: 'Success', description: 'Address saved successfully' });
    }
    setLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({ title: 'Error', description: 'Please select a delivery address', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const selectedAddr = addresses.find(a => a.id === selectedAddress);

    try {
      if (paymentMethod === 'cod') {
        // Create order for COD
        const { data: order, error } = await supabase
          .from('orders')
          .insert([{
            user_id: user?.id as string,
            order_number: '',
            payment_method: 'cod',
            payment_status: 'pending',
            subtotal,
            shipping,
            tax,
            total,
            shipping_address: selectedAddr as any
          }])
          .select()
          .single();

        if (error) throw error;

        // Add order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization || null
        }));

        await supabase.from('order_items').insert(orderItems);

        // Add initial tracking
        await supabase.from('order_tracking').insert({
          order_id: order.id,
          status: 'confirmed',
          description: 'Order confirmed successfully'
        });

        // Send confirmation
        await supabase.functions.invoke('send-order-confirmation', {
          body: { orderId: order.id, email: user?.email }
        });

        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      } else if (paymentMethod === 'razorpay') {
        // Create Razorpay order
        const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
          body: { amount: total, currency: 'INR' }
        });

        if (error) throw error;

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: data.key_id,
            amount: data.amount,
            currency: data.currency,
            order_id: data.order_id,
            name: 'PrintVerse',
            description: 'Order Payment',
            handler: async (response: any) => {
              // Verify payment and create order
              const { data: order } = await supabase
                .from('orders')
                .insert([{
                  user_id: user?.id as string,
                  order_number: '',
                  payment_method: 'razorpay',
                  payment_status: 'paid',
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  subtotal,
                  shipping,
                  tax,
                  total,
                  shipping_address: selectedAddr as any
                }])
                .select()
                .single();

              if (order) {
                const orderItems = items.map(item => ({
                  order_id: order.id,
                  product_name: item.name,
                  product_image: item.image,
                  quantity: item.quantity,
                  price: item.price,
                  customization: item.customization || null
                }));

                await supabase.from('order_items').insert(orderItems);
                await supabase.from('order_tracking').insert({
                  order_id: order.id,
                  status: 'confirmed',
                  description: 'Payment received and order confirmed'
                });

                await supabase.functions.invoke('send-order-confirmation', {
                  body: { orderId: order.id, email: user?.email }
                });

                clearCart();
                navigate(`/order-confirmation/${order.id}`);
              }
            },
            prefill: {
              email: user?.email,
              contact: selectedAddr?.phone
            },
            theme: { color: '#EC4899' }
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };
      } else if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
          body: {
            items: items.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })),
            shipping,
            tax,
            successUrl: `${window.location.origin}/order-confirmation`,
            cancelUrl: `${window.location.origin}/checkout`,
            metadata: {
              userId: user?.id,
              shippingAddress: JSON.stringify(selectedAddr)
            }
          }
        });

        if (error) throw error;

        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process order',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { num: 1, label: 'Address', icon: MapPin },
              { num: 2, label: 'Payment', icon: CreditCard },
              { num: 3, label: 'Confirm', icon: Check }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    step >= s.num ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                  <span className="font-medium">{s.label}</span>
                </div>
                {i < 2 && <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Address */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    Delivery Address
                  </h2>

                  {addresses.length > 0 && (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`border rounded-xl p-4 cursor-pointer transition-all ${
                            selectedAddress === addr.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <RadioGroupItem value={addr.id!} id={addr.id} className="sr-only" />
                          <label htmlFor={addr.id} className="cursor-pointer">
                            <p className="font-medium">{addr.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {showAddressForm ? (
                    <form onSubmit={handleAddAddress} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={newAddress.full_name}
                            onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                          />
                          {errors.full_name && <p className="text-destructive text-sm">{errors.full_name}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          />
                          {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address_line1">Address Line 1</Label>
                        <Input
                          id="address_line1"
                          value={newAddress.address_line1}
                          onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        />
                        {errors.address_line1 && <p className="text-destructive text-sm">{errors.address_line1}</p>}
                      </div>
                      <div>
                        <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                        <Input
                          id="address_line2"
                          value={newAddress.address_line2}
                          onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                          {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          />
                          {errors.state && <p className="text-destructive text-sm">{errors.state}</p>}
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                          />
                          {errors.pincode && <p className="text-destructive text-sm">{errors.pincode}</p>}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="outline" onClick={() => setShowAddressForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add New Address
                    </Button>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedAddress}
                      className="btn-luxury"
                    >
                      Continue to Payment
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                    Payment Method
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="space-y-3">
                    <div
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        paymentMethod === 'razorpay' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <RadioGroupItem value="razorpay" id="razorpay" className="sr-only" />
                      <label htmlFor="razorpay" className="cursor-pointer flex items-center gap-3">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                          Razorpay
                        </div>
                        <div>
                          <p className="font-medium">Razorpay</p>
                          <p className="text-sm text-muted-foreground">UPI, Cards, Wallets, NetBanking</p>
                        </div>
                      </label>
                    </div>

                    <div
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        paymentMethod === 'stripe' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <RadioGroupItem value="stripe" id="stripe" className="sr-only" />
                      <label htmlFor="stripe" className="cursor-pointer flex items-center gap-3">
                        <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                          Stripe
                        </div>
                        <div>
                          <p className="font-medium">Stripe</p>
                          <p className="text-sm text-muted-foreground">Credit/Debit Cards, Apple Pay, Google Pay</p>
                        </div>
                      </label>
                    </div>

                    <div
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" className="sr-only" />
                      <label htmlFor="cod" className="cursor-pointer flex items-center gap-3">
                        <Truck className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="btn-luxury">
                      Review Order
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent" />
                    Review Order
                  </h2>

                  {/* Delivery Address */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Delivery Address</h3>
                    {addresses.find(a => a.id === selectedAddress) && (
                      <div className="bg-muted/30 p-4 rounded-xl">
                        <p className="font-medium">{addresses.find(a => a.id === selectedAddress)?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {addresses.find(a => a.id === selectedAddress)?.address_line1}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addresses.find(a => a.id === selectedAddress)?.city}, {addresses.find(a => a.id === selectedAddress)?.state} - {addresses.find(a => a.id === selectedAddress)?.pincode}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Items ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <p className="font-medium capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button onClick={handlePlaceOrder} disabled={loading} className="btn-luxury">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Place Order
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-2xl sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-accent">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-sm text-green-500 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Free shipping on orders above ₹999!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
