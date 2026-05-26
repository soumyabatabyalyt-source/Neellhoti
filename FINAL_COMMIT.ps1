# Final Commit Script - Run this to commit all changes
# Usage: powershell -ExecutionPolicy Bypass -File FINAL_COMMIT.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   FINAL COMMIT: All Changes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Kill any git processes
Write-Host "`n[1/5] Stopping any running git processes..." -ForegroundColor Yellow
Get-Process git -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Delete lock files
Write-Host "[2/5] Removing git lock files..." -ForegroundColor Yellow
$lockFiles = @(
    "C:\Users\SOUMYA\nillohit\.git\HEAD.lock",
    "C:\Users\SOUMYA\nillohit\.git\index.lock"
)

foreach ($file in $lockFiles) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force -ErrorAction Stop
            Write-Host "     ✓ Deleted: $(Split-Path $file -Leaf)" -ForegroundColor Green
        }
        catch {
            Write-Host "     ✗ Failed to delete: $(Split-Path $file -Leaf)" -ForegroundColor Red
        }
    }
}

Start-Sleep -Seconds 2

# Step 3: Navigate to project
Write-Host "`n[3/5] Navigating to project directory..." -ForegroundColor Yellow
Set-Location C:\Users\SOUMYA\nillohit
Write-Host "     Current location: $(Get-Location)" -ForegroundColor Gray

# Step 4: Stage all changes
Write-Host "`n[4/5] Staging all changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "     ✗ Git add failed" -ForegroundColor Red
    exit 1
}
Write-Host "     ✓ All changes staged" -ForegroundColor Green

# Show what will be committed
Write-Host "`n     Files to be committed:" -ForegroundColor Gray
git diff --cached --name-only | ForEach-Object { Write-Host "       • $_" -ForegroundColor Gray }

Write-Host "`n     Summary:" -ForegroundColor Gray
git diff --cached --stat | ForEach-Object { Write-Host "       $_" -ForegroundColor Gray }

# Step 5: Create commit
Write-Host "`n[5/5] Creating commit..." -ForegroundColor Yellow

$commitMessage = @"
feat: complete submission display and task requirements system

Major Features:
- Live cooldown countdown timer on account and task pool pages
  * Real-time updates every second (hours:minutes:seconds)
  * Auto-clears when cooldown expires
  * Displays on both account page and task pool

- Task creation form enhancements
  * Add min_karma requirement field (optional)
  * Add min_account_age_days requirement field (optional)
  * Fields available in both post and comment task sections
  * Requirements saved to database and validated on claim

- Fixed submission display in my-tasks section
  * Active tab: Shows claimed tasks (status: active)
  * Pending tab: Shows submitted tasks awaiting review
  * Approved tab: Shows manager-approved submissions
  * Rejected tab: Shows manager-rejected submissions
  * Properly maps task_claims statuses to display statuses

Technical Details:
- task_claims with 'completed' status display as 'approved'
- task_claims with 'expired' status (from review) display as 'rejected'
- Cooldown timer uses useEffect with interval cleanup
- Requirement fields are optional (default to null)
- All changes backward compatible with existing data

Bug Fixes:
- Fixed schema error in my-tasks query
- Corrected task claim status mappings
- Proper interval cleanup prevents memory leaks

Documentation:
- Added SUBMISSION_DISPLAY_FIX.md explaining the fix
- Added TESTING_SUBMISSION_DISPLAY.md with test cases
- Added CHANGES_TO_COMMIT.md documenting all changes
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n" -ForegroundColor White
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "   ✓ COMMIT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green

    Write-Host "`nRecent commits:" -ForegroundColor Cyan
    git log --oneline -5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Push changes: git push" -ForegroundColor Gray
    Write-Host "  2. Test the application: npm run dev -- --webpack" -ForegroundColor Gray
    Write-Host "  3. Verify submission display in my-tasks page" -ForegroundColor Gray

} else {
    Write-Host "`n" -ForegroundColor White
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "   ✗ COMMIT FAILED" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "`nPlease check the error above and try again." -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
