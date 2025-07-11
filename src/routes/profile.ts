/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile
 */

/**
 * @swagger
 * /api/profile/mine:
 *   post:
 *     summary: return User Profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Returns User Profile
 */

import express from 'express';
import { myProfile } from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.js';

const profileRoutes = express.Router();
profileRoutes.post('/mine', authenticate, myProfile);

export default profileRoutes;
