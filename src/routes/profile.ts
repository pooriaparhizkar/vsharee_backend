/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile
 */

import express from 'express';
import { myProfile, searchUsers } from '../controllers';
import { authenticate } from '../middlewares/auth';

const profileRoutes = express.Router();

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
profileRoutes.post('/mine', authenticate, myProfile);

/**
 * @swagger
 * /api/profile/search:
 *   get:
 *     summary: Search for users by name
 *     tags: [Profile]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial name or email to search for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: A list of users matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       400:
 *         description: Name query is required
 *       500:
 *         description: Internal server error
 */
profileRoutes.get('/search', authenticate, searchUsers);
export default profileRoutes;
