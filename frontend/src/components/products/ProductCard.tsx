import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  
  return (
    <div className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 lg:aspect-none lg:h-60">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              <Link to={`/products/${product.slug}`}>
                <span aria-hidden="true" className="absolute inset-0" />
                {product.name}
              </Link>
            </h3>
            {product.category && (
              <p className="mt-1 text-sm text-gray-500">{product.category.name}</p>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(product.priceCents / 100)}
          </p>
        </div>

        {product.rating && (
          <div className="mt-2 flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((rating) => (
                <StarIcon
                  key={rating}
                  className={`h-4 w-4 ${
                    product.rating > rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-500">
              {product.reviewCount} reviews
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            // onClick handler for add to cart would go here
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
};
