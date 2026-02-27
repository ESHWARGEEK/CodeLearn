#!/bin/bash

# Script to extract CDK outputs and update .env file
# Usage: ./scripts/update-env-from-cdk.sh

set -e

echo "🔍 Extracting CDK outputs..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first (brew install jq or apt-get install jq)"
    exit 1
fi

# Get AWS region
AWS_REGION=${AWS_REGION:-us-east-1}
echo "📍 Using AWS region: $AWS_REGION"

# Function to get stack output
get_output() {
    local stack_name=$1
    local output_key=$2
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$AWS_REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

echo ""
echo "📦 Fetching Cognito outputs..."
USER_POOL_ID=$(get_output "CodeLearnStack" "UserPoolId")
CLIENT_ID=$(get_output "CodeLearnStack" "UserPoolClientId")
IDENTITY_POOL_ID=$(get_output "CodeLearnStack" "IdentityPoolId")
USER_POOL_DOMAIN=$(get_output "CodeLearnStack" "UserPoolDomain")

echo "📦 Fetching DynamoDB outputs..."
USERS_TABLE=$(get_output "CodeLearnStack" "UsersTableName")
PROJECTS_TABLE=$(get_output "CodeLearnStack" "ProjectsTableName")
LEARNING_PATHS_TABLE=$(get_output "CodeLearnStack" "LearningPathsTableName")
TEMPLATES_TABLE=$(get_output "CodeLearnStack" "TemplatesTableName")
JOBS_TABLE=$(get_output "CodeLearnStack" "JobsTableName")
INTEGRATIONS_TABLE=$(get_output "CodeLearnStack" "IntegrationsTableName")

echo "📦 Fetching S3 outputs..."
USER_PROJECTS_BUCKET=$(get_output "CodeLearnStack" "UserProjectsBucketName")
TEMPLATES_BUCKET=$(get_output "CodeLearnStack" "TemplatesBucketName")
ASSETS_BUCKET=$(get_output "CodeLearnStack" "AssetsBucketName")

echo "📦 Fetching SQS outputs..."
AI_JOBS_QUEUE_URL=$(get_output "CodeLearnStack" "AIJobsQueueUrl")
AI_JOBS_DLQ_URL=$(get_output "CodeLearnStack" "AIJobsDLQUrl")

echo ""
echo "✅ CDK outputs extracted successfully!"
echo ""
echo "📝 Updating .env file..."

# Create backup of existing .env
if [ -f .env ]; then
    cp .env .env.backup
    echo "📋 Backup created: .env.backup"
fi

# Update .env file
cat > .env.cdk-outputs << EOF
# AWS Cognito (from CDK output)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=${USER_POOL_ID}
NEXT_PUBLIC_COGNITO_CLIENT_ID=${CLIENT_ID}
COGNITO_IDENTITY_POOL_ID=${IDENTITY_POOL_ID}
COGNITO_USER_POOL_DOMAIN=${USER_POOL_DOMAIN}

# DynamoDB Tables (from CDK output)
DYNAMODB_TABLE_USERS=${USERS_TABLE}
DYNAMODB_TABLE_PROJECTS=${PROJECTS_TABLE}
DYNAMODB_TABLE_LEARNING_PATHS=${LEARNING_PATHS_TABLE}
DYNAMODB_TABLE_TEMPLATES=${TEMPLATES_TABLE}
DYNAMODB_TABLE_JOBS=${JOBS_TABLE}
DYNAMODB_TABLE_INTEGRATIONS=${INTEGRATIONS_TABLE}

# S3 Buckets (from CDK output)
S3_BUCKET_PROJECTS=${USER_PROJECTS_BUCKET}
S3_BUCKET_TEMPLATES=${TEMPLATES_BUCKET}
S3_BUCKET_ASSETS=${ASSETS_BUCKET}

# SQS Queues (from CDK output)
SQS_QUEUE_AI_JOBS=${AI_JOBS_QUEUE_URL}
SQS_QUEUE_AI_JOBS_DLQ=${AI_JOBS_DLQ_URL}
EOF

echo ""
echo "✅ CDK outputs saved to .env.cdk-outputs"
echo ""
echo "📋 Summary of extracted values:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Cognito User Pool ID:     ${USER_POOL_ID}"
echo "Cognito Client ID:        ${CLIENT_ID}"
echo "Cognito Identity Pool:    ${IDENTITY_POOL_ID}"
echo "Cognito Domain:           ${USER_POOL_DOMAIN}"
echo ""
echo "Users Table:              ${USERS_TABLE}"
echo "Projects Table:           ${PROJECTS_TABLE}"
echo "Learning Paths Table:     ${LEARNING_PATHS_TABLE}"
echo "Templates Table:          ${TEMPLATES_TABLE}"
echo "Jobs Table:               ${JOBS_TABLE}"
echo "Integrations Table:       ${INTEGRATIONS_TABLE}"
echo ""
echo "User Projects Bucket:     ${USER_PROJECTS_BUCKET}"
echo "Templates Bucket:         ${TEMPLATES_BUCKET}"
echo "Assets Bucket:            ${ASSETS_BUCKET}"
echo ""
echo "AI Jobs Queue URL:        ${AI_JOBS_QUEUE_URL}"
echo "AI Jobs DLQ URL:          ${AI_JOBS_DLQ_URL}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo "1. Review .env.cdk-outputs file"
echo "2. Manually merge values into your .env file"
echo "3. Add your OAuth credentials (GitHub, Google)"
echo "4. Add your AWS credentials (ACCESS_KEY_ID, SECRET_ACCESS_KEY)"
echo ""
echo "💡 Tip: The Cognito callback URL for OAuth providers is:"
echo "   ${USER_POOL_DOMAIN}/oauth2/idpresponse"
echo ""
