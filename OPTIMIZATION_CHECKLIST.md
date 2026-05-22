# 🎯 Optimization Implementation Checklist

## Phase 1: Quick Wins (Start Here!) - 4-6 Hours Total

### 1.1 Enable Database Query Monitoring ✅
**Effort**: 30 minutes | **Benefit**: Find N+1 queries

- [ ] Go to Supabase dashboard → Settings → Database
- [ ] Enable `pg_stat_statements` extension (should already be installed)
- [ ] Run this query to see your slowest queries:

```sql
-- Paste this in Supabase SQL Editor
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

- [ ] Screenshot results and save to `docs/slow_queries.txt`
- [ ] Identify any queries taking > 100ms

**Questions to answer**:
- [ ] Are there any SELECT * queries? (should be specific columns)
- [ ] Are there loops doing multiple queries? (N+1 pattern)
- [ ] Can any be combined with JOINs?

---

### 1.2 Refactor N+1 Query Patterns ✅
**Effort**: 2-3 hours | **Benefit**: 60-70% fewer queries

Search your codebase for these patterns:

```bash
# Find potential N+1 patterns
grep -r "for.*const\|map.*async\|\.select(.*\*" app/api --include="*.ts"
```

**Check these files** (most likely culprits):
- [ ] `app/api/tasks/route.ts` - Line by line check
- [ ] `app/api/manager/tasks/route.ts` - Line by line check
- [ ] `app/dashboard/components/TaskPool.tsx` - Any `.map()` with database calls?
- [ ] `app/components/MyTasks.tsx` - Any loops fetching data?

**For each file**, apply this pattern:

```typescript
// BEFORE - N+1 query (BAD)
const tasks = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'open')

const tasksWithUsers = await Promise.all(
  tasks.map(async (task) => {
    const user = await supabase
      .from('profiles')
      .select('*')
      .eq('id', task.created_by)
      .single()
    
    return { ...task, user }
  })
)

// AFTER - Single query with JOIN (GOOD)
const tasksWithUsers = await supabase
  .from('tasks')
  .select(`
    id,
    title,
    reward_credits,
    status,
    created_at,
    profiles!tasks_created_by_fkey(id, username, email)
  `)
  .eq('status', 'open')
```

- [ ] Fix TaskPool.tsx
- [ ] Fix MyTasks.tsx
- [ ] Fix all API routes with `.select('*')`
- [ ] Test each change with `npm run dev`

---

### 1.3 Replace SELECT * with Specific Columns ✅
**Effort**: 1-2 hours | **Benefit**: 30-40% less data transfer

Find all `.select('*')` patterns:

```bash
grep -r "\.select.*\*" app --include="*.ts" --include="*.tsx"
```

For each occurrence, create a specific column list:

**Example: Tasks API Route**
```typescript
// BEFORE
const { data } = await supabase
  .from('tasks')
  .select('*')

// AFTER
const { data } = await supabase
  .from('tasks')
  .select(`
    id,
    title,
    description,
    reward_credits,
    status,
    task_type,
    created_at,
    created_by,
    max_claims
  `)
```

**Common column selections** (save as snippets):
```typescript
// Tasks (8 columns instead of 20+)
'id, title, description, reward_credits, status, task_type, created_at, max_claims'

// Profiles (5 columns instead of 12+)
'id, username, email, role, approval_status'

// Task Claims (6 columns)
'id, task_id, user_id, status, created_at, expires_at'

// Submissions (7 columns)
'id, claim_id, task_id, user_id, submission_link, status, created_at'
```

- [ ] Replace all `.select('*')` in API routes
- [ ] Replace all `.select('*')` in components
- [ ] Test each page loads correctly
- [ ] No console errors about missing columns

---

### 1.4 Set Up Client-Side Caching with SWR ✅
**Effort**: 1.5-2 hours | **Benefit**: 50% fewer API calls

```bash
npm install swr
```

**Update high-traffic components** (in this order):

#### File 1: `app/dashboard/components/TaskPool.tsx`
```typescript
// BEFORE - New fetch every render
'use client'
import { useState, useEffect } from 'react'

export function TaskPool() {
  const [tasks, setTasks] = useState([])
  
  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(setTasks)
  }, [])
  
  return <div>{/* render tasks */}</div>
}

