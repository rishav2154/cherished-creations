import { Truck, Gift, Shield, Clock, RotateCcw, CreditCard } from "lucide-react";

const features = [
  { icon: Truck, text: "Free Delivery" },
  { icon: RotateCcw, text: "Easy Returns" },
  { icon: Shield, text: "Secure Payment" },
  { icon: Gift, text: "Gift Wrapping" },
  { icon: CreditCard, text: "COD Available" },
  { icon: Clock, text: "Fast Shipping" },
];

export const MarqueeBanner = () => {
  return (
    <div className="bg-muted/50 border-b border-border/50 py-2.5 overflow-hidden">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
          {features.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap min-w-fit px-2"
            >
              <item.icon className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
