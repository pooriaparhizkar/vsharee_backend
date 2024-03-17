import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import groupRoutes from './routes/group';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI ?? "")
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


// Define Routes
// Example:
// app.use('/api/users', require('./routes/users'));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/group', groupRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
