/**
 * @swagger
 * components:
 *   schemas:
 *     GroupMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         text:
 *           type: string
 *           example: "Hello group!"
 *         sender:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "user-uuid-1234"
 *             name:
 *               type: string
 *               example: "Alice"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-13T12:34:56Z"
 */
/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group Management
 */

import express from 'express';
import { createGroup, deleteGroup, getGroupMessages, myGroups, updateGroup, verifyGroupId } from '../controllers';
import { authenticate } from '../middlewares/auth';
import { verify } from 'crypto';

const groupRoute = express.Router();

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
groupRoute.post('/', authenticate, createGroup);

/**
 * @swagger
 * /api/group/mine:
 *   get:
 *     summary: Get all groups created by the authenticated user
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 */
groupRoute.get('/mine', authenticate, myGroups);

/**
 * @swagger
 * /api/group/verify-id:
 *   post:
 *     summary: Verify if a group ID is available
 *     tags: [Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: group123
 *     responses:
 *       200:
 *         description: ID is free
 *       400:
 *         description: ID is not free
 */
groupRoute.post('/verify-id', authenticate, verifyGroupId);

/**
 * @swagger
 * /api/group/{id}:
 *   put:
 *     summary: Update a group by ID (creator only)
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Current ID of the group to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: New ID for the group
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Bad request or duplicate ID
 *       403:
 *         description: Unauthorized to update group
 *       500:
 *         description: Internal server error
 */
groupRoute.put('/:id', authenticate, updateGroup);

/**
 * @swagger
 * /api/group/{id}:
 *   delete:
 *     summary: Delete a group by ID (creator only)
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to delete
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       400:
 *         description: Missing group ID or unauthorized
 *       403:
 *         description: Not authorized to delete this group
 */
groupRoute.delete('/:id', authenticate, deleteGroup);

/**
 * @swagger
 * /api/group/{groupId}/messages:
 *   get:
 *     summary: Get paginated messages of a group
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to fetch messages from
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Paginated list of group messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 20
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalCount:
 *                   type: integer
 *                   example: 100
 *                 hasPreviousPage:
 *                   type: boolean
 *                   example: false
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupMessage'
 *       400:
 *         description: Missing groupId parameter
 *       500:
 *         description: Internal server error
 */
groupRoute.get('/:groupId/messages', authenticate, getGroupMessages);
export default groupRoute;
