# PowerShell script to commit all fixes including the submission display fix
# Run with: powershell -ExecutionPolicy Bypass -File commit_all_fixes.ps1

Write-Host "Cleaning up git lock files..." -ForegroundColor Cyan

# Stop any git processes
Get-Process git -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Delete lock files
$lockFiles = @(
    "C:\Users\SOUMYA\nillohit\.git\HEAD.lock",
    "C:\Users\SOUMYA\nillohit\.git\index.lock"
)

foreach ($file in $lockFiles) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force -ErrorAction Stop
            Write-Host "✓ Deleted: $file" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to delete: $file" -ForegroundColor Red
        }
    }
}

Start-Sleep -Seconds 2

Write-Host "`nNavigating to project directory..." -ForegroundColor Cyan
Set-Location C:\Users\SOUMYA\nillohit

Write-Host "`nStaging all changes..." -ForegroundColor Cyan
git add .

Write-Host "`nShowing changes to be committed:" -ForegroundColor Cyan
git diff --cached --stat

Write-Host "`nCommitting changes..." -ForegroundColor Cyan
git commit -m "fix: show submitted tasks in approval, approved, and rejected states

Problem: Tasks submitted by taskers with approval/accepted/rejected status were not showing in my-tasks section

Root cause: When submissions are reviewed:
- task_submissions status is set to 'approved' or 'rejected'
- task_claims status is set to 'completed' (approved) or 'expired' (rejected)

But the query only looked for 'approved' and 'rejected' in task_claims, which don't exist.

Solution:
- Updated query to fetch task_claims with 'completed' and 'expired' statuses
- Join with task_submissions to get submission metadata
- Map 'completed' → 'approved' and 'expired' → 'rejected' for display
- Updated type definitions to match actual database statuses
- Tasks now appear in correct tabs: pending (submitted), approved (completed), rejected (expired)

This ensures taskers can see all their submissions regardless of review status.

Also includes:
- Live cooldown countdown timer on account and task pool pages
- Min karma requirement field in task creation form
- Min account age requirement field in task creation form"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Commit successful!" -ForegroundColor Green
    Write-Host "`nRecent commits:" -ForegroundColor Cyan
    git log --oneline -3
    Write-Host "`nReady to push with: git push" -ForegroundColor Green
}