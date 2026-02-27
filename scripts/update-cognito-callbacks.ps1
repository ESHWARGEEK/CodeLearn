# Update Cognito App Client Callback URLs
# Usage: .\scripts\update-cognito-callbacks.ps1

$UserPoolId = "us-east-1_bNco2tmIx"
$ClientId = "1belt192f8jpto6m9f9m3hm6l3"
$VercelUrl = "https://codelearn-lemon.vercel.app"
$CognitoDomain = "https://codelearn-dev.auth.us-east-1.amazoncognito.com"

Write-Host "Updating Cognito callback URLs..." -ForegroundColor Cyan

aws cognito-idp update-user-pool-client `
  --user-pool-id $UserPoolId `
  --client-id $ClientId `
  --callback-urls "$VercelUrl/api/auth/callback" "$CognitoDomain/oauth2/idpresponse" `
  --logout-urls $VercelUrl `
  --allowed-o-auth-flows "code" "implicit" `
  --allowed-o-auth-scopes "email" "openid" "profile" `
  --allowed-o-auth-flows-user-pool-client `
  --supported-identity-providers "GitHub" "COGNITO" `
  --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cognito callback URLs updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Callback URLs configured:" -ForegroundColor Yellow
    Write-Host "  - $VercelUrl/api/auth/callback" -ForegroundColor White
    Write-Host "  - $CognitoDomain/oauth2/idpresponse" -ForegroundColor White
    Write-Host ""
    Write-Host "Logout URL: $VercelUrl" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to update Cognito callback URLs" -ForegroundColor Red
}
