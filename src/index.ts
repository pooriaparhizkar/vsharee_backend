import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { authRoutes, groupRoutes, profileRoutes } from './routes';
import { createServer } from 'http';
import { setupSocket } from './socket';
import fs from 'fs';
import path from 'path';
import https from 'https';

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

app.get('/', (req, res) => res.send('vSharee backend is running!'));

// Read SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../certs/localhost-key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../certs/localhost.pem')),
};

const server = https.createServer(sslOptions, app);
setupSocket(server); // 👉 Socket.io initialized
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port 8000`));
