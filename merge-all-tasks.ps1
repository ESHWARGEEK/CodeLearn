# Script to merge all task branches into integrated build

$taskBranches = @(
    "feature/task-9-deployment",
    "feature/task-10-portfolio",
    "feature/task-11-template-library",
    "feature/task-12-template-extraction",
    "feature/task-13-code-integration",
    "feature/task-14-rate-limiting",
    "feature/task-15-payments",
    "feature/task-16-ai-workers"
)

Write-Host "Creating integrated build with all tasks..." -ForegroundColor Green
Write-Host "Current branch: $(git branch --show-current)`n" -ForegroundColor Cyan

foreach ($branch in $taskBranches) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Merging: $branch" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    git merge origin/$branch --no-edit -m "merge: integrate $branch into unified build"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Merge conflict detected for $branch" -ForegroundColor Red
        Write-Host "Please resolve conflicts manually" -ForegroundColor Red
        Write-Host "After resolving, run: git add . && git commit" -ForegroundColor Cyan
        Write-Host "Then re-run this script to continue" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "Successfully merged $branch" -ForegroundColor Green
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "All tasks merged successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the integrated code" -ForegroundColor White
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Test locally" -ForegroundColor White
Write-Host "4. Push: git push origin feature/integrated-all-tasks" -ForegroundColor White
Write-Host "5. Deploy to Vercel" -ForegroundColor White
