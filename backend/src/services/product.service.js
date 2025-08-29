import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../middlewares/error.js';

export class ProductService {
  /**
   * Find all products with pagination and filtering
   * @param {Object} options - Query options
   * @param {string} [options.query] - Search query
   * @param {string} [options.category] - Category filter
   * @param {string} [options.sort] - Sort option
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.perPage=20] - Items per page
   * @returns {Promise<{data: Array, total: number, page: number, perPage: number}>}
   */
  static async findAll({
    query = '',
    category,
    sort = 'newest',
    page = 1,
    perPage = 20,
  }) {
    const skip = (page - 1) * perPage;
    
    const where = {
      status: 'ACTIVE',
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(category && {
        category: {
          OR: [
            { id: category },
            { slug: category },
          ],
        },
      }),
    };

    const orderBy = this.getOrderBy(sort);

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1, // Only get the first image for listing
          },
          inventory: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    return {
      data: products,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  /**
   * Find a single product by ID or slug
   * @param {string} idOrSlug - Product ID or slug
   * @returns {Promise<Object>}
   */
  static async findByIdOrSlug(idOrSlug) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        inventory: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create a new product
   * @param {Object} data - Product data
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const { inventory, ...productData } = data;
    
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          inventory: {
            create: {
              quantity: inventory?.quantity || 0,
              lowStock: inventory?.lowStock || 2,
            },
          },
        },
        include: {
          inventory: true,
        },
      });

      return product;
    });
  }

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} data - Updated product data
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    const { inventory, ...productData } = data;
    
    return prisma.$transaction(async (tx) => {
      // Update product
      const product = await tx.product.update({
        where: { id },
        data: productData,
        include: {
          inventory: true,
        },
      });

      // Update inventory if provided
      if (inventory) {
        await tx.inventory.update({
          where: { id: product.inventory.id },
          data: inventory,
        });
      }

      return product;
    });
  }

  /**
   * Soft delete a product
   * @param {string} id - Product ID
   * @returns {Promise<Object>}
   */
  static async delete(id) {
    return prisma.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  /**
   * Get order by clause based on sort option
   * @private
   */
  static getOrderBy(sort) {
    switch (sort) {
      case 'price_asc':
        return { priceCents: 'asc' };
      case 'price_desc':
        return { priceCents: 'desc' };
      case 'newest':
        return { createdAt: 'desc' };
      case 'popular':
      default:
        return { name: 'asc' };
    }
  }
}
