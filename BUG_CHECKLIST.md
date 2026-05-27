# Reddit Tasking Website - Bug Fixes Checklist

## Sheet & Data Structure Issues

### Sheet Fields & Columns
- [ ] **Add Subreddit Field for Post Tasks** - Post tasks need a subreddit column/field in the Google Sheet to track which subreddit the post should be created in
- [ ] **Remove Description Column** - Description column in sheet is irrelevant and should be removed from the schema (clean up frontend and backend references)
- [ ] **Update Sheet Schema** - Ensure all POST and COMMENT task types have proper fields mapped (subreddit for posts, comment type for comments)

---

## Drafts Section Issues

### Post Body Display
- [ ] **Post Body Not Showing in Drafts** - When viewing draft post tasks, the body/content of the post should be displayed alongside other task details
  - Check drafts API endpoint response
  - Verify post body is being retrieved from database/sheet
  - Update drafts UI component to render post body

---

## Sheet Updates & Post Submission Issues

### Post Link Sync
- [ ] **Post Link Not Updating in Sheet on Task Submission** - When a task is submitted for review, the post link generated from Reddit should be immediately updated in the Google Sheet
  - Post link should be captured when task is submitted
  - Sheet update endpoint needs to push post link to correct row/column
  - Verify link is persisted in database AND reflected in sheet simultaneously
  - Add error handling for failed sheet updates

---

## Comment Task Naming Issues

### Dynamic Task Naming
- [ ] **Comment Tasks Named "Untitled"** - All comment tasks are currently showing as "untitled" instead of using the comment type
  - Implement logic to use "comment_type" field from sheet as task name
  - Map comment types (e.g., "engaging", "supportive", etc.) to display names
  - Update database schema if comment_type field is missing
  - Update task creation endpoint to set proper name based on comment_type
  - Verify task listing displays correct names

---

## Wallet & Balance Issues

### Wallet Balance Addition
- [ ] **Wallet Balance Addition Trigger Failing** - The trigger that adds reward balance to user wallet is not executing properly
  - Check if trigger is configured in database
  - Verify trigger fires on task submission/approval
  - Debug transaction logs to see if trigger is running
  - Check for any error messages in logs

### Balance Display Accuracy
- [ ] **Balance Display Incorrect** - Wallet balance does not reflect the correct value (e.g., $0.30 not displaying)
  - Verify balance calculation logic in backend
  - Check database query that retrieves user balance
  - Ensure no rounding or formatting errors
  - Test with various decimal values

### Balance Value Mapping
- [ ] **Balance Should Only Reflect Reward Value** - Balance increase should match ONLY the reward amount input, not multiplied or altered values
  - Remove any bonus multipliers if applied
  - Ensure reward field value is used directly for balance addition
  - Verify all values are stored and displayed in $ currency
  - Add validation to prevent incorrect value transformations

---

## Notification Issues

### Discord Notifications
- [ ] **Discord Notification Trigger Failing** - Discord notifications are not being sent when tasks are created/updated/submitted
  - Verify Discord webhook URL is valid and active
  - Check if notification trigger is configured
  - Verify Discord bot has proper permissions
  - Test webhook payload format
  - Check for any network/CORS issues preventing notification delivery
  - Add error logging for failed notification attempts
  - Verify notification is triggered at correct event (task creation, submission, approval, etc.)

---

## Testing Checklist (Once Fixes Applied)

- [ ] Test post task creation with subreddit field
- [ ] Verify post body displays in drafts
- [ ] Create a post task, submit it, and confirm post link appears in sheet within seconds
- [ ] Create comment tasks and verify they display correct name based on comment_type
- [ ] Submit a task and verify wallet balance updates correctly
- [ ] Test balance display with various reward values ($0.30, $1.50, $5.00, etc.)
- [ ] Test Discord notification triggers for various task states
- [ ] Verify sheet description column is removed from all views

---

## Priority Levels

**CRITICAL:**
- Post link not updating in sheet
- Comment tasks named "Untitled" 
- Wallet balance not updating/displaying

**HIGH:**
- Post body not showing in drafts
- Subreddit field missing for post tasks
- Discord notifications failing

**MEDIUM:**
- Remove description column from sheet
- Balance display accuracy refinement

---

## Notes

- All values should be in USD ($)
- Ensure database triggers are properly configured
- Consider adding unit tests for wallet balance calculations
- Add logging for all sheet update operations for debugging
