import { PaginationResult } from '../interfaces';

/**
 * Generic pagination helper for Prisma models.
 * @param queryParams Query params from the request (page, pageSize).
 * @param countFn Function to count total records.
 * @param fetchFn Function to fetch paginated data.
 */
export async function paginate<T>(
    queryParams: Record<string, any>,
    countFn: () => Promise<number>,
    fetchFn: (skip: number, take: number) => Promise<T[]>,
    defaultPageSize = 20,
    maxPageSize = 100,
): Promise<PaginationResult<T>> {
    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(queryParams.pageSize) || defaultPageSize, 1), maxPageSize);
    const skip = (page - 1) * pageSize;

    const totalCount = await countFn();
    const totalPages = Math.ceil(totalCount / pageSize);

    const data = await fetchFn(skip, pageSize);

    return {
        page,
        pageSize,
        totalPages,
        totalCount,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
        data,
    };
}
