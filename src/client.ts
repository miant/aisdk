import { ClientConfig, Base44Client } from './types/client';
import { HttpClient } from './lib/http-client';
import { createAuthModule } from './lib/auth';
import { createEntitiesModule } from './lib/entities';
import { createIntegrationsModule } from './lib/integrations';
import { getAccessToken } from './utils/storage';
import { ValidationError } from './lib/errors';

export function createClient(config: ClientConfig): Base44Client {
    // Validate required config
    if (!config || !config.appId) {
        throw new ValidationError('appId is required');
    }

    const {
        serverUrl = 'https://base44.app',
        appId,
        env = 'prod',
        token,
        requiresAuth = false,
        timeout = 30000,
        debug = false
    } = config;

    // Create HTTP client
    const httpClient = new HttpClient({
        baseURL: `${serverUrl}/api`,
        headers: {
            'X-App-Id': String(appId),
            'X-Environment': env
        },
        token,
        timeout,
        requiresAuth,
        appId,
        serverUrl,
        debug
    });

    // Create modules
    const auth = createAuthModule(httpClient, appId, serverUrl);
    const entities = createEntitiesModule(httpClient, appId);
    const integrations = createIntegrationsModule(httpClient, appId);

    // Auto-detect token from URL or localStorage
    if (typeof window !== 'undefined') {
        const autoToken = token || getAccessToken();
        if (autoToken) {
            auth.setToken(autoToken);
        }
    }

    // Auto-authenticate if required
    if (requiresAuth && typeof window !== 'undefined') {
        setTimeout(async () => {
            try {
                const isAuthenticated = await auth.isAuthenticated();
                if (!isAuthenticated) {
                    auth.login(window.location.href);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);
                auth.login(window.location.href);
            }
        }, 0);
    }

    return {
        entities,
        integrations,
        auth,

        setToken(token: string) {
            auth.setToken(token);
        },

        clearToken() {
            auth.clearToken();
        },

        getConfig() {
            return {
                serverUrl,
                appId,
                env,
                requiresAuth,
                timeout,
                debug
            };
        },

        async isConnected(): Promise<boolean> {
            return httpClient.ping();
        }
    };
}