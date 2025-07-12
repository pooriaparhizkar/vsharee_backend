import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { authRoutes, groupRoutes, profileRoutes } from './routes';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
app.use(
    cors({
        origin: '*', // Allow any origin — adjust for production
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/group', groupRoutes);

app.get('/', (req, res) => {
    res.send('vSharee backend is running!');
});

const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // Adjust in production
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    socket.on('joinGroup', ({ groupId, userId }) => {
        socket.join(groupId);
        socket.to(groupId).emit('userJoined', { userId });
    });

    socket.on('sendMessage', ({ groupId, message, user }) => {
        io.to(groupId).emit('newMessage', { message, user });
    });

    socket.on('videoControl', ({ groupId, action }) => {
        io.to(groupId).emit('syncVideo', action); // { type: 'play', time: 120 }
    });

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
        // Optionally broadcast 'userLeft'
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port 8000`);
});
