# Counter-pick data audit — 2026-11-24

## Current coverage

- Hero catalogue: 133 entries.
- Tactical profiles: 133 entries; no missing or out-of-catalogue profile IDs.
- Required combat fields: complete for all 133 profiles.
- Strong matchup links: 456.
- Weak matchup links: 488.
- Unique matchup target IDs: 130; every target resolves to a known tactical profile.
- Matchup provenance:
  - 82 profiles have a structured `matchupEvidence` record.
  - 35 profiles have `matchupsReviewedAt` and `matchupsMethod`.
  - 16 profiles were missing explicit matchup provenance before this audit; all 16 now have a dated source record.
- Legacy draft candidate array: 32 heroes. Draft recommendations now use all 133 tactical profiles instead.

## Final 16 records checked

The following profile matchup arrays were checked against the MLBB.io ranked matchup tables on 2026-11-24 and given explicit evidence metadata:

`saber`, `lesley`, `lolita`, `luo-yi`, `lylia`, `martis`, `aamon`, `alice`, `angela`, `odette`, `phoveus`, `popol-and-kupa`, `ruby`, `selena`, `silvanna`, `sora`.

Three stale third-place entries were corrected to match the latest available ranked table:
- Lolita: Bane → Harley.
- Ruby: Argus → Joy.
- Sora: Roger → Guinevere.

Source pages:
- https://mlbb.io/en/hero/saber
- https://mlbb.io/en/hero/lesley
- https://mlbb.io/en/hero/lolita
- https://mlbb.io/en/hero/luo-yi
- https://mlbb.io/en/hero/lylia
- https://mlbb.io/en/hero/martis
- https://mlbb.io/en/hero/aamon
- https://mlbb.io/en/hero/alice
- https://mlbb.io/en/hero/angela
- https://mlbb.io/en/hero/odette
- https://mlbb.io/en/hero/phoveus
- https://mlbb.io/en/hero/popol-and-kupa
- https://mlbb.io/en/hero/ruby
- https://mlbb.io/en/hero/selena
- https://mlbb.io/en/hero/silvanna
- https://mlbb.io/en/hero/sora

## Recommendation engine changes

- Candidate filtering is based on the selected lane in the full tactical profile catalogue.
- The engine compares the candidate's `strongAgainst` links with each enemy's `weakAgainst` links, and also checks the reverse negative matchup signals.
- It considers the candidate's recorded synergies with already selected allies.
- It adds only small, explicitly situational composition-fit signals from structured combat fields.
- It returns three candidates whenever the selected lane has at least three eligible heroes and the enemy composition is non-empty.
- If no direct statistical matchup exists, the candidate is labelled as a situational alternative or team-synergy pick; the engine does not fabricate a direct counter.
- The report no longer displays an unexplained numeric score. It shows matchup signals, risk signals, source date, and an explicit warning that ranked statistics are not a guaranteed win or lane-specific proof.

## Important limits

The current MLBB.io matchup tables are aggregated statistical signals. They are not a complete lane-vs-lane dataset and do not by themselves prove that a hero is a direct counter in a specific lane, rank bracket, draft order, or team composition. Reviewed local profile links derived from this evidence remain available to the counter-pick model; the separate user-selected, rank-filtered Rone Arena aggregates are retained as supplemental context only and do not affect scores, ordering, or counter-item recommendations. Professional tournament/VOD evidence remains a separate research track.

## Automated checks

`server/counter-pick-data-audit.js` exposes the current coverage metrics. Regression tests assert catalogue/profile completeness, matchup reference integrity, provenance coverage, the 16 newly sourced matchup records, lane filtering, full-catalogue candidate selection, and the three-option minimum.

## Scenario matrix validation

On 2026-11-24, the automated scenario matrix exercised every one of the 133 catalogue heroes as an enemy against each of the five selectable lanes: 665 single-enemy scenarios. Every case resolved the enemy profile and returned exactly three candidates, all on the selected lane, excluding the enemy and carrying explanation/provenance.

Five additional multi-enemy scenarios covered 3- and 5-hero enemy drafts with allied picks present.

