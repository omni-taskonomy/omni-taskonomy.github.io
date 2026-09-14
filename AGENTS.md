# Project-page copy contract

The user requires manuscript-original wording and forbids GPT summaries or paraphrases.

- All research prose, research headings, findings, captions, image alt text, and metadata must come from contiguous passages in the actual manuscript source. Do not polish, shorten by rewriting, correct grammar, or synthesize claims.
- Choose excerpts only from active files included by the manuscript's main.tex. Exclude commented drafts, TODOs, collaborator notes, and template author placeholders.
- Use content/manuscript-excerpts.json through the existing components. Each excerpt records its pinned manuscript commit, file, source lines, raw TeX, and source hash. The source copies are under content/manuscript-sources and are not public assets.
- Permitted transformations are LaTeX presentation only: whitespace, emphasis commands, math delimiters, typography, and expansion of verified manuscript macros. Do not invent citations or resolve them from memory. Prefer self-contained passages that do not require omitted references.
- Interface controls and the existing, separately marked website-design acknowledgment are the only non-manuscript copy on this site. The manuscript's acknowledgment names are also copied as an exact passage.
- Run python scripts/extract-manuscript.py --check and python scripts/verify-page-copy.py <local-url> before publishing. The second check rejects unregistered rendered research text and verifies captions, alt text, and metadata.
- Preserve the established page design, original manuscript figures, and current site audience. This site task does not authorize manuscript or bibliography changes on Overleaf.
