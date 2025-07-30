export * from './client';
export * from './auth';
export * from './entities';

// Base interfaces
export interface Entity {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface FilterOptions {
    sort?: string;
    limit?: number;
    skip?: number;
    fields?: string[] | string;
}

export interface QueryFilter {
    [key: string]: any;
}

export interface BulkOperationResult {
    success: boolean;
    created: number;
    failed: number;
    errors?: Array<{
        index: number;
        error: string;
    }>;
}