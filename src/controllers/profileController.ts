import { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces';

const prisma = new PrismaClient();

export const myProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
