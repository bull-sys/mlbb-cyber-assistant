# Hero Data Coverage — MLBB Cyber Assistant

Last audited: 2026-11-23  
Project reference patch: 2.2.23  
Working branch: assistant/cyber-redesign-2

## Coverage snapshot

| Layer | Coverage | Meaning |
|---|---:|---|
| Working hero catalogue | 133 / 133 | The current project catalogue contains 133 entries with unique IDs. This remains a working roster, not an independently verified official-client snapshot. |
| Neutral reference dataset | 133 / 133 | Every catalogue entry has a local reference record with title, role, lane, specialties, release metadata, region/resource labels, source ratings and base statistics. |
| Role cross-check | 103 / 133 | Role labels have cross-source evidence in the catalogue. |
| Primary-lane cross-check | 102 / 133 | Primary-lane labels have cross-source evidence in the catalogue. |
| Extended local profile records | 102 / 133 | 102 heroes have a structured local profile record. 31 still need a local extended record. |
| Runtime profile endpoint | 133 / 133 supported by catalogue lookup | The encyclopedia requests the current neutral hero profile from MLBBDex. When that endpoint is unavailable, the new local reference dataset supplies the base passport and statistics. |
| Local fallback lore and skill text | Not complete | The static fallback intentionally does not invent lore or skill descriptions. Those sections require sourced data and remain marked unavailable if the live source cannot provide them. |

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
- Skill descriptions continue to come from the separate skill-data path. Russian descriptions are machine-translated source text and must remain visibly identified as such.
- No missing story, statistic, translation or patch note should be filled with a guess.

## Local extended profiles still missing

The following 31 heroes are present in the 133-entry catalogue and the new neutral reference dataset, but do not yet have a local extended profile record:

Mathilda (Матильда), Melissa (Мелисса), Minsitthar (Минситтар), Moskov (Москов), Natalia (Наталья), Natan (Натан), Novaria (Новария), Aamon (Эймон), Alice (Алиса), Angela (Ангела), Odette (Одетта), Phoveus (Фовиус), Popol and Kupa (Пополь и Купа), Ruby (Руби), Selena (Селена), Silvanna (Сильвана), Sora (Сора), Uranus (Уранус), Vale (Вэйл), Valentina (Валентина), Vexana (Вексана), Wanwan (Ванван), X.Borg (Икс.Борг), Yi Sun-shin (Ли Сун-Син), Yin (Инь), Yu Zhong (Чонг), Yve (Ив), Zetian (Цзэтянь), Zhask (Заск), Zhuxin (Чжусинь), Zilong (Зилонг).

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

The official-client roster itself remains marked incomplete until independently checked against an official-client snapshot.

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
