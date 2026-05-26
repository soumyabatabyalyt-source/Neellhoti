# Google Sheet Integration Setup Guide

## Problem
The "Import Tasks" button is showing: `Import failed: GOOGLE_SCRIPT_URL environment variable is not set`

This means your app cannot connect to the Google Sheet to fetch tasks.

---

## Solution: Setup Google Apps Script

### Step 1: Open Your Google Sheet
Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1pVmU_ewKj6i2OpxmJgLdtTVXMS8TY1bFfBj57SWR44g

### Step 2: Create a Google Apps Script
1. In the Google Sheet, click **Extensions** → **Apps Script**
2. Delete the default code and paste this:

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Neellohit 2.0");
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({error: "Sheet 'Neellohit 2.0' not found"}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Convert to array of objects using headers
  const tasks = data.slice(1).map(row => {
    const task = {};
    headers.forEach((header, index) => {
      task[header.toLowerCase().trim()] = row[index] || null;
    });
    return task;
  }).filter(task => task.task_id || task.task_code); // Only include rows with task_id
  
  return ContentService.createTextOutput(JSON.stringify(tasks))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy as Web App
1. Click **Deploy** (top right) → **New deployment**
2. Select **Type**: "Web app"
3. Set **Execute as**: Your Google Account
4. Set **Who has access**: "Anyone"
5. Click **Deploy**
6. Copy the deployment URL (it will look like: `https://script.google.com/macros/s/XXXXX/usercache...`)

### Step 4: Add to Environment Variables
1. Open your `.env.local` file in the project root
2. Add this line:
```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercache...
```
Replace `YOUR_DEPLOYMENT_ID` with the actual ID from your deployment URL.

### Step 5: Verify Setup
1. Restart your development server (`npm run dev`)
2. Go to the Task Manager → **Import Tasks** tab
3. Click the **Import Tasks** button
4. If successful, you should see: `✅ X tasks imported successfully`

---

## Google Sheet Column Requirements

Your sheet should have these columns (A-J):

| Column | Name | Type | Example |
|--------|------|------|---------|
| A | task_id | string | "a1" |
| B | task_type | string | "post" or "comment" |
| C | title | string | "Post about Reddit moderation" |
| D | description | string | "Detailed description..." |
| E | body | string | "Post/comment body text..." |
| F | reward | number | 5 |
| G | post_link | string | "https://reddit.com/r/sub/comments/..." |
| H | comment_type | string | "comment" |
| I | min_karma | number | 1000 |
| J | min_account_age_days | number | 30 |

---

## Troubleshooting

### Error: "Google Apps Script returned status 404"
- The deployment URL is incorrect
- Verify the URL in your `.env.local`

### Error: "Invalid JSON from Google Apps Script"
- The sheet name might not be "Neellohit 2.0"
- Check the actual sheet tab name and update the script

### Error: "Expected array of tasks"
- The script is returning an object instead of an array
- Verify the doGet() function returns JSON.stringify(tasks)

### No tasks imported but no error
- Check that your sheet has data (not empty rows)
- Verify the `task_id` column (A) has values

---

## Re-deployment (if you update the script)

If you need to update the Apps Script later:
1. Click **Deploy** → **Manage deployments**
2. Delete the old deployment
3. Create a new deployment following Step 3 above
4. Update `.env.local` with the new URL
5. Restart your dev server

---

## Testing Without Deployment

If you want to test locally first, you can temporarily set `GOOGLE_SCRIPT_URL` to return test data:

```bash
GOOGLE_SCRIPT_URL=http://localhost:3001/api/test-sheet
```

Then create `/app/api/test-sheet/route.ts`:

```typescript
export async function GET() {
  return Response.json([
    { task_id: "test1", task_type: "post", title: "Test Post", reward: 10 },
    { task_id: "test2", task_type: "comment", task_type: "comment", body: "Test comment", reward: 5 }
  ]);
}
```
