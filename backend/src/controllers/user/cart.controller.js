import { CartService } from '../../services/cart.service.js';
import { 
  cartItemAddSchema, 
  cartItemUpdateSchema, 
  cartItemDeleteSchema 
} from '../../validations/cart.validations.js';

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

export class CartController {
  /**
   * @swagger
   * /api/v1/me/cart:
   *   get:
   *     summary: Get user's cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User's cart with items
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cart'
   */
  static async getCart(req, res, next) {
    try {
      const cart = await CartService.getOrCreateUserCart(req.user.id);
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/me/cart/items:
   *   post:
   *     summary: Add item to cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - productId
   *             properties:
   *               productId:
   *                 type: string
   *                 format: cuid
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *                 default: 1
   *     responses:
   *       200:
   *         description: Item added to cart
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cart'
   */
  static async addItem(req, res, next) {
    try {
      const { productId, quantity } = cartItemAddSchema.parse(req).body;
      const cart = await CartService.addItem(req.user.id, productId, quantity);
      
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/me/cart/items/{id}:
   *   patch:
   *     summary: Update cart item quantity
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: cuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 0
   *     responses:
   *       200:
   *         description: Cart item updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cart'
   */
  static async updateItem(req, res, next) {
    try {
      const { id } = cartItemUpdateSchema.parse(req).params;
      const { quantity } = cartItemUpdateSchema.parse(req).body;
      
      const cart = await CartService.updateItem(req.user.id, id, quantity);
      
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/me/cart/items/{id}:
   *   delete:
   *     summary: Remove item from cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: cuid
   *     responses:
   *       200:
   *         description: Item removed from cart
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cart'
   */
  static async removeItem(req, res, next) {
    try {
      const { id } = cartItemDeleteSchema.parse(req).params;
      const cart = await CartService.removeItem(req.user.id, id);
      
      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Add to swagger components
/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         userId:
 *           type: string
 *           format: cuid
 *         status:
 *           type: string
 *           enum: [ACTIVE, ABANDONED, CONVERTED]
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         cartId:
 *           type: string
 *           format: cuid
 *         productId:
 *           type: string
 *           format: cuid
 *         quantity:
 *           type: integer
 *         priceSnapshotCents:
 *           type: integer
 *         product:
 *           $ref: '#/components/schemas/Product'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
