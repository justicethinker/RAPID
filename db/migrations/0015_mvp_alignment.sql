-- MVP alignment for the three RAPID services. The existing workflow
-- (accounts, invitations, responses and findings) stays the backbone.

alter table tests
  add column if not exists service_key text not null default 'idea_validation'
    check (service_key in ('idea_validation', 'product_testing', 'customer_research'));
alter table tests
  add column if not exists project_status text not null default 'draft'
    check (project_status in ('draft', 'under_review', 'awaiting_payment', 'recruiting', 'running', 'reviewing', 'completed', 'cancelled', 'on_hold'));
alter table tests
  add column if not exists payment_status text not null default 'not_required'
    check (payment_status in ('not_required', 'awaiting_payment', 'processing', 'paid', 'failed', 'refunded', 'waived'));
alter table tests
  add column if not exists price_amount bigint
    check (price_amount is null or price_amount >= 0);
alter table tests
  add column if not exists price_currency text not null default 'NGN';
alter table tests
  add column if not exists task_url text;
alter table tests
  add column if not exists task_requires_return boolean not null default false;
alter table tests
  add column if not exists reward_amount bigint
    check (reward_amount is null or reward_amount >= 0);

update tests
   set project_status = case status
     when 'requested' then 'draft'
     when 'scoping' then 'under_review'
     when 'recruiting' then 'recruiting'
     when 'fielding' then 'running'
     when 'findings' then 'reviewing'
     when 'published' then 'completed'
     else 'cancelled'
   end
 where project_status = 'draft';


alter table tests
  add column if not exists brief_id uuid;

-- External task outcomes live in task_actions; responses.outcome keeps the
-- legacy four values so older tables with different owners are not altered.
create table if not exists research_briefs (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references people (id) on delete cascade,
  test_id uuid references tests (id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'flagged')),
  brief jsonb not null default '{}'::jsonb,
  missing_details jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists research_briefs_founder_idx on research_briefs (founder_id, created_at desc);
create index if not exists research_briefs_test_idx on research_briefs (test_id);

alter table tests
  drop constraint if exists tests_brief_id_fkey;
alter table tests
  add constraint tests_brief_id_fkey foreign key (brief_id)
  references research_briefs (id) on delete set null;

