import { ProductService } from '../../services/product.service.js';
import { productListQuerySchema, productIdParamSchema } from '../../validations/product.validations.js';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Public product endpoints
 */

export class ProductController {
  /**
   * @swagger
   * /api/v1/products:
   *   get:
   *     summary: Get paginated list of products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: query
   *         schema: { type: string }
   *         description: Search query
   *       - in: query
   *         name: category
   *         schema: { type: string }
   *         description: Filter by category ID or slug
   *       - in: query
   *         name: sort
   *         schema: { type: string, enum: [price_asc, price_desc, newest, popular] }
   *         description: Sort option
   *       - in: query
   *         name: page
   *         schema: { type: integer, minimum: 1, default: 1 }
   *         description: Page number
   *       - in: query
   *         name: perPage
   *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
   *         description: Items per page
   *     responses:
   *       200:
   *         description: List of products with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Product'
   *                 total:
   *                   type: integer
   *                   example: 100
   *                 page:
   *                   type: integer
   *                   example: 1
   *                 perPage:
   *                   type: integer
   *                   example: 20
   *                 totalPages:
   *                   type: integer
   *                   example: 5
   */
  static async listProducts(req, res, next) {
    try {
      const { query, category, sort, page, perPage } = productListQuerySchema.parse({
        query: req.query.query,
        category: req.query.category,
        sort: req.query.sort,
        page: req.query.page,
        perPage: req.query.perPage,
      });

      const result = await ProductService.findAll({
        query,
        category,
        sort,
        page,
        perPage,
      });

      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   get:
   *     summary: Get product by ID or slug
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *         description: Product ID or slug
   *     responses:
   *       200:
   *         description: Product details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   */
  static async getProduct(req, res, next) {
    try {
      const { id } = productIdParamSchema.parse(req.params);
      const product = await ProductService.findByIdOrSlug(id);
      
      res.json({
        success: true,
        data: product,
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
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         priceCents:
 *           type: integer
 *         currency:
 *           type: string
 *           example: INR
 *         sku:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, ARCHIVED, DELETED]
 *         categoryId:
 *           type: string
 *           format: cuid
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         inventory:
 *           $ref: '#/components/schemas/Inventory'
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     ProductImage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         s3Key:
 *           type: string
 *         url:
 *           type: string
 *           format: uri
 *         altText:
 *           type: string
 *         sortOrder:
 *           type: integer
 * 
 *     Inventory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         quantity:
 *           type: integer
 *         lowStock:
 *           type: integer
 * 
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         name:
 *           type: string
 *         slug:
 *           type: string
 */
