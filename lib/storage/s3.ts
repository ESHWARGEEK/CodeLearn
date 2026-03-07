/**
 * S3 Storage Utilities
 * 
 * Provides functions for storing and retrieving files from S3.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const PROJECTS_BUCKET = process.env.S3_PROJECTS_BUCKET || 'codelearn-user-projects-dev';
const TEMPLATES_BUCKET = process.env.S3_TEMPLATES_BUCKET || 'codelearn-templates-dev';
const ASSETS_BUCKET = process.env.S3_ASSETS_BUCKET || 'codelearn-assets-dev';

/**
 * Upload an object to S3
 */
export async function putObject(
  key: string,
  data: Buffer | string,
  bucket: string = PROJECTS_BUCKET,
  contentType?: string
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );
}

/**
 * Get an object from S3
 */
export async function getObject(
  key: string,
  bucket: string = PROJECTS_BUCKET
): Promise<Buffer | null> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      return null;
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    throw error;
  }
}

/**
 * Delete an object from S3
 */
export async function deleteObject(
  key: string,
  bucket: string = PROJECTS_BUCKET
): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Get a signed URL for an object
 */
export async function getSignedObjectUrl(
  key: string,
  bucket: string = PROJECTS_BUCKET,
  expiresIn: number = 3600
): Promise<string> {
  return await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn }
  );
}

/**
 * Upload project code
 */
export async function uploadProjectCode(
  userId: string,
  projectId: string,
  code: Buffer
): Promise<string> {
  const key = `${userId}/${projectId}/code.zip`;
  await putObject(key, code, PROJECTS_BUCKET, 'application/zip');
  return key;
}

/**
 * Get project code
 */
export async function getProjectCode(
  userId: string,
  projectId: string
): Promise<Buffer | null> {
  const key = `${userId}/${projectId}/code.zip`;
  return await getObject(key, PROJECTS_BUCKET);
}

/**
 * Upload template
 */
export async function uploadTemplate(
  templateId: string,
  code: Buffer
): Promise<string> {
  const key = `${templateId}/code.zip`;
  await putObject(key, code, TEMPLATES_BUCKET, 'application/zip');
  return key;
}

/**
 * Get template
 */
export async function getTemplate(templateId: string): Promise<Buffer | null> {
  const key = `${templateId}/code.zip`;
  return await getObject(key, TEMPLATES_BUCKET);
}

/**
 * Upload asset
 */
export async function uploadAsset(
  path: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  await putObject(path, data, ASSETS_BUCKET, contentType);
  return path;
}

/**
 * Get asset URL
 */
export async function getAssetUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  return await getSignedObjectUrl(path, ASSETS_BUCKET, expiresIn);
}
