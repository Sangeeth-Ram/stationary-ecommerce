import { prisma } from '../lib/prisma.js';
import { NotFoundError, ValidationError } from '../middlewares/error.js';

export class CartService {
  /**
   * Get or create user's active cart
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart with items
   */
  static async getOrCreateUserCart(userId) {
    // Try to find existing active cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Create new cart if none exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user: { connect: { id: userId } },
          status: 'ACTIVE',
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  inventory: true,
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Add item to cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Object>} Updated cart
   */
  static async addItem(userId, productId, quantity = 1) {
    if (quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    return prisma.$transaction(async (tx) => {
      // Get or create cart
      let cart = await tx.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId, status: 'ACTIVE' },
        });
      }

      // Check product exists and has inventory
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { inventory: true },
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (!product.inventory || product.inventory.quantity < quantity) {
        throw new ValidationError('Insufficient inventory');
      }

      // Check if item already in cart
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (existingItem) {
        // Update quantity if item exists
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        });
      } else {
        // Add new item
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            priceSnapshotCents: product.priceCents,
          },
        });
      }

      // Return updated cart
      return this.getCartWithItems(tx, cart.id);
    });
  }

  /**
   * Update cart item quantity
   * @param {string} userId - User ID
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  static async updateItem(userId, itemId, quantity) {
    if (quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }

    return prisma.$transaction(async (tx) => {
      // Find cart item with cart and product info
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId,
            status: 'ACTIVE',
          },
        },
        include: {
          product: {
            include: {
              inventory: true,
            },
          },
        },
      });

      if (!item) {
        throw new NotFoundError('Cart item not found');
      }

      if (quantity === 0) {
        // Remove item if quantity is 0
        await tx.cartItem.delete({
          where: { id: itemId },
        });
      } else {
        // Check inventory
        if (item.product.inventory.quantity < quantity) {
          throw new ValidationError('Insufficient inventory');
        }

        // Update quantity
        await tx.cartItem.update({
          where: { id: itemId },
          data: { quantity },
        });
      }

      // Return updated cart
      return this.getCartWithItems(tx, item.cartId);
    });
  }

  /**
   * Remove item from cart
   * @param {string} userId - User ID
   * @param {string} itemId - Cart item ID
   * @returns {Promise<Object>} Updated cart
   */
  static async removeItem(userId, itemId) {
    return prisma.$transaction(async (tx) => {
      // Find cart item
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cart: {
            userId,
            status: 'ACTIVE',
          },
        },
      });

      if (!item) {
        throw new NotFoundError('Cart item not found');
      }

      // Delete item
      await tx.cartItem.delete({
        where: { id: itemId },
      });

      // Return updated cart
      return this.getCartWithItems(tx, item.cartId);
    });
  }

  /**
   * Get cart with items
   * @private
   */
  static async getCartWithItems(prismaTx, cartId) {
    return prismaTx.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }
}
