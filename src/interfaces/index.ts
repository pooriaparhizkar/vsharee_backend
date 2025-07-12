import { __CreateGroupBody, __LoginBody, __SignupBody, __UpdateGroupBody } from './body';
import { __AuthenticatedRequest, __JwtPayload } from './general';

export interface JwtPayload extends __JwtPayload {}
export interface AuthenticatedRequest<T = any> extends __AuthenticatedRequest<T> {}
export interface SignupBody extends __SignupBody {}
export interface LoginBody extends __LoginBody {}
export interface CreateGroupBody extends __CreateGroupBody {}
export interface UpdateGroupBody extends __UpdateGroupBody {}
