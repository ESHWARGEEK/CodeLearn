# PowerShell script to extract CDK outputs and update .env file
# Usage: .\scripts\update-env-from-cdk.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔍 Extracting CDK outputs..." -ForegroundColor Cyan

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Get AWS region
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
Write-Host "📍 Using AWS region: $AWS_REGION" -ForegroundColor Yellow

# Function to get stack output
function Get-StackOutput {
    param(
        [string]$StackName,
        [string]$OutputKey
    )
    
    try {
        $output = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --region $AWS_REGION `
            --query "Stacks[0].Outputs[?OutputKey=='$OutputKey'].OutputValue" `
            --output text 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            return $output
        }
        return ""
    }
    catch {
        return ""
    }
}

Write-Host ""
Write-Host "📦 Fetching Cognito outputs..." -ForegroundColor Cyan
$USER_POOL_ID = Get-StackOutput "CodeLearnStack" "UserPoolId"
$CLIENT_ID = Get-StackOutput "CodeLearnStack" "UserPoolClientId"
$IDENTITY_POOL_ID = Get-StackOutput "CodeLearnStack" "IdentityPoolId"
$USER_POOL_DOMAIN = Get-StackOutput "CodeLearnStack" "UserPoolDomain"

Write-Host "📦 Fetching DynamoDB outputs..." -ForegroundColor Cyan
$USERS_TABLE = Get-StackOutput "CodeLearnStack" "UsersTableName"
$PROJECTS_TABLE = Get-StackOutput "CodeLearnStack" "ProjectsTableName"
$LEARNING_PATHS_TABLE = Get-StackOutput "CodeLearnStack" "LearningPathsTableName"
$TEMPLATES_TABLE = Get-StackOutput "CodeLearnStack" "TemplatesTableName"
$JOBS_TABLE = Get-StackOutput "CodeLearnStack" "JobsTableName"
$INTEGRATIONS_TABLE = Get-StackOutput "CodeLearnStack" "IntegrationsTableName"

Write-Host "📦 Fetching S3 outputs..." -ForegroundColor Cyan
$USER_PROJECTS_BUCKET = Get-StackOutput "CodeLearnStack" "UserProjectsBucketName"
$TEMPLATES_BUCKET = Get-StackOutput "CodeLearnStack" "TemplatesBucketName"
$ASSETS_BUCKET = Get-StackOutput "CodeLearnStack" "AssetsBucketName"

Write-Host "📦 Fetching SQS outputs..." -ForegroundColor Cyan
$AI_JOBS_QUEUE_URL = Get-StackOutput "CodeLearnStack" "AIJobsQueueUrl"
$AI_JOBS_DLQ_URL = Get-StackOutput "CodeLearnStack" "AIJobsDLQUrl"

Write-Host ""
Write-Host "✅ CDK outputs extracted successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Updating .env file..." -ForegroundColor Cyan

# Create backup of existing .env
if (Test-Path .env) {
    Copy-Item .env .env.backup
    Write-Host "📋 Backup created: .env.backup" -ForegroundColor Yellow
}

# Create .env.cdk-outputs file
$envContent = @"
# AWS Cognito (from CDK output)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID
COGNITO_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
COGNITO_USER_POOL_DOMAIN=$USER_POOL_DOMAIN

# DynamoDB Tables (from CDK output)
DYNAMODB_TABLE_USERS=$USERS_TABLE
DYNAMODB_TABLE_PROJECTS=$PROJECTS_TABLE
DYNAMODB_TABLE_LEARNING_PATHS=$LEARNING_PATHS_TABLE
DYNAMODB_TABLE_TEMPLATES=$TEMPLATES_TABLE
DYNAMODB_TABLE_JOBS=$JOBS_TABLE
DYNAMODB_TABLE_INTEGRATIONS=$INTEGRATIONS_TABLE

# S3 Buckets (from CDK output)
S3_BUCKET_PROJECTS=$USER_PROJECTS_BUCKET
S3_BUCKET_TEMPLATES=$TEMPLATES_BUCKET
S3_BUCKET_ASSETS=$ASSETS_BUCKET

# SQS Queues (from CDK output)
SQS_QUEUE_AI_JOBS=$AI_JOBS_QUEUE_URL
SQS_QUEUE_AI_JOBS_DLQ=$AI_JOBS_DLQ_URL
"@

$envContent | Out-File -FilePath .env.cdk-outputs -Encoding UTF8

Write-Host ""
Write-Host "✅ CDK outputs saved to .env.cdk-outputs" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of extracted values:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Cognito User Pool ID:     $USER_POOL_ID" -ForegroundColor White
Write-Host "Cognito Client ID:        $CLIENT_ID" -ForegroundColor White
Write-Host "Cognito Identity Pool:    $IDENTITY_POOL_ID" -ForegroundColor White
Write-Host "Cognito Domain:           $USER_POOL_DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "Users Table:              $USERS_TABLE" -ForegroundColor White
Write-Host "Projects Table:           $PROJECTS_TABLE" -ForegroundColor White
Write-Host "Learning Paths Table:     $LEARNING_PATHS_TABLE" -ForegroundColor White
Write-Host "Templates Table:          $TEMPLATES_TABLE" -ForegroundColor White
Write-Host "Jobs Table:               $JOBS_TABLE" -ForegroundColor White
Write-Host "Integrations Table:       $INTEGRATIONS_TABLE" -ForegroundColor White
Write-Host ""
Write-Host "User Projects Bucket:     $USER_PROJECTS_BUCKET" -ForegroundColor White
Write-Host "Templates Bucket:         $TEMPLATES_BUCKET" -ForegroundColor White
Write-Host "Assets Bucket:            $ASSETS_BUCKET" -ForegroundColor White
Write-Host ""
Write-Host "AI Jobs Queue URL:        $AI_JOBS_QUEUE_URL" -ForegroundColor White
Write-Host "AI Jobs DLQ URL:          $AI_JOBS_DLQ_URL" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Review .env.cdk-outputs file"
Write-Host "2. Manually merge values into your .env file"
Write-Host "3. Add your OAuth credentials (GitHub, Google)"
Write-Host "4. Add your AWS credentials (ACCESS_KEY_ID, SECRET_ACCESS_KEY)"
Write-Host ""
Write-Host "💡 Tip: The Cognito callback URL for OAuth providers is:" -ForegroundColor Yellow
Write-Host "   $USER_POOL_DOMAIN/oauth2/idpresponse" -ForegroundColor White
Write-Host ""
