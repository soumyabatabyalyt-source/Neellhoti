# Testing Guide: Submission Display Fix

## Overview
The fix ensures that submitted tasks appear in all tabs of the My-Tasks page, regardless of their approval status.

## What Was Fixed
- **Active Tab**: Shows currently claimed tasks (status: `"active"`)
- **Pending Tab**: Shows submitted tasks awaiting manager review (status: `"submitted"`, `"pending_review"`)
- **Approved Tab**: Shows approved submissions (task_claims status: `"completed"` → displayed as `"approved"`)
- **Rejected Tab**: Shows rejected submissions (task_claims status: `"expired"` → displayed as `"rejected"`)

## Testing Steps

### Prerequisites
1. Make sure the application is running: `npm run dev -- --webpack`
2. You need at least one task claim in each status:
   - Active claim (status: "active")
   - Submitted claim (status: "submitted")
   - Completed claim (status: "completed") - from an approved submission
   - Expired claim (status: "expired") - from a rejected submission

### Test Case 1: Active Tasks Tab
**Expected Behavior**: Shows tasks that are currently claimed and not expired
```
Steps:
1. Go to: /dashboard/my-tasks/active
2. Click "Active (X)" tab
3. Verify: You see claimed tasks that haven't been submitted yet
```

### Test Case 2: Pending Tasks Tab
**Expected Behavior**: Shows submitted tasks waiting for manager review
```
Steps:
1. Stay on: /dashboard/my-tasks/active
2. Click "Pending (X)" tab
3. Verify: You see submitted tasks (submitted or pending_review status)
4. These tasks should show:
   - Task details
   - Submission link
   - Status indicator
```

### Test Case 3: Approved Tasks Tab
**Expected Behavior**: Shows tasks that were approved by manager
```
Steps:
1. Stay on: /dashboard/my-tasks/active
2. Click "Approved (X)" tab
3. Verify: You see approved submissions
4. Database status: task_claims.status = "completed"
5. Display shows: "approved" status
6. Verify the approved tasks show:
   - Task details
   - Approval indication
   - Reward credits (if applicable)
```

### Test Case 4: Rejected Tasks Tab
**Expected Behavior**: Shows tasks that were rejected by manager
```
Steps:
1. Stay on: /dashboard/my-tasks/active
2. Click "Rejected (X)" tab
3. Verify: You see rejected submissions
4. Database status: task_claims.status = "expired" (from review)
5. Display shows: "rejected" status
6. Verify the rejected tasks show:
   - Task details
   - Rejection indication
   - (Rejection reason if provided by manager)
```

## How to Create Test Data

### Create an Active Task
```sql
-- Create claim in "active" status
INSERT INTO task_claims (
  task_id,
  user_id,
  status,
  created_at,
  expires_at
) VALUES (
  'task-uuid-here',
  'user-uuid-here',
  'active',
  NOW(),
  NOW() + INTERVAL '1 hour'
);
```

### Create an Approved Task
```sql
-- This is created automatically when a manager approves a submission
-- The review-task endpoint does this:
UPDATE task_claims
SET status = 'completed'
WHERE id = 'claim-id-here';
```

### Create a Rejected Task
```sql
-- This is created automatically when a manager rejects a submission
-- The review-task endpoint does this:
UPDATE task_claims
SET status = 'expired'
WHERE id = 'claim-id-here';
```

## Verification Checklist

- [ ] Active tab shows only "active" status tasks
- [ ] Pending tab shows "submitted" and "pending_review" status tasks
- [ ] Approved tab shows "completed" status tasks (displayed as "approved")
- [ ] Rejected tab shows "expired" status tasks (displayed as "rejected")
- [ ] Task counts are correct in each tab header
- [ ] All tabs load without errors
- [ ] Task details display correctly in each tab
- [ ] No console errors in browser DevTools

## Code Changes Made

**File**: `app/dashboard/my-tasks/active/page.tsx`

**Change 1** - Updated query to fetch correct statuses:
```typescript
.in("status", [
  "active",
  "submitted",
  "pending_review",
  "completed",      // Changed from "approved"
  "expired",        // Changed from "rejected"
])
```

**Change 2** - Map database statuses to display statuses:
```typescript
let displayStatus = item.status

// When approved: task_claims status is "completed"
if (item.status === "completed") {
  displayStatus = "approved"
}
// When rejected: task_claims status is "expired"
else if (item.status === "expired") {
  displayStatus = "rejected"
}
```

**Change 3** - Updated type definition:
```typescript
type ClaimStatus =
  | "active"
  | "submitted"
  | "pending_review"
  | "completed"      // Changed from "approved"
  | "expired"        // Changed from "rejected"
```

## Troubleshooting

### Issue: Approved/Rejected tasks still not showing
**Possible Causes**:
- Task claims don't have "completed" or "expired" status in database
- Browser is caching old version - try hard refresh (Ctrl+Shift+R)
- Next.js rebuild needed - restart dev server

**Solution**:
1. Check database: `SELECT id, status FROM task_claims WHERE user_id = 'your-id'`
2. Verify statuses are one of: active, submitted, pending_review, completed, expired
3. Restart dev server: Kill process, run `npm run dev -- --webpack`
4. Clear browser cache and reload

### Issue: No tasks showing in any tab
**Possible Causes**:
- User has no task claims yet
- Tasks were created for different user
- Database connection issue

**Solution**:
1. Check console for errors (F12 → Console tab)
2. Verify logged-in user is correct
3. Check database for this user's claims: `SELECT * FROM task_claims WHERE user_id = 'your-id'`

### Issue: Counts show (0) in all tabs
**Possible Causes**:
- User has no claims
- Query isn't fetching claims
- Filter logic is broken

**Solution**:
1. Insert test data in database
2. Check browser console for JavaScript errors
3. Check network tab for API errors

---

**Note**: After making database changes, refresh the page (F5) to see updates.
