-- Phase 6 completion: startup profiles can be reported, and founders receive
-- in-app notifications for the audience actions that matter to them.

alter table content_reports
  drop constraint if exists content_reports_target_type_check;
alter table content_reports
  add constraint content_reports_target_type_check
  check (target_type in ('post', 'feedback', 'startup'));

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
      'moderation'
    )
  );
