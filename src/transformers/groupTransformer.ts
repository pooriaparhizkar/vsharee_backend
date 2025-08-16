import { Prisma } from '@prisma/client';

// Define the include object with a const assertion, and derive the payload type via GroupGetPayload.
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
} as const;

// Infer the precise result type for a group returned with the above include
export type GroupWith = Prisma.GroupGetPayload<{ include: typeof groupInclude }>;

export function transformGroup(group: GroupWith) {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
        createdAt: group.createdAt,
        members: group.members.map((member) => ({
            role: member.role,
            user: member.user,
        })),
        isIdle: group.isIdle,
    };
}

export function transformGroups(groups: GroupWith[]) {
    return groups.map(transformGroup);
}
