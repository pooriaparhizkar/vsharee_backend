import { Socket, Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { GroupMemberRole } from '../../interfaces';

const prisma = new PrismaClient();

export default function registerGroupHandlers(io: Server, socket: Socket) {
    const user = (socket as any).user;

    socket.on('joinGroup', async ({ groupId }) => {
        try {
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                include: { members: true },
            });

            if (!group) return socket.emit('error', { message: 'Group not found' });

            const isMember = group.members.some((m) => m.userId === user.id);
            if (!isMember) return socket.emit('error', { message: 'Not a member' });

            socket.join(groupId);

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
            socket.to(groupId).emit('userJoined', { id: user.id, name: user.name });
        } catch (error) {
            console.error('Error in joinGroup:', error);
            socket.emit('error', { message: 'Internal server error in joinGroup' });
        }
    });

    socket.on('leftGroup', ({ groupId }) => {
        try {
            socket.leave(groupId);
            const joinedGroups = (socket as any).joinedGroups || [];
            (socket as any).joinedGroups = joinedGroups.filter((id: string) => id !== groupId);
            socket.to(groupId).emit('userLeft', { id: user.id, name: user.name });
        } catch (error) {
            console.error('Error in leftGroup:', error);
            socket.emit('error', { message: 'Internal server error in leftGroup' });
        }
    });

    socket.on('sendMessage', async ({ groupId, message }) => {
        try {
            io.to(groupId).emit('newMessage', {
                message,
                user: { id: user.id, name: user.name },
            });
            await prisma.groupMessage.create({
                data: {
                    text: message,
                    senderId: user.id,
                    groupId,
                },
            });
        } catch (error) {
            console.error('Error in sendMessage:', error);
            socket.emit('error', { message: 'Internal server error in sendMessage' });
        }
    });

    socket.on('videoControl', ({ groupId, action, time }) => {
        try {
            io.to(groupId).emit('syncVideo', {
                action,
                time,
                user: { id: user.id, name: user.name },
            });
        } catch (error) {
            console.error('Error in videoControl:', error);
            socket.emit('error', { message: 'Internal server error in videoControl' });
        }
    });

    socket.on('disconnect', () => {
        try {
            const user = (socket as any).user;
            const joinedGroups = (socket as any).joinedGroups || [];

            for (const groupId of joinedGroups) {
                socket.to(groupId).emit('userLeft', {
                    id: user.id,
                    name: user.name,
                });
            }
        } catch (error) {
            console.error('Error in disconnect handler:', error);
        }
    });

    // Heartbeat event
    socket.on('heartbeat', () => {
        try {
            socket.emit('heartbeat_ack');
        } catch (error) {
            console.error('Error in heartbeat:', error);
        }
    });

    // WebRTC video offer
    socket.on('videoOffer', ({ offer, groupId }) => {
        try {
            socket.to(groupId).emit('videoOffer', { offer });
        } catch (error) {
            console.error('Error in videoOffer:', error);
            socket.emit('error', { message: 'Internal server error in videoOffer' });
        }
    });

    // WebRTC video answer
    socket.on('videoAnswer', ({ answer, groupId }) => {
        try {
            socket.to(groupId).emit('videoAnswer', { answer });
        } catch (error) {
            console.error('Error in videoAnswer:', error);
            socket.emit('error', { message: 'Internal server error in videoAnswer' });
        }
    });

    // ICE candidate relay
    socket.on('iceCandidate', ({ candidate, groupId }) => {
        try {
            socket.to(groupId).emit('iceCandidate', { candidate });
        } catch (error) {
            console.error('Error in iceCandidate:', error);
            socket.emit('error', { message: 'Internal server error in iceCandidate' });
        }
    });

    socket.on('methodSelected', async ({ groupId, method }) => {
        console.log({ groupId }, { method });
        try {
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                include: { members: true },
            });
            if (!group) return socket.emit('error', { message: 'Group not found' });
            console.log({ group });
            const member = group.members.find((m) => m.userId === user.id);
            if (!member) return socket.emit('error', { message: 'Not a member' });
            console.log({ member });
            if (![GroupMemberRole.CREATOR, GroupMemberRole.CONTROLLER].includes(member.role as GroupMemberRole))
                return socket.emit('error', { message: 'Not qualified to chose method' });
            console.log({ method });
            io.to(groupId).emit('methodSelected', { method });
        } catch (error) {
            console.error('Error in videoSelected:', error);
            socket.emit('error', { message: 'Internal server error in videoSelected' });
        }
    });

    socket.on('sendVideoUrl', async ({ groupId, url }) => {
        try {
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                include: { members: true },
            });

            if (!group) return socket.emit('error', { message: 'Group not found' });

            const isMember = group.members.some((m) => m.userId === user.id);
            if (!isMember) return socket.emit('error', { message: 'Not a member' });

            io.to(groupId).emit('receiveVideoUrl', { url });
        } catch (error) {
            console.error('Error in send-video-url:', error);
            socket.emit('error', { message: 'Internal server error in send-video-url' });
        }
    });

    socket.on('sendVideoFileHash', async ({ groupId, hash, name }) => {
        try {
            const group = await prisma.group.findUnique({
                where: { id: groupId },
                include: { members: true },
            });

            if (!group) return socket.emit('error', { message: 'Group not found' });

            const isMember = group.members.some((m) => m.userId === user.id);
            if (!isMember) return socket.emit('error', { message: 'Not a member' });

            io.to(groupId).emit('receiveVideoFileHash', { hash, name });
        } catch (error) {
            console.error('Error in sendVideoFileHash:', error);
            socket.emit('error', { message: 'Internal server error in sendVideoFileHash' });
        }
    });
}
