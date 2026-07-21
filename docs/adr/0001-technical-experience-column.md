# Store years-based technical proficiency on `technical_experience`

v2 needs a time-anchored computer/technical experience covariate, but v1 already uses `technical_proficiency` for a subjective none/limited/moderate/advanced scale that must stay frozen for historical analysis. We store the years buckets on a separate column renamed from `programming_experience` to `technical_experience`, and keep the participant-facing label “Technical proficiency” for the years-based question.