// AFTER - Cached fetch with SWR
'use client'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export function TaskPool() {
  const { data: tasks = [] } = useSWR('/api/tasks', fetcher, {
    revalidateOnFocus: false,    // Don't refetch when window refocused
    revalidateOnReconnect: true, // Refetch if reconnected
    dedupingInterval: 60000,     // Cache for 1 minute
  })
  
  return <div>{/* render tasks */}</div>
}
```

- [ ] Install SWR: `npm install swr`
- [ ] Update TaskPool.tsx with SWR
- [ ] Update MyTasks.tsx with SWR
- [ ] Update Wallet.tsx with SWR
- [ ] Test: Navigate away and back, should use cache (no loading spinner)
- [ ] Test: Manually refresh page (should show cached data immediately)

#### File 2: `app/components/MyTasks.tsx`
```typescript
// Apply same SWR pattern for '/api/user/tasks'
```

#### File 3: `app/components/Wallet.tsx`
```typescript
// Apply same SWR pattern for '/api/user/wallet'
```

---

## Phase 2: Database Optimization - 6-8 Hours

### 2.1 Add Database Indexes ✅
**Effort**: 1-2 hours | **Benefit**: 50-70% faster queries

Go to Supabase SQL Editor and run these:

```sql
-- Add indexes for frequently filtered columns
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_published_at ON tasks(published_at) WHERE published_at IS NOT NULL;

CREATE INDEX idx_profiles_approval ON profiles(approval_status);
CREATE INDEX idx_profiles_suspended ON profiles(suspended);

CREATE INDEX idx_task_claims_user_status ON task_claims(user_id, status);
CREATE INDEX idx_task_claims_expires ON task_claims(expires_at);

CREATE INDEX idx_submissions_status ON task_submissions(status);
CREATE INDEX idx_submissions_task_id ON task_submissions(task_id);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- Composite indexes for common multi-column queries
CREATE INDEX idx_submissions_task_user ON task_submissions(task_id, user_id);
CREATE INDEX idx_tasks_status_created ON tasks(status, created_at DESC);
```

- [ ] Run each CREATE INDEX command in Supabase SQL editor
- [ ] Wait for each to complete (should be instant)
- [ ] Verify no errors
- [ ] Run your slowest queries again - note the improvement!

---

### 2.2 Optimize API Routes for Specific Columns ✅
**Effort**: 2-3 hours | **Benefit**: 40-50% less data transfer

Review each API route and replace SELECT * with specific columns:

**Priority order:**
1. [ ] `app/api/tasks/route.ts`
2. [ ] `app/api/manager/tasks/route.ts`
3. [ ] `app/api/manager/submissions/route.ts`
4. [ ] `app/api/manager-submissions/route.ts`
5. [ ] All other API routes with `.select()`

**Example refactor:**

```typescript
// app/api/tasks/route.ts - BEFORE
export async function GET() {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'available')
  return Response.json(data)
}

// AFTER
export async function GET() {
  const { data } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      task_type,
      platform,
      subreddit,
      reward_credits,
      status,
      created_at,
      created_by,
      profiles!tasks_created_by_fkey(id, username)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
  return Response.json(data)
}
```

---

### 2.3 Refactor Loops to Batch Operations ✅
**Effort**: 1.5 hours | **Benefit**: 80-90% fewer API calls for bulk operations

Find any loops doing database inserts:

```bash
grep -r "for.*const\|\.map.*await\|await.*insert" app/api --include="*.ts"
```

**Example refactor:**

```typescript
// BEFORE - Inserting 100 items = 100 API calls
async function batchApproveWithdrawals(withdrawalIds: string[]) {
  for (const id of withdrawalIds) {
    await supabase
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', id)
  }
}

