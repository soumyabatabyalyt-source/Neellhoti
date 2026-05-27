# Post Link Sheet Sync Fix - Implementation Complete

## Status
✅ **Backend code changes completed** - Awaiting Google Apps Script update

## The Problem
When a user submits a task with a post/comment link:
- ❌ Link saved to database ✅
- ❌ Link NOT updated in Google Sheet ❌

This breaks the audit trail and makes it impossible to track which posts were actually created.

## The Solution

### Backend Changes (DONE ✅)

**1. New endpoint: `/api/update-sheet-field`**
- Accepts POST requests with `{ task_code, field, value }`
- Forwards the update to Google Apps Script
- Non-blocking: doesn't fail task submission if sheet update fails

**2. Updated: `/api/submit-task`**
- After saving post_link/comment_link to database
- Calls `/api/update-sheet-field` to sync the value
- Field names: `post_link` (for posts) or `comment_link` (for comments)

## Google Apps Script Update Required

Your Google Apps Script needs to handle POST requests to update individual cells.

### Add this function to your Apps Script:

```javascript
// Handle updates from the app
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "updateField") {
      return updateSheetField(data.task_code, data.field, data.value);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("Error in doPost: " + err);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Update a specific field in the sheet for a task
function updateSheetField(taskCode, field, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Neellohit 2.0");
  const data = sheet.getDataRange().getValues();
  
  // Find the row with matching task_code (column B)
  const columnIndex = getColumnIndex(field);
  if (columnIndex === -1) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "Unknown field: " + field })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  for (let i = 1; i < data.length; i++) {
    // Column B (index 1) has task_code
    if (data[i][1] === taskCode) {
      sheet.getRange(i + 1, columnIndex + 1).setValue(value);
      Logger.log(`Updated ${field} for task_code ${taskCode} to: ${value}`);
      
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, updated: true })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: false, error: "Task code not found: " + taskCode })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Map field names to column indices
function getColumnIndex(field) {
  const columnMap = {
    "task_id": 0,        // Column A
    "task_code": 1,      // Column B
    "task_type": 2,      // Column C
    "subreddit": 3,      // Column D
    "title": 4,          // Column E
    "body": 5,           // Column F
    "reward": 6,         // Column G
    "time_limit": 7,     // Column H
    "post_link": 8,      // Column I
    "comment_link": 8,   // Column I (same as post_link)
    "comment_type": 9,   // Column J
    "min_karma": 10,     // Column K
    "min_account_age_days": 11 // Column L
  };
  
  return columnMap[field] !== undefined ? columnMap[field] : -1;
}

// Keep your existing doGet function for sync-tasks
function doGet(e) {
  // ... your existing code ...
}
```

## How It Works Now

### Post Task Submission Flow:
```
1. User submits post with URL
   ↓
2. app/api/submit-task saves to database
   - tasks.post_link = url ✅
   ↓
3. Calls app/api/update-sheet-field
   ↓
4. update-sheet-field calls Google Apps Script (doPost)
   ↓
5. Apps Script finds row by task_code
   ↓
6. Updates column I (post_link) with the URL ✅
   ↓
7. Sheet now shows: post_link in column I ✅
```

### Comment Task Submission Flow:
```
Similar flow but:
- saves comment_link instead of post_link
- updates same column I
```

## Testing

After updating your Apps Script:

1. **Create a comment task** from the sheet
   - Set task_type = "comment"
   - Set post_link = "https://reddit.com/r/example/comments/xxx" (optional initially)
   
2. **User claims and submits**
   - Submits with comment URL: "https://reddit.com/r/example/comments/xxx/_/yyy"

3. **Check the sheet**
   - Column I (post_link) should now show the submitted comment URL
   - ✅ = Fix is working

4. **Verify in manager dashboard**
   - Go to Submissions page
   - Should see the post_link in the submissions list

## Environment Variables

Make sure your `.env.local` has:
```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercontent
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## Error Handling

The sheet sync is **non-blocking**:
- If sheet update fails, the task submission still succeeds
- Database is the source of truth
- Sheet is synced best-effort
- Check logs for sync errors but don't block the user

## Column Reference

| Column | Letter | Field              |
|--------|--------|--------------------|
| task_code | B    | Task identifier    |
| post_link | I    | Reddit post URL    |
| comment_link | I  | Reddit comment URL |

Note: post_link and comment_link use the same column (I) since a task is either a post task OR a comment task, never both.

## Deployment Notes

1. Update your Google Apps Script with the new functions above
2. Deploy as a new version
3. Deploy changes to this repo
4. Test with a comment task submission
5. Verify sheet updates in real-time