The scoring model was then tightened:
- Local reviewed matchup evidence remains a counter-pick scoring signal; rank-scoped aggregates are displayed separately and are not a scoring signal.
- Allied synergy and general composition-fit bonuses are combined and capped at +2 total, so they cannot accumulate across allies and overwhelm matchup evidence.
- Direct matchup candidates win score ties against secondary-only options.
- A candidate with both positive and negative matchup signals is labelled `mixed-matchup`, not as an unqualified direct counter; the report exposes both the advantage and risk.
- A scenario-matrix regression test searches the actual profile data for a returned candidate with simultaneous positive and negative signals.

The matrix is automated regression coverage, not a claim that 665 picks were independently validated against match outcome data. The latter requires lane-specific ranked samples or reviewed match/VOD evidence.



## Extended quality regression — 2026-11-25

The draft test suite now also includes:

- A live-patch lane-eligibility smoke test for the top-three heroes listed per lane in MLBBDex's November 24, 2026 report for Original Server patch 2.2.23. This checks that the current high-performing lane options are represented in the tactical catalogue and assigned to the corresponding lane. It does **not** force meta picks into counter-pick recommendations.
- A rank-isolation regression: a +4.2 percentage-point Rone Arena aggregate is retained as visible evidence but must not change candidate scores, order, local matchup labels, or counter-item recommendations. The source does not publish pair sample sizes and does not scope these pair signals to a lane.
- An input-order invariance check: reversing enemy and ally selection order must not change counter-pick candidate order, scores, matchup labels, or sorted positive/negative matchup signals.

Live-patch lane snapshot source: https://mlbbdex.com/en/meta (updated 2026-11-24, patch 2.2.23). The report lists Gold Lane: Obsidia, Hanabi, Bruno; Jungle: Hirara, Sun, Saber; Mid: Eudora, Valir, Xavier; EXP: Masha, Sun, Gloo; Roam: Marcel, Belerick, Estes.

These checks strengthen catalogue and ranking invariants. They still do not substitute for expert-reviewed draft outcomes, lane-specific matchup samples, or labelled match/VOD data.


## Five-enemy measured-matchup fixtures — 2026-11-25

Added a regression set using three measured matchup examples displayed in the Patch 2.2.23 MLBBHub matchup matrix:

- Lolita over Cyclops: +9.2 percentage points.
- X.Borg over Terizla: +4.2 percentage points.
- Valir over Fredrinn: +4.1 percentage points.

Each example is injected into a five-enemy draft containing Cyclops, Fredrinn, Terizla, Wanwan, and Belerick. The test verifies that the corresponding candidate remains in the top three for its selected lane, the measured pair remains visible in the recommendation evidence, and occupied enemy picks are never recommended.

Source: https://mlbbhub.com/matchups (Patch 2.2.23 snapshot, accessed 2026-11-25). The page attributes measured edges to Moonton GMS, but does not specify the rank bracket or measurement window, and does not publish pair sample sizes or lane-specific scope. The fixture deliberately leaves rank/window unspecified rather than inferring them from a different provider. It is a regression input for evidence handling, not independent verification of match outcomes or a claim that the listed candidate is always the best full-draft choice.


## Full-draft cross-check against the live matchup matrix — 2026-11-25

The 12 most decisive measured pairings shown in MLBBHub's Patch 2.2.23 Matchup Matrix were compared against the local tactical profile links:

| Candidate | Opponent | Measured edge |
|---|---|---:|
| Lolita | Cyclops | +9.2 pp |
| Phoveus | Wanwan | +6.5 pp |
| Esmeralda | Lolita | +6.2 pp |
| Lolita | Harley | +4.7 pp |
| Natalia | Xavier | +4.6 pp |
| X.Borg | Terizla | +4.2 pp |
| Valir | Fredrinn | +4.1 pp |
| Phoveus | Freya | +4.1 pp |
| Estes | Alice | +3.8 pp |
| Valir | Balmond | +3.6 pp |
| Ruby | Sun | +3.5 pp |
| Xavier | Belerick | +3.4 pp |

