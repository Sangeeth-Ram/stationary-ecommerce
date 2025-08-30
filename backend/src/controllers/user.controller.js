import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

class UserController {
  static async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
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

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}

export { UserController };
