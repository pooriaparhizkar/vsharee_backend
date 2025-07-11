import { Request } from 'express';

export interface __JwtPayload {
    userId: string;
}

export interface __AuthenticatedRequest<T = any> extends Request<any, any, T> {
    user?: __JwtPayload;
}
