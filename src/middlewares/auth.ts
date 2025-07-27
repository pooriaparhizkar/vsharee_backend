import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, JwtPayload } from '../interfaces';
import { createResponse } from '../utils';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json(createResponse(null, 403, 'Not authorized'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        res.status(401).json(createResponse(null, 401, 'Invalid token'));
    }
};
