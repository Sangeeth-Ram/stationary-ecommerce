import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

type LocationState = {
  orderId: string;
  paymentId: string | null;
};

export const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentId } = (location.state as LocationState) || {};

  // Redirect to home if accessed directly without order data
  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-green-600 sm:text-5xl">✓</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                Thank you for your order!
              </h1>
              <p className="mt-1 text-base text-gray-500">
                Your order #{orderId} has been placed and is being processed.
                {paymentId && (
                  <span className="block mt-1">
                    Payment ID: <span className="font-mono">{paymentId}</span>
                  </span>
                )}
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Button as={Link} to="/orders" variant="primary">
                View Orders
              </Button>
              <Button as={Link} to="/products" variant="outline">
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
