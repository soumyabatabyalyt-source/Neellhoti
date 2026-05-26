# Fix: Submissions Not Showing in My-Tasks

## Issue
Tasks submitted by taskers that were under approval, accepted, or rejected weren't showing up in the "my-tasks" section.

## Root Cause

When a manager reviews a submission (approves/rejects):

**In `api/review-task/route.ts`:**
```typescript
// Line 87 - Updates task_submissions
await supabase
  .from("task_submissions")
  .update({ status: reviewedStatus })  // "approved" or "rejected"
  .eq("id", submission.id)

// Line 103-106 - Updates task_claims
const claimFinalStatus = reviewedStatus === "approved" ? "completed" : "expired"
await supabase
  .from("task_claims")
  .update({ status: claimFinalStatus })
  .eq("id", claim_id)
```

So the actual statuses in `task_claims` are:
- When approved: `"completed"`
- When rejected: `"expired"`

But the my-tasks page was querying for:
```typescript
.in("status", [
  "active",
  "submitted",
  "pending_review",
  "approved",    // ← Never set in task_claims!
  "rejected",    // ← Never set in task_claims!
])
```

## Solution

### File: `app/dashboard/my-tasks/active/page.tsx`

**1. Updated the query (line ~169):**
```typescript
.in("status", [
  "active",
  "submitted",
  "pending_review",
  "completed",      // ← Actual status when approved
  "expired",        // ← Actual status when rejected
])
```

**2. Added submission data join (line ~161-162):**
```typescript
.select(`
  *,
  tasks!task_claims_task_fkey (*),
  task_submissions!task_submissions_claim_id_fkey (status)
`)
```

**3. Updated type definition (line 31-36):**
```typescript
type ClaimStatus =
  | "active"
  | "submitted"
  | "pending_review"
  | "completed"      // Changed from "approved"
  | "expired"        // Changed from "rejected"
```

**4. Updated mapping logic (line 218-238):**
```typescript
// Map database statuses to display statuses
const submission = item["task_submissions"]?.[0]
let displayStatus = item.status

if (submission?.status) {
  if (item.status === "completed") {
    displayStatus = "approved"
  } else if (item.status === "expired") {
    displayStatus = "rejected"
  }
}

return {
  claim: {
    // ... other fields ...
    status: displayStatus,  // Use mapped display status
  },
  // ...
}
```

**5. Filter logic works correctly now:**
```typescript
const approvedTasks = useMemo(() => {
  return tasks.filter((t) => t.claim.status === "approved")  // Works!
}, [tasks])

const rejectedTasks = useMemo(() => {
  return tasks.filter((t) => t.claim.status === "rejected")  // Works!
}, [tasks])
```

## Result

Taskers can now see their submissions in the correct tabs:
- **Pending Tab**: Shows "submitted" and "pending_review" statuses
- **Approved Tab**: Shows "completed" statuses (mapped to "approved" for display)
- **Rejected Tab**: Shows "expired" statuses from reviews (mapped to "rejected" for display)

## Testing

To verify the fix works:
1. Submit a task as a tasker
2. Review it as a manager (approve or reject)
3. Go back to my-tasks section
4. The submission should now appear in the Approved or Rejected tab

---

**Note:** This fix also ensures consistency with the task lifecycle:
- Task submitted → claim status: "submitted"
- Manager approves → claim status: "completed