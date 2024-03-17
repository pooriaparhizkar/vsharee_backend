import express from 'express';
import User from '../models/User'; // Import your User model here
import { verifyToken } from '../scripts/verifyToken.index';

const router = express.Router();

// API endpoint to get user information based on token
router.get('/user', verifyToken, async (req: any, res: any) => {
    try {
        const user = await User.findById(req.userId).select('-password -__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
