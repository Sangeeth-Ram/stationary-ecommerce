import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { QUERY_KEYS } from '@/lib/react-query';
import { Search, Loader2, User, Mail, Phone, Calendar } from 'lucide-react';
import type { FC } from 'react';


interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export const Customers: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: [QUERY_KEYS.ADMIN_USERS],
    queryFn: async () => {
      // const { data } = await api.getAdminCustomers();
      // return data;
      
      // Mock data
      return [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          ordersCount: 5,
          totalSpent: 12500,
          lastOrderDate: '2023-06-15T10:30:00Z',
          createdAt: '2023-01-10T08:45:00Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1 (555) 987-6543',
          ordersCount: 3,
          totalSpent: 7800,
          lastOrderDate: '2023-06-10T14:20:00Z',
          createdAt: '2023-02-15T11:20:00Z',
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          ordersCount: 1,
          totalSpent: 2500,
          lastOrderDate: '2023-05-22T09:15:00Z',
          createdAt: '2023-04-05T16:30:00Z',
        },
      ];
    },
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your store's customers
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {customer.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {customer.phone}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.ordersCount}</div>
                    {customer.lastOrderDate && (
                      <div className="text-sm text-muted-foreground">
                        <span>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${(customer.totalSpent / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${((customer.totalSpent / customer.ordersCount) / 100).toFixed(2)} avg.
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(customer.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination would go here */}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  );
};
