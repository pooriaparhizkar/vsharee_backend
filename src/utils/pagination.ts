import { PaginationResult } from '../interfaces';

/**
 * Generic pagination helper for Prisma models.
 * @param queryParams Query params from the request (page, pageSize).
 * @param countFn Function to count total records.
 * @param fetchFn Function to fetch paginated data.
 * @param transformFn Optional function to transform fetched data.
 */
export async function paginate<T, U = T>(
    queryParams: Record<string, any>,
    countFn: () => Promise<number>,
    fetchFn: (skip: number, take: number) => Promise<T[]>,
    transformFn?: (items: T[]) => U[],
): Promise<PaginationResult<U>> {
    const DEFAULT_PAGE_SIZE = 20;
    const MAX_PAGE_SIZE = 100;
    const page = Math.max(parseInt(queryParams.page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(queryParams.pageSize) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const totalCount = await countFn();
    const totalPages = Math.ceil(totalCount / pageSize);

    const rawData = await fetchFn(skip, pageSize);
    const data = (transformFn ? transformFn(rawData) : rawData) as U[];

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
