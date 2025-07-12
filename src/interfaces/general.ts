import { Request } from 'express';

export interface __JwtPayload {
    userId: string;
}

export interface __AuthenticatedRequest<T = any> extends Request<any, any, T> {
    user?: __JwtPayload;
}

export interface __PaginationResult<T> {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    data: T[];
}