// AFTER - Inserting 100 items = 1 API call
async function batchApproveWithdrawals(withdrawalIds: string[]) {
  // Supabase handles bulk updates
  await supabase
    .from('withdrawals')
    .update({ status: 'approved' })
    .in('id', withdrawalIds) // Use .in() for bulk operations
}
```

- [ ] Find all loops with database operations
- [ ] Convert to bulk operations using `.in()` or batch inserts
- [ ] Test thoroughly - ensure data is still correct

---

## Phase 3: Frontend Optimization - 4-6 Hours

### 3.1 Image Optimization ✅
**Effort**: 1-2 hours | **Benefit**: 40-60% smaller images

First, find all images in your project:

```bash
grep -r "<img" app --include="*.tsx" --include="*.jsx"
```

For each image, replace with Next.js Image component:

```typescript
// BEFORE
<img src="/reddit-logo.png" alt="Reddit" />

// AFTER
import Image from 'next/image'

<Image
  src="/reddit-logo.png"
  alt="Reddit"
  width={200}
  height={200}
  priority={false}  // Set to true only for above-the-fold images
  quality={80}      // 80 is good balance between quality/size
/>
```

- [ ] Find all `<img` tags in your codebase
- [ ] Convert to `<Image` from next/image
- [ ] Set width/height for each
- [ ] Set priority={true} only for hero/logo images (max 3-4)
- [ ] Test images still display correctly

**Update next.config.ts:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { 
        protocol: 'https',
        hostname: 'reddit.com' 
      },
      { 
        protocol: 'https',
        hostname: '**.redditmedia.com' 
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

- [ ] Update next.config.ts with remotePatterns (if using external images)
- [ ] Set to ['image/avif', 'image/webp'] for best compression
- [ ] Deploy and check Network tab - images should be smaller

---

### 3.2 Code Splitting for Heavy Components ✅
**Effort**: 1-2 hours | **Benefit**: 20-30% smaller initial JS

Find heavy components that aren't immediately visible:

```bash
# Look for large libraries that might not be needed immediately
grep -r "import.*Chart\|import.*Editor\|import.*Table" app --include="*.tsx"
```

Lazy-load them:

```typescript
// BEFORE - Loads even if tab is not visible
import RevenueChart from '@/components/RevenueChart'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview')
  
  return (
    <>
      <RevenueChart />  {/* Loaded even if hidden */}
    </>
  )
}

// AFTER - Loads only when tab is clicked
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(
  () => import('@/components/RevenueChart'),
  { 
    loading: () => <div className="h-64 bg-gray-100 animate-pulse" />
  }
)

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview')
  
  return (
    <>
      {activeTab === 'revenue' && <RevenueChart />}  {/* Loaded only when visible */}
    </>
  )
}
```

- [ ] Identify components only shown on specific tabs/conditions
- [ ] Wrap with `dynamic()` import
- [ ] Add loading skeleton
- [ ] Test: Component should load only when needed

---

### 3.3 Disable Sourcemaps in Production ✅
**Effort**: 5 minutes | **Benefit**: 10-20% smaller production build

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Disable in production
  // But keep enabled in development for debugging
  ...(process.env.NODE_ENV === 'development' && {
    productionBrowserSourceMaps: true,
  }),
};

export default nextConfig;
```

- [ ] Update next.config.ts
- [ ] Run `npm run build` and check build size (should be noticeably smaller)
- [ ] Deploy and verify - errors still tracked in Sentry if set up

---

## Phase 4: Monitoring & Automation - 2-3 Hours

### 4.1 Set Up Budget Alerts ✅
**Effort**: 30 minutes | **Benefit**: Prevent cost surprises

**Supabase Alert:**
1. [ ] Go to https://supabase.com/dashboard
2. [ ] Select your project → Settings → Billing
3. [ ] Set "Spending Limit" to $10/month (safety net)
4. [ ] You'll get email if approaching limit

**Vercel Alert:**
1. [ ] Go to https://vercel.com
2. [ ] Click your project → Settings → Usage
3. [ ] Set spending limit to $20/month
4. [ ] Enable email notifications

- [ ] Supabase billing alert set to $10/month
- [ ] Vercel spending limit set to $20/month
- [ ] Test: Check you got confirmation email

---

### 4.2 Add Performance Logging to API Routes ✅
**Effort**: 1-2 hours | **Benefit**: Catch slow queries before users notice

Create `app/lib/timing.ts`:

```typescript
export function logTiming(route: string, duration: number) {
  if (duration > 100) {
    console.warn(`⚠️ SLOW: ${route} took ${duration}ms`)
  } else if (duration > 50) {
    console.log(`📊 ${route} took ${duration}ms`)
  }
}
```

