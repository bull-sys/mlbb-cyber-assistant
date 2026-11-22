# Cyber DNA + Squad DNA — Product and Technical Architecture

**Status:** proposed architecture; documentation only. These features are not implemented until their API, UI, migrations, tests, and deployment are complete.

## 1. Product decision

The social direction is **persistent ranked-team formation**, not dating.

- **Cyber DNA** describes a player's voluntarily supplied game preferences and practical play profile.
- **Squad DNA** describes how a stable group fits together and what the group can improve.
- **Discover** helps a player find compatible teammates and form a recurring squad.
- **Squad Home** gives the group a shared identity, roster, role plan, availability overlap, goals, and progress.

The differentiator is the loop between the existing MLBB knowledge/draft engine and the social layer: the platform can explain why two players or a five-player roster complement each other using hero pools, roles, rank bands, playstyle preferences, schedule overlap, and draft coverage. It must not claim to predict match wins.

## 2. Product principles

1. **Game-first, not dating-first.** No romantic matching language, appearance-based ranking, or dating profile fields.
2. **Explainable matching.** Every score has visible factors and a confidence/completeness indicator.
3. **Consent and control.** Profiles are opt-in, discoverability can be paused, and every invitation is accepted explicitly.
4. **Privacy by default.** No public email, phone, exact location, precise age, or external social handles. Game ID is private and never included in public search results.
5. **Age-appropriate safety.** Before social discovery launches, define a minimum-age policy consistent with applicable law and platform rules. Use age bands rather than displaying birth dates. Do not recommend or expose direct contact between adult and minor accounts; separate age cohorts in discovery and squad formation. Add reporting, blocking, moderation, and account deletion before public launch. Do not launch open DMs in the MVP.
6. **No fabricated telemetry.** The first version uses self-reported preferences and user-entered match/session feedback. Do not imply access to hidden MLBB match data or official APIs.
7. **No pay-to-win.** Paid features may add analysis, customization, and team-management convenience, never ranked matchmaking advantage or visibility boosts that undermine fair discovery.

## 3. User journeys

### 3.1 Cyber DNA setup
1. User opts into teammate discovery.
2. User chooses main and secondary roles, preferred lanes, rank band, and a manageable hero pool.
3. User selects playstyle preferences using neutral game-language labels, for example proactive/patient or objective-focused/skirmish-focused.
4. User selects goals (ranked climb, regular duo/trio, stable five-stack, learning) and typical availability windows with timezone.
5. User chooses communication preferences (in-game pings, text, voice) without entering external contact details.
6. User reviews a preview of what other players can see and saves.

All fields are editable and deletable. Do not infer sensitive personality traits from gameplay.

### 3.2 Discover and match
1. User chooses a target format: duo, trio, or five-stack.
2. Search applies hard eligibility filters first: active/visible profile, same permitted age cohort, compatible rank band, chosen format, and blocked-user exclusions.
3. Candidate cards show game-relevant facts only: roles, selected heroes, rank band, goals, schedule overlap, and a short compatibility explanation.
4. A user sends a structured team invitation. The recipient accepts or declines.
5. Only after mutual acceptance does the app reveal the minimum game coordination details each person explicitly chose to share.

No infinite swipe loop is required for MVP. A ranked list with clear explanations is more useful and easier to moderate.

### 3.3 Squad formation
1. Accepted users can create or join a persistent squad.
2. Squad has a name, optional emblem/theme, target format, rank band, goals, and a roster.
3. Members set their preferred squad role(s), hero pool, and availability.
4. Squad DNA computes team composition coverage and schedule overlap.
5. Squad members can set a recurring session target and complete a short post-session check-in.

### 3.4 Squad improvement loop
After a session, members may optionally record:
- whether planned roles were covered;
- whether the selected composition felt comfortable;
- whether the team coordinated objectives;
- one thing to repeat and one thing to improve.

Insights are private to the squad by default. Never publicly rank or shame individual members. Do not claim a causal win-rate improvement without reliable, consented match data.

## 4. Cyber DNA data model

Keep the first implementation deliberately small. Suggested SQLite entities:

