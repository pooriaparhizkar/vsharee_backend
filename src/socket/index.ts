import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import socketAuth from '../middlewares/socketAuth';
import registerGroupHandlers from './handlers/groupHandlers';

export function setupSocket(server: Server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use(socketAuth); // Authenticate sockets with JWT

    io.on('connection', (socket) => {
        registerGroupHandlers(io, socket);
    });

    return io;
}
