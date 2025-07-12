/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile
 */

import express from 'express';
import { myProfile, profileDetail, searchUsers } from '../controllers';
import { authenticate } from '../middlewares/auth';

const profileRoutes = express.Router();

/**
 * @swagger
 * /api/profile/mine:
 *   get:
 *     summary: return User Profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Returns User Profile
 */
profileRoutes.get('/mine', authenticate, myProfile);

/**
 * @swagger
 * /api/profile/search/{page}/{pageSize}:
 *   get:
 *     summary: Search for users by name or email
 *     tags: [Profile]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Partial name or email to search for
 *       - in: path
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: true
 *         description: Page number
 *       - in: path
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         required: true
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: A list of users matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *                 hasPreviousPage:
 *                   type: boolean
 *                 hasNextPage:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       400:
 *         description: Name query is required
 *       500:
 *         description: Internal server error
 */
profileRoutes.get('/search/:page/:pageSize', authenticate, searchUsers);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Returns User Profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
profileRoutes.get('/:id', authenticate, profileDetail);

export default profileRoutes;
