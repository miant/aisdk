import { Entity } from './index';

export interface User extends Entity {
    email: string;
    name: string;
    role?: string;
    permissions?: string[];
    preferences?: Record<string, any>;
}

export interface AuthModule {
    me(): Promise<User>;
    updateMe(data: Record<string, any>): Promise<User>;
    login(nextUrl?: string): void;
    logout(redirectUrl?: string): Promise<void>;
    setToken(token: string, saveToStorage?: boolean): void;
    clearToken(): void;
    isAuthenticated(): Promise<boolean>;
    refreshToken(): Promise<string>;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
}

export interface LoginOptions {
    redirectUrl?: string;
    state?: string;
    popup?: boolean;
}