All 12 directional edges are represented by the local static matchup links in at least one direction. A new regression test places each target into a five-enemy draft with four additional opponents and checks that the measured-edge candidate remains in the top three for its lane, all three recommendations stay lane-eligible, and no occupied enemy is recommended.

Important distinction: the matrix's measured percentage-point edge is not copied into the local static score. The local profiles retain directional matchup evidence only; the exact pp values remain source-snapshot metadata. These are 12 notable examples selected by the source page, not a random or exhaustive sample of all 1,942 measured edges. Their presence in the local profiles is not independent confirmation because profile research may use the same upstream reference.

Source: https://mlbbhub.com/matchups, Patch 2.2.23 snapshot accessed 2026-11-25. The source says measured edges come from Moonton's GMS ranked statistics, and distinguishes them from direction-only in-game counter lists.


### Observed top-three placement in the five-enemy regression

The fixed regression roster uses each target hero plus Tigreal, Nana, Miya and Nolan (excluding a duplicate target). Current local-engine placement:

| Measured edge | Candidate position | Other top-three picks |
|---|---:|---|
| Lolita > Cyclops | 3 | Belerick, Kусака |
| Phoveus > Wanwan | 3 | Alice, Kусака |
| Esmeralda > Lolita | Outside top 3 | Alice, Hylos, Gloo |
| Lolita > Harley | Outside top 3 | Akai, Gloo, Belerick |
| Natalia > Xavier | 1 | Akai, Helcurt |
| X.Borg > Terizla | 1 | Alice, Kусака |
| Valir > Fredrinn | 1 | Gord, Zetian |
| Phoveus > Freya | Outside top 3 | Alice, Kусака, Minsitthar |
| Estes > Alice | Outside top 3 | Angela, Belerick, Kусака |
| Valir > Balmond | 2 | Zetian, Aurora |
| Ruby > Sun | Outside top 3 | Alice, Hylos, Alucard |
| Xavier > Belerick | 1 | Zetian, Aurora |

Seven of twelve candidates make the top three in this fixed five-enemy fixture. Five are displaced by other candidates with multiple positive matchup links or stronger total fit against the selected roster. These five are review cases, not automatically algorithm defects: a full-draft recommendation should account for all five opponents rather than maximize one isolated edge.

The regression locks the observed candidate positions so later scoring changes cannot silently alter this reviewed comparison. It checks reproducibility of current ranking behaviour, not match outcome accuracy. The roster is intentionally fixed and is not a representative random sample of ranked drafts.


## MLBBHub source/API feasibility review — 2026-11-25

### What is publicly documented

The public Matchup Matrix page exposes a Patch 2.2.23 snapshot with 133 heroes, 1,942 measured edges and 950 direction-only flagged counters. It provides Hero Lookup and Full Matrix views, plus Lane and Role filters. Its own methodology distinguishes:
- **Measured edge (pp):** the difference in matchup outcome attributed to the row hero, expressed in percentage points; it is not the hero's absolute win rate.
- **Direction-only counter:** a relationship from Moonton's in-game counter data, with no numeric effect size.
- **No flagged counter:** neither source supports a claim for that pair.

The site's About page says ranked matchup data comes from Moonton's GMS data, while counter lists come from in-game hero data. It says the matchup/counter tools refresh on Mondays and Fridays; the broad ranked hero-stat tables refresh daily. Therefore a page snapshot must retain its own observed timestamp and displayed patch rather than assuming daily matchup refresh.

Primary references:
- https://mlbbhub.com/matchups
- https://mlbbhub.com/about

### API finding and integration decision

As of this review, the public pages and indexed documentation disclose no supported MLBBHub developer API, OpenAPI schema, public endpoint contract, authentication policy, rate limits, versioning policy, or machine-readable data export for the matchup matrix. The public page is usable interactively, but that alone does not establish a stable integration interface.

This is **not proof that no private or undocumented endpoint exists**. It means no endpoint was sufficiently documented or contractually supportable from the public evidence reviewed. The page's frontend implementation was not treated as an API contract. No HTML scraping, guessed JSON endpoint, or undocumented browser-internal request was added to the production recommendation path.

