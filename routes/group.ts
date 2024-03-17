import express from 'express';
import Group from '../models/Group';
import User from '../models/User'; // Import your User model here
import { verifyToken } from '../scripts/verifyToken.index';

const router = express.Router();

// POST /api/groups - Create a new group
router.post('/', verifyToken, async (req: any, res) => {
    const { name, description } = req.body;

    try {
        const newGroup = new Group({
            name,
            description,
            members: [req.userId] // Add the creator as the first member
        });

        await newGroup.save();

        res.status(201).json({ message: 'Group created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/groups - Get groups the user belongs to
router.get('/', verifyToken, async (req: any, res) => {
    try {
        const groups = await Group.find({ members: req.userId }).populate({
            path: 'members',
            select: '-password -__v' // Exclude password and __v fields
        });

        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/groups/:groupId/invite - Invite members to a group
router.post('/:groupId/invite', async (req, res) => {
    const { userIds } = req.body;
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Add new members to the group
        group.members.push(...userIds);
        await group.save();

        res.status(200).json({ message: 'Members invited successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
