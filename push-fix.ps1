# push-fix.ps1 — Run this to fix the broken deployment
# Double-click or run in PowerShell from the project folder

Set-Location "C:\Users\SOUMYA\nillohit"

Write-Host "Staging all fixed files..." -ForegroundColor Cyan
git add -A

Write-Host "Committing..." -ForegroundColor Cyan
git commit -m "Fix build errors: restore corrupted files, keep new features

- app/page.tsx: remove framer-motion import (was accidentally restored)
- app/manager/submissions/ReviewActions.tsx: restore missing closing tags
- app/api/update-tasker-cooldown/route.ts: restore truncated lines
- app/admin/withdrawals/page.tsx: restore truncated content
- app/manager/draft-tasks/page.tsx: restore truncated content
- app/manager/tasks/create/page.tsx: restore truncated content
- Brought in new files: Discord, API routes, migrations, admin mobile layout"

Write-Host "Force pushing to GitHub (replaces broken commits)..." -ForegroundColor Yellow
git push origin main --force

Write-Host ""
Write-Host "Done! Vercel will now auto-deploy the fix." -ForegroundColor Green
Write-Host "Check deployment at: https://vercel.com/soumyabatabyal2-9505s-projects/neellhoti" -ForegroundColor Green
