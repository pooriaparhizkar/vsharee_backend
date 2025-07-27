import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces';
import { paginate } from '../utils';
import { createResponse } from '../utils';
import { groupInclude, transformGroups } from '../transformers';

const prisma = new PrismaClient();

export const myProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
        });
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: { userId: req.user?.userId },
                },
            },
            include: groupInclude,
        });

        if (!user) {
            res.status(404).json(createResponse(null, 404, 'User not found'));
            return;
        }
        const { password, ...userWithoutPassword } = user;
        res.json(
            createResponse(
                {
                    user: {
                        ...userWithoutPassword,
                        groups: transformGroups(groups),
                    },
                },
                200,
            ),
        );
    } catch (error) {
        res.status(401).json(createResponse(null, 401, 'Invalid token'));
    }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
    const name = req.query.name?.toString().trim().toLowerCase();
    const page = parseInt(req.params.page, 10);
    const pageSize = parseInt(req.params.pageSize, 10);

    if (!name) {
        return res.status(400).json(createResponse(null, 400, 'Name query is required'));
    }

    if (isNaN(page) || page < 1) {
        return res.status(400).json(createResponse(null, 400, 'Invalid page parameter'));
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        return res.status(400).json(createResponse(null, 400, 'Invalid pageSize parameter'));
    }

    try {
        const result = await paginate(
            { page, pageSize },
            () =>
                prisma.user.count({
                    where: {
                        OR: [
                            { name: { contains: name, mode: 'insensitive' } },
                            { email: { contains: name, mode: 'insensitive' } },
                        ],
                    },
                }),
            (skip, take) =>
                prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: name, mode: 'insensitive' } },
                            { email: { contains: name, mode: 'insensitive' } },
                        ],
                    },
                    select: { id: true, name: true, email: true },
                    skip,
                    take,
                }),
        );

        res.status(200).json(createResponse(result, 200));
    } catch (error) {
        console.error('[Search Users]', error);
        res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};

export const profileDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.params.id;

    if (!userId) {
        res.status(400).json(createResponse(null, 400, 'User ID is required'));
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: { userId: userId },
                },
            },
            include: groupInclude,
        });

        if (!user) {
            res.status(404).json(createResponse(null, 404, 'User not found'));
            return;
        }
        const { password, ...userWithoutPassword } = user;

        res.status(200).json(
            createResponse(
                {
                    ...userWithoutPassword,
                    groups: transformGroups(groups),
                },
                200,
            ),
        );
    } catch (error) {
        console.error('[Profile Detail]', error);
        res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};
