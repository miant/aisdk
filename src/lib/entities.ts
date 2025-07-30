import { HttpClient } from './http-client';
import { EntitiesModule, EntityMethods, ImportOptions, ImportResult } from '../types/entities';
import { Entity, FilterOptions, QueryFilter, BulkOperationResult } from '../types';

function createEntityMethods<T extends Entity = Entity>(
    httpClient: HttpClient,
    appId: string | number,
    entityName: string
): EntityMethods<T> {
    const baseUrl = `/apps/${appId}/entities/${entityName}`;

    return {
        async list(options: FilterOptions = {}): Promise<T[]> {
            const params: any = {};

            if (options.sort) params.sort = options.sort;
            if (options.limit) params.limit = options.limit;
            if (options.skip) params.skip = options.skip;
            if (options.fields) {
                params.fields = Array.isArray(options.fields) ? options.fields.join(',') : options.fields;
            }

            return httpClient.get(baseUrl, {params});
        },

        async filter(query: QueryFilter, options: FilterOptions = {}): Promise<T[]> {
            const params: any = {
                q: JSON.stringify(query)
            };

            if (options.sort) params.sort = options.sort;
            if (options.limit) params.limit = options.limit;
            if (options.skip) params.skip = options.skip;
            if (options.fields) {
                params.fields = Array.isArray(options.fields) ? options.fields.join(',') : options.fields;
            }

            return httpClient.get(baseUrl, { params });
        },

        async get(id: string): Promise<T> {
            return httpClient.get(`${baseUrl}/${id}`);
        },

        async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
            return httpClient.post(baseUrl, data);
        },

        async update(id: string, data: Partial<T>): Promise<T> {
            return httpClient.put(`${baseUrl}/${id}`, data);
        },

        async delete(id: string): Promise<void> {
            return httpClient.delete(`${baseUrl}/${id}`);
        },

        async deleteMany(query: QueryFilter): Promise<{ deletedCount: number }> {
            return httpClient.delete(baseUrl, { data: query });
        },

        async bulkCreate(data: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BulkOperationResult> {
            return httpClient.post(`${baseUrl}/bulk`, data);
        },

        async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<BulkOperationResult> {
            return httpClient.put(`${baseUrl}/bulk`, updates);
        },

        async importEntities(file: File, options: ImportOptions = {}): Promise<ImportResult> {
            const formData = new FormData();
            formData.append('file', file, file.name);

            if (options.skipDuplicates !== undefined) {
                formData.append('skipDuplicates', String(options.skipDuplicates));
            }
            if (options.updateExisting !== undefined) {
                formData.append('updateExisting', String(options.updateExisting));
            }
            if (options.mapping) {
                formData.append('mapping', JSON.stringify(options.mapping));
            }

            return httpClient.post(`${baseUrl}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        },

        async exportEntities(query: QueryFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'json'): Promise<Blob> {
            const params: any = {
                format,
                q: JSON.stringify(query)
            };

            return httpClient.get(`${baseUrl}/export`, {
                params,
                responseType: 'blob'
            });
        },

        async count(query: QueryFilter = {}): Promise<number> {
            const params = {
                q: JSON.stringify(query)
            };

            const response = await httpClient.get(`${baseUrl}/count`, { params });
            return response.count;
        },

        async exists(id: string): Promise<boolean> {
            try {
                await httpClient.get(`${baseUrl}/${id}/exists`);
                return true;
            } catch (error: any) {
                if (error.status === 404) {
                    return false;
                }
                throw error;
            }
        }
    };
}

export function createEntitiesModule(
    httpClient: HttpClient,
    appId: string | number
): EntitiesModule {
    return new Proxy({} as EntitiesModule, {
        get(target, entityName) {
            if (typeof entityName === 'string' && entityName !== 'then' && !entityName.startsWith('_')) {
                return createEntityMethods(httpClient, appId, entityName);
            }
            return undefined;
        }
    });
}