### player_preferences
- user_id primary key / foreign key to users
- discoverable boolean, default false
- main_role, secondary_roles_json
- rank_band
- hero_pool_json (hero IDs, optional mastery labels supplied by the user)
- playstyle_json (bounded enumerated preferences, not free-form personality labels)
- goals_json
- communication_mode (pings, text, voice, mixed)
- timezone
- availability_json (weekly day/time windows; never precise location)
- age_cohort (restricted enum; not publicly displayed as exact age)
- profile_visibility
- updated_at

### player_blocks
- blocker_user_id, blocked_user_id, created_at
- unique pair; block is enforced in both search directions and invitation endpoints.

### player_reports
- id, reporter_user_id, reported_user_id
- category, details (length-limited), created_at, status, moderator_note
- access restricted to moderation roles; never expose reporter identity to the reported user.

### team_invites
- id, sender_user_id, recipient_user_id
- target_format (duo/trio/five_stack), message_template_id
- status (pending/accepted/declined/cancelled/expired)
- created_at, expires_at, responded_at
- enforce no self-invites, no duplicate pending invitations, blocks, rate limits, and cohort compatibility.

### squads
- id, name, owner_user_id, target_format, rank_band
- goals_json, visibility, created_at, updated_at
- status (recruiting/active/paused/archived)

### squad_members
- squad_id, user_id, member_role (owner/captain/member)
- preferred_roles_json, hero_pool_json, availability_json
- joined_at, status
- unique active membership constraints; one active primary squad per user in MVP.

### squad_sessions
- id, squad_id, planned_at, status, created_by, created_at
- session participation is opt-in; do not expose a member's exact online status.

### squad_checkins
- id, session_id, user_id
- bounded ratings for role clarity, coordination, objective focus, comfort
- optional structured keep/improve selections
- private to squad; deletion and retention policy required.

Use versioned migrations rather than expanding the inline CREATE TABLE block indefinitely. Add foreign keys, indexes, constraints, and transaction-based migrations. Use UTC timestamps and store the user's IANA timezone separately.

## 5. Matching and compatibility engine

### 5.1 Hard filters before scoring
- both users have opted into discovery;
- accounts are active and not blocked in either direction;
- age-cohort policy allows the match;
- rank ranges are compatible for the selected format;
- target format and squad capacity are compatible;
- no pending invite conflict.

A high score must never override a failed safety or eligibility filter.

### 5.2 Explainable score (initial heuristic)
Calculate a 0–100 score from available, user-approved fields:

| Factor | Initial weight |
| --- | ---: |
| Role complementarity | 25 |
| Rank-band compatibility | 20 |
| Hero-pool / draft complementarity | 20 |
| Playstyle preference fit | 15 |
| Schedule overlap | 15 |
| Shared goals | 5 |

Weights are configuration, not truth. Normalize only over fields both users supplied and show a profile completeness/confidence label. If key fields are missing, say “not enough information” rather than giving false precision.

The engine should return structured reasons such as:
- “Your preferred roles complement each other.”
- “You have several overlapping ranked time windows.”
- “Your hero pools cover different team needs.”

It must not return opaque claims such as “you will win 80% together.” Track algorithm_version for reproducibility and future evaluation.

### 5.3 Squad DNA
Calculate separate dimensions rather than one mysterious score:
- role coverage (does the roster have viable coverage for the intended format?);
- hero-pool flexibility (does the group have options without assuming mastery?);
- rank-band cohesion;
- schedule overlap;
- goal alignment;
- self-reported coordination trend from optional check-ins.

Display gaps and suggestions, not a public leaderboard. A squad with incomplete data should show “building your team profile.”

## 6. API boundary

Keep social endpoints separate from draft endpoints and put them behind authentication. Proposed routes:

### Cyber DNA
- GET /api/cyber-dna — current user's private preferences.
- PUT /api/cyber-dna — validate and replace allowed preference fields.
- DELETE /api/cyber-dna — disable discovery and delete preference data.

### Discover and invitations
- GET /api/discover?format=&role=&rankBand= — eligible candidates with explainable score.
- POST /api/team-invites — create structured invite.
- GET /api/team-invites — received/sent invites.
- POST /api/team-invites/:id/respond — accept/decline.
- POST /api/players/:id/block and DELETE /api/players/:id/block.
- POST /api/players/:id/report.

