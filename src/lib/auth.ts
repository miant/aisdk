import { HttpClient } from './http-client';
import { AuthModule, User, LoginOptions } from '../types/auth';
import { saveAccessToken, removeAccessToken, getAccessToken } from '../utils/storage';

export function createAuthModule(
    httpClient: HttpClient,
    appId: string | number,
    serverUrl: string
): AuthModule {
    return {
        async me(): Promise<User> {
            return httpClient.get(`/apps/${appId}/entities/User/me`);
        },

        async updateMe(data: Record<string, any>): Promise<User> {
            return httpClient.put(`/apps/${appId}/entities/User/me`, data);
        },

        login(nextUrl?: string, options: LoginOptions = {}): void {
            if (typeof window === 'undefined') {
                throw new Error('Login method can only be used in a browser environment');
            }

            const redirectUrl = nextUrl || window.location.href;
            const loginUrl = new URL('/login', serverUrl);

            loginUrl.searchParams.set('from_url', redirectUrl);
            loginUrl.searchParams.set('app_id', String(appId));

            if (options.state) {
                loginUrl.searchParams.set('state', options.state);
            }

            if (options.popup) {
                // Open in popup window
                const popup = window.open(
                    loginUrl.toString(),
                    'base44-login',
                    'width=500,height=600,scrollbars=yes,resizable=yes'
                );

                // Listen for popup completion
                const checkClosed = setInterval(() => {
                    if (popup?.closed) {
                        clearInterval(checkClosed);
                        // Check if token was set
                        const token = getAccessToken();
                        if (token) {
                            window.location.reload();
                        }
                    }
                }, 1000);
            } else {
                // Redirect current window
                window.location.href = loginUrl.toString();
            }
        },

        async logout(redirectUrl?: string): Promise<void> {
            // Clear token from HTTP client
            httpClient.clearToken();

            // Clear token from localStorage
            removeAccessToken();

            // Call logout endpoint if available
            try {
                await httpClient.post(`/apps/${appId}/auth/logout`);
            } catch (error) {
                // Ignore logout endpoint errors
                console.warn('Logout endpoint error:', error);
            }

            // Redirect if URL provided
            if (redirectUrl && typeof window !== 'undefined') {
                window.location.href = redirectUrl;
            }

            return Promise.resolve();
        },

        setToken(token: string, saveToStorage: boolean = true): void {
            if (token) {
                httpClient.setToken(token);

                if (saveToStorage) {
                    saveAccessToken(token);
                }
            }
        },

        clearToken(): void {
            httpClient.clearToken();
            removeAccessToken();
        },

        async isAuthenticated(): Promise<boolean> {
            try {
                await this.me();
                return true;
            } catch (error) {
                return false;
            }
        },

        async refreshToken(): Promise<string> {
            try {
                const response = await httpClient.post(`/apps/${appId}/auth/refresh`);
                const newToken = response.accessToken;

                if (newToken) {
                    this.setToken(newToken);
                    return newToken;
                }

                throw new Error('No token in refresh response');
            } catch (error) {
                // If refresh fails, clear current token
                this.clearToken();
                throw error;
            }
        }
    };
}