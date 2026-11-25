# Emblem Talent Audit — MLBB Cyber Assistant

Last reviewed: 2026-11-25  
Project reference patch: 2.2.23  
Working branch: `assistant/cyber-redesign-2`

## Scope

The local catalogue contains 26 talents across three tiers (8 / 8 / 10). This pass compared the stored effect text with the current talent reference published by MLBB Nexus on 2026-11-25. The source is an independent community project, not an official Moonton publication. Its page explicitly notes that talent picks are not yet included in its ranked top-build aggregation, so this audit verifies effect descriptions, not talent win rates or best-in-slot meta choices.

Reference: https://mlbbnexus.com/academy/emblems

## Corrections made

- Fatal: corrected extra Critical Damage to +10%.
- Firmness: corrected hybrid defenses to +6.
- Festival of Blood: corrected the stack cap to 8.
- Master Assassin: recorded the +7% isolated-target condition.
- Pull Yourself Together: corrected cooldown reduction to 15%.
- Tenacity: replaced the stale damage-reduction description with +15 Physical and Magic Defense below 50% HP.
- Weapons Master: corrected the bonus to 5%.
- Focusing Mark: removed an unsupported allied Movement Speed bonus from the effect text; retained the verified +6% allied damage effect and 3-second duration.
- Impure Rage: documented the 1% HP recovery alternative for heroes without Mana.
- Killing Spree: corrected its trigger to a hero takedown.
- Quantum Charge: corrected its cooldown to 8 seconds.
- Temporal Reign: clarified that the next Ultimate cast reduces the remaining cooldown of the hero's other active skills.
- War Cry: documented the three separate hits trigger and 6-second cooldown.
- Weakness Finder: documented the basic-attack cooldown reduction, down to 3 seconds.

All 26 catalogue entries now carry the same source URL and review date for this snapshot. Where a future patch changes an effect, update the source snapshot and the regression test together.

## Recommendation logic adjustment

The Firmness rule now uses the damage type recorded in the enemy hero profile rather than inferring physical damage from the hero's class. It recommends hybrid defense when the enemy composition contains both physical and magic damage. Unknown damage types do not count as confirmed evidence.

Other talent recommendations remain rule-based heuristics derived from hero profiles, lane, allies, and enemy composition. They are not represented as statistically proven meta builds. In particular, a talent's presence in a recommendation is not evidence of a measured win-rate advantage.

## Regression coverage

- Catalogue checks assert current values, provenance, and review date for representative changed effects.
- A mixed-damage test checks that class labels do not misclassify two magic-damage heroes as physical threats.
- A mass matrix exercises every local hero profile against three enemy archetype groups and validates one catalogue-backed recommendation per tier.
- Existing tests continue to validate baseline fallbacks and jungle-lane talent selection.

## Remaining limitations

- The effect snapshot is sourced from a community reference and still needs spot-checking against the live in-game client.
- The current recommendation scores are hand-authored rules, not a trained or calibrated model.
- The repository does not yet have a labelled dataset of real draft outcomes or expert-reviewed talent choices for every hero and matchup.
- No talent-specific ranked win-rate claims should be displayed until a reliable, attributable dataset exists.
