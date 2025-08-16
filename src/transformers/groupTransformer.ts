import { Prisma } from '@prisma/client';

export const groupInclude = {
    creator: {
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    },
    members: {
        select: {
            role: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    },
} satisfies Prisma.GroupInclude;

export function transformGroup(group: any) {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        createdAt: group.createdAt,
        members: group.members.map((member: any) => ({
            role: member.role,
            user: member.user,
        })),
        isIdle: group.isIdle,
    };
}

export function transformGroups(groups: any[]) {
    return groups.map(transformGroup);
}
