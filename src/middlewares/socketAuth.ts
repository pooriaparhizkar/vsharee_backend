import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Socket } from 'socket.io';

const prisma = new PrismaClient();

export default async function socketAuth(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error('Unauthorized'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) return next(new Error('User not found'));

        (socket as any).user = user;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
}