Add to each API route:

```typescript
// app/api/tasks/route.ts
import { logTiming } from '@/lib/timing'

export async function GET(req: Request) {
  const start = performance.now()
  
  // Your code here
  const { data } = await supabase.from('tasks').select('...')
  
  const duration = performance.now() - start
  logTiming('GET /api/tasks', duration)
  
  return Response.json(data)
}
```

- [ ] Create `app/lib/timing.ts`
- [ ] Add to 5-10 most important API routes
- [ ] Deploy and monitor logs
- [ ] Watch for queries taking > 100ms

---

### 4.3 Create Weekly Health Check Email ✅
**Effort**: 1-2 hours | **Benefit**: Proactive monitoring

Create `app/api/health/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Check database
    const { count: userCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
    
    const { count: taskCount } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('status', 'open')
    
    const { count: submissionCount } = await supabase
      .from('task_submissions')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
    
    const stats = {
      timestamp: new Date().toISOString(),
      totalUsers: userCount,
      openTasks: taskCount,
      pendingReviews: submissionCount,
      status: 'healthy',
    }
    
    // Optional: Send email if something looks wrong
    if (submissionCount! > 10) {
      console.warn('⚠️ Many pending reviews:', submissionCount)
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    )
  }
}
```

Then set up a cron job to call it weekly:

```bash
# Add to your deployment (e.g., GitHub Actions or Vercel Cron)
# Calls /api/health every Sunday at 9am
```

- [ ] Create `app/api/health/route.ts`
- [ ] Test locally: `curl http://localhost:3000/api/health`
- [ ] Deploy
- [ ] Set up weekly reminder to check the endpoint

---

## Testing Checklist

### Before Each Deployment
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - builds successfully
- [ ] Check bundle size - should be < 500KB (gzip)
- [ ] Manual test: Load main pages, no 404s or errors
- [ ] Manual test: Caching works (navigate away/back quickly)
- [ ] Manual test: Images load correctly and are small

### Performance Testing
- [ ] Open DevTools Network tab (throttle to "Slow 3G")
- [ ] Load dashboard - should be < 3s
- [ ] Load task pool - should be < 2s
- [ ] Check for any > 100ms waterfall chains

### Database Testing
- [ ] Run slowest queries in Supabase SQL editor
- [ ] Compare before/after optimization
- [ ] Check query plan with `EXPLAIN ANALYZE`
- [ ] Verify indexes are being used (EXPLAIN output shows "Index Scan")

---

## Deployment Order

1. **Week 1**: Complete Phase 1 (Query monitoring + SWR caching)
2. **Week 2**: Complete Phase 2 (Database indexes + column selection)
3. **Week 3**: Complete Phase 3 (Image optimization + code splitting)
4. **Week 4**: Complete Phase 4 (Monitoring + automation)

---

## Success Metrics

After completing all phases, you should see:

✅ **Database Metrics**:
- Avg query time: < 50ms (was unknown)
- Queries/minute: -60% reduction
- No N+1 patterns in slow queries log

✅ **API Metrics**:
- Vercel function invocations: -50-70%
- API response time: 50-100ms median
- No API errors in Sentry

✅ **Frontend Metrics** (Chrome DevTools):
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- JS bundle size: < 300KB gzip

✅ **Cost Metrics**:
- Monthly bill: $0 (free tier)
- Can support 200+ daily users at no cost
- Zero manual maintenance needed

---

## When to Stop Optimizing

You can stop when:
1. ✅ All queries are < 100ms
2. ✅ No more pages taking > 3s to load
3. ✅ JS bundle < 300KB gzip
4. ✅ Can support 200+ concurrent users

Don't over-optimize at the cost of:
- Code readability (keep it simple)
- Development velocity (use existing libraries)
- New features (don't optimize features that aren't built yet)

---

## Questions During Implementation?

Helpful searches:
- "Supabase N+1 queries" - how to use joins
- "Next.js SWR" - client-side caching docs
- "Next.js Image optimization" - img tag replacement
- "PostgreSQL query optimization" - indexes and explain

Good luck! 🚀

