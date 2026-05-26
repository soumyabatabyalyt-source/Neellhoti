#!/bin/bash

# Script to commit all outstanding changes
# Run this from the project root directory

cd "$(dirname "$0")" || exit 1

echo "🔧 Git Lock Issue Fix & Commit Script"
echo "======================================"

# Step 1: Force remove git lock files
echo "Step 1: Removing git lock files..."
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
sleep 2

# Step 2: Verify lock files are gone
if [ -f .git/index.lock ] || [ -f .git/HEAD.lock ]; then
    echo "❌ Git lock files still exist. Manual removal required:"
    echo "   Windows: Delete .git/HEAD.lock and .git/index.lock manually"
    echo "   Linux/Mac: sudo rm .git/*.lock"
    exit 1
fi

echo "✅ Lock files removed"

# Step 3: Reset git state
echo "Step 2: Resetting git state..."
git reset --soft HEAD || git status

# Step 4: Stage all changes
echo "Step 3: Staging all changes..."
git add -A

# Step 5: Show what will be committed
echo "Step 4: Preview of changes to commit:"
git diff --cached --stat

# Step 6: Commit changes
echo "Step 5: Creating commit..."
git commit -m "feat: add live cooldown timer and task requirements fields

Features:
- Live countdown timer on account page showing hours:minutes:seconds
- Live countdown timer on task pool page
- Min karma requirement field in task creation form
- Min account age requirement field in task creation form
- Real-time timer updates every second
- Auto-clear timer when cooldown expires
- Task creation form fields are optional (default to null)

Files changed:
- app/dashboard/account/page.tsx: Added cooldown timer UI and logic
- app/dashboard/tasks/page.tsx: Added live countdown timer
- app/manager/tasks/create/page.tsx: Added requirement fields to form
- Multiple API and auth page updates
- Dependency updates"

# Step 7: Verify commit
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Commit successful!"
    echo ""
    echo "Recent commits:"
    git log --oneline -5
    echo ""
    echo "Ready to push to origin with: git push"
else
    echo ""
    echo "❌ Commit failed. Check the error above."
    exit 1
fi
