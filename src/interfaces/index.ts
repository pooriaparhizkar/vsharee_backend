import { __LoginBody, __SignupBody } from './body';
import { __AuthenticatedRequest, __JwtPayload } from './general';

export interface SignupBody extends __SignupBody {}
export interface LoginBody extends __LoginBody {}
export interface JwtPayload extends __JwtPayload {}
export interface AuthenticatedRequest extends __AuthenticatedRequest {}
