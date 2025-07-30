export interface StorageOptions {
    storageKey?: string;
    paramName?: string;
    saveToStorage?: boolean;
    removeFromUrl?: boolean;
}

const DEFAULT_STORAGE_KEY = 'base44_access_token';
const DEFAULT_PARAM_NAME = 'access_token';

export function getAccessToken(options: StorageOptions = {}): string | null {
    const {
        storageKey = DEFAULT_STORAGE_KEY,
        paramName = DEFAULT_PARAM_NAME,
        saveToStorage = true,
        removeFromUrl = true
    } = options;

    let token: string | null = null;

    // First, try to get token from URL parameters
    if (typeof window !== 'undefined' && window.location) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get(paramName);

            if (token) {
                // Save to localStorage if requested
                if (saveToStorage) {
                    saveAccessToken(token, { storageKey });
                }

                // Remove from URL if requested
                if (removeFromUrl) {
                    urlParams.delete(paramName);
                    const newUrl = `${window.location.pathname}${
                        urlParams.toString() ? `?${urlParams.toString()}` : ''
                    }${window.location.hash}`;
                    window.history.replaceState({}, document.title, newUrl);
                }

                return token;
            }
        } catch (error) {
            console.error('Error retrieving token from URL:', error);
        }
    }

    // If not found in URL, try localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            token = window.localStorage.getItem(storageKey);
            return token;
        } catch (error) {
            console.error('Error retrieving token from localStorage:', error);
        }
    }

    return null;
}

export function saveAccessToken(
    token: string,
    options: StorageOptions = {}
): boolean {
    const { storageKey = DEFAULT_STORAGE_KEY } = options;

    if (typeof window === 'undefined' || !window.localStorage || !token) {
        return false;
    }

    try {
        window.localStorage.setItem(storageKey, token);
        return true;
    } catch (error) {
        console.error('Error saving token to localStorage:', error);
        return false;
    }
}

export function removeAccessToken(options: StorageOptions = {}): boolean {
    const { storageKey = DEFAULT_STORAGE_KEY } = options;

    if (typeof window === 'undefined' || !window.localStorage) {
        return false;
    }

    try {
        window.localStorage.removeItem(storageKey);
        return true;
    } catch (error) {
        console.error('Error removing token from localStorage:', error);
        return false;
    }
}

export function hasValidToken(options: StorageOptions = {}): boolean {
    const token = getAccessToken(options);
    return !!token && token.length > 0;
}