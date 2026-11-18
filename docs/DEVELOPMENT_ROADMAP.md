MLBB Cyber Assistant — Development Roadmap

This roadmap describes the next implementation stages. The project is an independent fan-made assistant and does not claim access to official Moonton APIs or live ranked statistics.

Priorities

1. Improve draft analysis so the selected hero, allies, enemy composition, and lane all influence recommendations.
2. Replace generic counter-build output with hero-aware, threat-aware item recommendations based on the local item catalogue.
3. Expand and validate the hero, item, emblem, talent, and battle-spell data. Keep patch-sensitive values clearly labelled and easy to update.
4. Improve screenshot assistance with confidence-aware OCR and manual confirmation; do not silently treat OCR guesses as confirmed picks.
5. Make persistence reliable in production. Render’s ephemeral filesystem must not be treated as durable storage; configure a persistent database before relying on user accounts.
6. Add automated tests for API validation, draft analysis, authentication, and core UI flows.
7. Harden production security: restrict CORS to configured origins, add focused authentication rate limits, review token storage, and validate uploaded files.

Working rules

* Never invent live win rates, pick rates, or patch statistics.
* Explain why a recommendation is made and identify uncertainty.
* Keep the app usable on mobile Safari.
* Prefer small, testable changes over large rewrites.
* Verify health and key flows after each deployment.

Current known limitations

* Draft analysis is mostly tag-based and does not meaningfully use allies or the selected hero.
* Counter-build recommendations are mostly static lane templates.
* The hero and item catalogues are starter samples, not a complete current-patch database.
* Browser OCR is text recognition, not reliable visual hero identification.
* SQLite stored on an ephemeral Render filesystem can be lost on restart or redeploy.
* There is no automated test suite yet.