### Squads
- POST /api/squads, GET /api/squads/:id, PATCH /api/squads/:id.
- POST /api/squads/:id/invites, POST /api/squads/:id/join.
- DELETE /api/squads/:id/members/:userId (owner/captain authorization rules).
- GET /api/squads/:id/dna.
- POST /api/squads/:id/sessions.
- POST /api/squad-sessions/:id/checkins.

Every route needs ownership/membership authorization, schema validation, rate limits, safe error messages, and audit events for moderation-sensitive actions. Never trust a user ID supplied in a request body when identity is available from the verified session.

## 7. MVP scope

### Include
- opt-in Cyber DNA profile;
- ranked/role/hero-pool/goal/availability filters;
- explainable candidate list;
- structured invitation with accept/decline;
- create a persistent duo/trio/five-stack squad;
- squad roster and role coverage;
- basic Squad DNA dimensions;
- block/report and profile visibility controls;
- age-cohort eligibility gate and privacy-safe profile preview;
- moderation queue sufficient for a closed beta;
- account/profile deletion and data retention controls.

### Explicitly defer
- open direct messages and voice rooms;
- public global feed;
- location-based matching;
- public game IDs, phone numbers, email addresses, or external handles;
- automatic MLBB account linking or match telemetry unless an authorized integration exists;
- AI-generated personality labels;
- paid discovery boosts;
- public individual performance rankings;
- complex clan wars/tournaments.

For the first beta, use structured invitations and safe in-app status updates rather than free-form chat. Add messaging only after moderation, reporting, blocking, retention, and age-safety controls have been tested.

## 8. Security, privacy, and safety requirements

- Make discoverability off by default.
- Do not show email, exact age, birthday, precise location, private game ID, or external contact details in candidate APIs.
- Age-cohort policy is a hard gate. Do not match adults with minors; if age cannot be handled safely and lawfully, disable social discovery for that account until policy is resolved.
- No public profile field for phone, Discord, Telegram, Instagram, or other external contact details.
- Provide block, report, leave squad, mute/disable discovery, and delete account/profile.
- Rate-limit discovery, invites, reports, and profile edits; prevent invite spam.
- Escape all user-generated text; limit lengths and supported formatting.
- Use generic public error responses; do not reveal whether an email/account exists.
- Keep moderation evidence access-controlled with a documented retention period.
- Review token storage and XSS exposure before launch.
- Add abuse tests, authorization tests, and migration rollback/backup checks.
- Do not launch public social features on ephemeral preview storage. Production requires persistent storage, backups, monitoring, and an operational moderation process.

## 9. Retention loop

1. Complete Cyber DNA.
2. Discover compatible players.
3. Accept invitations.
4. Form a stable squad.
5. Plan a session.
6. Play together in MLBB.
7. Complete an optional squad check-in.
8. See a private, constructive Squad DNA insight.
9. Improve the roster/roles and schedule.
10. Return for the next session.

Use opt-in reminders and weekly team goals, not manipulative streak pressure. Cosmetic achievements may recognize teamwork and consistency; they must not confer in-game advantage.

## 10. Monetization boundary

Keep team formation and basic profile discovery free during validation. Later test a modest subscription for deeper private Squad DNA history, saved team compositions and draft presets, advanced team training plans, expanded personal analytics, and profile customization.

Never charge for safety controls, blocking/reporting, account deletion, or basic fair access to discovery. Do not sell user profile data or private team feedback.

## 11. Success metrics

Measure:
- profile completion and opt-in rate;
- eligible candidate impressions to invitation rate;
- invitation acceptance rate;
- time to first accepted teammate;
- squads formed and squads active after 7/28 days;
- planned sessions completed;
- optional check-in participation;
- block/report rates and moderation response time;
- user-reported usefulness of compatibility explanations.

North-star metric for the social module: **weekly active squads that complete at least one planned session**, accompanied by safety metrics. Do not optimize retention while ignoring reports, blocks, or user comfort.

## 12. Definition of done

A social MVP is not done when cards render. It is done only when:
- migrations work on a clean and existing database;
- API authorization and validation tests pass;
- block and age-cohort filters cannot be bypassed;
- public responses contain no private fields;
- invitation state transitions are tested;
- squad membership permissions are tested;
- profile deletion and data retention are verified;
- moderation/report workflows are operational;
- PWA screens are usable on iPhone Safari;
- production storage and backups are configured;
- a closed beta has validated actual team formation and repeat sessions.
