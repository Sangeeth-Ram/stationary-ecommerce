import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addItem, removeItem, updateQuantity, clearCart } from '@/store/slices/cartSlice';
import { CartItem } from '@/types';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalItems, totalPrice } = useSelector((state: RootState) => state.cart);

  const addToCart = (item: Omit<CartItem, 'id'> & { id?: string }) => {
    const cartItem: CartItem = {
      id: item.id || Date.now().toString(),
      name: item.name,
      priceCents: item.priceCents,
      quantity: item.quantity,
      image: item.image,
      maxQuantity: item.maxQuantity,
    };
    
    // Check if item already exists in cart
    const existingItem = items.find((i) => 
      i.id === cartItem.id && 
      i.priceCents === cartItem.priceCents
    );

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = Math.min(
        existingItem.quantity + cartItem.quantity,
        existingItem.maxQuantity
      );
      dispatch(updateQuantity({ id: existingItem.id, quantity: newQuantity }));
    } else {
      // Add new item to cart
      dispatch(addItem(cartItem));
    }
  };

  const removeFromCart = (id: string) => {
    dispatch(removeItem(id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart: clearCartItems,
  };
};
