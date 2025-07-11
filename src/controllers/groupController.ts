import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateGroupBody } from '../interfaces';

const prisma = new PrismaClient();

export const createGroup = async (req: AuthenticatedRequest<CreateGroupBody>, res: Response) => {
    const { id, name, description } = req.body;
    const creatorId = req.user?.userId;

    if (!id || !name || !creatorId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const group = await prisma.group.create({
            data: {
                id,
                name,
                description: description ?? '',
                creatorId,
            },
        });

        return res.status(201).json(group);
    } catch (error) {
        console.error('[Create Group]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
