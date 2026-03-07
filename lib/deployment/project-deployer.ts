/**
 * Project Deployment Service
 * 
 * Handles deployment of user projects to various platforms (Vercel, Netlify).
 * Manages project code extraction from S3 and deployment orchestration.
 */

import { getProjectByUser, updateProjectDeployment } from '../db/projects';
import { getObject } from '../storage/s3';
import { createDeployment, getDeploymentStatus, VercelDeployment } from './vercel-client';
import JSZip from 'jszip';

export interface DeploymentRequest {
  projectId: string;
  userId: string;
  platform: 'vercel' | 'netlify';
}

export interface DeploymentResult {
  deploymentId: string;
  url: string;
  status: 'building' | 'ready' | 'error';
  platform: 'vercel' | 'netlify';
}

/**
 * Deploy a project to the specified platform
 */
export async function deployProject(
  request: DeploymentRequest
): Promise<DeploymentResult> {
  // Get project from database
  const project = await getProjectByUser(request.projectId, request.userId);
  if (!project) {
    throw new Error('Project not found');
  }

  // Get project code from S3
  const codeBuffer = await getObject(project.codeS3Key);
  if (!codeBuffer) {
    throw new Error('Project code not found in storage');
  }

  // Extract files from zip
  const files = await extractFilesFromZip(codeBuffer);

  // Deploy based on platform
  let deployment: VercelDeployment;
  
  if (request.platform === 'vercel') {
    deployment = await deployToVercel(project.name, files, project.technology);
  } else {
    throw new Error(`Platform ${request.platform} not yet implemented`);
  }

  // Update project with deployment URL
  const deploymentUrl = `https://${deployment.url}`;
  await updateProjectDeployment(request.projectId, request.userId, deploymentUrl);

  return {
    deploymentId: deployment.id,
    url: deploymentUrl,
    status: mapDeploymentStatus(deployment.status),
    platform: request.platform,
  };
}

/**
 * Get deployment status
 */
export async function getDeploymentStatusById(
  deploymentId: string,
  platform: 'vercel' | 'netlify'
): Promise<DeploymentResult> {
  if (platform === 'vercel') {
    const deployment = await getDeploymentStatus(deploymentId);
    return {
      deploymentId: deployment.id,
      url: `https://${deployment.url}`,
      status: mapDeploymentStatus(deployment.status),
      platform: 'vercel',
    };
  }

  throw new Error(`Platform ${platform} not yet implemented`);
}

/**
 * Deploy to Vercel
 */
async function deployToVercel(
  projectName: string,
  files: Record<string, string>,
  technology: string
): Promise<VercelDeployment> {
  // Detect framework from technology
  const framework = detectFramework(technology);

  // Create deployment
  const deployment = await createDeployment({
    projectName: sanitizeProjectName(projectName),
    files,
    framework,
    buildCommand: getBuildCommand(framework),
    outputDirectory: getOutputDirectory(framework),
  });

  return deployment;
}

/**
 * Extract files from zip buffer
 */
async function extractFilesFromZip(
  buffer: Buffer
): Promise<Record<string, string>> {
  const zip = await JSZip.loadAsync(buffer);
  const files: Record<string, string> = {};

  for (const [filename, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      const content = await file.async('string');
      files[filename] = content;
    }
  }

  return files;
}

/**
 * Detect framework from technology
 */
function detectFramework(technology: string): 'nextjs' | 'react' | 'vue' | 'static' {
  const tech = technology.toLowerCase();
  
  if (tech.includes('next')) return 'nextjs';
  if (tech.includes('react')) return 'react';
  if (tech.includes('vue')) return 'vue';
  
  return 'static';
}

/**
 * Get build command for framework
 */
function getBuildCommand(framework: string): string {
  switch (framework) {
    case 'nextjs':
      return 'npm run build';
    case 'react':
      return 'npm run build';
    case 'vue':
      return 'npm run build';
    default:
      return '';
  }
}

/**
 * Get output directory for framework
 */
function getOutputDirectory(framework: string): string {
  switch (framework) {
    case 'nextjs':
      return '.next';
    case 'react':
      return 'build';
    case 'vue':
      return 'dist';
    default:
      return 'dist';
  }
}

/**
 * Sanitize project name for deployment
 */
function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63); // Vercel limit
}

/**
 * Map Vercel status to our status
 */
function mapDeploymentStatus(
  status: string
): 'building' | 'ready' | 'error' {
  switch (status) {
    case 'QUEUED':
    case 'BUILDING':
      return 'building';
    case 'READY':
      return 'ready';
    case 'ERROR':
    case 'CANCELED':
      return 'error';
    default:
      return 'building';
  }
}
