import { Router } from 'express';
import { CartController } from '../controllers/user/cart.controller.js';
import { UserController } from '../controllers/user.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// All routes in this file require authentication
router.use(auth);

// Cart routes
router.get('/me/cart', CartController.getCart);
router.post('/me/cart/items', CartController.addItem);
router.patch('/me/cart/items/:id', CartController.updateItem);
router.delete('/me/cart/items/:id', CartController.removeItem);

// Orders routes will be added here

// User profile routes
router.get('/me', UserController.getProfile);

export { router as userRoutes };
