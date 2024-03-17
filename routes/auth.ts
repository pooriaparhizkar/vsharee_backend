import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Import your User model here
import { UserType } from '../interface';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        let existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log({ username, password })

    try {
        // Check if the user exists
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ status: 404, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const access_token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET ?? "", { expiresIn: '48h' });

        const modifiedUser: UserType = { username: user.username, _id: user._id.toString() };
        res.status(200).json({ status: 200, data: { access_token, user: modifiedUser } });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
