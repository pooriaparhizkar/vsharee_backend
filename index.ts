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
import jwt from 'jsonwebtoken';
import User from './models/User';
import { initializeWebSocketServer } from './websocketServer';

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

// Initialize WebSocket server
initializeWebSocketServer(server);



// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
