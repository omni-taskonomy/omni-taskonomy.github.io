# Project-page copy contract

The user requires manuscript-original wording and forbids GPT summaries or paraphrases.

- All research prose, research headings, findings, captions, image alt text, and metadata must come from contiguous passages in the actual manuscript source. Do not polish, shorten by rewriting, correct grammar, or synthesize claims.
- Choose excerpts only from active files included by the manuscript's main.tex. Exclude commented drafts, TODOs, collaborator notes, and template author placeholders.
- Use content/manuscript-excerpts.json through the existing components. Each excerpt records its pinned manuscript commit, file, source lines, raw TeX, and source hash. The source copies are under content/manuscript-sources and are not public assets.
- Permitted transformations are LaTeX presentation only: whitespace, emphasis commands, math delimiters, typography, and expansion of verified manuscript macros. Do not invent citations or resolve them from memory. Prefer self-contained passages that do not require omitted references.
- Interface controls and the existing, separately marked website-design acknowledgment are the only non-manuscript copy on this site. The manuscript's acknowledgment names are also copied as an exact passage.
- Run python scripts/extract-manuscript.py --check and python scripts/verify-page-copy.py <local-url> before publishing. The second check rejects unregistered rendered research text and verifies captions, alt text, and metadata.
- Follow the user-requested visual direction while preserving original manuscript figures and the current site audience. Use short contiguous excerpts and progressive disclosure for long original passages; never rewrite prose to fit a layout. This site task does not authorize manuscript or bibliography changes on Overleaf.

## Explicit author edits on September 14, 2026

- The author supplied replacement R1–R6 descriptions and a compact plot legend. These are recorded separately in content/author-provided-copy.json and rendered with data-author-copy. This narrowly scoped exception does not permit invented research prose elsewhere.
- Use short, contiguous manuscript excerpts for TL;DR findings. Remove the rejected systematic-transfer and Taken-together lead-ins.
- Explain R1–R6 visibly before the training plot and link its caption to that note. Display annotation and experimental details in readable, open sections; do not hide them behind small disclosure labels.
- The rendered-copy audit must verify both manuscript excerpts and the explicit author-provided replacements against their separate records.

## Author-supplied interactive v12 data

- The author explicitly requested integrating the supplied v12 heatmap, tree and representative samples into the existing homepage. Exact labels, definitions, sample questions/choices/answers and counts from these files are an additional, narrowly scoped source for the two interactive figures.
- Keep this data in content/unitaskonomy-v12.json; source hashes and unchanged example-image hashes are in content/unitaskonomy-v12-provenance.json. Do not paraphrase definitions or generate example images.
- data-v12-copy identifies exact source fields; data-v12-metric identifies numeric cells calculated from the supplied correct/total pairs; data-v12-view identifies displayed row and sample counts. The rendered-copy audit validates these records separately and continues to reject unregistered text.
- Family membership follows the supplied v12 data. Keep the original manuscript figures accessible for comparison; they are a separate, older snapshot. Use the >100 global sample threshold for the default 19 rows, and preserve missing values as missing.
- Run scripts/verify-interactive-data.py in addition to the existing manuscript and rendered-copy checks.
