/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group Management
 */

/**
 * @swagger
 * /api/group:
 *   post:
 *     summary: Create a new group
 *     tags: [Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, name]
 *             properties:
 *               id:
 *                 type: string
 *                 example: group123
 *               name:
 *                 type: string
 *                 example: My Group
 *               description:
 *                 type: string
 *                 example: This is a sample group description.
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: group123
 *                 name:
 *                   type: string
 *                   example: My Group
 *                 description:
 *                   type: string
 *                   example: This is a sample group description.
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

import express from 'express';
import { createGroup } from '../controllers';
import { authenticate } from '../middlewares/auth';

const groupRoute = express.Router();
groupRoute.post('/', authenticate, createGroup);

export default groupRoute;
