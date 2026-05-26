# QUICK REFERENCE GUIDE
**For quick lookup of all changes and new features**

---

## 🔴 CRITICAL FIXES APPLIED

| Issue | Fix Location | Status |
|-------|-------------|--------|
| MyTasks "relationship" error | `/app/dashboard/my-tasks/page.tsx:91` | ✅ Fixed |
| Account approval field mismatch | `/app/api/manager/accounts/action/route.ts` | ✅ Fixed |
| No wallet on approval | `/app/api/manager/accounts/action/route.ts` | ✅ Added |
| Tasks page "draft" error | Needs migration (DB column) | ⏳ Pending |

---

## 🟢 NEW FEATURES

| Feature | Files | Status |
|---------|-------|--------|
| Draft task management UI | `/app/manager/draft-tasks/page.tsx` | ✅ Complete |
| Draft task API | `/app/api/manager/draft-tasks/route.ts` | ✅ Complete |
| Rejection reasons in submissions | `/app/manager/submissions/ReviewActions.tsx` | ✅ Complete |
| Display rejection to users | `/app/dashboard/my-tasks/page.tsx` | ✅ Complete |
| Draft Tasks nav | `/app/manager/layout.tsx` | ✅ Added |

---

## 📍 KEY URLs

**User Pages:**
- Task Pool: `/dashboard/tasks`
- My Tasks: `/dashboard/my-tasks`
- Wallet: `/dashboard/wallet`

**Manager Pages:**
- **NEW** Draft Tasks: `/manager/draft-tasks`
- Submissions: `/manager/submissions`
- Accounts: `/manager/accounts`
- Tasks: `/manager/tasks`
- Withdrawals: `/manager/withdrawals`

---

## 🔑 API Endpoints

### Draft Tasks Management
```
GET  /api/manager/draft-tasks
     → Fetch all draft tasks

PUT  /api/manager/draft-tasks
     → publish, reject, or edit tasks
```

### Task Review (Updated)
```
POST /api/review-task
     → Approve or reject submissions
     → Now includes rejectionReason
```

### Account Approval (Updated)
```
POST /api/manager/accounts/action
     → Approve/reject accounts
     → Now creates wallet on approval
```

---

## 📊 Database Changes

**Migration File:** `/migrations/001_add_draft_to_tasks.sql`

**Adds to tasks table:**
```sql
draft boolean NOT NULL DEFAULT false
approval_status text DEFAULT 'pending'
rejection_reason text
```

**Status:** ⏳ Needs to be executed in Supabase

---

## 🎨 UI Components

### New Pages:
- `/app/manager/draft-tasks/page.tsx` - Draft management

### Updated Components:
- `/app/manager/submissions/ReviewActions.tsx` - Enhanced rejection modal
- `/app/dashboard/my-tasks/page.tsx` - Shows rejection reasons

---

## 🔄 WORKFLOWS AT A GLANCE

### Draft Workflow:
```
Create Draft Task → Manager Reviews → Publish OR Reject → 
(if Publish) Task in Pool → Users Claim
```

### Submission Workflow:
```
User Submits → Manager Reviews → Approve (reward) OR 
Reject (with reason) → User sees result in MyTasks
```

### Rejection Reasons:
```
Filtered | Mod Removed | Low Quality | Rule Violation | 
Duplicate | Incomplete | Other (custom)
```

---

## ⚙️ SETUP STEPS

1. **Run Migration** (Supabase SQL Editor)
   - Copy `/migrations/001_add_draft_to_tasks.sql`
   - Execute

2. **Test URLs**
   - `/dashboard/tasks` → Should load
   - `/dashboard/my-tasks` → Should load
   - `/manager/draft-tasks` → Should be accessible

3. **Test Workflows**
   - Create task → Claim → Submit → Review
   - Publish/reject in draft tasks

---

## 🚨 IF SOMETHING DOESN'T WORK

**Tasks page shows "draft" error:**
- Migration not executed
- Run migration in Supabase

**MyTasks shows "relationship" error:**
- Check that task_id column exists in task_claims
- Verify foreign key is properly defined

**Wallet not created:**
- Check wallets table exists
- Verify user was approved after migration

**Rejection modal not appearing:**
- Ensure ReviewActions.tsx updated
- Check browser console for errors

---

## 📝 FILE CHANGES SUMMARY

### NEW FILES (3):
- `/app/manager/draft-tasks/page.tsx`
- `/app/api/manager/draft-tasks/route.ts`
- `/migrations/001_add_draft_to_tasks.sql`

### MODIFIED FILES (5):
- `/app/dashboard/my-tasks/page.tsx`
- `/app/api/review-task/route.ts`
- `/app/api/manager/accounts/action/route.ts`
- `/app/manager/submissions/ReviewActions.tsx`
- `/app/manager/layout.tsx`

### TOTAL: 8 files changed/created

---

## 🎯 MANAGER REJECTION REASONS

**Preset Options:**
1. Filtered
2. Mod Removed
3. Low Quality
4. Rule Violation
5. Duplicate
6. Incomplete
7. Other (custom text input)

**When to use each:**
- **Filtered**: Task excluded by platform filters
- **Mod Removed**: Content removed by moderators
- **Low Quality**: Doesn't meet standards
- **Rule Violation**: Breaks platform rules
- **Duplicate**: Similar task already exists
- **Incomplete**: Missing required info
- **Other**: Custom reason needed

---

## 📱 RESPONSIVE DESIGN

All new features are fully responsive:
- ✅ Mobile friendly
- ✅ Tablet optimized
- ✅ Desktop enhanced

---

## 🔒 PERMISSIONS

All new endpoints require:
- ✅ Valid authentication
- ✅ Manager or Admin role
- ✅ CORS headers checked

---

## 💾 DATA PERSISTENCE

All changes are:
- ✅ Saved to Supabase
- ✅ Real-time synced
- ✅ Properly indexed
- ✅ Cascading deletes configured

---

## ⏱️ ESTIMATED SETUP TIME

- Migration execution: **2 minutes**
- Testing all features: **10 minutes**
- Training managers: **30 minutes**
- **Total: ~45 minutes**

---

## 🚀 GO-LIVE CHECKLIST

```
□ Migration executed
□ No database errors
□ /dashboard/tasks loads
□ /dashboard/my-tasks loads
□ /manager/draft-tasks loads
□ Test draft publish
□ Test draft reject
□ Test submission approve
□ Test submission reject
□ Verify rejection reason shows
□ Verify wallet created on approval
□ Test full workflow
```

---

## 📞 SUPPORT

**Documentation:**
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `DRAFT_AND_REJECTION_FEATURES.md` - Feature details
- `IMPLEMENTATION_GUIDE.md` - Step-by-step guide
- `COMPLETE_AUDIT_CHECKLIST.m