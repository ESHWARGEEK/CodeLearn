/**
 * Vercel Deployment Client
 * 
 * Handles deployment of projects to Vercel using the Vercel API.
 * Requires VERCEL_TOKEN environment variable.
 */

export interface VercelDeploymentConfig {
  projectName: string;
  files: Record<string, string>; // filename -> content
  framework?: 'nextjs' | 'react' | 'vue' | 'static';
  buildCommand?: string;
  outputDirectory?: string;
  environmentVariables?: Record<string, string>;
}

export interface VercelDeployment {
  id: string;
  url: string;
  status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
  buildingAt?: number;
  readyAt?: number;
}

export interface VercelDeploymentError {
  code: string;
  message: string;
}

const VERCEL_API_BASE = 'https://api.vercel.com';
const VERCEL_API_VERSION = 'v13';

/**
 * Get Vercel API token from environment
 */
function getVercelToken(): string {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is not set');
  }
  return token;
}

/**
 * Create a new deployment on Vercel
 */
export async function createDeployment(
  config: VercelDeploymentConfig
): Promise<VercelDeployment> {
  const token = getVercelToken();

  // Convert files to Vercel format
  const files = Object.entries(config.files).map(([file, content]) => ({
    file,
    data: Buffer.from(content).toString('base64'),
    encoding: 'base64',
  }));

  // Build deployment payload
  const payload = {
    name: config.projectName,
    files,
    projectSettings: {
      framework: config.framework || 'static',
      buildCommand: config.buildCommand,
      outputDirectory: config.outputDirectory || 'dist',
    },
    target: 'production',
    env: config.environmentVariables || {},
  };

  const response = await fetch(`${VERCEL_API_BASE}/${VERCEL_API_VERSION}/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Vercel deployment failed: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.url,
    status: data.readyState || 'QUEUED',
    readyState: data.readyState || 'QUEUED',
    createdAt: data.createdAt,
    buildingAt: data.buildingAt,
    readyAt: data.readyAt,
  };
}

/**
 * Get deployment status
 */
export async function getDeploymentStatus(
  deploymentId: string
): Promise<VercelDeployment> {
  const token = getVercelToken();

  const response = await fetch(
    `${VERCEL_API_BASE}/${VERCEL_API_VERSION}/deployments/${deploymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get deployment status: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.url,
    status: data.readyState || 'QUEUED',
    readyState: data.readyState || 'QUEUED',
    createdAt: data.createdAt,
    buildingAt: data.buildingAt,
    readyAt: data.readyAt,
  };
}

/**
 * Cancel a deployment
 */
export async function cancelDeployment(deploymentId: string): Promise<void> {
  const token = getVercelToken();

  const response = await fetch(
    `${VERCEL_API_BASE}/${VERCEL_API_VERSION}/deployments/${deploymentId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to cancel deployment: ${error.error?.message || response.statusText}`);
  }
}

/**
 * Get deployment logs
 */
export async function getDeploymentLogs(
  deploymentId: string
): Promise<string[]> {
  const token = getVercelToken();

  const response = await fetch(
    `${VERCEL_API_BASE}/${VERCEL_API_VERSION}/deployments/${deploymentId}/events`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get deployment logs: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.map((event: { text: string }) => event.text);
}

/**
 * Check if Vercel token is configured
 */
export function isVercelConfigured(): boolean {
  return !!process.env.VERCEL_TOKEN;
}
