#!/bin/bash

# Script to export CDK stack outputs as environment variables
# Usage: ./scripts/export-env.sh dev

ENV=${1:-dev}
REGION=${AWS_REGION:-us-east-1}

echo "Extracting environment variables from CDK stacks (env: $ENV, region: $REGION)..."
echo ""

# Function to get stack output value
get_output() {
    local stack_name=$1
    local output_key=$2
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null
}

# Database Stack Outputs
echo "# DynamoDB Tables"
echo "USERS_TABLE_NAME=$(get_output "CodeLearn-Database-$ENV" "UsersTableName")"
echo "PROJECTS_TABLE_NAME=$(get_output "CodeLearn-Database-$ENV" "ProjectsTableName")"
echo "LEARNING_PATHS_TABLE_NAME=$(get_output "CodeLearn-Database-$ENV" "LearningPathsTableName")"
echo "TEMPLATES_TABLE_NAME=$(get_output "CodeLearn-Database-$ENV" "TemplatesTableName")"
echo "JOBS_TABLE_NAME=$(get_output "CodeLearn-Database-$ENV" "JobsTableName")"
echo "INTEGRATIONS_TABLE_NAME=$(get_output "CodeLearn-Database-$ENV" "IntegrationsTableName")"
echo ""

# Storage Stack Outputs
echo "# S3 Buckets"
echo "USER_PROJECTS_BUCKET=$(get_output "CodeLearn-Storage-$ENV" "UserProjectsBucketName")"
echo "TEMPLATES_BUCKET=$(get_output "CodeLearn-Storage-$ENV" "TemplatesBucketName")"
echo "ASSETS_BUCKET=$(get_output "CodeLearn-Storage-$ENV" "AssetsBucketName")"
echo "ASSETS_CDN_URL=$(get_output "CodeLearn-Storage-$ENV" "AssetsCdnUrl")"
echo ""

# Auth Stack Outputs
echo "# Cognito"
echo "COGNITO_USER_POOL_ID=$(get_output "CodeLearn-Auth-$ENV" "UserPoolId")"
echo "COGNITO_CLIENT_ID=$(get_output "CodeLearn-Auth-$ENV" "UserPoolClientId")"
echo "COGNITO_IDENTITY_POOL_ID=$(get_output "CodeLearn-Auth-$ENV" "IdentityPoolId")"
echo "COGNITO_USER_POOL_DOMAIN=$(get_output "CodeLearn-Auth-$ENV" "UserPoolDomain")"
echo ""

# Queue Stack Outputs
echo "# SQS"
echo "AI_JOBS_QUEUE_URL=$(get_output "CodeLearn-Queue-$ENV" "AiJobsQueueUrl")"
echo "AI_JOBS_QUEUE_ARN=$(get_output "CodeLearn-Queue-$ENV" "AiJobsQueueArn")"
echo "AI_JOBS_DLQ_URL=$(get_output "CodeLearn-Queue-$ENV" "AiJobsDlqUrl")"
echo "AI_JOBS_DLQ_ARN=$(get_output "CodeLearn-Queue-$ENV" "AiJobsDlqArn")"
echo ""

# AWS Region
echo "# AWS Region"
echo "AWS_REGION=$REGION"
echo ""

echo "# Copy the above output to your .env file"
