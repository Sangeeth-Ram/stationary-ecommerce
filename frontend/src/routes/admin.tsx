import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { AdminRoute } from '../components/routes/AdminRoute';

// Lazy load admin pages for better performance
const lazyLoad = (path: string) => {
  return lazy(() => import(`../pages/admin/${path}`).then(module => ({
    default: module.default
  })));
};

// Lazy load components
const Dashboard = lazyLoad('Dashboard');
const Products = lazyLoad('Products');
const CreateProduct = lazyLoad('CreateProduct');
const EditProduct = lazyLoad('EditProduct');
const Orders = lazyLoad('Orders');
const OrderDetail = lazyLoad('OrderDetail');
const Customers = lazyLoad('Customers');
const CustomerDetail = lazyLoad('CustomerDetail');

// Admin route configuration
export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <Products />,
          },
          {
            path: 'new',
            element: <CreateProduct />,
          },
          {
            path: ':id/edit',
            element: <EditProduct />,
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <Orders />,
          },
          {
            path: ':id',
            element: <OrderDetail />,
          },
        ],
      },
      {
        path: 'customers',
        children: [
          {
            index: true,
            element: <Customers />,
          },
          {
            path: ':id',
            element: <CustomerDetail />,
          },
        ],
      },
    ],
  },
];
