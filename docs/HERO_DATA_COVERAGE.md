# Hero Data Coverage — MLBB Cyber Assistant

Last audited: 2026-11-23  
Project reference patch: 2.2.23  
Working branch: assistant/cyber-redesign-2

## Coverage snapshot

| Layer | Coverage | Meaning |
|---|---:|---|
| Working hero catalogue | 133 / 133 | The current project catalogue contains 133 entries with unique IDs. This remains a working roster, not an independently verified official-client snapshot. |
| Neutral reference dataset | 133 / 133 | Every catalogue entry has a local reference record with title, role, lane, specialties, release metadata, region/resource labels, source ratings and base statistics. |
| Role cross-check | 133 / 133 | Every role now matches the pinned reference and the matching MLBB.io page. |
| Primary-lane cross-check | 132 / 133 | 132 entries have a verified primary lane; Badang remains pending because its split-lane record has no settled primary. |
| Extended local profile records | 133 / 133 | All 133 heroes have a structured local profile record. |
| Runtime profile endpoint | 133 / 133 supported by catalogue lookup | The encyclopedia requests the current neutral hero profile from MLBBDex. When that endpoint is unavailable, the new local reference dataset supplies the base passport and statistics. |
| Local Russian lore summaries | 133 / 133 | Every catalogue hero has an original Russian summary based on the pinned CC BY-SA lore dataset, with source revision and attribution retained. |
| Russian skill descriptions | 528 source entries | The pinned Russian skill catalogue has descriptions for 132 heroes; automatic translation quality still requires editorial review. |

## New neutral reference dataset

server/hero-reference-data.js contains a dated snapshot for all 133 working catalogue entries. It is generated from the public MLBBDex game catalogue and matched one-to-one against the project's own hero IDs.

Each record contains:
- English and project-approved Russian display names
- Hero ID and title
- Roles and lanes, with Russian labels
- Specialties, with Russian labels where a verified mapping exists
- Release information, region and resource type
- Source ratings
- Base character statistics supplied by the source

The dataset deliberately excludes authored gameplay analysis and equipment/build content. It is a factual offline fallback, not a recommendation engine.

