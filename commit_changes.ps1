# PowerShell script to commit all changes
# Run with: powershell -ExecutionPolicy Bypass -File commit_changes.ps1

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
            Write-Host "  Error: $_" -ForegroundColor Red
        }
    }
}

Write-Host "`nVerifying lock files are removed..." -ForegroundColor Cyan
$remaining = $lockFiles | Where-Object { Test-Path $_ }
if ($remaining) {
    Write-Host "✗ Lock files still exist. Manual deletion required." -ForegroundColor Red
    exit 1
}
Write-Host "✓ All lock files removed" -ForegroundColor Green

Write-Host "`nNavigating to project directory..." -ForegroundColor Cyan
Set-Location C:\Users\SOUMYA\nillohit

Write-Host "`nStaging all changes..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Git add failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Changes staged" -ForegroundColor Green

Write-Host "`nShowing changes to be committed:" -ForegroundColor Cyan
git diff --cached --stat

Write-Host "`nCommitting changes..." -ForegroundColor Cyan
git commit -m "feat: add live cooldown timer and task requirements fields

Features:
- Live countdown timer on account page (hours:minutes:seconds)
- Live countdown timer on task pool page
- Min karma requirement field in task creation form
- Min account age requirement field in task creation form
- Real-time timer updates every second
- Auto-clear timer when cooldown expires
- Optional requirement fields (default to null)

Changes:
- app/dashboard/account/page.tsx: Cooldown timer UI and logic
- app/dashboard/tasks/page.tsx: Live countdown timer
- app/manager/tasks/create/page.tsx: Requirement input fields
- Multiple API and configuration updates
- Dependency updates"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Commit successful!" -ForegroundColor Green
    Write-Host "`nRecent commits:" -ForegroundColor Cyan
    git log --oneline -5
    Write-Host "`nReady to push with: git push" -ForegroundColor Green
} else {
    Write-Host "`n✗ Commit failed" -ForegroundColor Red
    exit 1
}
