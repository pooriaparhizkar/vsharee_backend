import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateGroupBody, UpdateGroupBody } from '../interfaces';

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
                id: id.toLocaleLowerCase(),
                name,
                description: description ?? '',
                creatorId,
                members: {
                    connect: {
                        id: creatorId,
                    },
                },
            },
        });

        return res.status(201).json(group);
    } catch (error) {
        console.error('[Create Group]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const myGroups = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const myGroups = await prisma.group.findMany({
        where: {
            members: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                },
            },
            members: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    const output = myGroups.map((group: any) => {
        const { creatorId, ...rest } = group;
        return rest;
    });

    return res.json(output);
};

export const verifyGroupId = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
    const group = await prisma.group.findUnique({ where: { id: req.body?.id.toLowerCase() } });
    if (!group) {
        res.json({ message: 'ID is free' });
        return;
    }

    res.status(400).json({ message: 'ID is not free' });
};

export const updateGroup = async (req: AuthenticatedRequest<UpdateGroupBody>, res: Response) => {
    const creatorId = req.user?.userId;
    const currentGroupId = req.params.id?.toLowerCase();
    // id in body is the new id to update to
    const { id: newGroupId, name, description, members } = req.body;

    if (!currentGroupId || !creatorId) {
        return res.status(400).json({ message: 'Missing group ID or unauthorized' });
    }

    try {
        const group = await prisma.group.findUnique({
            where: { id: currentGroupId },
        });

        if (!group || group.creatorId !== creatorId) {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        // If newGroupId is provided and different, check uniqueness
        if (newGroupId && newGroupId.toLowerCase() !== currentGroupId) {
            const existing = await prisma.group.findUnique({
                where: { id: newGroupId.toLowerCase() },
            });
            if (existing) {
                return res.status(400).json({ message: 'New group ID is already taken' });
            }
        }

        const updatedGroup = await prisma.group.update({
            where: { id: currentGroupId },
            data: {
                id: newGroupId?.toLowerCase() ?? undefined,
                name: name ?? undefined,
                description: description ?? undefined,
                members: members
                    ? {
                          set: Array.from(new Set([...members, creatorId])).map((userId: string) => ({ id: userId })),
                      }
                    : undefined,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                members: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('[Update Group]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteGroup = async (req: AuthenticatedRequest, res: Response) => {
    const creatorId = req.user?.userId;
    const groupId = req.params.id?.toLowerCase();
    if (!groupId || !creatorId) {
        return res.status(400).json({ message: 'Missing group ID or unauthorized' });
    }
    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group || group.creatorId !== creatorId) {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        await prisma.group.delete({
            where: { id: groupId },
        });

        return res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('[Update Group]', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
