import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry for 404s or 401s
        if (error?.response?.status === 404 || error?.response?.status === 401) {
          return false;
        }
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error: any) => {
        toast.error(error.message || 'Something went wrong');
      },
    },
  },
});

// Query keys
export const QUERY_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CATEGORIES: 'categories',
  CART: 'cart',
  ORDERS: 'orders',
  USER_PROFILE: 'userProfile',
  ADMIN_PRODUCTS: 'adminProducts',
  ADMIN_ORDERS: 'adminOrders',
  ADMIN_USERS: 'adminUsers',
};
