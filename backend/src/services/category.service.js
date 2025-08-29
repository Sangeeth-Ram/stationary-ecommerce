import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../middlewares/error.js';

export class CategoryService {
  /**
   * Get all categories as a tree structure
   * @returns {Promise<Array>} Tree of categories
   */
  static async getCategoryTree() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
      },
      where: {
        parentId: null, // Only get top-level categories
      },
    });

    return categories;
  }

  /**
   * Create a new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name
   * @param {string} data.slug - URL-friendly slug
   * @param {string} [data.parentId] - Parent category ID (for subcategories)
   * @returns {Promise<Object>} Created category
   */
  static async create({ name, slug, parentId = null }) {
    return prisma.category.create({
      data: {
        name,
        slug,
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  static async update(id, data) {
    try {
      return await prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Category not found');
      }
      throw error;
    }
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Deleted category
   */
  static async delete(id) {
    try {
      // Check if category has children
      const children = await prisma.category.count({
        where: { parentId: id },
      });

      if (children > 0) {
        throw new Error('Cannot delete category with subcategories');
      }

      // Check if category has products
      const products = await prisma.product.count({
        where: { categoryId: id },
      });

      if (products > 0) {
        throw new Error('Cannot delete category with products');
      }

      return await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Category not found');
      }
      throw error;
    }
  }
}
