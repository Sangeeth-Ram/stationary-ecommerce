import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

// Define validation schema with Zod
const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
  country: z.string().min(1, 'Country is required'),
  saveInfo: z.boolean().optional(),
  paymentMethod: z.enum(['razorpay', 'cod'], {
    required_error: 'Please select a payment method',
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'razorpay',
    },
  });

  const paymentMethod = watch('paymentMethod');

  // Load saved address if available
  useEffect(() => {
    const savedAddress = localStorage.getItem('shippingAddress');
    if (savedAddress) {
      const address = JSON.parse(savedAddress);
      Object.entries(address).forEach(([key, value]) => {
        setValue(key as keyof CheckoutFormData, value as string);
      });
      setValue('saveInfo', true);
    }
  }, [setValue]);

  const processOrder = async (data: CheckoutFormData) => {
    if (data.saveInfo) {
      const { saveInfo, paymentMethod, ...address } = data;
      localStorage.setItem('shippingAddress', JSON.stringify(address));
    } else {
      localStorage.removeItem('shippingAddress');
    }

    // In a real app, you would create an order in your backend
    // and process the payment with Razorpay
    if (data.paymentMethod === 'razorpay') {
      await processRazorpayPayment(data);
    } else {
      // Cash on Delivery
      await createOrder(data, 'pending');
    }
  };

  const processRazorpayPayment = async (data: CheckoutFormData) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your backend to create a Razorpay order
      // const { data: order } = await api.createRazorpayOrder({
      //   amount: totalPrice,
      //   currency: 'INR',
      //   receipt: `order_${Date.now()}`,
      // });
      
      // Mock order ID for demo
      const order = { id: `order_${Date.now()}` };
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalPrice,
        currency: 'INR',
        name: 'Stationary Shop',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function(response: any) {
          // Handle successful payment
          await createOrder(data, 'paid', response.razorpay_payment_id);
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: '#4F46E5',
        },
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', function(response: any) {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while processing your payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (
    data: CheckoutFormData, 
    status: 'pending' | 'paid',
    paymentId?: string
  ) => {
    try {
      // In a real app, you would call your backend to create an order
      // await api.createOrder({
      //   items,
      //   total: totalPrice,
      //   status,
      //   paymentMethod: data.paymentMethod,
      //   paymentId,
      //   shippingAddress: {
      //     name: `${data.firstName} ${data.lastName}`,
      //     email: data.email,
      //     phone: data.phone,
      //     address: data.address,
      //     city: data.city,
      //     state: data.state,
      //     zipCode: data.zipCode,
      //     country: data.country,
      //   },
      // });
      
      // Clear cart on successful order
      clearCart();
      
      // Redirect to order confirmation page
      navigate('/order/success', { 
        state: { 
          orderId: `ORD-${Date.now()}`,
          paymentId: paymentId || null,
        } 
      });
      
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to create order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-primary-600 sm:text-5xl">Cart Empty</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Your cart is empty
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Please add some items to your cart before checking out.
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Button as="a" href="/products" variant="primary">
                  Continue Shopping
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Checkout</h1>
        
        <form onSubmit={handleSubmit(processOrder)} className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Shipping information */}
          <div className="mt-10 lg:pt-6">
            <h2 className="text-lg font-medium text-gray-900">Contact information</h2>
            
            <div className="mt-4">
              <Input
                id="email"
                type="email"
                label="Email address"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>
              
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <Input
                    id="firstName"
                    label="First name"
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                  />
                </div>
                
                <div>
                  <Input
                    id="lastName"
                    label="Last name"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <Input
                    id="address"
                    label="Address"
                    autoComplete="street-address"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>
                
                <div>
                  <Input
                    id="city"
                    label="City"
                    autoComplete="address-level2"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                </div>
                
                <div>
                  <Input
                    id="state"
                    label="State / Province"
                    autoComplete="address-level1"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                </div>
                
                <div>
                  <Input
                    id="zipCode"
                    label="ZIP / Postal code"
                    autoComplete="postal-code"
                    error={errors.zipCode?.message}
                    {...register('zipCode')}
                  />
                </div>
                
                <div>
                  <Input
                    id="country"
                    label="Country"
                    autoComplete="country-name"
                    error={errors.country?.message}
                    {...register('country')}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <Input
                    id="phone"
                    type="tel"
                    label="Phone"
                    autoComplete="tel"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center">
                <input
                  id="save-info"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('saveInfo')}
                />
                <label htmlFor="save-info" className="ml-2 block text-sm text-gray-900">
                  Save this information for next time
                </label>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            
            <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex px-4 py-6 sm:px-6">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 rounded-md"
                      />
                    </div>
                    
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm">
                            <a href={`/products/${item.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                              {item.name}
                            </a>
                          </h4>
                        </div>
                      </div>
                      
                      <div className="flex flex-1 items-end justify-between">
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatCurrency(item.priceCents / 100)}
                        </p>
                        
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalPrice / 100)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {totalPrice > 5000 ? 'Free' : formatCurrency(100)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-medium">Total</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {formatCurrency(
                      (totalPrice + (totalPrice > 5000 ? 0 : 10000)) / 100
                    )}
                  </dd>
                </div>
              </dl>
              
              {/* Payment method */}
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment method</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="razorpay"
                      type="radio"
                      value="razorpay"
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="razorpay" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit / Debit Card (Razorpay)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="cod"
                      type="radio"
                      value="cod"
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      {...register('paymentMethod')}
                    />
                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      You'll be redirected to Razorpay's secure payment page to complete your purchase.
                    </p>
                  </div>
                )}
                
                <div className="mt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isLoading}
                  >
                    {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
