/**
 * Neellohit 2.0 — Google Apps Script
 *
 * Two-tab structure:
 *   "Posts" tab    → post tasks
 *   "Comments" tab → comment tasks
 *
 * task_type is injected automatically from the tab name.
 * Deploy as: Web App → Execute as Me → Anyone can access
 *
 * Deployed Web App URL (also in .env.local as GOOGLE_SCRIPT_URL):
 * https://script.google.com/macros/s/AKfycbw8Jfh5ZrhycGTmbcrpaCAK5uebq-uV2S3WTQxsa1mfwBpCx8DZ_feGWt8O0eGMIDwAcA/exec
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasks = [];

  // ── Posts tab ──────────────────────────────────────────────
  // Columns: task_id | task_code | subreddit | title | body | reward | time_limit | min_karma | min_account_age_days
  const postsSheet = ss.getSheetByName("Posts");
  if (postsSheet) {
    const data = postsSheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue;
      const obj = { task_type: "post" };
      headers.forEach((h, idx) => { obj[h] = row[idx]; });
      tasks.push(obj);
    }
  }

  // ── Comments tab ───────────────────────────────────────────
  // Columns: task_id | task_code | post_link | body | reward | time_limit | comment_type | comment_link
  // post_link  = the Reddit post URL where the comment should be made (stored in DB subreddit column)
  // comment_link = filled in after tasker submits their comment URL (written back by submit-task)
  const commentsSheet = ss.getSheetByName("Comments");
  if (commentsSheet) {
    const data = commentsSheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/ /g, "_"));
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue;
      const obj = { task_type: "comment" };
      headers.forEach((h, idx) => { obj[h] = row[idx]; });
      tasks.push(obj);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify(tasks))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the Apps Script editor (select setupTabs from the
 * function dropdown, then click Run) to create the Posts and Comments tabs.
 */
function setupTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let postsSheet = ss.getSheetByName("Posts");
  if (!postsSheet) {
    postsSheet = ss.insertSheet("Posts");
  } else {
    postsSheet.clearContents();
  }
  postsSheet.getRange(1, 1, 1, 9).setValues([[
    'task_id', 'task_code', 'subreddit', 'title', 'body', 'reward', 'time_limit', 'min_karma', 'min_account_age_days'
  ]]);

  let commentsSheet = ss.getSheetByName("Comments");
  if (!commentsSheet) {
    commentsSheet = ss.insertSheet("Comments");
  } else {
    commentsSheet.clearContents();
  }
  commentsSheet.getRange(1, 1, 1, 8).setValues([[
    'task_id', 'task_code', 'post_link', 'body', 'reward', 'time_limit', 'comment_type', 'comment_link'
  ]]);

  Logger.log('setupTabs complete!');
}
