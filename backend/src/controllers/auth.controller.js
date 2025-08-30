import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger.js';

const prisma = new PrismaClient();

export class AuthController {
  static async syncUser(authUser) {
    const { id: supabaseUid, email, user_metadata, email_confirmed_at } = authUser;
    const { name, phone } = user_metadata || {};

    try {
      // Find or create user
      const user = await prisma.user.upsert({
        where: { supabaseUid },
        update: { 
          email, 
          name: name || undefined, // Only update if name exists
          phone: phone || undefined, // Only update if phone exists
          emailVerified: email_confirmed_at ? true : undefined,
          lastSignInAt: new Date()
        },
        create: { 
          supabaseUid, 
          email, 
          name: name || null, 
          phone: phone || null,
          emailVerified: !!email_confirmed_at,
          role: 'USER' // Default role
        },
      });
      
      logger.info(`User ${user.id} synced successfully`);
      return user;
    } catch (error) {
      logger.error('Error syncing user:', error);
      throw error;
    }
  }

  static async getProfile(userId) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  }
}
