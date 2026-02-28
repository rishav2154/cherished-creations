import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

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

export const CategoriesSection = () => {
  return (
    <section className="py-3 sm:py-4 bg-card border-b border-border/50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide justify-between sm:justify-center">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="flex flex-col items-center gap-1.5 min-w-[60px] sm:min-w-[80px] group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-accent transition-colors">
                <img
                  src={categoryImages[category.id]}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-accent text-center leading-tight transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
