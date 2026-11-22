# MLBB Cyber Assistant — Development Roadmap

The project is an independent fan-made MLBB assistant. It does not claim access to official Moonton APIs, live ranked statistics, or verified win rates.

## Current implementation

- PWA shell with manifest, service worker, offline app shell, and cached hero/item catalogue after the first successful online load.
- Registration and login with input validation, bcrypt password hashing, JWT sessions, SQLite profiles, and authentication rate limits.
- Guest draft analysis with strict payload validation and a dedicated request limit. OpenAI explanations are available only to authenticated users when a server-side API key is configured.
- Draft analysis for enemy composition, allied synergy, counter-picks, item recommendations, emblem, battle spell, and general timing guidance.
- Local counter-build recommendations based on the item catalogue, selected archetype, and marked enemy threats.
- Browser-side screenshot OCR with manual confirmation of candidate hero names.
- Player profiles, filters, likes, and mutual matches for accounts on the same deployment.
- Automated tests for draft analysis, draft validation, guest authentication, registration, counter-builds, offline draft restore, and HTML escaping.
- Node.js 22 Docker image and a temporary Render Blueprint for preview deployment.

## Next priorities

1. Deploy the preview and verify the health endpoint, registration, guest draft analysis, and the main UI on iPhone Safari.
2. Check PWA installation, service-worker updates, and offline restoration on a real iPhone; automated tests cannot replace this.
3. Add a persistent production database and backups. The free Render preview uses ephemeral storage and must not be used for durable accounts.
4. Add email verification, password reset, account deletion, abuse reporting, moderation, and privacy/retention policies before a public community launch.
5. Expand and validate hero, item, emblem, talent, and battle-spell data against each MLBB patch. Keep patch-sensitive information dated and sourced.
6. Improve OCR confidence handling and hero recognition; text OCR is not reliable visual hero identification.
7. Review production CORS, token storage, upload handling, rate limits, logging, and operational monitoring.

## Working rules

- Never invent live win rates, pick rates, or patch statistics.
- Explain why a recommendation is made and identify uncertainty.
- Keep the app usable on mobile Safari.
- Prefer small, testable changes over large rewrites.
- Verify health and key flows after every deployment.

## Known limitations

- The catalogue is a starter dataset and can be incomplete or outdated after a game patch.
- Draft and item recommendations are deterministic heuristics unless an authenticated user has enabled the optional AI explanation. Neither mode is live match telemetry.
- OCR uses browser-loaded third-party code and language data; first use requires an internet connection.
- Free preview storage can be erased on restart or redeploy.
- Search and mutual matching only include users registered on the same deployed instance.
- Chat, push notifications, email verification, password reset, moderation, and production-grade account lifecycle controls are not implemented yet.

## Social product direction: Cyber DNA + Squad DNA

The approved social direction is persistent ranked-team formation, not dating. The detailed product/technical architecture and phased MVP acceptance criteria live in:

- [Cyber DNA + Squad DNA architecture](CYBER_DNA_SQUAD_DNA_ARCHITECTURE.md)
- [Cyber DNA + Squad DNA MVP delivery plan](CYBER_DNA_SQUAD_DNA_MVP.md)

These are planning documents. They do not mean the social features are implemented. The existing teammate finder remains a starter implementation until the phases, safety requirements, tests, and production readiness gates are completed.
