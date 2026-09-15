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

## Subsequent author correction on September 14, 2026

- Remove both "Original paper figure" disclosures from the rendered page, as explicitly requested. This supersedes the earlier requirement to display the original taxonomy and transfer figures; leave their source assets intact.
- Remove the two modality badges above the taxonomy tree. This does not remove modality definitions elsewhere.
- TL;DR should introduce the paired setup and I2I/I2T abbreviations, then list the introduction's three exact research questions before Finding 1/2/3. Remove the UniTaskonomy introduction from TL;DR.

## Typography and heatmap simplification

- All prose uses Times New Roman at the same body size, including the TL;DR questions; the author withdrew the larger question size. Preserve Roman question numbering and Cormorant Garamond headings, including Finding labels.
- The transfer heatmap has only one selector: Benchmark. Show delta from the I2T-only baseline for the original 19-capability main analysis. Remove accuracy mode and the capability-subset selector.
- Keep family headers in their own column groups; the single-column Recognition label must not extend into Reconstruction.

## Mobile layout and pending citation

- Keep the established manuscript copy and uniform Times New Roman body size while adapting spacing, figures, touch targets and dialogs to narrow screens.
- The author requested a final Citation section with pending BibTeX. Display the explicit comment `% BibTeX pending.` until an authoritative entry is supplied; do not invent citation metadata. This is a narrowly scoped interface placeholder, registered in the copy audit.

## Author clarification of I2I families

- The author clarified with an updated paper heatmap that Recognition no longer contains I2I tasks. Semantic segmentation moves from Recognition to Reorganization; I2T Region semantic recognition stays in Recognition.
- Preserve the original v12 export and apply the explicit mapping and heatmap column order in content/unitaskonomy-author-corrections.json. Its source is the author's supplied paper figure. The heatmap has 8 Reconstruction and 7 Reorganization columns; the combined taxonomy still has three families because I2T retains Recognition.
- This supersedes the original v12 I2I family assignment and single-column Recognition header rule. Do not change measurements, definitions, examples, I2T assignments or manuscript prose to implement this correction.

## Opening ability-transfer diagram

- Remove the standalone overview caption "When does generation help understanding?" from the rendered page; preserve the main paper title and research figure.
- Replace the small I2I/I2T badges with the author's centered diagram: "Image Generation (Image to Image, I2I)" → "Image Understanding (Image to Text, I2T)", with "Ability Transfer" above the arrow. These explicit labels are registered in content/author-provided-copy.json.
- This diagram uses Cormorant Garamond to match the title, with red generation and blue understanding. It is an explicit exception to the uniform body font rule; surrounding prose remains unchanged.

## Consistent modality colors

- Color editable page text for generation / image-to-image / I2I in muted red and image understanding / image-to-text / I2T in blue, including terms within existing bold passages. Color bare "understanding" only in paired modality phrases such as "generation and understanding" and "generation-to-understanding"; do not color capability names such as "Appearance understanding" or "Depth understanding." Apply colors by wrapping exact text, without rewriting it.
- Retain the original plot assets and their scientific color scales. The positive/negative transfer legend is independent of prose modality colors.