**Source and attribution:** MLBBDex / Mobile Legends Wiki. The source documentation identifies the underlying community-wiki data as CC BY-SA and reports its latest synchronization as 2026-11-20. Attribution is stored with the local dataset and shown in the encyclopedia. See the [MLBBDex API documentation](https://mlbbdex.com/en/api-doc), [methodology](https://mlbbdex.com/en/methodology), and [source repository](https://github.com/achedon12/mlbb).

## Runtime behavior

- The encyclopedia first requests the current neutral hero profile from MLBBDex.
- Current source fields are merged with the local base-reference snapshot, so a missing optional field does not erase a known base statistic.
- If the external profile endpoint fails, the adapter returns the local record and marks it as a dated fallback.
- The UI distinguishes current source data from fallback data. It does not present the fallback snapshot as live.
- A separate local lore dataset supplies concise Russian summaries for the 31 previously missing extended profiles, including source revision and CC BY-SA attribution. The adapter exposes the same `lore` field to the existing encyclopedia section in both live and offline modes.
- Skill descriptions continue to come from the separate skill-data path. Russian descriptions are machine-translated source text and must remain visibly identified as such. The content audit flagged the literal Helcurt state translation “Бродяга”; this is a localization defect, not an approved Russian term, and must be corrected in a dedicated terminology pass.
- No missing story, statistic, translation or patch note should be filled with a guess.

## Local extended profiles still missing

No catalogue heroes remain without a local extended tactical profile.

## Completion standard for each encyclopedia profile

A profile can be marked complete only when the applicable sections have sourced data and a review date:

1. Identity, English name, approved Russian display name and title.
2. Role, lane and specialties, with source evidence and uncertainty kept explicit.
3. Character background and region, summarized in Russian with source attribution.
4. Base statistics, units, level range and source date.
5. Skill names and factual descriptions from a current source, with translation status visible.
6. Release information and relevant patch-history references.
7. Source links and last-checked date.

A section with no reliable source remains visibly unverified. Machine translation is not described as human-edited or official localization. A source's subjective rating is labelled as that source's rating, not as an objective game value.

## Validation

The new tests check:
- exactly 133 unique neutral reference records;
- one-to-one coverage against all current catalogue IDs;
- required identity, classification and base-stat fields;
- numeric and finite stat values;
- source attribution and snapshot date;
- existing extended profile IDs remain linked to the catalogue.

The official-client roster itself remains marked incomplete until independently checked against an official-client snapshot. Matching a community reference page does not by itself establish an official-client roster snapshot.

## Level-by-level base-stat charts

The encyclopedia now has a second, per-hero source lookup for level growth:

- `server/hero-growth-adapter.js` reads only the **Base stats** table from the independent MLBB.io hero page. It does not import the site's builds, counters, matchup data, or other analysis.
- Supported rows include HP, HP regeneration, mana, mana regeneration, physical attack, physical defense, magic defense, attack speed, movement speed and basic attack range.
- The source's level-1 value, level-15 value and published per-level increment are retained separately. The adapter caches successful results for 12 hours and does not persist a fabricated value when a page or table is unavailable.
- A solid chart is used only when the published increment is consistent with the two endpoint values within a small rounding tolerance. If only endpoints are available, or the increment is inconsistent, the chart uses a dashed line and labels intermediate levels as an estimate. Constant values such as movement speed are displayed as fixed parameters, not as a growth curve.
- If the source cannot be parsed, the UI falls back to the existing MLBBDex values. It shows a dashed endpoint-only estimate when both endpoints exist, or a clear unavailable state when they do not.
- The UI credits the source page and its reported update date. MLBBDex remains the primary reference source for the offline passport and base-stat fallback.

**Important coverage limit:** adding the adapter does not mean that all 133 external pages have already been independently crawled and audited. Coverage is determined per hero at request time. The page parser has fixture tests for numeric parsing, absent growth values, and missing tables; live-page coverage and visual rendering still require a full preview pass.

**Additional source:** [MLBB.io hero database](https://mlbb.io/en/hero/helcurt). It is an independent community resource, not an official Moonton service. Its page identifies official Mobile Legends hero data as its underlying source. Cross-check conflicting values before treating them as confirmed.

## Full 133-hero source audit — 2026-11-23

An automated audit was run against all 133 catalogue entries. The audit script is `scripts/audit-hero-data.mjs`; it checks the local snapshot against the pinned upstream dataset and requests every matching MLBB.io hero page with bounded concurrency. The full machine-readable per-hero report is uploaded by the `Hero data audit` GitHub Actions workflow as the `hero-data-audit` artifact.

### Roster and reference consistency

- 133 / 133 catalogue IDs have a local reference record.
- 133 / 133 local records match the pinned upstream records for title, role, lane, specialties, release metadata, region, resource, ratings and supplied numeric statistics.
- 0 reference-field differences remain after restoring 12 conditional basic-attack-range labels as text rather than dropping them as non-numeric values.
- 133 / 133 MLBB.io hero pages returned HTTP success and yielded a parseable Base stats table in this run.
- Basic attack range is a static reference parameter, not a level-growth series. It is present in the reference snapshot for 92 / 133 heroes; 12 of those values describe multiple forms/states and are retained as text. The other 41 are not published in this snapshot and remain unavailable rather than guessed.

### Live level-growth coverage

| Characteristic | Published per-level growth | Endpoints / single value | No source row |
|---|---:|---:|---:|
| HP | 133 | 0 | 0 |
| HP regeneration | 58 | 75 endpoint estimates | 0 |
| Mana | 81 | 3 | 49 |
| Mana regeneration | 80 | 4 | 49 |
| Physical attack | 132 | 0 | 1 |
| Physical defense | 81 | 52 endpoint estimates | 0 |
| Magic defense | 96 | 37 endpoint estimates | 0 |
| Attack speed | 60 | 73 endpoint estimates | 0 |
| Movement speed | 60 fixed values | 73 single values | 0 |

The one missing physical-attack row is Zetian. Mana and mana-regeneration rows absent from a page are treated as unavailable; the audit does not infer a zero value or assume the hero has no mana. Movement speed is displayed as a static value when the source does not publish a level-15 value. Endpoint estimates are visibly distinguished from published growth.

### Remaining catalogue review

The source-data comparison and stat-page retrieval are complete for this pass, but the whole encyclopedia audit is not complete:

- Identity: 35 source-verified, 2 user-confirmed, 96 still marked pending review.
- English hero headings matched the expected names on 133 / 133 MLBB.io pages.
- Role: 133 / 133 marked verified after matching the pinned reference and MLBB.io page.
- Primary lane: 132 / 133 marked verified; Badang remains pending because its EXP/Roam split is deliberately not collapsed into a single primary lane.
- 13 catalog lane sets contain additional or different flexible-lane assignments compared with the single-lane MLBBDex snapshot: Julian, Atlas, Akai, Alucard, Arlott, Barats, Edith, Guinevere, Harith, Hylos, Valir, Rafaela and Minotaur. These are retained because the catalog has separate multi-source research; they need individual reconciliation rather than automatic deletion.
- At the time of that earlier audit snapshot, 29 heroes still lacked a local extended profile record; the current list is maintained in the section above.
- The current run verifies source availability and table parsing, not in-game values against a fresh client build. Patch-specific confirmation and visual review in the preview app remain separate tasks.

No missing biography, stat, lane, or localization is to be inferred from another hero. The audit artifact records each hero's page status, available rows, source date, chart classification, and catalog-vs-reference role/lane differences.


## Local hero biographies — 2026-11-23

- The offline lore dataset now contains concise Russian paraphrase summaries for all 133 catalogue heroes.
- The 102 newly added entries are based on the pinned French-language lore files in `achedon12/mlbb` revision `92f0fe94e4226ab6057db25711c4d65b3ca12130`; the original 31 entries remain on the same pinned source revision.
- Summaries are original paraphrases, not copied story passages. The encyclopedia now displays source attribution, CC BY-SA license and source-check date beneath each biography.
- All 133 entries are covered by automated tests, including offline fallback and source attribution.
- These are concise editorial summaries, not a complete verbatim reproduction of every in-game lore page. Full canonical text and patch-specific changes should be reviewed against the current game client when available.


## Profile and skill text availability snapshot — 2026-11-23

- The live MLBBDex hero-profile API returned a usable profile for 90 / 133 heroes in the content audit. The other 43 endpoints were unavailable in that run; the local encyclopedia fallback still returns a dated passport and Russian lore summary for all 133 catalogue entries.
- The pinned Russian skill dataset contains 528 skill entries across the 133-hero roster. No entry in this snapshot has an empty description.
- The raw skill source still contains the mistranslated Helcurt state label «Бродяги» in three descriptions. The display normalizer now preserves the source's canonical term «Prowler» for Helcurt instead of showing that misleading translation. The term remains untranslated until a verified official Russian equivalent is found; Moonton's own English hero spotlight uses «Prowler State».
- The audit checks for suspicious wording; it does not certify every machine-translated sentence as publication-quality Russian. A separate editorial pass is still required for names, grammar, terminology and patch-specific accuracy.

## Tactical passport rendering — 2026-11-23

The encyclopedia passport now renders the existing local tactical profile instead of reducing the hero's identity to generic role/specialty labels:

- The first documented mechanic is highlighted as the hero's key distinguishing feature.
- Strengths are shown as reasons to try the hero and as tactical value to consider during draft.
- Weaknesses are shown beside strengths so the selection is not presented as universally good.
- The teamfight plan, target priorities, cautions and item notes are visible in the passport.
- Remaining mechanics are grouped in a collapsible section to keep the mobile layout readable.
- A hero without a local tactical profile is explicitly marked as not yet profiled. The UI does not invent matchups, synergies or counter-picks.
- Profile validation now checks the minimum tactical content, source URLs, patch review date and teamfight guidance for each of the 114 existing profiles.

The same profile evidence is now attached to supported Draft Assistant counter-pick cards: users can inspect the candidate's key mechanic, a documented strength and a caution alongside the existing composition-based reason. This is explanatory evidence, not a new matchup claim. The ranking algorithm still uses the existing local role/tag heuristics; empty matchup and synergy arrays are not treated as confirmed counters. A later scoring pass can use explicit, reviewed draft-fit fields once that dataset is authored.


## Melissa tactical profile — 2026-11-23

- Added a sourced partial tactical profile for Melissa: Doll Buster, Falling!, Eyes on You! and Go Away!, including the Muddles link mechanic and anti-dive spacing.
- Role and Gold Lane are cross-checked against MLBB.io and MLBBHub.
- Matchups and synergies remain empty until supported by a reviewed evidence set; current ranking deltas are not treated as universal counter claims.
- Coverage at this checkpoint was 104 / 133; 29 tactical profiles remained.


## Five additional tactical profiles — 2026-11-23

- Added Minsitthar, Moskov, Natalia, Natan and Novaria as sourced partial tactical profiles.
- Each profile includes four mechanics, strengths, weaknesses, teamfight plan, target priorities, cautions, item notes and source links.
- Role and lane classifications were updated where the matching MLBB.io hero pages provide a clear classification. Natalia is recorded as Jungle primary with Roam as a flexible lane.
- Matchup and synergy arrays remain empty rather than converting current statistical deltas into universal counter claims.
- Coverage at this checkpoint was 109 / 133; 24 tactical profiles remained.


## Five additional tactical profiles — 2026-11-23 (Aamon, Alice, Angela, Odette, Phoveus)

- Added five sourced partial tactical profiles with hero-specific passive and skill mechanics, strengths, weaknesses, teamfight plans, target priorities, cautions and item principles.
- Role/lane classifications updated where independently supported: Aamon — Assassin/Jungle; Alice — Tank/Mage, EXP Lane; Angela — Support/Roam; Odette — Mage/Mid Lane; Phoveus — Fighter/EXP Lane.
- Phoveus's revamped mark-and-chain ultimate is checked against the official Moonton Hero Spotlight as well as independent skill references.
- Matchup and synergy arrays remain empty pending a separate evidence review; statistical matchup deltas are not treated as universal counter claims.
- Coverage is now 114 / 133; 19 tactical profiles remain.


## Five additional tactical profiles — 2026-11-23 (Popol and Kupa, Ruby, Selena, Silvanna, Sora)

- Added five partial tactical profiles with hero-specific mechanics, strengths, weaknesses, item principles, teamfight plans, target priorities, cautions and source links.
- Popol and Kupa is documented against the 2.2.23 revamp released November 11, 2026; older pre-revamp guides are not treated as current.
- Ruby, Selena, Silvanna and Sora mechanics were checked against current hero references. Sora's Thunder/Torrent choice and upgraded arts are separately described.
- Role/lane classifications updated: Popol and Kupa — Marksman, Gold Lane primary with Jungle flex; Ruby — Fighter, EXP Lane with Roam flex; Selena — Assassin/Mage, Mid Lane; Silvanna — Fighter/EXP Lane; Sora — Fighter/Assassin, EXP Lane.
- Matchup and synergy arrays remain empty pending a separate evidence review; ranking aggregates are not presented as universal counter claims.
- Coverage is now 119 / 133; 14 tactical profiles remain.


## Five additional tactical profiles — 2026-11-23 (Uranus, Vale, Valentina, Vexana, Wanwan)

- Added five partial tactical profiles with hero-specific mechanics, strengths, weaknesses, item principles, teamfight plans, target priorities, cautions and source links.
- Uranus — Tank/EXP Lane; Vale, Valentina and Vexana — Mage/Mid Lane; Wanwan — Marksman/Gold Lane. Role and primary lane were cross-checked against current independent hero references.
- Vale's current three-skill kit is used; older guides describing removed skill-upgrade variants are not treated as current.
- Valentina's ultimate is documented as composition-dependent; Wanwan's ultimate activation condition and second-skill control cleanse are explicitly represented.
- Matchup and synergy arrays remain empty pending a separate evidence review. Community build samples are labelled as limited rather than treated as consensus.
- Coverage is now 124 / 133; 9 tactical profiles remain.


## Five additional tactical profiles — 2026-11-23 (X.Borg, Yi Sun-shin, Yin, Yu Zhong, Yve)

- Added five partial tactical profiles with distinct passive and skill mechanics, strengths, weaknesses, item principles, teamfight plans, target priorities, cautions and source links.
- X.Borg — Fighter/EXP Lane; Yi Sun-shin — Assassin/Marksman, Jungle; Yin — Fighter/Assassin, Jungle primary with EXP flex; Yu Zhong — Fighter/EXP Lane; Yve — Mage/Mid Lane.
- X.Borg's two armor states, overheating and ultimate armor break are explicitly modelled. Yi Sun-shin's current weapon-switch mastery and repeat-use global ultimate are included. Yin's base/Lieh skill variants and isolation are distinguished. Yu Zhong's Dragon-to-Dragonoid transition is documented.
- Yve's passive uses the current three-stack Galactic Power description; the outdated ten-stack description found on an older MLBB.io page is explicitly excluded.
- Matchup and synergy arrays remain empty pending separate evidence review; professional VOD review remains pending.
- Coverage is now 129 / 133; 4 tactical profiles remain.


## Final four tactical profiles — 2026-11-23 (Zetian, Zhask, Zhuxin, Zilong)

- Added four partial tactical profiles with hero-specific mechanics, strengths, weaknesses, item principles, teamfight plans, target priorities, cautions and source links.
- Zetian — Mage/Mid Lane; Zhask — Mage/Mid Lane; Zhuxin — Mage/Mid Lane; Zilong — Fighter/Assassin, EXP Lane.
- Zetian's global ultimate, Zhask's summoned spawn and fusion, Zhuxin's Soul Snare capture threshold, and Zilong's passive trigger and kill-reset mechanic are documented separately.
- Zhuxin references disagree on passive butterfly cap and mana-return percentage; the profile records the shared mechanic and explicitly avoids treating disputed values as settled.
- Matchup and synergy arrays remain empty pending separate evidence review. Professional VOD review remains pending.
- Coverage is now 133 / 133; no tactical profiles remain missing.
