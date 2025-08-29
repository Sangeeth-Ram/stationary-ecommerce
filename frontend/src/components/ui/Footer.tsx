import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/products" className="text-base text-gray-500 hover:text-gray-900">All Products</Link></li>
              <li><Link to="/categories/notebooks" className="text-base text-gray-500 hover:text-gray-900">Notebooks</Link></li>
              <li><Link to="/categories/pens" className="text-base text-gray-500 hover:text-gray-900">Pens & Pencils</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-base text-gray-500 hover:text-gray-900">Shipping Policy</Link></li>
              <li><Link to="/returns" className="text-base text-gray-500 hover:text-gray-900">Returns</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/about" className="text-base text-gray-500 hover:text-gray-900">About Us</Link></li>
              <li><Link to="/blog" className="text-base text-gray-500 hover:text-gray-900">Blog</Link></li>
              <li><Link to="/careers" className="text-base text-gray-500 hover:text-gray-900">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-500 text-center">
            &copy; {currentYear} StationaryShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
