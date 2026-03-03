# Disable email verification requirement for Cognito User Pool
# This allows users to login immediately after signup without email confirmation
# Recommended for development/testing only

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
$region = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

if (-not $userPoolId) {
    Write-Host "Error: Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID in .env" -ForegroundColor Red
    exit 1
}

Write-Host "Disabling email verification requirement..." -ForegroundColor Cyan
Write-Host "User Pool ID: $userPoolId" -ForegroundColor Gray
Write-Host "Region: $region" -ForegroundColor Gray
Write-Host ""

# Update user pool to not require email verification
Write-Host "Updating user pool configuration..." -ForegroundColor Yellow

aws cognito-idp update-user-pool `
    --user-pool-id $userPoolId `
    --auto-verified-attributes `
    --region $region `
    --output json | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully disabled email verification!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Users can now login immediately after signup without email confirmation." -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: Existing unconfirmed users need to be confirmed manually." -ForegroundColor Yellow
    Write-Host "See CONFIRM_USER_MANUAL.md for instructions." -ForegroundColor Yellow
} else {
    Write-Host "✗ Failed to update user pool configuration" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can disable it manually via AWS Console:" -ForegroundColor Yellow
    Write-Host "1. Go to Cognito → User pools → codelearn-dev" -ForegroundColor Gray
    Write-Host "2. Properties tab → Edit" -ForegroundColor Gray
    Write-Host "3. Find 'User attribute verification' section" -ForegroundColor Gray
    Write-Host "4. Uncheck 'Email' under verification attributes" -ForegroundColor Gray
    Write-Host "5. Save changes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Note: AWS Console interface may vary by region/version" -ForegroundColor Gray
    exit 1
}
