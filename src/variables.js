// params will be provided in search
const params = (new URL(document.location)).searchParams;

export const API_KEY = params.get("apiKey");
export const ENV_ID = params.get("envId");
export const TENANT_ID = params.get("tenantId");
export const FLOW_ID = params.get("flowId");
export const AWS_ENDPOINT = params.get("awsEndpoint");
