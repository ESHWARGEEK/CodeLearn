# Script to fix Vercel build errors across all feature branches

$branches = @(
    "feature/task-10-portfolio",
    "feature/task-11-template-library",
    "feature/task-12-template-extraction",
    "feature/task-13-code-integration",
    "feature/task-14-rate-limiting",
    "feature/task-15-payments",
    "feature/task-16-ai-workers"
)

$currentBranch = git branch --show-current

Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
Write-Host "Starting branch fixes..." -ForegroundColor Green

foreach ($branch in $branches) {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "Processing: $branch" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    # Checkout the branch
    Write-Host "Checking out $branch..." -ForegroundColor Cyan
    git checkout $branch
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to checkout $branch, skipping..." -ForegroundColor Red
        continue
    }
    
    # Copy required files from main branch
    Write-Host "Copying required files..." -ForegroundColor Cyan
    
    # Copy UI components
    git checkout main -- components/ui/button.tsx 2>$null
    git checkout main -- components/ui/card.tsx 2>$null
    git checkout main -- components/ui/input.tsx 2>$null
    
    # Copy developer components
    git checkout main -- components/developer/TemplateLibrary.tsx 2>$null
    
    # Copy billing components
    git checkout main -- components/billing/BillingManagement.tsx 2>$null
    
    # Copy learning components
    git checkout main -- components/learning/TechnologySelector.tsx 2>$null
    
    # Copy deployment modules
    git checkout main -- lib/deployment/project-deployer.ts 2>$null
    git checkout main -- lib/auth/verify.ts 2>$null
    
    # Check if there are changes to commit
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "Committing changes..." -ForegroundColor Cyan
        git add components/ui/*.tsx 2>$null
        git add components/developer/*.tsx 2>$null
        git add components/billing/*.tsx 2>$null
        git add components/learning/*.tsx 2>$null
        git add lib/deployment/*.ts 2>$null
        git add lib/auth/*.ts 2>$null
        
        git commit -m "fix: Add missing components and modules for Vercel build

- Add UI components (button, card, input)
- Add TemplateLibrary component
- Add BillingManagement component
- Add TechnologySelector component
- Add deployment modules
- Add auth verification module

Fixes Vercel build MODULE_NOT_FOUND errors"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Changes committed successfully" -ForegroundColor Green
            
            # Push to remote
            Write-Host "Pushing to remote..." -ForegroundColor Cyan
            git push origin $branch
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Pushed successfully to $branch" -ForegroundColor Green
            } else {
                Write-Host "Failed to push to $branch" -ForegroundColor Red
            }
        } else {
            Write-Host "Failed to commit changes" -ForegroundColor Red
        }
    } else {
        Write-Host "No changes needed for $branch" -ForegroundColor Green
    }
}

# Return to original branch
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Returning to original branch: $currentBranch" -ForegroundColor Cyan
git checkout $currentBranch

Write-Host "`nAll branches processed!" -ForegroundColor Green
Write-Host "Please check Vercel deployments to verify builds succeed." -ForegroundColor Cyan
