# Enable USER_PASSWORD_AUTH flow for Cognito User Pool Client
# This is required for email/password login to work

# Load environment variables from .env file
$envFile = Join-Path $PSScriptRoot ".." ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*?)\s*$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$userPoolId = $env:NEXT_PUBLIC_COGNITO_USER_POOL_ID
$clientId = $env:NEXT_PUBLIC_COGNITO_CLIENT_ID
$region = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

if (-not $userPoolId -or -not $clientId) {
    Write-Host "Error: Missing required environment variables" -ForegroundColor Red
    Write-Host "Please ensure NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_CLIENT_ID are set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "Enabling USER_PASSWORD_AUTH flow..." -ForegroundColor Cyan
Write-Host "User Pool ID: $userPoolId" -ForegroundColor Gray
Write-Host "Client ID: $clientId" -ForegroundColor Gray
Write-Host "Region: $region" -ForegroundColor Gray
Write-Host ""

# Get current client configuration
Write-Host "Fetching current client configuration..." -ForegroundColor Yellow
$currentConfig = aws cognito-idp describe-user-pool-client `
    --user-pool-id $userPoolId `
    --client-id $clientId `
    --region $region `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to fetch client configuration" -ForegroundColor Red
    exit 1
}

$client = $currentConfig.UserPoolClient

# Check if USER_PASSWORD_AUTH is already enabled
if ($client.ExplicitAuthFlows -contains "ALLOW_USER_PASSWORD_AUTH") {
    Write-Host "✓ USER_PASSWORD_AUTH is already enabled!" -ForegroundColor Green
    exit 0
}

Write-Host "Current auth flows:" -ForegroundColor Yellow
$client.ExplicitAuthFlows | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

# Add USER_PASSWORD_AUTH to existing flows
$authFlows = @($client.ExplicitAuthFlows)
if (-not ($authFlows -contains "ALLOW_USER_PASSWORD_AUTH")) {
    $authFlows += "ALLOW_USER_PASSWORD_AUTH"
}

# Ensure ALLOW_REFRESH_TOKEN_AUTH is also enabled
if (-not ($authFlows -contains "ALLOW_REFRESH_TOKEN_AUTH")) {
    $authFlows += "ALLOW_REFRESH_TOKEN_AUTH"
}

Write-Host "Updating client with new auth flows..." -ForegroundColor Yellow
Write-Host "New auth flows:" -ForegroundColor Yellow
$authFlows | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

# Build the update command
$authFlowsJson = $authFlows | ConvertTo-Json -Compress

# Update the client
aws cognito-idp update-user-pool-client `
    --user-pool-id $userPoolId `
    --client-id $clientId `
    --explicit-auth-flows $authFlows `
    --region $region `
    --output json | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully enabled USER_PASSWORD_AUTH flow!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use email/password login in your application." -ForegroundColor Green
    Write-Host ""
    Write-Host "Test it at: https://codelearn-lemon.vercel.app/login" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to update client configuration" -ForegroundColor Red
    exit 1
}
