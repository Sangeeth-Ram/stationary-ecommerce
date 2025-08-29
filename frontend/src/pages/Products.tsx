import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { QUERY_KEYS } from '../lib/react-query';
import type { Product } from '../types';

// Mock data
const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'notebooks', name: 'Notebooks' },
  { id: 'pens', name: 'Pens & Pencils' },
  { id: 'office', name: 'Office Supplies' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';

  // Fetch products
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, { category, sort, search: searchQuery }],
    queryFn: async () => {
      // In a real app, call your API with filters
      // const { data } = await api.getProducts({ category, sort, search: searchQuery });
      // return data;
      
      // Mock data
      return [
        {
          id: '1',
          name: 'Premium Notebook',
          slug: 'premium-notebook',
          description: 'High-quality A5 notebook',
          priceCents: 2499,
          category: { id: 'notebooks', name: 'Notebooks' },
          images: [{ id: '1', url: '/images/notebook.jpg', alt: 'Notebook', isPrimary: true }],
          inventory: { quantity: 100 },
          rating: 4.5,
          reviewCount: 24,
        },
      ] as Product[];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    params.delete('page');
    setSearchParams(params);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === 'all') params.delete('category');
    else params.set('category', e.target.value);
    params.delete('page');
    setSearchParams(params);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === 'newest') params.delete('sort');
    else params.set('sort', e.target.value);
    setSearchParams(params);
  };

  if (isError) {
    return (
      <div className="bg-white min-h-screen px-4 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error loading products</h1>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {category === 'all' ? 'All Products' : categories.find(c => c.id === category)?.name}
            {searchQuery && ` for "${searchQuery}"`}
          </h1>
          
          <div className="w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-[200px]"
              />
              <Button type="submit" variant="primary">
                Search
              </Button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <div className="w-full md:w-64 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={category}
                onChange={handleCategoryChange}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <Select
                value={sort}
                onChange={handleSortChange}
                options={sortOptions}
                className="w-full"
              />
            </div>
          </div>

          {/* Products grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-80" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found. Try adjusting your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
