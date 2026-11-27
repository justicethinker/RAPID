alter table notifications
  drop constraint if exists notifications_kind_check;
alter table notifications
  add constraint notifications_kind_check
  check (
    kind in (
      'application_received',
      'application_decision',
      'invitation',
      'findings_published',
      'reward_sent',
      'new_follower',
      'new_feedback',
      'waitlist_join',
      'moderation',
      'research_status',
      'request_received'
    )
  );

alter table findings
  add column if not exists version integer not null default 1;
alter table findings
  drop constraint if exists findings_version_positive;
alter table findings
  add constraint findings_version_positive check (version > 0);
