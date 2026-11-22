# Cyber DNA + Squad DNA — MVP Delivery Plan

This document turns the approved Hybrid / All product direction into an incremental implementation plan. It is a plan, not a claim that the features already exist.

## Current repository baseline

The current app already has:
- Node.js 22 + Express backend and SQLite;
- email/password registration, JWT authentication, and basic player profiles;
- player search filters, likes, and mutual matches;
- PWA shell and draft/hero knowledge features.

The current social implementation is only a starter teammate finder. It does not yet provide Cyber DNA, persistent squads, Squad DNA, chat, moderation workflows, or production-ready age/privacy controls. The current README and roadmap should remain explicit about these limitations.

## Delivery strategy

Build on the existing account/profile/search foundation. Do not rewrite the draft assistant or replace the PWA. Keep changes small, isolated, migration-backed, and testable.

### Phase 0 — Product and safety contract
- [x] Confirm Cyber DNA + Squad DNA as one system.
- [x] Confirm persistent ranked-team formation as the primary social use case.
- [ ] Define minimum-age policy and permitted age cohorts for the actual launch jurisdictions and app-store rules.
- [ ] Define privacy notice, data retention, account deletion, and moderation operating procedure.
- [ ] Decide whether existing game_id values are migrated to private-only storage or removed from public profile responses.

**Exit gate:** safety, age eligibility, privacy, and moderation requirements approved before social beta.

### Phase 1 — Cyber DNA profile foundation
- [ ] Introduce versioned SQLite migrations; stop adding all future tables only to the inline startup schema.
- [ ] Add player_preferences with discoverability disabled by default.
- [ ] Add strict enums/allowlists for roles, rank bands, goals, communication mode, playstyle, and availability.
- [ ] Keep exact age and private identifiers out of public profile responses.
- [ ] Add GET/PUT/DELETE /api/cyber-dna and ownership tests.
- [ ] Add profile preview and privacy controls to the PWA.

**Exit gate:** a user can create, preview, edit, pause, and delete Cyber DNA; another user cannot read private fields.

### Phase 2 — Explainable Discover and invitations
- [ ] Implement hard eligibility filters before scoring: opt-in, age cohort, blocks, rank/format compatibility.
- [ ] Implement versioned, deterministic compatibility scoring with factor-level explanations and completeness.
- [ ] Add candidate list with role/rank/hero/goal/schedule facts only.
- [ ] Add structured team invites, expiry, accept/decline, cancellation, and rate limits.
- [ ] Add block/report endpoints and a minimal moderation queue.
- [ ] Add tests for blocked users, cohort boundaries, invite spam, duplicate invites, and private-field leakage.

**Exit gate:** two eligible users can find each other and mutually accept an invitation; blocked or ineligible accounts cannot interact through discovery.

### Phase 3 — Persistent squads and Squad DNA
- [ ] Add squads, squad_members, and membership authorization rules.
- [ ] Support duo, trio, and five-stack squad formats.
- [ ] Add squad role coverage and hero-pool flexibility analysis using existing hero catalog identifiers.
- [ ] Add schedule-overlap calculation using declared timezone and availability windows.
- [ ] Add squad home screen, roster, role assignments, recruiting/paused states, and leave/remove flows.
- [ ] Add tests for capacity, duplicate membership, owner/captain permissions, and squad visibility.

**Exit gate:** a stable squad can be created, filled, managed, and analyzed without exposing private profile data.

### Phase 4 — Sessions and healthy retention loop
- [ ] Add planned squad sessions and opt-in participation.
- [ ] Add structured, optional post-session check-ins.
- [ ] Show private Squad DNA insights and constructive next-step suggestions.
- [ ] Add opt-in reminders only after notification permissions and preferences are designed.
- [ ] Measure weekly active squads, completed sessions, repeat squad activity, and safety metrics.

**Exit gate:** a squad can plan and complete repeat sessions and see useful, non-punitive progress feedback.

### Phase 5 — Closed beta and production readiness
- [ ] Deploy only with persistent database storage and automated backups.
- [ ] Add email verification, password reset, account deletion, abuse handling, and moderator tooling.
- [ ] Run security review for auth/session storage, XSS, CSRF where applicable, rate limits, uploads, and logs.
- [ ] Perform manual iPhone Safari/PWA testing.
- [ ] Invite a small, moderated beta cohort; review safety and retention metrics before opening registration.

**Exit gate:** operational moderation, data recovery, privacy controls, and a successful closed beta. A successful CI run alone is not a launch gate.

## MVP acceptance criteria

1. Discoverability is opt-in and can be paused immediately.
2. A Cyber DNA profile can be created and edited using validated values.
3. Search returns only eligible profiles and never exposes email, exact age, private game ID, or external contact details.
4. Compatibility results include factor-level reasons and a data-completeness indicator.
5. An invitation requires explicit acceptance and expires.
6. Users can block and report; blocks apply in both directions.
7. Age-cohort restrictions are enforced server-side, not just hidden in the UI.
8. A user can create or join a duo/trio/five-stack squad, subject to capacity and eligibility rules.
9. Squad DNA shows role coverage, hero-pool flexibility, rank cohesion, and schedule overlap as separate dimensions.
10. Users can leave a squad and delete their profile data under the published retention policy.
11. Automated tests cover authorization, validation, privacy leakage, abuse limits, and all membership/invitation state transitions.
12. No public release occurs on ephemeral storage or without an operational moderation process.

## Recommended implementation order in this repository

1. Review and harden the existing /api/profile and /api/players response shapes, especially private game_id handling.
2. Add migration infrastructure and schema tests.
3. Implement Cyber DNA model/service/routes and unit/API tests.
4. Implement compatibility scoring as a pure module with deterministic fixtures.
5. Implement invitations and block/report flows.
6. Implement squads and Squad DNA.
7. Add PWA views after the API contracts stabilize.
8. Update README only when features actually ship; keep planned and implemented status separate.

## Non-goals for MVP

- Dating/romantic matching;
- open DMs, voice rooms, or external contact exchange;
- location-based discovery;
- automatic access to MLBB match telemetry;
- AI-generated personality profiling;
- paid boosts or pay-to-win mechanics;
- public individual skill rankings;
- global unmoderated feed.

## Release discipline

- Work on a dedicated feature branch based on the current PR head.
- Never merge PR #4 without explicit user approval.
- Run npm test, production Docker build, and inspect GitHub Actions.
- Do not claim manual iPhone testing unless it was actually performed.
