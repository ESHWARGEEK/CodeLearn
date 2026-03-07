/**
 * Netlify Deployment Client
 * 
 * Handles deployment of projects to Netlify using the Netlify API.
 * Requires NETLIFY_TOKEN environment variable.
 */

export interface NetlifyDeploymentConfig {
  siteName: string;
  files: Record<string, string>; // filename -> content
  buildCommand?: string;
  publishDirectory?: string;
  environmentVariables?: Record<string, string>;
}

export interface NetlifyDeployment {
  id: string;
  url: string;
  status: 'new' | 'building' | 'ready' | 'error';
  state: 'new' | 'building' | 'ready' | 'error';
  createdAt: string;
  deployedAt?: string;
  siteId: string;
  siteName: string;
}

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  admin_url: string;
  created_at: string;
}

const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';

/**
 * Get Netlify API token from environment
 */
function getNetlifyToken(): string {
  const token = process.env.NETLIFY_TOKEN;
  if (!token) {
    throw new Error('NETLIFY_TOKEN environment variable is not set');
  }
  return token;
}

/**
 * Create a new site on Netlify
 */
export async function createSite(siteName: string): Promise<NetlifySite> {
  const token = getNetlifyToken();

  const payload = {
    name: siteName,
  };

  const response = await fetch(`${NETLIFY_API_BASE}/sites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Netlify site creation failed: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    ssl_url: data.ssl_url,
    admin_url: data.admin_url,
    created_at: data.created_at,
  };
}

/**
 * Create a new deployment on Netlify
 */
export async function createDeployment(
  config: NetlifyDeploymentConfig
): Promise<NetlifyDeployment> {
  const token = getNetlifyToken();

  // First, create or get the site
  let site: NetlifySite;
  try {
    site = await createSite(config.siteName);
  } catch (error: any) {
    // If site already exists, try to get it
    if (error.message.includes('already exists') || error.message.includes('taken')) {
      site = await getSiteByName(config.siteName);
    } else {
      throw error;
    }
  }

  // Prepare files for deployment
  const files: Record<string, string> = {};
  for (const [filename, content] of Object.entries(config.files)) {
    files[`/${filename}`] = Buffer.from(content).toString('base64');
  }

  // Create deployment
  const deployPayload = {
    files,
    draft: false,
    branch: 'main',
  };

  const response = await fetch(`${NETLIFY_API_BASE}/sites/${site.id}/deploys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deployPayload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Netlify deployment failed: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.ssl_url || data.url,
    status: mapNetlifyState(data.state),
    state: mapNetlifyState(data.state),
    createdAt: data.created_at,
    deployedAt: data.published_at,
    siteId: site.id,
    siteName: site.name,
  };
}

/**
 * Get site by name
 */
async function getSiteByName(siteName: string): Promise<NetlifySite> {
  const token = getNetlifyToken();

  const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteName}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get site: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    ssl_url: data.ssl_url,
    admin_url: data.admin_url,
    created_at: data.created_at,
  };
}

/**
 * Get deployment status
 */
export async function getDeploymentStatus(
  deploymentId: string
): Promise<NetlifyDeployment> {
  const token = getNetlifyToken();

  const response = await fetch(
    `${NETLIFY_API_BASE}/deploys/${deploymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get deployment status: ${error.message || response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.ssl_url || data.url,
    status: mapNetlifyState(data.state),
    state: mapNetlifyState(data.state),
    createdAt: data.created_at,
    deployedAt: data.published_at,
    siteId: data.site_id,
    siteName: data.name,
  };
}

/**
 * Cancel a deployment
 */
export async function cancelDeployment(deploymentId: string): Promise<void> {
  const token = getNetlifyToken();

  const response = await fetch(
    `${NETLIFY_API_BASE}/deploys/${deploymentId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to cancel deployment: ${error.message || response.statusText}`);
  }
}

/**
 * Get deployment logs
 */
export async function getDeploymentLogs(
  deploymentId: string
): Promise<string[]> {
  const token = getNetlifyToken();

  const response = await fetch(
    `${NETLIFY_API_BASE}/deploys/${deploymentId}/log`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get deployment logs: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.messages || [];
}

/**
 * Map Netlify state to our standard state
 */
function mapNetlifyState(
  state: string
): 'new' | 'building' | 'ready' | 'error' {
  switch (state) {
    case 'new':
    case 'preparing':
    case 'processing':
    case 'building':
    case 'enqueued':
      return 'building';
    case 'ready':
    case 'published':
      return 'ready';
    case 'error':
    case 'failed':
      return 'error';
    default:
      return 'building';
  }
}

/**
 * Check if Netlify token is configured
 */
export function isNetlifyConfigured(): boolean {
  return !!process.env.NETLIFY_TOKEN;
}
