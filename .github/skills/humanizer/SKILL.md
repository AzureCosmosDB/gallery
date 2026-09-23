---
name: humanizer
description: "Make short gallery classification evidence natural, neutral, concise, and specific. Use when writing criteria or evidence for gallery candidate and retirement decisions."
user-invocable: false
---

# Humanizer

Use this skill only after the classification decision is complete.

## Rules

- Preserve every fact, verdict, confidence value, index, URL, and JSON field.
- Edit only human-readable `criteria` and `evidence` strings.
- Use plain, direct language grounded in the supplied source or audit evidence.
- Remove promotional phrasing, inflated claims, vague attribution, filler, repetition, and unnecessary intensifiers.
- Prefer one concrete reason over a list of generic claims.
- Do not add opinions, humor, speculation, first-person commentary, or facts not present in the input.
- Do not add Markdown, line breaks, control characters, or text outside the required JSON object.

## Final Check

Before returning JSON, confirm that each evidence statement is concise, factual, and readable, and that humanization did not change the classification result or schema.
