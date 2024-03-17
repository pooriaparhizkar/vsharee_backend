import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Import your User model here

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET ?? "", (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// API endpoint to get user information based on token
router.get('/user', verifyToken, async (req: any, res: any) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
