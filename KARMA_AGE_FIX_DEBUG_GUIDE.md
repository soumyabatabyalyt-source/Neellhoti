# Karma/Age Database Update Fix - Debugging Guide

## What Was Fixed

The `/api/update-tasker-stats` endpoint now includes proper verification that database updates actually succeed:

```typescript
// Added .select() to return updated rows
const { data, error, count } = await supabase
  .from("profiles")
  .update(updates)
  .eq("id", user_id)
  .select()

// Verify update succeeded with detailed logging
if (error) {
  console.error("Database error:", { error, user_id, updates })
  throw error
}

if (!data || data.length === 0) {
  console.error("No rows returned from update for user:", {
    user_id,
    updates,
    data,
    count,
  })
  throw new Error(`Failed to update profile for user ${user_id} - no rows affected`)
}
```

## Testing Steps

1. **Start dev server:**
   ```bash
   npm run dev -- --webpack
   ```

2. **Navigate to Manager > Taskers page**
   - URL: `http://localhost:3000/manager/taskers`

3. **Edit karma and/or account age:**
   - Enter a new karma value (e.g., 5000)
   - Or enter a new account age in days (e.g., 365)
   - The "Save Changes" button should become blue and enabled

4. **Click "Save Changes"**
   - Button should show "Saving..." with a spinner
   - Should complete within 2-3 seconds

5. **Check browser console** (F12 → Console tab):
   - **Success:** Look for log message: `"Successfully updated profile: { user_id, updates, data[0] }"`
   - **Failure:** Look for error messages with detailed info about what failed

## Expected Console Output (Success)

```javascript
Successfully updated profile: {
  user_id: "98c34d61-17f5-4cde-a3e4-d7e41e784c51",
  updates: { reddit_karma: 5000 },
  data: {
    id: "98c34d61-17f5-4cde-a3e4-d7e41e784c51",
    reddit_karma: 5000,
    reddit_account_age_days: 0,
    ...
  }
}
```

## Expected Console Output (Failure Cases)

### Case 1: Database Update Error
```javascript
Database error: {
  error: { code: "...", message: "...", details: "..." },
  user_id: "98c34d61-17f5-4cde-a3e4-d7e41e784c51",
  updates: { reddit_karma: 5000 }
}
```
**Diagnosis:** Supabase returned an error. Check:
- RLS policies on `profiles` table
- User authentication token validity
- Database constraints

### Case 2: No Rows Affected
```javascript
No rows returned from update for user: {
  user_id: "98c34d61-17f5-4cde-a3e4-d7e41e784c51",
  updates: { reddit_karma: 5000 },
  data: [],
  count: undefined
}
```
**Diagnosis:** Update executed but `.select()` returned no rows. Check:
- User ID exists in profiles table
- RLS policies allow manager/admin to select after update
- No filtering is removing the row

### Case 3: Invalid User ID
If the user_id being sent is malformed, the API returns 400 (Bad Request):
```javascript
{ error: "Missing user_id", status: 400 }
```

## Verification After Successful Save

1. **Immediate:** Stats tags should update below the input fields
2. **Refresh page (F5):** Values should persist and reload from database
3. **Check Supabase directly:**
   ```sql
   SELECT id, reddit_karma, reddit_account_age_days 
   FROM profiles 
   WHERE id = '98c34d61-17f5-4cde-a3e4-d7e41e784c51';
   ```

## Troubleshooting

### "Failed to update profile for user" Error
- **Check 1:** Is the user logged in as a manager/admin?
  - Navigate to: `/api/auth/getuser` (or similar) to verify role
  - Must have `role = 'admin'` or `role = 'manager'`

- **Check 2:** Is the user ID valid?
  - Should be a UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
  - The page should display the correct user ID below username

- **Check 3:** Are there RLS policies on the profiles table?
  - Check Supabase dashboard → Authentication → Policies
  - Manager/admin should have update + select permissions

### Page Keeps Loading After Click
- Server may have crashed
- Check terminal for errors
- Restart: `npm run dev -- --webpack`

### No Console Output at All
- Open DevTools with F12
- Go to Console tab
- Refresh page
- Try save again
- Console should show network request in Network tab

## Code Changes Summary

**File:** `/app/api/update-tasker-stats/route.ts`

**Changes:**
1. Added error check after database update (line 44-47)
2. Added detailed error logging for "no rows" case (line 49-62)
3. Wrapped success response with verified data (line 65)

**File:** `/app/manager/taskers/page.tsx`

**No changes needed** - already properly implemented with:
- Direct number inputs for karma and age
- Save button that calls API with values
- Automatic page reload after successful save

## Next Steps if Issues Occur

1. Share the console error m