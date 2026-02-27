# Add Google OAuth Provider to Cognito
# Usage: .\scripts\add-google-oauth.ps1

$UserPoolId = "us-east-1_bNco2tmIx"

# REPLACE THESE WITH YOUR GOOGLE OAUTH CREDENTIALS
$GoogleClientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
$GoogleClientSecret = "GOCSPX-YOUR_GOOGLE_CLIENT_SECRET"

Write-Host "Adding Google OAuth provider to Cognito..." -ForegroundColor Cyan

aws cognito-idp create-identity-provider `
  --user-pool-id $UserPoolId `
  --provider-name Google `
  --provider-type Google `
  --provider-details "client_id=$GoogleClientId,client_secret=$GoogleClientSecret,authorize_scopes=profile email openid" `
  --attribute-mapping "email=email,username=sub" `
  --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Google OAuth provider added successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add Google OAuth provider" -ForegroundColor Red
}
