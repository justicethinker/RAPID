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
      'research_status'
    )
  );
