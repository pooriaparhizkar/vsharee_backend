import { Socket, Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function registerGroupHandlers(io: Server, socket: Socket) {
    const user = (socket as any).user;

    socket.on('joinGroup', async ({ groupId }) => {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { members: true },
        });

        if (!group) return socket.emit('error', { message: 'Group not found' });

        const isMember = group.members.some((m) => m.id === user.id);
        if (!isMember) return socket.emit('error', { message: 'Not a member' });

        socket.join(groupId);

        // Track groups manually
        (socket as any).joinedGroups = (socket as any).joinedGroups || [];
        if (!(socket as any).joinedGroups.includes(groupId)) {
            (socket as any).joinedGroups.push(groupId);
        }

        const onlineSockets = await io.in(groupId).fetchSockets();
        const onlineMembers = onlineSockets
            .map((s) => ({
                id: (s as any).user?.id,
                name: (s as any).user?.name,
            }))
            .filter(Boolean);

        socket.emit('joinedGroup', { onlineMembers });

        socket.to(groupId).emit('userJoined', { userId: user.id, name: user.name });
    });

    socket.on('sendMessage', ({ groupId, message }) => {
        io.to(groupId).emit('newMessage', {
            message,
            user: { id: user.id, name: user.name },
        });
    });

    socket.on('videoControl', ({ groupId, action }) => {
        io.to(groupId).emit('syncVideo', {
            ...action,
            user: { id: user.id, name: user.name },
        });
    });

    socket.on('disconnect', () => {
        const user = (socket as any).user;
        const joinedGroups = (socket as any).joinedGroups || [];

        for (const groupId of joinedGroups) {
            socket.to(groupId).emit('userLeft', {
                userId: user.id,
                name: user.name,
            });
        }
    });
}
