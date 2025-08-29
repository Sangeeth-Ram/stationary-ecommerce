import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QUERY_KEYS } from '@/lib/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Truck, CheckCircle, XCircle, Package } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  trackingNumber?: string;
  notes?: string;
}

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch order details
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: [QUERY_KEYS.ADMIN_ORDER, id],
    queryFn: async () => {
      // const { data } = await api.getOrder(id!);
      // return data;
      
      // Mock data
      return {
        id: id!,
        orderNumber: `ORD-2023-${id?.padStart(3, '0')}`,
        customer: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
        },
        shippingAddress: {
          line1: '123 Main St',
          line2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
        },
        items: [
          {
            id: '1',
            productId: '1',
            name: 'Premium Notebook',
            quantity: 2,
            price: 2000,
          },
          {
            id: '2',
            productId: '2',
            name: 'Gel Pen Set',
            quantity: 1,
            price: 250,
          },
        ],
        subtotal: 4250,
        shippingCost: 0,
        tax: 340,
        total: 4590,
        status: 'processing' as OrderStatus,
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        paymentId: 'pi_123456789',
        orderDate: '2023-06-15T10:30:00Z',
        notes: 'Customer requested gift wrapping',
      };
    },
    enabled: !!id,
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async (status: OrderStatus) => {
      // await api.updateOrderStatus(id!, status);
      return status;
    },
    onSuccess: (status) => {
      toast.success(`Order marked as ${status}`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ORDER, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ORDERS] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
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

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-muted-foreground mt-2">
          The order you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Order Status:</span>
          <select
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
              order.status
            )}`}
            value={order.status}
            onChange={(e) =>
              updateOrderStatus.mutate(e.target.value as OrderStatus)
            }
            disabled={updateOrderStatus.isPending}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-4 border-b last:border-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.price / 100)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency((item.price * item.quantity) / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shippingCost === 0
                      ? 'Free'
                      : formatCurrency(order.shippingCost / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax / 100)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 mt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.total / 100)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h3 className="font-medium">{order.customer.name}</h3>
                <p className="text-muted-foreground">{order.customer.email}</p>
                {order.customer.phone && (
                  <p className="text-muted-foreground">{order.customer.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{order.paymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-1" />
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.orderDate, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {order.shippedDate ? (
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="h-full w-0.5 bg-gray-200 mt-1" />
                    </div>
                    <div>
                      <p className="font-medium">Shipped</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.shippedDate, 'MMM d, yyyy h:mm a')}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-sm text-muted-foreground">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="h-full w-0.5 bg-gray-200 mt-1" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Shipped</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                )}

                {order.deliveredDate ? (
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.deliveredDate, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ) : order.status === 'cancelled' ? (
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-red-600">Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        Order was cancelled
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Delivered</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
