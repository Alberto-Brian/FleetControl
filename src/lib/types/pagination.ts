// Interface para parâmetros de paginação
export interface IPaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category_id?: string;
}

// Interface para resultado paginado
export interface IPaginatedResult<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}