import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query';

export const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to StationaryShop</h1>
          <p className="text-xl mb-8">Your one-stop shop for all stationery needs</p>
          <Link 
            to="/products"
            className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 1, name: 'Notebooks', count: 24 },
            { id: 2, name: 'Pens & Pencils', count: 36 },
            { id: 3, name: 'Office Supplies', count: 18 },
          ].map((category) => (
            <div key={category.id} className="border rounded-lg p-6 hover:shadow-md">
              <h3 className="font-medium text-lg">{category.name}</h3>
              <p className="text-gray-500">{category.count} items</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
