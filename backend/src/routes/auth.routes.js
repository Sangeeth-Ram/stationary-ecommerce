import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Get current user profile (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await AuthController.getProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook for Supabase auth events (public route)
router.post('/webhook', async (req, res) => {
  try {
    const { type, record } = req.body || {};

    // Optional: verify webhook secret
    const expected = process.env.SUPABASE_WEBHOOK_SECRET;
    if (expected) {
      const provided = req.headers['x-webhook-secret'];
      if (!provided || provided !== expected) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Handle different auth events
    if (type === 'SIGNUP' || type === 'USER_UPDATED' || type === 'user.created' || type === 'user.updated') {
      if (record) {
        await AuthController.syncUser(record);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };
