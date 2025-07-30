import { HttpClient } from './http-client';
import { IntegrationsModule, IntegrationsPackage, IntegrationEndpoint } from '../types/integrations';

function createIntegrationEndpoint(
    httpClient: HttpClient,
    appId: string | number,
    packageName: string,
    endpointName: string
): IntegrationEndpoint {
    return async (data: Record<string, any>) => {
        if (typeof data === 'string') {
            throw new Error(
                `Integration ${endpointName} must receive an object with named parameters, received: ${data}`
            );
        }

        let requestData: any;
        let contentType: string;

        // Handle file uploads
        if (data instanceof FormData || (data && Object.values(data).some(value => value instanceof File))) {
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                const value = data[key];
                if (value instanceof File) {
                    formData.append(key, value, value.name);
                } else if (typeof value === 'object' && value !== null) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            });

            requestData = formData;
            contentType = 'multipart/form-data';
        } else {
            requestData = data;
            contentType = 'application/json';
        }

        const url = packageName === 'Core'
            ? `/apps/${appId}/integration-endpoints/Core/${endpointName}`
            : `/apps/${appId}/integration-endpoints/installable/${packageName}/integration-endpoints/${endpointName}`;

        return httpClient.post(url, requestData, {
            headers: {
                'Content-Type': contentType
            }
        });
    };
}

function createIntegrationsPackage(
    httpClient: HttpClient,
    appId: string | number,
    packageName: string
): IntegrationsPackage {
    return new Proxy({} as IntegrationsPackage, {
        get(target, endpointName) {
            if (typeof endpointName === 'string' && endpointName !== 'then' && !endpointName.startsWith('_')) {
                return createIntegrationEndpoint(httpClient, appId, packageName, endpointName);
            }
            return undefined;
        }
    });
}

export function createIntegrationsModule(
    httpClient: HttpClient,
    appId: string | number
): IntegrationsModule {
    return new Proxy({} as IntegrationsModule, {
        get(target, packageName) {
            if (typeof packageName === 'string' && packageName !== 'then' && !packageName.startsWith('_')) {
                return createIntegrationsPackage(httpClient, appId, packageName);
            }
            return undefined;
        }
    });
}
