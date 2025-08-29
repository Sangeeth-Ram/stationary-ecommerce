import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductForm } from '@/components/admin/ProductForm';
import { QUERY_KEYS } from '@/lib/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

export const EditProduct: FC = () => {
  const { id } = useParams();
  
  if (!id) {
    throw new Error('Product ID is required');
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_PRODUCTS, id],
    queryFn: async () => {
      // In a real app, you would fetch the product from your API
      // const { data } = await api.getProduct(id!);
      // return data;
      
      // Mock response
      return {
        id: id,
        name: 'Premium Notebook',
        description: 'High-quality notebook with premium paper',
        priceCents: 2499,
        category: { id: 'notebooks', name: 'Notebooks' },
        inventory: { quantity: 100 },
        isActive: true,
        createdAt: '2023-01-15T10:00:00Z',
      };
    },
    enabled: !!id,
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async (data: any) => {
      // In a real app, you would send this to your API
      // const { data: response } = await api.updateProduct(id!, {
      //   ...data,
      //   priceCents: Math.round(data.price * 100),
      // });
      // return response;
      
      // Mock response
      return {
        id,
        ...data,
        priceCents: Math.round(data.price * 100),
        category: { id: data.categoryId, name: 'Category' },
        inventory: { quantity: data.inventory.quantity },
        isActive: data.isActive,
      };
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
      navigate('/admin/products');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const handleSubmit = (data: any) => {
    updateProduct.mutate(data);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground mt-2">
          The product you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">
          Update the product details below
        </p>
      </div>

      <div className="rounded-md border bg-card p-6">
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          isLoading={updateProduct.isPending}
        />
      </div>
    </div>
  );
};
