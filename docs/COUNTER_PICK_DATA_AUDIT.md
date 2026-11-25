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
