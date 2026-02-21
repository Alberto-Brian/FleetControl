// ========================================
// FILE: src/lb/types/pagination
// ========================================
export interface IPaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category_id?: string;
}

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
    // Counts globais — não afectados pelos filtros activos
    statusCounts?: Record<string, number>;
}