create table if not exists intake_messages (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references research_briefs (id) on delete cascade,
  founder_id uuid not null references people (id) on delete cascade,
  role text not null check (role in ('founder', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists intake_messages_brief_idx on intake_messages (brief_id, created_at);

create table if not exists study_templates (
  service_key text primary key
    check (service_key in ('idea_validation', 'product_testing', 'customer_research')),
  name text not null,
  description text not null default '',
  steps jsonb not null default '[]'::jsonb
);

create table if not exists study_steps (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests (id) on delete cascade,
  position integer not null check (position >= 0),
  step_type text not null
    check (step_type in ('single_choice', 'multiple_choice', 'scale', 'short_answer', 'image_prompt', 'link_task')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  unique (test_id, position)
);
create index if not exists study_steps_test_idx on study_steps (test_id, position);

create table if not exists eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests (id) on delete cascade,
  rule_type text not null
    check (rule_type in ('country', 'age_band', 'situation', 'interest', 'industry', 'screener')),
  operator text not null default 'in'
    check (operator in ('is', 'in')),
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists eligibility_rules_test_idx on eligibility_rules (test_id);

create table if not exists study_screeners (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests (id) on delete cascade,
  position integer not null check (position >= 0),
  question text not null,
  options jsonb not null default '[]'::jsonb,
  required boolean not null default true,
  unique (test_id, position)
);
create index if not exists study_screeners_test_idx on study_screeners (test_id, position);

create table if not exists screener_answers (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  screener_id uuid not null references study_screeners (id) on delete cascade,
  answer jsonb not null default 'null'::jsonb,
  unique (invitation_id, screener_id)
);

create table if not exists response_answers (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  step_id uuid not null references study_steps (id) on delete cascade,
  answer jsonb not null default 'null'::jsonb,
  unique (invitation_id, step_id)
);
create index if not exists response_answers_invitation_idx on response_answers (invitation_id);

create table if not exists task_actions (
  invitation_id uuid primary key references invitations (id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) = 64),
  target_url_hash text not null,
  target_domain text not null,
  state text not null default 'assigned'
    check (state in ('assigned', 'link_opened', 'self_reported', 'verified', 'not_applicable')),
  self_reported_outcome text,
  reason text,
  verified_by uuid references people (id) on delete set null,
  verified_at timestamptz,
  evidence_note text,
  opened_at timestamptz,
  opened_count integer not null default 0 check (opened_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists task_actions_state_idx on task_actions (state);

create table if not exists response_flags (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  flag_type text not null,
  detail text not null default '',
  status text not null default 'open' check (status in ('open', 'reviewed', 'kept', 'excluded')),
  reviewed_by uuid references people (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists response_flags_invitation_idx on response_flags (invitation_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests (id) on delete restrict,
  founder_id uuid not null references people (id) on delete restrict,
  provider text not null default 'paystack',
  provider_reference text not null unique,
  idempotency_key text not null unique,
  amount_kobo bigint not null check (amount_kobo >= 0),
  currency text not null default 'NGN',
  status text not null default 'initialized'
    check (status in ('initialized', 'verified', 'paid', 'failed', 'refunded', 'cancelled')),
  provider_status text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_test_idx on payments (test_id, created_at desc);
create index if not exists payments_founder_idx on payments (founder_id, created_at desc);

create table if not exists reward_ledger (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete restrict,
  tester_id uuid not null references people (id) on delete restrict,
  amount_kobo bigint not null check (amount_kobo >= 0),
  currency text not null default 'NGN',
  method text not null default 'manual',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'cancelled')),
  reference text,
  created_by uuid references people (id) on delete set null,
  paid_by uuid references people (id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (invitation_id, status)
);
create index if not exists reward_ledger_tester_idx on reward_ledger (tester_id, created_at desc);

create table if not exists ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people (id) on delete set null,
  purpose text not null,
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  estimated_cost_usd numeric(12, 6),
  status text not null check (status in ('ok', 'failed', 'fallback')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_logs_person_idx on ai_usage_logs (person_id, created_at desc);

insert into study_templates (service_key, name, description, steps) values
  ('idea_validation', 'Idea Validation', 'Screened problem and interest survey for idea validation.', '[{"position":0,"step_type":"single_choice","prompt":"How familiar are you with this problem?","options":["Very familiar","Somewhat familiar","Not familiar"]},{"position":1,"step_type":"single_choice","prompt":"How important is solving this problem to you?","options":["Very important","Somewhat important","Not important"]},{"position":2,"step_type":"single_choice","prompt":"Would you join a waitlist for updates?","options":["Yes","Maybe","No"]}]'::jsonb),
  ('product_testing', 'Product Testing', 'Five-second impression and website/app task feedback.', '[{"position":0,"step_type":"image_prompt","prompt":"Look at this screen for five seconds. In one sentence, what is it for?","options":[]},{"position":1,"step_type":"link_task","prompt":"Open the task link and try the flow.","options":[],"metadata":{"requiresReturn":true}},{"position":2,"step_type":"single_choice","prompt":"What happened when you tried the task?","options":["Completed","Could not complete","Chose not to"]},{"position":3,"step_type":"short_answer","prompt":"What got in the way, if anything?","options":[]}]'::jsonb),
  ('customer_research', 'Customer Research', 'Short survey on needs, preferences and buying barriers.', '[{"position":0,"step_type":"single_choice","prompt":"How often do you use this kind of solution today?","options":["Daily","Weekly","Monthly","Rarely","Never"]},{"position":1,"step_type":"multiple_choice","prompt":"Which needs matter most?","options":["Speed","Cost","Quality","Support","Ease of use"]},{"position":2,"step_type":"scale","prompt":"How likely would you pay for this?","options":[1,2,3,4,5],"metadata":{"min":1,"max":5}},{"position":3,"step_type":"short_answer","prompt":"What would stop you from buying?","options":[]}]'::jsonb)
on conflict (service_key) do nothing;

update tests
   set project_status = case project_status
     when 'draft' then 'draft'
     else project_status
   end;
