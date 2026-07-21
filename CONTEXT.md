# Glossary

## Study protocol version

A label that distinguishes which era of task instructions a participant completed. Two values exist: `v1_simple` and `v2_criteria`. The same participant may have rows under both versions after migrating from simple to criteria-based tasks.

## v1_simple

The original study protocol. Participants received open-ended task instructions without criteria-based verification. The frozen research paper snapshot (`research.json`) represents this cohort.

## v2_criteria

The current study protocol. Participants complete tasks that are verified against seeded criteria sets (specific course, section, facility, and booking time). New completions use this version.

## Task assignment set

A seeded variant of per-task targets (course, section, facility, booking time) used under v2_criteria. One set is randomly assigned to each participant at survey start; both interaction modalities share the same assignment for that participant.

## My study results

A read-only page where a participant reviews their own task, survey, and interview data across study protocol versions.
_Avoid_: Previous study record, study history

## Compare view

The side-by-side layout on My study results that aligns Simple Tasks and Criteria Tasks on the same metrics, with optional filtering by interaction modality (Traditional portal or Chat agent).

## Participation record

One participant's stored task progress, survey responses, and interview answers for a given study protocol version.

## Subjective technical proficiency

A v1_simple self-rating of technical skill: none, limited, moderate, or advanced.
_Avoid_: Technical proficiency (alone, when contrasting protocols), programming experience

## Years-based technical proficiency

A v2_criteria time-anchored measure of computer and technical experience: none, under 1 year, 1–3 years, or more than 3 years. “More than 3 years” means strictly more than three years; exactly three years belongs in 1–3 years.
_Avoid_: Programming experience, technical proficiency (alone, when contrasting protocols), advanced (as a years bucket)
