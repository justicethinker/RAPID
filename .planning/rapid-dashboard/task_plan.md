# RAPID Founder Dashboard — Remaining Plan

## Goal
Bring the existing RAPID founder dashboard toward the attached implementation plan by closing verified remaining product gaps, reusing existing startup, post, test, findings, staff and notification models. Do not fabricate metrics or records; preserve tester identity and research privacy.

## Current Phase
Complete for all supportable product work; external owner actions remain.

## Phases
1. Audit current code against phases 7–11 of the attached plan and the existing delivery constraints. **complete**
2. Complete organic analytics instrumentation, date filters, attribution and honest empty/insufficient-data states using canonical records. **complete**
3. Close managed validation/operator/report workflow gaps by extending existing tests/findings flow, with server-side authorization/audit. **complete**
4. Add payment capability only as supportable with an existing or configured provider; never trust client redirects or fake provider confirmation. **blocked: provider unavailable**
5. Address relevant notifications and optional AI only if prerequisites and secure configuration allow, keeping AI explicitly optional. **notifications complete; AI deferred**
6. Run focused integration coverage and the minimal full verification required; report actual remaining external setup/launch gates. **complete**

## Constraints
- Follow the attached implementation plan and existing README; do not add unsupported payment handling.
- Avoid unrelated feature work, fabricated data, and wide refactors.
- New database design requires `supabase-postgres-best-practices`; write behavior tests before implementation.
- Production source change must have a regression/integration test written and observed failing first.
- Apply local migrations only to the configured local development DB. Never deploy or use production credentials.

## Errors Encountered
| Error | Resolution |
|---|---|
| Migration 0011 initially failed: current local role did not own `notifications` | Confirmed owner was `postgres`; transferred local table ownership to `rapid` and migration applied. |
| Report date fields arrived from `pg` as `Date` objects, not strings | Added a `dateOnly` conversion in the report generator. |
| Test module bindings named `founder`/`staff` collided with local fixture variables | Renamed imports to `founderApi`/`staffApi`. |
| Integration report test left the test in `published`, affecting linked-test coverage | Reset the fixture to `fielding` and made the linked-test test set its own required status. |

## Next Step
Owner decisions: choose and configure a supported payment provider before adding proposals/paid checkout; optionally configure an LLM provider if the AI Guide is wanted. Otherwise, run the live Clerk/Resend loop and deploy through the existing release checklist.
