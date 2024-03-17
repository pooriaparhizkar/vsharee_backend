// index.ts

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import groupRoutes from './routes/group';
import swaggerUi from 'swagger-ui-express';
import specs from './swaggerConfig';
import http from 'http'; // Import http module for WebSocket
import WebSocket from 'ws'; // Import WebSocket module

const app = express();
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI ?? "")
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/group', groupRoutes);

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server and attach it to HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connection event handler
wss.on('connection', function connection(ws) {

    // WebSocket message event handler
    ws.on('message', function incoming(message) {

        // Convert message to string if it's not already
        const stringMessage = typeof message !== 'string' ? message.toString() : message;

        // Broadcast message to all connected WebSocket clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(stringMessage);
            }
        });
    });

    // WebSocket close event handler
    ws.on('close', function close() {
        console.log('Client disconnected from WebSocket');
    });
});



// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
