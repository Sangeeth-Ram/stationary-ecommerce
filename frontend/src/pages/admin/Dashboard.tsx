import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import type { FC } from 'react';

// Define query keys
const QUERY_KEYS = {
  ADMIN_STATS: 'admin-stats',
} as const;

const Dashboard: FC = () => {
  // In a real app, you would fetch these stats from your API
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STATS],
    queryFn: async () => {
      // const { data } = await api.getAdminStats();
      // return data;
      return {
        totalSales: 12500,
        totalOrders: 42,
        totalProducts: 18,
        totalCustomers: 37,
        recentOrders: [
          { id: '1', customer: 'John Doe', total: 4250, status: 'completed' },
          { id: '2', customer: 'Jane Smith', total: 3200, status: 'processing' },
          { id: '3', customer: 'Bob Johnson', total: 1850, status: 'pending' },
        ],
        topProducts: [
          { id: '1', name: 'Premium Notebook', sales: 28 },
          { id: '2', name: 'Gel Pen Set', sales: 15 },
          { id: '3', name: 'Sticky Notes', sales: 12 },
        ],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store's performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((stats?.totalSales || 0) / 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.total / 100)}
                    </p>
                    <div className="text-xs text-muted-foreground capitalize">
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topProducts?.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} sold
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {Math.round((product.sales / (stats?.totalOrders || 1)) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
