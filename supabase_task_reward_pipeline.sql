-- Run this whole file in Supabase SQL Editor.
-- Copy from the first line through the last line.

alter table public.task_claims enable row level security;
alter table public.tasks enable row level security;
alter table public.wallets enable row level security;
alter table public.profiles enable row level security;

alter table public.profiles
  add column if not exists cooldown_minutes integer not null default 0;

alter table public.profiles
  add column if not exists cooldown_until timestamptz;

create or replace function public.is_pipeline_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('manager', 'admin')
  );
$$;

grant execute on function public.is_pipeline_manager() to authenticated;

create unique index if not exists task_claims_one_active_per_user
  on public.task_claims (user_id)
  where status = 'active';

create unique index if not exists task_claims_one_open_claim_per_task
  on public.task_claims (task_id)
  where status in ('active', 'submitted');

drop policy if exists users_read_profiles_for_pipeline on public.profiles;
create policy users_read_profiles_for_pipeline
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_pipeline_manager()
  );

drop policy if exists tasks_read_pool_or_own_or_manager on public.tasks;
create policy tasks_read_pool_or_own_or_manager
  on public.tasks
  for select
  to authenticated
  using (
    status in ('open', 'available')
    or claimed_by = auth.uid()
    or public.is_pipeline_manager()
  );

drop policy if exists taskers_claim_open_tasks on public.tasks;
create policy taskers_claim_open_tasks
  on public.tasks
  for update
  to authenticated
  using (status in ('open', 'available'))
  with check (status = 'claimed' and claimed_by = auth.uid());

drop policy if exists taskers_submit_or_expire_own_tasks on public.tasks;
create policy taskers_submit_or_expire_own_tasks
  on public.tasks
  for update
  to authenticated
  using (claimed_by = auth.uid())
  with check (
    claimed_by = auth.uid()
    or (status = 'open' and claimed_by is null)
  );

drop policy if exists managers_manage_tasks on public.tasks;
create policy managers_manage_tasks
  on public.tasks
  for all
  to authenticated
  using (public.is_pipeline_manager())
  with check (public.is_pipeline_manager());

drop policy if exists taskers_read_own_claims on public.task_claims;
create policy taskers_read_own_claims
  on public.task_claims
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_pipeline_manager()
  );

drop policy if exists taskers_create_own_active_claim on public.task_claims;
create policy taskers_create_own_active_claim
  on public.task_claims
  for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'active');

drop policy if exists taskers_submit_or_expire_own_claim on public.task_claims;
create policy taskers_submit_or_expire_own_claim
  on public.task_claims
  for update
  to authenticated
  using (user_id = auth.uid() and status = 'active')
  with check (user_id = auth.uid() and status in ('submitted', 'expired', 'abandoned'));

drop policy if exists managers_update_tasker_cooldown on public.profiles;
create policy managers_update_tasker_cooldown
  on public.profiles
  for update
  to authenticated
  using (public.is_pipeline_manager())
  with check (public.is_pipeline_manager());

drop policy if exists users_update_own_cooldown_until on public.profiles;
create policy users_update_own_cooldown_until
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists managers_review_claims on public.task_claims;
create policy managers_review_claims
  on public.task_claims
  for update
  to authenticated
  using (
    status = 'submitted'
    and public.is_pipeline_manager()
  )
  with check (
    status in ('approved', 'rejected')
    and public.is_pipeline_manager()
  );

drop policy if exists users_read_own_wallet on public.wallets;
create policy users_read_own_wallet
  on public.wallets
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_pipeline_manager()
  );

drop policy if exists managers_credit_wallets on public.wallets;
create policy managers_credit_wallets
  on public.wallets
  for all
  to authenticated
  using (public.is_pipeline_manager())
  with check (public.is_pipeline_manager());

insert into public.task_claims (
  task_id,
  user_id,
  status,
  claimed_at,
  expires_at
)
select
  stuck_tasks.id,
  stuck_tasks.claimed_by,
  'active',
  coalesce(stuck_tasks.claimed_at, now()),
  coalesce(stuck_tasks.claimed_at, now()) + make_interval(mins => coalesce(stuck_tasks.claim_duration_minutes, 15))
from (
  select
    tasks.*,
    row_number() over (
      partition by tasks.claimed_by
      order by tasks.claimed_at desc nulls last, tasks.created_at desc
    ) as claim_rank
  from public.tasks
  where tasks.claimed_by is not null
  and tasks.status in ('claimed', 'active')
) s