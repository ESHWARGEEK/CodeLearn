# Add GitHub OAuth Provider to Cognito
# Usage: .\scripts\add-github-oauth.ps1

$UserPoolId = "us-east-1_bNco2tmIx"
$GitHubClientId = "Ov23liegYVHQEUiCdgEv"
$GitHubClientSecret = "685ecca5efa31c0e5c5cc8cb34467fb76b69d49a"

Write-Host "Adding GitHub OAuth provider to Cognito..." -ForegroundColor Cyan

aws cognito-idp create-identity-provider `
  --user-pool-id $UserPoolId `
  --provider-name GitHub `
  --provider-type OIDC `
  --provider-details "client_id=$GitHubClientId,client_secret=$GitHubClientSecret,authorize_scopes=openid user:email,attributes_request_method=GET,oidc_issuer=https://token.actions.githubusercontent.com,authorize_url=https://github.com/login/oauth/authorize,token_url=https://github.com/login/oauth/access_token,attributes_url=https://api.github.com/user,jwks_uri=https://token.actions.githubusercontent.com/.well-known/jwks" `
  --attribute-mapping "email=email" `
  --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub OAuth provider added successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add GitHub OAuth provider" -ForegroundColor Red
}
