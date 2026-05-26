@echo off
REM Batch script to commit all changes
REM Run this file directly or from command prompt

setlocal enabledelayedexpansion

echo Cleaning up git lock files...
echo.

REM Kill any git processes
taskkill /IM git.exe /F /T 2>nul
timeout /t 2 /nobreak >nul

REM Delete lock files
if exist ".git\HEAD.lock" (
    del ".git\HEAD.lock" /F /Q
    if %errorlevel% equ 0 (
        echo [OK] Deleted: .git\HEAD.lock
    ) else (
        echo [FAILED] Could not delete .git\HEAD.lock
        echo Run as Administrator and retry
        pause
        exit /b 1
    )
)

if exist ".git\index.lock" (
    del ".git\index.lock" /F /Q
    if %errorlevel% equ 0 (
        echo [OK] Deleted: .git\index.lock
    ) else (
        echo [FAILED] Could not delete .git\index.lock
        echo Run as Administrator and retry
        pause
        exit /b 1
    )
)

echo.
echo Verifying lock files are removed...
timeout /t 2 /nobreak >nul

if exist ".git\HEAD.lock" (
    echo [ERROR] HEAD.lock still exists
    exit /b 1
)

if exist ".git\index.lock" (
    echo [ERROR] index.lock still exists
    exit /b 1
)

echo [OK] All lock files removed
echo.

echo Staging all changes...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Git add failed
    pause
    exit /b 1
)
echo [OK] Changes staged

echo.
echo Changes to be committed:
git diff --cached --stat

echo.
echo Committing changes...
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

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Commit successful!
    echo.
    echo Recent commits:
    git log --oneline -5
    echo.
    echo Ready to push with: git push
) else (
    echo.
    echo [ERROR] Commit failed
    pause
    exit /b 1
)

pause
