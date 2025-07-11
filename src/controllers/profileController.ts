import { Response } from 'express';
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

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
    const name = req.query.name?.toString().trim().toLowerCase();
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    if (!name) {
        return res.status(400).json({ message: 'Name query is required' });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error('[Search Users]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
