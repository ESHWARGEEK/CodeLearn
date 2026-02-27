# Script to export CDK stack outputs as environment variables
# Usage: .\scripts\export-env.ps1 -Env dev

param(
    [string]$Env = "dev",
    [string]$Region = $env:AWS_REGION ?? "us-east-1"
)

Write-Host "Extracting environment variables from CDK stacks (env: $Env, region: $Region)..." -ForegroundColor Green
Write-Host ""

# Function to get stack output value
function Get-StackOutput {
    param(
        [string]$StackName,
        [string]$OutputKey
    )
    
    try {
        $output = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --region $Region `
            --query "Stacks[0].Outputs[?OutputKey=='$OutputKey'].OutputValue" `
            --output text 2>$null
        return $output
    }
    catch {
        return ""
    }
}

# Database Stack Outputs
Write-Host "# DynamoDB Tables"
Write-Host "USERS_TABLE_NAME=$(Get-StackOutput "CodeLearn-Database-$Env" "UsersTableName")"
Write-Host "PROJECTS_TABLE_NAME=$(Get-StackOutput "CodeLearn-Database-$Env" "ProjectsTableName")"
Write-Host "LEARNING_PATHS_TABLE_NAME=$(Get-StackOutput "CodeLearn-Database-$Env" "LearningPathsTableName")"
Write-Host "TEMPLATES_TABLE_NAME=$(Get-StackOutput "CodeLearn-Database-$Env" "TemplatesTableName")"
Write-Host "JOBS_TABLE_NAME=$(Get-StackOutput "CodeLearn-Database-$Env" "JobsTableName")"
Write-Host "INTEGRATIONS_TABLE_NAME=$(Get-StackOutput "CodeLearn-Database-$Env" "IntegrationsTableName")"
Write-Host ""

# Storage Stack Outputs
Write-Host "# S3 Buckets"
Write-Host "USER_PROJECTS_BUCKET=$(Get-StackOutput "CodeLearn-Storage-$Env" "UserProjectsBucketName")"
Write-Host "TEMPLATES_BUCKET=$(Get-StackOutput "CodeLearn-Storage-$Env" "TemplatesBucketName")"
Write-Host "ASSETS_BUCKET=$(Get-StackOutput "CodeLearn-Storage-$Env" "AssetsBucketName")"
Write-Host "ASSETS_CDN_URL=$(Get-StackOutput "CodeLearn-Storage-$Env" "AssetsCdnUrl")"
Write-Host ""

# Auth Stack Outputs
Write-Host "# Cognito"
Write-Host "COGNITO_USER_POOL_ID=$(Get-StackOutput "CodeLearn-Auth-$Env" "UserPoolId")"
Write-Host "COGNITO_CLIENT_ID=$(Get-StackOutput "CodeLearn-Auth-$Env" "UserPoolClientId")"
Write-Host "COGNITO_IDENTITY_POOL_ID=$(Get-StackOutput "CodeLearn-Auth-$Env" "IdentityPoolId")"
Write-Host "COGNITO_USER_POOL_DOMAIN=$(Get-StackOutput "CodeLearn-Auth-$Env" "UserPoolDomain")"
Write-Host ""

# Queue Stack Outputs
Write-Host "# SQS"
Write-Host "AI_JOBS_QUEUE_URL=$(Get-StackOutput "CodeLearn-Queue-$Env" "AiJobsQueueUrl")"
Write-Host "AI_JOBS_QUEUE_ARN=$(Get-StackOutput "CodeLearn-Queue-$Env" "AiJobsQueueArn")"
Write-Host "AI_JOBS_DLQ_URL=$(Get-StackOutput "CodeLearn-Queue-$Env" "AiJobsDlqUrl")"
Write-Host "AI_JOBS_DLQ_ARN=$(Get-StackOutput "CodeLearn-Queue-$Env" "AiJobsDlqArn")"
Write-Host ""

# AWS Region
Write-Host "# AWS Region"
Write-Host "AWS_REGION=$Region"
Write-Host ""

Write-Host "# Copy the above output to your .env file" -ForegroundColor Yellow