**Decision: do not connect MLBBHub to runtime recommendations yet.** Keep the existing Rone Arena adapter unchanged. It is preferable to show the current local/profile evidence with clear provenance than silently couple draft recommendations to a brittle page implementation.

### Lane filter: important unresolved semantics

The Matchup Matrix UI has a Lane filter, and its FAQ describes using it to focus on fights relevant to the lane. However, the public explanation does not define the exact aggregation semantics:
- whether a matchup edge is calculated only from games where both heroes occupied the selected lane;
- whether the filter merely limits the displayed hero pool using each hero's lane metadata;
- how flex picks and dual-role heroes are assigned;
- whether both sides must share the selected lane or only the row hero;
- whether the underlying GMS matchup sample and time window change with the filter.

Until these details and the underlying response schema are confirmed, the lane selector must not be interpreted as proof that a numeric edge is lane-scoped.

### Required contract before any future adapter is enabled

A supported feed or explicit maintainer confirmation must provide, at minimum:
1. Stable hero identifiers for both sides, with a versioned mapping to this repository's 133 hero IDs.
2. Patch/version and source observation/update timestamp.
3. Evidence kind: measured edge versus direction-only counter list.
4. For measured edges: exact pp semantics, population/rank scope, measurement window, and pair sample size or an explicit statement that it is unavailable.
5. Lane-scope semantics and role/flex handling; unknown lane scope must remain `null`, never inferred.
6. Pagination/completeness guarantees for the full matrix, including explicit representation of missing/unmeasured pairs.
7. Documented access policy, rate limits, caching expectations, and a stable schema/version or change notice.
8. A fail-open adapter: source outage, schema drift, stale patch, or incomplete response must fall back to local evidence and visibly mark MLBBHub data unavailable/stale.

Suggested normalized evidence shape:

```js
{
  source: "MLBBHub",
  sourceUrl: "https://mlbbhub.com/matchups",
  observedAt: "ISO-8601",
  patch: "2.2.23",
  candidateId: "lolita",
  opponentId: "cyclops",
  evidenceKind: "measured-ranked-pair", // or "direction-only-counter"
  advantagePp: 9.2,                    // null for direction-only
  lane: null,                           // until lane scope is explicitly proven
  rankBracket: null,
  windowDays: null,
  sampleSize: null,
  confidence: "source-reported"
}
```

No missing rank, window, lane, or sample metadata should be filled from another provider or guessed from the page controls. A direction-only edge must never be assigned an invented pp value.

### Current conclusion

MLBBHub is a useful **manual QA/reference surface** and its public matrix supports stronger source-aware review than a bare counter list. It is not yet a verified machine integration target. The next safe step is to request the maintainer's supported data interface and clarify lane-filter semantics. If that is not available, use explicitly dated, reviewed snapshots for offline QA only; do not scrape the page into the live engine.


## MLBBDex public API feasibility review — 2026-11-25

### Confirmed public contract

MLBBDex documents a public JSON API at `https://mlbbdex.com/api/v1`, with no API key or registration. Its API documentation explicitly requires source attribution from each response. The documented endpoints relevant to draft analysis are:

- `GET /heroes/{slug}/counters`: measured counter relationships, grouped by rank.
- `GET /heroes/{slug}/builds`: observed builds grouped by position and rank.
- `GET /heroes?lane={Gold|Jungle|Mid|Exp|Roam}`: hero catalogue filtered by lane.
- `GET /heroes?role={Tank|Fighter|Assassin|Mage|Marksman|Support}`: catalogue filtered by role.

The live Argus counter response was inspected. Its `data` object has rank keys `all`, `epic`, `legend`, `mythic`, `honor`, and `glory`. Each rank has `strong`, `weak`, and `winRate`; each strong/weak entry contains a hero `slug` and signed `advantage`. The example returned six strong and six weak entries per rank. The response also includes a `source` object with name, URL, and license.

The live Argus builds response groups builds by position (the example includes `Exp`) and rank. Each build includes item names, emblem, talents, spell, win rate, and pick rate. This is materially more useful for lane-specific build research than the current generic counter-build heuristic, but it is not matchup evidence.

