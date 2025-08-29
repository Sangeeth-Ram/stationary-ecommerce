import { CategoryService } from '../../services/category.service.js';
import { z } from 'zod';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Public category endpoints
 */

export class CategoryController {
  /**
   * @swagger
   * /api/v1/categories:
   *   get:
   *     summary: Get category tree
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of categories in a tree structure
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CategoryTree'
   */
  static async getCategoryTree(req, res, next) {
    try {
      const categories = await CategoryService.getCategoryTree();
      res.json({
        success: true,
        data: categories,
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
 *     CategoryTree:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         parentId:
 *           type: string
 *           format: cuid
 *           nullable: true
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CategoryTree'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
