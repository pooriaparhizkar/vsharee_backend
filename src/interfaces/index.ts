import {
    __EditMemberBody,
    __CreateGroupBody,
    __LoginBody,
    __SignupBody,
    __UpdateGroupBody,
    __GroupMemberRole,
} from './body';
import { __AuthenticatedRequest, __JwtPayload, __PaginationResult, __Response } from './general';

export interface JwtPayload extends __JwtPayload {}
export interface AuthenticatedRequest<T = any> extends __AuthenticatedRequest<T> {}
export interface SignupBody extends __SignupBody {}
export interface LoginBody extends __LoginBody {}
export interface CreateGroupBody extends __CreateGroupBody {}
export interface UpdateGroupBody extends __UpdateGroupBody {}
export interface EditMemberBody extends __EditMemberBody {}
export interface PaginationResult<T> extends __PaginationResult<T> {}
export interface Response<T> extends __Response<T> {}
export { __GroupMemberRole as GroupMemberRole };
