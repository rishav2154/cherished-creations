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
    <section className="py-4 sm:py-6 mt-4 sm:mt-2 bg-card/50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-5 sm:gap-8 overflow-x-auto pb-2 scrollbar-hide justify-between sm:justify-center">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="flex flex-col items-center gap-2 min-w-[64px] sm:min-w-[88px] group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border/60 group-hover:border-accent transition-all duration-300 shadow-md group-hover:shadow-accent/20 group-hover:scale-105">
                <img
                  src={categoryImages[category.id]}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-muted-foreground group-hover:text-accent text-center leading-tight transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
