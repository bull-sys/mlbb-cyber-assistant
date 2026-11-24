# Ranked matchup evidence research — 2026-11-24

## Decision

The next evidence source for draft ranking is the public ranked matchup data exposed by MLBBDex / Rone Arena and cross-checked against MLBBHub's explanation of the Moonton GMS matchup matrix.

This is a meaningful improvement over the current all-rank hero-level lists, but it must not be described as lane-vs-lane proof.

## Sources inspected

### MLBBDex public API

- API documentation: https://mlbbdex.com/en/api-doc
- Example endpoint: https://mlbbdex.com/api/v1/heroes/argus/counters
- Methodology: https://mlbbdex.com/en/methodology
- Counter matrix: https://mlbbdex.com/en/tools/matchups

The public JSON endpoint returns a per-hero matchup object with:
- `all`, `epic`, `legend`, `mythic`, `honor`, and `glory` rank buckets;
- up to six `strong` and six `weak` matchup entries per bucket;
- an `advantage` value in percentage points;
- the hero's baseline `winRate`;
- a source attribution envelope.

The inspected Argus response confirms that rank buckets can differ. Example values are not copied into production data by this research note.

The API's documented response does **not** include a per-pair sample size, a lane identifier for the matchup pair, or an explicit patch field on each matchup record. The public methodology says ranked counters and statistics are refreshed from the community Rone Arena API; the API is unofficial and community-maintained.

### Rone Arena API

- Counter endpoint documentation: https://arena.rone.dev/web/academy/heroes/{hero_identifier}/counters
- Lane distribution endpoint documentation: https://arena.rone.dev/web/academy/heroes/{hero_identifier}/lane
- Project overview: https://rone.dev/projects/rone-arena-api

The counters endpoint supports rank filters and exposes pair-level impact fields, but its documented counter records do not establish that the pair was measured specifically in the selected lane. The separate lane endpoint describes a hero's lane assignments/distribution; it is not a lane-specific hero-vs-hero matchup table.

### MLBBHub matchup matrix

- Matrix: https://mlbbhub.com/matchups
- Methodology/about: https://mlbbhub.com/about

The matrix describes measured matchup edges from Moonton's GMS statistics and direction-only fallback data from in-game counter lists. It explicitly distinguishes measured percentage-point shifts from unquantified counter-list directions and leaves unmeasured pairs blank.

The site supports lane/role filters for browsing eligible heroes. That filtering must not be interpreted as proof that the underlying pair statistic was collected only from games on that lane.

### MLBB Core matchup and draft methodology

- Matchup pages: https://mlbbcore.com/counters/
- Draft tool: https://mlbbcore.com/draft/

MLBB Core describes its pair-impact source as Moonton's GMS matchup feed, with a 15-day pair window and selectable rank. Its published methodology explicitly says Moonton does not publish per-pair game counts, and that the pair figures are read as team-level signals rather than lane duels because the source does not document lane scope. It also excludes heroes picked in under 0.2% of games from some matchup views due to noise. The lane selector organizes eligible heroes; it does not transform the underlying pair signal into lane-only outcomes.

## Evidence semantics to preserve in the product

A future normalized record should keep these fields separate:

- `opponentId`
- `candidateId`
- `source`
- `sourceUrl`
- `observedAt` — when Cyber Assistant retrieved the source
- `sourceUpdatedAt` — only when the upstream source actually provides it
- `patch` — only when tied to the specific snapshot by the source
- `rankBracket`
- `window` — only when provided by the source
- `lane` — null unless the pair statistic itself is lane-scoped
- `advantagePp` — measured percentage-point shift, never relabelled as win rate
- `baselineWinRate` — only when present in the source response
- `sampleSize` — null when not published
- `direction` — candidate-favourable or opponent-favourable
- `evidenceKind` — measured-ranked-pair, in-game-counter-direction, or mechanics-reviewed
- `confidence` — must account for missing sample size, stale snapshots, and source coverage

Never synthesize a sample size, absolute head-to-head win rate, or lane-specific value from an all-rank/team-level pair signal.

## Recommendation-engine implications

1. Continue to hard-filter candidates by the user's selected lane. This is lane eligibility, not lane-specific matchup evidence.
2. Add rank-specific measured pair evidence as a separate signal when the user rank is known and the data source supports that rank.
3. Label such a signal as a **ranked matchup advantage**, not a **direct lane counter**.
4. Keep matchup risk visible when positive and negative signals coexist.
5. Do not infer a neutral matchup from a missing pair: the official matrix publishes only a subset of pairs.
6. Keep mechanics-based explanations distinct from measured statistical evidence.
7. Do not expose a fabricated win probability or confidence percentage.

## Implemented integration

The branch now contains `server/ranked-matchup-adapter.js`, which:

- reads the Rone Arena ranked hero index to map upstream numeric hero IDs to the local 133-profile catalogue;
- requests each selected enemy's counter records using the chosen rank and a 15-day window;
- normalizes signed `increase_win_rate` values to percentage-point impact;
- preserves source URL, retrieval time, upstream update time when present, rank bracket and window;
- deliberately leaves `lane`, `sampleSize`, and `patch` null because the endpoint does not provide those pair-level fields;
- caches successful upstream responses for 30 minutes and degrades to the existing local matchup catalogue if the source is unavailable.

Draft scoring uses a measured ranked-pair signal in preference to the local profile matchup link for that same candidate/opponent pair, avoiding double-counting. Positive and negative signals remain visible. Ranked advantages and ranked risks have their own labels; mixed positive/negative evidence remains a mixed matchup. Candidate eligibility is still hard-filtered by the user's selected lane, but the ranked pair statistic is not represented as lane-specific.

Rank selection is taken from an explicit supported `rank` in the draft request, otherwise from the authenticated user's saved profile rank, and otherwise defaults to `all`. Supported upstream filters are `all`, `epic`, `legend`, `mythic`, `honor`, and `glory`.

## Current research conclusion

- Rank-specific matchup evidence is now integrated as a separate ranking signal, with a 15-day window and explicit source metadata.
- Pair-level sample sizes are not published by the inspected public interfaces.
- MLBB Core's documented GMS pair data is rank-selectable and uses a 15-day window, but is explicitly treated as a team-level signal, not a lane duel.
- Lane-specific hero-vs-hero outcome evidence was **not** established by these sources.
- Lane-specific hero win/pick rates and lane assignments can support lane-fit/meta context, but cannot replace a lane-scoped matchup sample.
- A genuine lane-specific gold set still requires reviewed match/VOD evidence or a source that explicitly provides pair outcomes filtered by both heroes' lane in the same match.

## Attribution

Any reuse of MLBBDex's public API data must retain its response source attribution and comply with the stated CC BY-SA attribution for wiki-derived material. Rone Arena is an unofficial community API; identify it as an upstream community data provider, not as an official Moonton API. MLBBHub is an independent fan project and should be cited as methodology cross-check, not treated as the upstream data owner.
