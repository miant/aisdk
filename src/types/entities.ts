import { Entity, FilterOptions, QueryFilter, BulkOperationResult } from './index';

export interface EntityMethods<T extends Entity = Entity> {
    list(options?: FilterOptions): Promise<T[]>;
    filter(query: QueryFilter, options?: FilterOptions): Promise<T[]>;
    get(id: string): Promise<T>;
    create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
    deleteMany(query: QueryFilter): Promise<{ deletedCount: number }>;
    bulkCreate(data: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BulkOperationResult>;
    bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<BulkOperationResult>;
    importEntities(file: File, options?: ImportOptions): Promise<ImportResult>;
    exportEntities(query?: QueryFilter, format?: 'csv' | 'json' | 'xlsx'): Promise<Blob>;
    count(query?: QueryFilter): Promise<number>;
    exists(id: string): Promise<boolean>;
}

export interface EntitiesModule {
    [entityName: string]: EntityMethods;
}

export interface ImportOptions {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    mapping?: Record<string, string>;
}

export interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{
        row: number;
        error: string;
    }>;
}
