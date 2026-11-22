# Hero Data Coverage — MLBB Cyber Assistant

Last audited: 2026-11-22  
Live patch reference: 2.2.23

## Current coverage snapshot

| Layer | Coverage | Meaning |
|---|---:|---|
| Hero catalog entries | 133 / 133 current catalog entries | Names and IDs are available to the encyclopedia/catalog UI. This is not yet an independently confirmed official-client roster snapshot. |
| Unique catalog IDs | 133 / 133 | No duplicate IDs after the Fanny catalog-entry correction. |
| Role verified | 50 / 133 | Role labels have cross-source evidence. |
| Primary lane verified | 48 / 133 | Primary lane has cross-source evidence. |
| Tactical profile records | 12 / 133 | Profile records are linked to the catalog; one remains a placeholder without researched mechanics. |
| Substantive partial tactical profiles | 11 / 133 | Hero-specific mechanics, strengths, weaknesses, item notes and team-fight guidance have been researched. |
| Tactical profiles marked complete | 0 / 133 | Profiles remain partial until current-patch and competitive evidence is sufficiently reviewed. |

## Tactical profile coverage

Current hero-specific profiles:
- Helcurt
- Hanzo
- Roger
- Ling
- Fanny
- Nolan
- Jawhead (Кусака)
- Suyou (Су Ё)
- Karrie (Кэрри)
- Bruno (Бруно)
- Terizla (Теризла)

Saber remains a legacy placeholder without researched mechanics and is not counted among the 11 substantive profiles.

A profile being present does not mean all matchups, synergies, professional VODs or current-patch build variants are fully verified. Empty matchup/synergy arrays are intentional when evidence is insufficient; do not fill them with guesses.

## Important product distinction

The encyclopedia/catalog can list the full 133-entry working roster. That does **not** mean all 133 heroes are ready for full draft recommendations or detailed AI tactical analysis.

The legacy draft-analysis data remains a separate compatibility layer with 32 established entries. The current readiness checks must continue to prevent unsupported heroes from being presented as fully analyzed.

## Completion standard for each hero

A hero should move from catalog-only to tactical-profile coverage only after:
1. Hero identity and current skill mechanics are checked against more than one reliable reference.
2. Role and lane evidence is recorded separately from tactical confidence.
3. Ranked statistics include date, patch, rank bracket and source methodology where available.
4. Professional picks/bans/win rates are reported separately from ranked statistics.
5. Matchups and synergies are added only when supported by sufficiently comparable evidence or reviewed gameplay.
6. Build recommendations include a current-patch source and explain situational alternatives.
7. Tests cover profile structure, source presence, uncertainty and catalog linkage.

## Next work

Expand tactical coverage in small reviewable batches. The latest batch added researched partial profiles for Suyou, Jawhead (Кусака), Karrie, Bruno and Terizla, and cross-source role/lane evidence for those five entries. Keep each batch isolated in its own commits, run the full test suite, and do not mark a profile complete merely to increase the coverage percentage.

The catalog roster status remains `incomplete` until it has been checked against an official-client roster snapshot. The current 133-entry count is a useful working baseline, not a claim of independent official verification.
