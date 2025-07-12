import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginBody, SignupBody } from '../interfaces';

const prisma = new PrismaClient();

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response): Promise<void> => {
    const { email, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        res.status(400).json({ message: 'Email exists' });
        return;
    }

    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashed, name },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);

    const { password, ...userWithoutPassword } = user;
    res.json({
        token,
        user: {
            ...userWithoutPassword,
            groups: [],
        },
    });
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
    const groups = await prisma.group.findMany({
        where: {
            members: {
                some: { id: user.id },
            },
        },
    });
    const { password, ...userWithoutPassword } = user;
    res.json({
        token,
        user: {
            ...userWithoutPassword,
            groups,
        },
    });
};
