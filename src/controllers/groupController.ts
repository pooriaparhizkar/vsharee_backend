import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateGroupBody, UpdateGroupBody } from '../interfaces';
import { paginate } from '../utils';
import { createResponse } from '../utils';

const prisma = new PrismaClient();

export const createGroup = async (req: AuthenticatedRequest<CreateGroupBody>, res: Response) => {
    const { id, name, description } = req.body;
    const creatorId = req.user?.userId;

    if (!id || !name || !creatorId) {
        return res.status(400).json(createResponse(null, 400, 'Missing required fields'));
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

        return res.status(201).json(createResponse(group, 201, 'Group created successfully'));
    } catch (error) {
        console.error('[Create Group]', error);
        return res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};

export const myGroups = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const page = parseInt(req.params.page, 10);
    const pageSize = parseInt(req.params.pageSize, 10);

    if (!userId) {
        return res.status(400).json(createResponse(null, 400, 'Missing user ID'));
    }

    if (isNaN(page) || page < 1) {
        return res.status(400).json(createResponse(null, 400, 'Invalid page parameter'));
    }
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        return res.status(400).json(createResponse(null, 400, 'Invalid pageSize parameter'));
    }

    const result = await paginate(
        { page, pageSize },
        () =>
            prisma.group.count({
                where: {
                    members: {
                        some: {
                            id: userId,
                        },
                    },
                },
            }),
        (skip, take) =>
            prisma.group.findMany({
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
                skip,
                take,
            }),
    );

    result.data = result.data.map((group: any) => {
        const { creatorId, ...rest } = group;
        return rest;
    });

    return res.json(createResponse(result, 200));
};

export const verifyGroupId = async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
    const group = await prisma.group.findUnique({ where: { id: req.body?.id.toLowerCase() } });
    if (!group) {
        res.json(createResponse(null, 200, 'ID is free'));
        return;
    }

    res.status(400).json(createResponse(null, 400, 'ID is not free'));
};

export const updateGroup = async (req: AuthenticatedRequest<UpdateGroupBody>, res: Response) => {
    const creatorId = req.user?.userId;
    const currentGroupId = req.params.id?.toLowerCase();
    // id in body is the new id to update to
    const { id: newGroupId, name, description, members } = req.body;

    if (!currentGroupId || !creatorId) {
        return res.status(400).json(createResponse(null, 400, 'Missing group ID or unauthorized'));
    }

    try {
        const group = await prisma.group.findUnique({
            where: { id: currentGroupId },
        });

        if (!group || group.creatorId !== creatorId) {
            return res.status(403).json(createResponse(null, 403, 'Not authorized to update this group'));
        }

        // If newGroupId is provided and different, check uniqueness
        if (newGroupId && newGroupId.toLowerCase() !== currentGroupId) {
            const existing = await prisma.group.findUnique({
                where: { id: newGroupId.toLowerCase() },
            });
            if (existing) {
                return res.status(400).json(createResponse(null, 400, 'New group ID is already taken'));
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

        return res.status(200).json(createResponse(updatedGroup, 200, 'Group updated successfully'));
    } catch (error) {
        console.error('[Update Group]', error);
        return res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};

export const deleteGroup = async (req: AuthenticatedRequest, res: Response) => {
    const creatorId = req.user?.userId;
    const groupId = req.params.id?.toLowerCase();
    if (!groupId || !creatorId) {
        return res.status(400).json(createResponse(null, 400, 'Missing group ID or unauthorized'));
    }
    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group || group.creatorId !== creatorId) {
            return res.status(403).json(createResponse(null, 403, 'Not authorized to update this group'));
        }

        await prisma.group.delete({
            where: { id: groupId },
        });

        return res.status(200).json(createResponse(null, 200, 'Group deleted successfully'));
    } catch (error) {
        console.error('[Update Group]', error);
        return res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};

export const getGroupMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const groupId = req.params.id;
        const page = parseInt(req.params.page, 10);
        const pageSize = parseInt(req.params.pageSize, 10);

        if (!groupId) {
            return res.status(400).json(createResponse(null, 400, 'Missing groupId parameter'));
        }
        if (isNaN(page) || page < 1) {
            return res.status(400).json(createResponse(null, 400, 'Invalid page parameter'));
        }
        if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
            return res.status(400).json(createResponse(null, 400, 'Invalid pageSize parameter'));
        }

        const result = await paginate(
            { page, pageSize },
            () => prisma.groupMessage.count({ where: { groupId } }),
            (skip, take) =>
                prisma.groupMessage.findMany({
                    where: { groupId },
                    include: { sender: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' },
                    skip,
                    take,
                }),
        );

        res.json(createResponse(result, 200));
    } catch (error) {
        console.error('[Get Group Messages]', error);
        res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};

export const getGroups = async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.params.page, 10);
    const pageSize = parseInt(req.params.pageSize, 10);
    const sortBy = (req.query.sortBy as string)?.toLowerCase() || 'createdat';
    const sortDirection = (req.query.sort as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    if (isNaN(page) || page < 1) {
        return res.status(400).json(createResponse(null, 400, 'Invalid page parameter'));
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        return res.status(400).json(createResponse(null, 400, 'Invalid pageSize parameter'));
    }

    try {
        const result = await paginate(
            { page, pageSize },
            () => prisma.group.count(),
            async (skip, take) => {
                const groups = await prisma.group.findMany({
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
                    skip,
                    take,
                    orderBy: sortBy === 'createdat' ? { createdAt: sortDirection } : undefined,
                });

                if (sortBy === 'members') {
                    groups.sort((a, b) =>
                        sortDirection === 'asc'
                            ? a.members.length - b.members.length
                            : b.members.length - a.members.length,
                    );
                }

                return groups;
            },
        );

        res.json(createResponse(result, 200));
    } catch (error) {
        console.error('[Get Groups]', error);
        res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};

export const getGroupDetail = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const groupId = req.params.id?.toLowerCase();
    if (!groupId) {
        return res.status(400).json(createResponse(null, 400, 'Missing group ID'));
    }
    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: true,
            },
        });

        if (!group || !group.members.some((member) => member.id === userId)) {
            return res.status(403).json(createResponse(null, 403, 'Not authorized to get this group detail'));
        }

        return res.status(200).json(createResponse(group, 200, ''));
    } catch (error) {
        console.error('[GET Group detail]', error);
        return res.status(500).json(createResponse(null, 500, 'Internal server error'));
    }
};
