import axios, {
    AxiosInstance,
    AxiosResponse,
    AxiosRequestConfig,
    InternalAxiosRequestConfig
} from 'axios';
import { Base44Error } from './errors';

export interface HttpClientOptions {
    baseURL: string;
    headers?: Record<string, string>;
    token?: string;
    timeout?: number;
    requiresAuth?: boolean;
    appId: string | number;
    serverUrl: string;
    debug?: boolean;
}

export class HttpClient {
    private client: AxiosInstance;
    private config: HttpClientOptions;

    constructor(options: HttpClientOptions) {
        this.config = options;

        // 创建基本的 axios 实例
        this.client = axios.create({
            baseURL: options.baseURL,
            timeout: options.timeout || 30000
        });

        // 分别设置 headers
        this.client.defaults.headers.common['Content-Type'] = 'application/json';
        this.client.defaults.headers.common['Accept'] = 'application/json';
        this.client.defaults.headers.common['X-App-Id'] = String(options.appId);
        this.client.defaults.headers.common['X-SDK-Version'] = '1.0.0';

        // 添加自定义 headers
        if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                this.client.defaults.headers.common[key] = value;
            });
        }

        if (options.token) {
            this.setToken(options.token);
        }

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // Add origin URL for browser environments
                if (typeof window !== 'undefined' && window.location) {
                    config.headers = {
                        ...config.headers,
                        'X-Origin-URL': window.location.href
                    };
                }

                // Debug logging
                if (this.config.debug) {
                    console.log(`[Base44 SDK] ${config.method?.toUpperCase()} ${config.url}`, {
                        data: config.data,
                        params: config.params
                    });
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                if (this.config.debug) {
                    console.log(`[Base44 SDK] Response:`, response.data);
                }
                return response.data;
            },
            (error) => {
                const base44Error = Base44Error.fromResponse(error.response, error);

                // Log error in development
                if (process.env.NODE_ENV !== 'production' || this.config.debug) {
                    this.logError(base44Error);
                }

                // Handle authentication errors
                if (this.config.requiresAuth && error.response?.status === 403) {
                    this.handleAuthError();
                }

                return Promise.reject(base44Error);
            }
        );
    }

    private logError(error: Base44Error) {
        console.error(`[Base44 SDK Error] ${error.status}: ${error.message}`);
        if (error.data) {
            try {
                console.error('Error data:', JSON.stringify(error.data, null, 2));
            } catch {
                console.error('Error data: [Cannot stringify error data]');
            }
        }
    }

    private handleAuthError() {
        if (typeof window !== 'undefined') {
            console.log('Authentication required. Redirecting to login...');
            setTimeout(() => {
                this.redirectToLogin();
            }, 100);
        }
    }

    private redirectToLogin() {
        if (typeof window === 'undefined') return;

        const loginUrl = `${this.config.serverUrl}/login?from_url=${encodeURIComponent(
            window.location.href
        )}&app_id=${this.config.appId}`;

        window.location.href = loginUrl;
    }

    setToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    clearToken() {
        delete this.client.defaults.headers.common['Authorization'];
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.client.get(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.client.post(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.client.put(url, data, config);
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.client.patch(url, data, config);
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.client.delete(url, config);
    }

    // Health check
    async ping(): Promise<boolean> {
        try {
            await this.get('/health');
            return true;
        } catch {
            return false;
        }
    }
}