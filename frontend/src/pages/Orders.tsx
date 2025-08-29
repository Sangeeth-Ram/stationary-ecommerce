import type { FC } from 'react';

const Orders: FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Your orders will appear here.</p>
      </div>
    </div>
  );
};

export default Orders;