### Source lineage and independence

The API documentation says its ranked win/pick/ban rates and counterpicks are obtained through the community Rone Arena API. The repository's existing runtime ranked-matchup adapter also calls Rone Arena directly.

Therefore MLBBDex counters and the current Rone adapter are **not independent statistical sources**. MLBBDex is a useful alternate normalized representation and a documented public endpoint, but adding its counter values on top of Rone values would double-count substantially overlapping upstream evidence. It must not be presented as a second independent confirmation.

The public API docs state that data is synchronized weekly; the documentation snapshot inspected on 2026-11-25 reported its last sync as 2026-11-20. The counters endpoint itself does not expose a per-pair sample size or a clearly specified observation window in the inspected response. Preserve these fields as unknown rather than borrowing Rone's 15-day request setting.

### Lane scope: what is and is not supported

The hero-list endpoint supports a lane filter. The builds endpoint is explicitly grouped by position and rank. The counters endpoint, however, is documented and observed as grouped by rank only; no lane key or lane query parameter was present in the public contract or inspected response.

Consequently:
- MLBBDex provides **rank-scoped matchup values**, not verified lane-scoped matchup values.
- Lane-filtered hero eligibility must not be confused with lane-filtered matchup outcomes.
- Position-specific builds can be considered for build recommendations, but the observed build win/pick rates must retain their position and rank labels.
- Do not infer a lane for a counter edge from either hero's preferred lane.

### Attribution and reuse

The API docs state that source data from Mobile Legends Wiki/Fandom is under CC BY-SA and that the API's `source` object must be attributed. The API docs separately identify site-authored analysis/build/counter content as MIT. Before persisting or redistributing fields, the adapter must retain the per-response `source` metadata and distinguish upstream wiki-derived fields from site-authored fields. This is an attribution/data-lineage requirement, not merely a UI credit.

### Integration decision

Do not add MLBBDex counter values to the live ranking score while the Rone Arena adapter is active: that would duplicate upstream data and still would not solve lane-specific matchup evidence.

A future MLBBDex adapter is justified for two narrower purposes:
1. **Offline contract/consistency QA:** normalize its rank-scoped counter response and compare it against the Rone adapter without adding both signals to one score. A disagreement should be surfaced for review, not averaged.
2. **Position-specific build research:** evaluate `/heroes/{slug}/builds` as a separate data track for lane + rank builds, with item/emblem/talent/spell name mapping, patch freshness, and attribution. Do not replace the contextual counter-build logic until coverage and mapping are audited.

Required metadata for any imported counter edge: source, source URL, retrieval time, source sync date if known, rank bracket, patch if explicitly provided, advantage semantics, lane=null, windowDays=null, sampleSize=null, and upstream lineage=`Rone Arena` where reported. Missing metadata remains null.

### References inspected

- Public API contract: https://mlbbdex.com/ru/api-doc
- Live counter response: https://mlbbdex.com/api/v1/heroes/argus/counters
- Live position/rank build response: https://mlbbdex.com/api/v1/heroes/argus/builds
- API documentation states weekly synchronization and last sync 2026-11-20 as of this review.

## MLBBDex observed builds integration — 2026-11-25

The first runtime integration is implemented separately from counter-pick scoring:

- server/mlbbdex-adapter.js fetches /api/v1/heroes/{slug}/builds on demand and caches each hero response for six hours.
- GET /api/hero-builds/:id exposes normalized build data to the encyclopedia. The UI offers position and rank selectors and renders the source's build order without re-ranking the records.
- Position keys are normalized for EXP, Jungle, Mid, Gold and Roam. Rank keys are normalized for all, Epic, Legend, Mythic, Honor and Glory.
- Item, emblem and talent names are matched against the local catalog by English source name. Unmatched entries retain the exact source label and are visibly flagged; they are not silently substituted.
- The API's win-rate and pick-rate values are displayed as published. Pair/build sample sizes are not supplied by the inspected response, so no sample size, confidence interval or reliability score is invented.
- The adapter preserves the response attribution object and links the MLBBDex methodology. MLBBDex says its ranked builds are aggregated through arena.rone.dev; they are not an independent source from the existing Rone ranked adapter.
- The encyclopedia's observed build panel is explicitly a statistical snapshot of what is played, not an automatic claim that the first build is optimal for every draft. Contextual counter-build recommendations remain a separate layer.

