export interface IntegrationEndpoint {
    (data: Record<string, any>): Promise<any>;
}

export interface IntegrationsPackage {
    [endpointName: string]: IntegrationEndpoint;
}

export interface IntegrationsModule {
    [packageName: string]: IntegrationsPackage;
}

export interface WebhookPayload {
    event: string;
    data: any;
    timestamp: string;
    signature?: string;
}