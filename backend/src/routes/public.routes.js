import { Router } from 'express';
import { ProductController } from '../controllers/public/product.controller.js';
import { CategoryController } from '../controllers/public/category.controller.js';

const router = Router();

// Public routes
router.get('/products', ProductController.listProducts);
router.get('/products/:id', ProductController.getProduct);
router.get('/categories', CategoryController.getCategoryTree);

export { router as publicRoutes };