The live Argus response was used as the contract fixture: the Exp position contains rank keys all, epic, legend, mythic, honor and glory; each build carries an item-name array, emblem, three talents, spell, winRate and pickRate. The endpoint may return three or four core items depending on the record, so the UI preserves the full list rather than truncating it to three.

**Coverage limitation:** this is an on-demand integration, not yet a completed 133-hero coverage audit. Position/rank availability and item-name mapping still need to be measured across the full roster before the project can claim complete build coverage. No Render deployment has been performed as part of this change.

## Full MLBBDex ranked-build coverage audit — 2026-11-25

A rate-limited sequential audit completed successfully against the full source roster. It matched the local neutral reference roster to the source's 133 heroes by English name and fetched every hero-build endpoint without failures.

| Measure | Result |
|---|---:|
| Local reference heroes | 133 |
| Source heroes | 133 |
| Successful build endpoints | 133 / 133 |
| Heroes with at least one returned build | 133 / 133 |
| Build records across positions and ranks | 2,913 |
| Item entries matched to the local item catalog | 8,788 / 8,788 (100%) |
| Emblem entries matched to the local emblem catalog | 2,762 / 2,913 (94.82%) |
| Talent entries matched to the local talent catalog | 8,739 / 8,739 (100%) |

Position coverage (heroes with at least one build / build records): EXP 42 / 741; Jungle 37 / 666; Mid 29 / 522; Gold 21 / 378; Roam 34 / 606. These are position-specific coverage counts; heroes can occur in more than one position.

Rank coverage (heroes with at least one build / build records): All 133 / 489; Epic 133 / 486; Legend 132 / 483; Mythic 133 / 486; Honor 133 / 486; Glory 132 / 483. The API does not return a build for every hero in every rank/position combination, so do not infer universal lane/rank availability from roster-wide endpoint coverage.

All item names and all talent names were mapped. The only unmatched emblem label in the audit was the generic source value "All" (151 records). It is deliberately not mapped to Basic Common: the source does not establish that "All" means that specific emblem. The UI preserves the source label and flags it as unmatched until the semantics can be verified.

The audit ran sequentially with a delay between hero requests after an initial concurrent pass encountered HTTP 429 responses. The full sequential pass succeeded with 133/133 endpoints. The repeatable audit is available as npm run audit:builds; its detailed JSON report is archived as a GitHub Actions artifact for run 45590688091.

**Interpretation:** the source has broad roster coverage and excellent item/talent name compatibility, but availability is not uniform by position/rank and emblem semantics still have one unresolved label. The endpoint returns observed builds and rates, not sample sizes or proof that a build is optimal. MLBBDex attributes ranked build statistics to arena.rone.dev, so these records are not an independent confirmation of the existing Rone-derived ranked evidence.

## Draft Assistant and Build Engine use of observed builds — 2026-11-25

The observed-build feed is now connected to both build workflows:

- In the Draft Assistant, selecting a personal hero adds a server-side MLBBDex build lookup in parallel with ranked matchup retrieval. The server selects the build for the requested draft lane and rank. If that exact rank has no build but the same lane has an all-ranks record, it explicitly labels the fallback. It never substitutes another lane.
- The report displays up to three source build variants with their source item order, emblem, talents, spell, published WR and pick rate. Unknown catalog labels remain visible and are marked as unmatched.
- The standalone Build Engine now lets the user choose a hero, position and rank. It displays the source's first returned build as the statistical baseline, then shows separate situational item additions from the existing archetype/threat-tag heuristic, excluding items already in the baseline.
- The observed baseline and situational suggestions are deliberately separate. The heuristic does not rewrite the source build order or claim to be a measured win-rate improvement.
- If no personal hero is selected, the Draft Assistant reports that no statistical baseline can be attached. If the selected position is absent, it reports that absence rather than silently borrowing a different lane.
- The source lookup is cached server-side for six hours; the API response is additionally cached by the browser/server response headers. Ranked source calls are not made for every enemy individually.

