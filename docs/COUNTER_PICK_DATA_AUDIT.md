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

The current MLBB.io matchup tables are aggregated ranked statistical signals. They are not a complete lane-vs-lane dataset and do not by themselves prove that a hero is a direct counter in a specific lane, rank bracket, draft order, or team composition. Professional tournament/VOD evidence remains a separate research track. The recommendation engine therefore treats these records as evidence for ranking candidates, not as guarantees.

## Automated checks

`server/counter-pick-data-audit.js` exposes the current coverage metrics. Regression tests assert catalogue/profile completeness, matchup reference integrity, provenance coverage, the 16 newly sourced matchup records, lane filtering, full-catalogue candidate selection, and the three-option minimum.

## Scenario matrix validation

On 2026-11-24, the automated scenario matrix exercised every one of the 133 catalogue heroes as an enemy against each of the five selectable lanes: 665 single-enemy scenarios. Every case resolved the enemy profile and returned exactly three candidates, all on the selected lane, excluding the enemy and carrying explanation/provenance.

Five additional multi-enemy scenarios covered 3- and 5-hero enemy drafts with allied picks present.

The scoring model was then tightened:
- Direct ranked matchup evidence is the primary scoring signal.
- Allied synergy and general composition-fit bonuses are combined and capped at +2 total, so they cannot accumulate across allies and overwhelm matchup evidence.
- Direct matchup candidates win score ties against secondary-only options.
- A candidate with both positive and negative matchup signals is labelled `mixed-matchup`, not as an unqualified direct counter; the report exposes both the advantage and risk.
- A scenario-matrix regression test searches the actual profile data for a returned candidate with simultaneous positive and negative signals.

The matrix is automated regression coverage, not a claim that 665 picks were independently validated against match outcome data. The latter requires lane-specific ranked samples or reviewed match/VOD evidence.



## Extended quality regression — 2026-11-25

The draft test suite now also includes:

- A live-patch lane-eligibility smoke test for the top-three heroes listed per lane in MLBBDex's November 24, 2026 report for Original Server patch 2.2.23. This checks that the current high-performing lane options are represented in the tactical catalogue and assigned to the corresponding lane. It does **not** force meta picks into counter-pick recommendations.
- A ranked-evidence stress case: a +4.2 percentage-point ranked matchup signal is checked against capped synergy and generic composition bonuses. The source does not publish pair sample sizes and does not scope these pair signals to a lane.
- An input-order invariance check: reversing enemy and ally selection order must not change the ranked candidate order, scores, matchup labels, or sorted positive/negative matchup signals.

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
