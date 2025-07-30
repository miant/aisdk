import { AuthModule } from './auth';
import { EntitiesModule } from './entities';
import { IntegrationsModule } from './integrations';

export interface ClientConfig {
    serverUrl?: string;
    appId: string | number;
    env?: 'prod' | 'dev' | 'staging';
    token?: string;
    requiresAuth?: boolean;
    timeout?: number;
    retries?: number;
    debug?: boolean;
}

export interface Base44Client {
    entities: EntitiesModule;
    integrations: IntegrationsModule;
    auth: AuthModule;
    setToken(token: string): void;
    clearToken(): void;
    getConfig(): {
        serverUrl: string;
        appId: string | number;
        env: string;
        requiresAuth: boolean;
        timeout?: number;
        debug?: boolean;
    };
    isConnected(): Promise<boolean>;
}

export interface RequestConfig {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}