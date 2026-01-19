-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can read active coupons
CREATE POLICY "Anyone can read active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- Insert some sample coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount) VALUES
('GIFT10', '10% off on your order', 'percentage', 10, 100, 500),
('FREESHIP', 'Free shipping on all orders', 'free_shipping', 0, 0, NULL),
('FLAT100', 'Flat ₹100 off', 'fixed', 100, 500, NULL),
('WELCOME20', '20% off for new customers', 'percentage', 20, 200, 1000);