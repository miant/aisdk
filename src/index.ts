// Main exports
export { createClient } from './client';

// Types
export type {
    Base44Client,
    ClientConfig,
    RequestConfig
} from './types/client';

export type {
    Entity,
    FilterOptions,
    QueryFilter,
    BulkOperationResult
} from './types';

export type {
    AuthModule,
    User,
    LoginOptions,
    AuthTokens
} from './types/auth';

export type {
    EntityMethods,
    EntitiesModule,
    ImportOptions,
    ImportResult
} from './types/entities';

export type {
    IntegrationEndpoint,
    IntegrationsPackage,
    IntegrationsModule,
    WebhookPayload
} from './types/integrations';

// Errors
export {
    Base44Error,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError
} from './lib/errors';

// Utilities
export {
    getAccessToken,
    saveAccessToken,
    removeAccessToken,
    hasValidToken
} from './utils/storage';

export type { StorageOptions } from './utils/storage';

// Version
export const version = '1.0.0';