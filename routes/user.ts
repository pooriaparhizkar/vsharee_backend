import express from 'express';
import User from '../models/User'; // Import your User model here
import { verifyToken } from '../scripts/verifyToken.index';

const router = express.Router();

// API endpoint to get user information based on token
/**
 * @swagger
 * /api/user/user:
 *   get:
 *     summary: Get your user
 *     description: Retrieve your user information
 *     security:
 *       - BearerAuth: []   # Use the security definition defined below
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 * securityDefinitions:
 *   BearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 *     description: JWT authorization token
 *     examples:
 *       example1:
 *         value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWY2ZDgxMTdmZDU1ZDk3M2Q5Njc3NjYiLCJpYXQiOjE3MTA2NzYwNzMsImV4cCI6MTcxMDY3OTY3M30.ZeCVbhGSI4TbH-4nYrAkBAlHTMwDouMUfu8EhFCkwq4"
 */

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