The pure lane/rank selection behavior is covered by tests: exact lane+rank selection, explicit all-ranks fallback, no cross-lane substitution, and unavailable-source handling. The full-roster audit remains a separate manual/weekly workflow so the 133-endpoint crawl does not run on every code commit.


## Follow-up verification: build compatibility and threat classification — 2026-11-25

The counter-build audit found that part of the draft item logic inferred damage type from hero class. That is unsafe for MLBB: an Assassin or Fighter can deal magic damage, and a Mage can deal physical damage. Draft counter-build eligibility, enemy damage counts, defensive boot explanations and damage-target matching now use the structured `combat.damage` profile (or an explicit physical/magic tag when the profile value is absent). Unknown damage remains unknown; the engine no longer guesses from class.

The same pass corrected burst-threat handling so both `high` and `very_high` burst profiles can trigger survival recommendations. Penetration recommendations are restricted to explicit physical-armour evidence; Tank class and general durability are not treated as proof of high physical defence.

Build-feed validation also exposed three battle spells that were present in MLBBDex build records but absent from the local spell list: Petrify, Aegis and Vengeance. The local Russian spell catalog now includes Окаменение, Щит and Месть, and adapter tests cover their mappings. The full-roster audit now measures spell mapping coverage alongside items, emblems and talents; the exact roster-wide spell totals are intentionally not stated until the next full audit run completes.

The automated CI workflow now syntax-checks the scheduled full-roster audit script. Its live API crawl remains manual/weekly and paced sequentially to avoid the HTTP 429 rate limiting observed during concurrent requests.


## Rank evidence isolation and counter-build audit follow-up — 2026-11-25

A code review found that rank-filtered Rone Arena matchup values were being added to counter-pick scores. The ranked branch also skipped the local profile matchup check for the same enemy/candidate pair. This coupled two distinct evidence sources and allowed rank selection to change the recommendation order or suppress local matchup evidence.

The current implementation separates them:
- Local profile matchup links remain the evidence used by the counter-pick score.
- Rank-filtered Rone Arena values are retained in each returned candidate's `profileEvidence.rankedMatchups` for transparency only. They do not add or subtract score, change `matchedEnemies` / `riskyEnemies`, set a counter verdict, or affect sorting.
- Local matchup evidence is evaluated independently even when a ranked aggregate exists for the same pair.
- Rank selection still filters the observed MLBBDex build by the selected lane and rank. It does not change the mechanical counter-item rules.
- Counter-items continue to use the selected hero's explicit damage profile and the enemy's explicit damage, burst, sustain, attack-speed, control and durability evidence. Hero class alone is not used to infer physical or magic damage.
- The report explicitly says ranked aggregates are not lane-specific and do not affect counter-pick ranking. Rank labels for Honor and Glory are mapped to their correct Russian names.

Regression tests compare candidate order, scores and matchup labels with and without ranked evidence, verify that positive/negative rank aggregates remain informational, and retain local matchup evidence when rank aggregates are present. CI on the current branch passed all tests, the live item catalog/artwork audit, scheduled-audit script syntax validation and the production Docker build.

This is a code-level and regression audit. A fresh full 133-hero MLBBDex crawl is still pending; the previously recorded 2,913-build coverage report remains the latest roster-wide audit. No Render deployment was performed.


### Item-effect audit — Attack Speed counters (2026-11-25)

A current-patch review found an obsolete `anti-attack-speed` tag on Dominance Ice. Patch 2.1.30 removed Dominance Ice's Arctic Cold attack-speed reduction and moved that counter effect to Chastise Pauldron; patch 2.2.23 further nerfed Chastise's reduction to 80% of normal. The local Dominance Ice passive description was already updated to Fortress Shield + Lifebane, but its tags had not been updated. The stale tag is removed, while its `anti-heal` tag is retained. Chastise Pauldron remains the explicit anti-attack-speed item, and Blade Armor remains a separate response to frequent physical basic attacks.

