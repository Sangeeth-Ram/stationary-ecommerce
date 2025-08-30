import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to StationaryShop</h1>
          <p className="text-xl text-gray-600 mb-8">Your one-stop shop for all stationery needs</p>
          <div className="space-x-4">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
