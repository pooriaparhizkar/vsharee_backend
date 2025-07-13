import { __Response } from '../interfaces/general';

export const createResponse = <T>(value: T, status: number, message?: string, errors?: any): __Response<T> => {
    return {
        value,
        status,
        isSuccess: status >= 200 && status < 300,
        message,
        errors,
    };
};
