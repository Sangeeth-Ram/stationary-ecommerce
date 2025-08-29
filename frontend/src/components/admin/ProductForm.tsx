import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Product } from '@/types';

// Define validation schema with Zod
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  inventory: z.object({
    quantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  }),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

// Mock categories - in a real app, these would come from your API
const categories = [
  { id: 'notebooks', name: 'Notebooks' },
  { id: 'pens', name: 'Pens & Pencils' },
  { id: 'office', name: 'Office Supplies' },
  { id: 'art', name: 'Art Supplies' },
];

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export const ProductForm = ({ product, onSubmit, isLoading }: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || '',
          price: product.priceCents / 100,
          categoryId: product.category.id,
          inventory: {
            quantity: product.inventory.quantity,
          },
          isActive: product.isActive,
        }
      : {
          inventory: {
            quantity: 0,
          },
          isActive: true,
        },
  });

  const isActive = watch('isActive');

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit({
      ...data,
      price: Number(data.price),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Premium Notebook"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            error={errors.description?.message}
            rows={4}
            placeholder="Enter product description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                id="price"
                type="number"
                step="0.01"
                className="pl-7"
                {...register('price')}
                error={errors.price?.message}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              {...register('categoryId')}
              error={errors.categoryId?.message}
              options={categories.map(category => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inventory.quantity">Stock Quantity</Label>
            <Input
              id="inventory.quantity"
              type="number"
              min="0"
              {...register('inventory.quantity')}
              error={errors.inventory?.quantity?.message}
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">
              {isActive ? 'Active' : 'Inactive'}
            </Label>
          </div>
        </div>

        {/* Image Upload - Placeholder for S3 integration */}
        <div className="space-y-2">
          <Label>Product Images</Label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    // onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
