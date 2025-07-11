import { Request } from 'express';

export interface __JwtPayload {
    userId: string;
}

export interface __AuthenticatedRequest extends Request {
    user?: __JwtPayload;
}
