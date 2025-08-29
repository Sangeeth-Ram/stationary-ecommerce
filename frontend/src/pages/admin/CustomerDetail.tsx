import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QUERY_KEYS } from '@/lib/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2, User, Mail, Phone, Calendar, ShoppingCart, DollarSign, MapPin } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  orderDate: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  ordersCount: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate?: string;
  createdAt: string;
  recentOrders: Order[];
}

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch customer details
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: [QUERY_KEYS.ADMIN_CUSTOMER, id],
    queryFn: async () => {
      // const { data } = await api.getCustomer(id!);
      // return data;
      
      // Mock data
      return {
        id: id!,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        address: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
        },
        ordersCount: 5,
        totalSpent: 12500,
        averageOrderValue: 2500,
        firstOrderDate: '2023-01-15T10:30:00Z',
        lastOrderDate: '2023-06-15T14:20:00Z',
        createdAt: '2023-01-10T08:45:00Z',
        recentOrders: [
          {
            id: '1',
            orderNumber: 'ORD-2023-005',
            total: 3200,
            status: 'delivered',
            orderDate: '2023-06-15T14:20:00Z',
            items: [
              { id: '1', name: 'Premium Notebook', quantity: 1, price: 2000 },
              { id: '2', name: 'Gel Pen Set', quantity: 2, price: 600 },
            ],
          },
          {
            id: '2',
            orderNumber: 'ORD-2023-004',
            total: 2800,
            status: 'delivered',
            orderDate: '2023-05-22T09:15:00Z',
            items: [
              { id: '3', name: 'Desk Organizer', quantity: 1, price: 1500 },
              { id: '4', name: 'Sticky Notes', quantity: 1, price: 500 },
            ],
          },
        ],
      };
    },
    enabled: !!id,
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Customer not found</h2>
        <p className="text-muted-foreground mt-2">
          The customer you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Details</h1>
        <p className="text-muted-foreground">
          View and manage customer information and order history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.recentOrders.length > 0 ? (
                <div className="space-y-6">
                  {customer.recentOrders.map((order) => (
                    <div key={order.id} className="border-b pb-4 last:border-0 last:pb-0 last:mb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div>
                          <h3 className="font-medium">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.orderDate, 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity} × {item.name}
                            </span>
                            <span>{formatCurrency(item.price / 100)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(order.total / 100)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No orders yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This customer hasn't placed any orders yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Customer ID: {customer.id}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
                
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-sm hover:underline"
                    >
                      {customer.phone}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Member since {formatDate(customer.createdAt, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {customer.address && (
            <Card>
              <CardHeader>
                <CardTitle>Default Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm">{customer.address.line1}</p>
                    {customer.address.line2 && (
                      <p className="text-sm">{customer.address.line2}</p>
                    )}
                    <p className="text-sm">
                      {customer.address.city}, {customer.address.state}{' '}
                      {customer.address.postalCode}
                    </p>
                    <p className="text-sm">{customer.address.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-medium">{customer.ordersCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(customer.totalSpent / 100)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground opacity-0" />
                  <span className="text-sm">Average Order Value</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(customer.averageOrderValue / 100)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">First Order</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(customer.firstOrderDate, 'MMM d, yyyy')}
                </span>
              </div>
              
              {customer.lastOrderDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Last Order</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(customer.lastOrderDate, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
