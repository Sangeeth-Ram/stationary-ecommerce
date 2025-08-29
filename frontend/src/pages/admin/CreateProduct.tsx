import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductForm } from '@/components/admin/ProductForm';
import { QUERY_KEYS } from '@/lib/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { FC } from 'react';

export const CreateProduct: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      // In a real app, you would send this to your API
      // const { data: response } = await api.createProduct({
      //   ...data,
      //   priceCents: Math.round(data.price * 100),
      // });
      // return response;
      
      // Mock response
      return {
        id: Math.random().toString(36).substring(2, 9),
        ...data,
        priceCents: Math.round(data.price * 100),
        category: { id: data.categoryId, name: 'Category' },
        inventory: { quantity: data.inventory.quantity },
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] });
      navigate('/admin/products');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const handleSubmit = (data: any) => {
    createProduct.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new product
        </p>
      </div>

      <div className="rounded-md border bg-card p-6">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={createProduct.isPending}
        />
      </div>
    </div>
  );
};
