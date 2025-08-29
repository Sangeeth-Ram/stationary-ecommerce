import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { QUERY_KEYS } from '@/lib/react-query';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import { Loader2, Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import type { FC } from 'react';

const Products: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_PRODUCTS],
    queryFn: async () => {
      // const { data } = await api.getAdminProducts();
      // return data;
      return [
        {
          id: '1',
          name: 'Premium Notebook',
          priceCents: 2499,
          category: { id: 'notebooks', name: 'Notebooks' },
          inventory: { quantity: 100 },
          isActive: true,
          createdAt: '2023-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Gel Pen Set',
          priceCents: 899,
          category: { id: 'pens', name: 'Pens & Pencils' },
          inventory: { quantity: 200 },
          isActive: true,
          createdAt: '2023-02-20T14:30:00Z',
        },
      ] as Product[];
    },
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      // await api.deleteProduct(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ADMIN_PRODUCTS],
        (old: Product[] = []) => old.filter(p => p.id !== deletedId)
      );
      // toast.success('Product deleted successfully');
    },
    onError: () => {
      // toast.error('Failed to delete product');
    },
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your store's products
          </p>
        </div>
        <Button 
          onClick={() => navigate('/admin/products/new')} 
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{formatCurrency(product.priceCents / 100)}</TableCell>
                  <TableCell>{product.inventory.quantity} in stock</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this product?')) {
                            deleteProduct.mutate(product.id);
                          }
                        }}
                        disabled={deleteProduct.isPending}
                      >
                        {deleteProduct.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
