import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { QUERY_KEYS } from '@/lib/react-query';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/useCart';

// Mock product data - in a real app, this would come from your API
const mockProduct = {
  id: '1',
  name: 'Premium Notebook',
  slug: 'premium-notebook',
  description: 'High-quality A5 notebook with 120 pages of premium paper, perfect for note-taking, journaling, or sketching. The thick, acid-free paper prevents ink bleed-through, and the durable cover protects your notes.',
  priceCents: 2499,
  category: { id: 'notebooks', name: 'Notebooks' },
  images: [
    { id: '1', url: '/images/notebook-1.jpg', alt: 'Premium Notebook Front', isPrimary: true },
    { id: '2', url: '/images/notebook-2.jpg', alt: 'Premium Notebook Back', isPrimary: false },
    { id: '3', url: '/images/notebook-3.jpg', alt: 'Premium Notebook Inside', isPrimary: false },
  ],
  inventory: { quantity: 100 },
  rating: 4.5,
  reviewCount: 24,
  details: [
    'A5 size (148 x 210 mm)',
    '120 pages (60 sheets)',
    '100gsm acid-free paper',
    'Dot grid format',
    'Lay-flat binding',
    'Elastic closure',
    'Ribbon bookmark',
    'Back pocket',
  ],
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2023-01-15T10:00:00Z',
};

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart } = useCart();

  // In a real app, you would fetch the product by slug
  const { data: product = mockProduct, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, slug],
    queryFn: async () => {
      // const { data } = await api.getProductBySlug(slug!);
      // return data;
      return mockProduct;
    },
  });

  // Set the selected image to the primary image when the product loads
  useEffect(() => {
    if (product?.images?.length) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      setSelectedImage(primaryImage.url);
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: product.images[0]?.url || '',
      quantity,
      maxQuantity: product.inventory.quantity,
    });
    
    // Optional: Show success message or navigate to cart
    // toast.success('Added to cart!');
    // navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button variant="primary" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const otherImages = product.images.filter(img => img !== primaryImage);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <a href={`/products?category=${product.category.id}`} className="text-gray-500 hover:text-gray-700">
                {product.category.name}
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Image gallery */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={selectedImage || primaryImage?.url}
                alt={primaryImage?.alt || product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            {otherImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {otherImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                ${(product.priceCents / 100).toFixed(2)}
              </p>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <svg
                      key={rating}
                      className={`h-5 w-5 flex-shrink-0 ${
                        rating < Math.round(product.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  {product.reviewCount} reviews
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Details</h3>
              <div className="mt-4">
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  {product.details?.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.inventory.quantity}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="mt 4 text-sm text-gray-500">
                {product.inventory.quantity > 0 ? (
                  <span className="text-green-600">In stock ({product.inventory.quantity} available)</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>
              <Button
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                onClick={handleAddToCart}
                disabled={product.inventory.quantity === 0}
              >
                {product.inventory.quantity > 0 ? 'Add to cart' : 'Out of stock'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