Sources checked:
- https://liquipedia.net/mobilelegends/Patch_2.1.30
- https://liquipedia.net/mobilelegends/Patch_2.2.23
- https://mlbb.tools/items/chastise-pauldron

A regression now checks that an attack-speed-only enemy triggers Chastise Pauldron and Blade Armor, but not Dominance Ice. Existing sustain tests continue to check Dominance Ice as an anti-heal option.


### Magic-DPS counter validation — 2026-11-25

A second item-tag review found that the draft engine treated every non-burst magic-damage hero as a sustained magic-DPS threat. This incorrectly classified low-DPS magic supports such as Floryn or Estes as Radiant Armor targets. The rule now requires an explicit `combat.dps` value of `high` or `very_high`, an explicit magic damage type, and no high-burst classification. Low/medium/unknown DPS is not promoted to sustained magic DPS by exclusion.

Cursed Helmet's `magic-dps` tag described its own Burning Soul damage-over-time effect, not a defensive counter role. It is now tagged `magic-damage-over-time`; Radiant Armor retains the `magic-dps` counter tag. Tests verify that low-DPS Floryn does not trigger Radiant Armor or Cursed Helmet as counter-items, while high-DPS Valir does trigger Radiant Armor. The attack-speed and anti-heal regressions also remain separate: Chastise Pauldron is the explicit attack-speed counter, while Dominance Ice remains an anti-heal option.

### Follow-up: per-enemy counter-item explanations and attack-speed coverage — 2026-11-25

The counter-item report previously stored an item's reasons globally, then copied the complete reason list to every enemy in that item's target list. When a defensive item had multiple independent effects/eligibility rules, this could attribute one enemy's counter reason to another enemy. The scorer now stores reasons per target hero and the matchup detail uses only that hero's reasons. A mixed-enemy regression verifies that Chastise Pauldron's attack-speed explanation is attached to Miya, not to Leomord, while its physical-defense explanation remains applicable to both.

A separate data-coverage limitation remains open: the current draft-analysis profile builder imports legacy hero tags, and only Miya currently has the explicit `attack-speed` tag in that legacy catalogue. The 133-hero structured profile catalogue has no dedicated attack-speed field or explicit attack-speed mentions. Therefore the Chastise Pauldron / Blade Armor attack-speed trigger is currently narrow and must not be described as complete roster coverage. Do not infer attack-speed dependence from Marksman class alone; the missing hero-specific classifications require patch-checked evidence before they can be added.

The first CI run after the scorer change passed 267/267 tests and the build checks. Adding the dedicated per-enemy regression then exposed that the target-reason map was not yet copied into the final build-detail projection; this was corrected in the follow-up commit. Final CI passed 268/268 tests, audit-script syntax validation, live item catalogue/artwork audit and the production Docker build. No live 133-hero build crawl or Render deployment was performed in this pass.


### Follow-up: physical penetration and basic-attack counter precision — 2026-11-25

A further review found two overly broad recommendation conditions:

- Malefic Roar was recommended against any durable frontline, including a durable Fighter, even when the enemy profile did not confirm high physical defence. General durability is not equivalent to physical armour. The rule now requires an explicit enemy tag identifying physical defence / high physical defence / armour stacking. Until hero-specific armour evidence is curated, the engine intentionally abstains rather than guessing.
- Blade Armor's attack-speed bonus could be attributed to an attack-speed hero without confirming that the hero's basic attacks are physical. The special Blade Armor counter bonus now requires both the attack-speed tag and a confirmed physical damage profile. Chastise Pauldron remains tied to attack-speed dependence because its attack-speed reduction applies to the attacker regardless of damage type.

The Malefic Roar regression now asserts that a durable Leomord profile without explicit physical-armour evidence does not trigger the item. Existing Miya attack-speed tests continue to cover Chastise Pauldron and Blade Armor. These are code-level safeguards; they do not imply that all 133 heroes already have complete attack-speed or physical-defence classifications. CI for these latest commits has not yet been verified in this audit pass.
