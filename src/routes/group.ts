/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group Management
 */

import express from 'express';
import {
    createGroup,
    deleteGroup,
    getGroupMessages,
    myGroups,
    updateGroup,
    verifyGroupId,
    getGroups,
    getGroupDetail,
} from '../controllers';
import { authenticate } from '../middlewares/auth';

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
 * /api/group/mine/{page}/{pageSize}:
 *   get:
 *     summary: Get all groups joined by the authenticated user (paginated)
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: path
 *         name: pageSize
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of groups per page
 *     responses:
 *       200:
 *         description: Paginated list of user's groups
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
 *                   example: 2
 *                 totalCount:
 *                   type: integer
 *                   example: 40
 *                 hasPreviousPage:
 *                   type: boolean
 *                   example: false
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       401:
 *         description: Unauthorized
 */
groupRoute.get('/mine/:page/:pageSize', authenticate, myGroups);

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
 * /api/group/{id}/messages/{page}/{pageSize}:
 *   get:
 *     summary: Get paginated messages of a group
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to fetch messages from
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: path
 *         name: pageSize
 *         required: true
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-message-id"
 *                       text:
 *                         type: string
 *                         example: "Hello group!"
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user-id-123"
 *                           name:
 *                             type: string
 *                             example: "Alice"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-13T12:34:56Z"
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
groupRoute.get('/:id/messages/:page/:pageSize', authenticate, getGroupMessages);

/**
 * @swagger
 * /api/group/{page}/{pageSize}:
 *   get:
 *     summary: Get all groups (paginated & sortable)
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: path
 *         name: pageSize
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of groups per page
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [members, createdAt]
 *           default: members
 *         description: Field to sort groups by
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Paginated list of groups
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
groupRoute.get('/:page/:pageSize', authenticate, getGroups);

/**
 * @swagger
 * /api/group/{id}:
 *   get:
 *     summary: get a group by ID
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group to get
 *     responses:
 *       200:
 *         description: Get Group detail successfully
 *       400:
 *         description: Missing group ID or unauthorized
 *       403:
 *         description: Not authorized to get this group detail
 */
groupRoute.get('/:id', authenticate, getGroupDetail);
export default groupRoute;
