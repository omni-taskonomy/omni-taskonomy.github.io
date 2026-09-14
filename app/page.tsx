import { FileText, Code } from 'lucide-react';
import type { ReactNode } from 'react';
import manuscriptContent from '@/content/manuscript-excerpts.json';
import authorContent from '@/content/author-provided-copy.json';
import { InteractiveTaxonomy, InteractiveTransferMap } from '@/components/interactive-figures';

// The author requested resource buttons with their destinations left blank.
const resourceLinks = { paper: '', github: '', huggingface: '' };
const excerpts = manuscriptContent.excerpts;
const authorExcerpts = authorContent.excerpts;
type AuthorId = keyof typeof authorExcerpts;
type ExcerptId = keyof typeof excerpts;
const text = (id: ExcerptId) => excerpts[id].text;
const source = (id: ExcerptId) => `${excerpts[id].source.file}:${excerpts[id].source.start_line}-${excerpts[id].source.end_line}`;
const sections: [string, ExcerptId][] = [
  ['controlled', 'nav_controlled'], ['recipe', 'nav_training'], ['taxonomy', 'nav_taxonomy'],
  ['transfer', 'nav_transfer'], ['alignment', 'nav_alignment'],
];
const emphasis: Partial<Record<ExcerptId, string[]>> = {
  tldr_paired: ['paired generation and understanding tasks', 'same visual operation', 'different modalities'],
  tldr_taxonomy_compact: ['UniTaskonomy', 'unified capability taxonomy'],
  finding_a: ['steadily improve', 'training recipe'],
  finding_b: ['highly task-dependent', 'large gains', 'interfere with understanding'],
  overview_panel_a: ['steadily improve', 'training recipe'],
  overview_panel_b: ['highly task-dependent', 'large gains', 'interfere with understanding'],
  overview_panel_c: ['gradient alignment', 'pre-attention normalization'],
  controlled_lead: ['paired generation and understanding tasks', 'same underlying visual operation', 'output modality'],
  controlled_inputs: ['Jigsaw', 'Zoom-In'],
  controlled_output: ['reconstructs the correctly ordered image', 'predicts the patch order in text'],
  recipe_result: ['I2I pretraining followed by I2T finetuning', 'default recipe'],
  recipe_finding: ['complements but does not replace', 'largest gains in low-I2T settings'],
  taxonomy_lead: ['UniTaskonomy', 'shared hierarchy', 'visual information'],
  taxonomy_quantity: ['15 I2I supervision leaves', '25 I2T capability leaves'],
  taxonomy_annotation: ['three independent LLM judges', 'majority vote'],
  transfer_lead: ['Z-depth', 'object pointing', '2D keypoint supervision', 'help some capabilities while interfering with others'],
  transfer_caption: ['percentage points', 'I2T-only baseline', 'positive transfer', 'negative transfer'],
  transfer_setup: ['50k I2I training samples', 'I2T-only baseline'],
  related_example: ['Object pointing', 'Counting', '+3.57 pp'],
  depth_example: ['Z-depth', 'Metric 3D relation', '+2.90 pp'],
  cross_results: ['Colorization', 'Visual correspondence', '+5.71 pp', '2D keypoints', 'Multi-view reasoning', '+7.38 pp'],
  alignment_lead: ['optimization compatibility', 'one factor associated with successful transfer'],
  alignment_setup: ['six tasks', '500 source pairs per task'],
  alignment_finding: ['more aligned gradients', 'early normalization layers'],
};
// Split and wrap existing characters only: emphasis never creates or edits copy.
function formatted(value: string, highlights: string[] = []): ReactNode {
  const colors = ['Image Generation', 'Image Understanding', 'image-to-image (I2I)', 'image-to-text (I2T)'];
  const terms = [...new Set([...highlights, ...colors])].sort((a, b) => b.length - a.length);
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${terms.map(escape).join('|')})`, 'gi');
  return value.split(pattern).map((part, i) => {
    const lower = part.toLowerCase();
    const color = lower === 'image generation' || lower === 'image-to-image (i2i)' ? 'term-generation' : lower === 'image understanding' || lower === 'image-to-text (i2t)' ? 'term-understanding' : '';
    if (highlights.some(term => term.toLowerCase() === lower)) return <strong key={i} className={color || undefined}>{part}</strong>;
    return color ? <span key={i} className={color}>{part}</span> : part;
  });
}
function ResourceButton({ label, href, children }: { label: string; href: string; children: ReactNode }) {
  return <a className="resource-button" href={href || undefined} role="link" aria-disabled={!href} tabIndex={href ? undefined : -1}>{children}<span>{label}</span></a>;
}
function Passage({ id, className }: { id: ExcerptId; className?: string }) {
  return <p className={className} data-manuscript-excerpt={id} data-source={source(id)}>{formatted(text(id), emphasis[id])}</p>;
}
function AuthorPassage({ id, highlights = [] }: { id: AuthorId; highlights?: string[] }) {
  return <p data-author-copy={id}>{formatted(authorExcerpts[id].text, highlights)}</p>;
}
function PlotLegend() {
  return <div className="plot-legend" aria-label="Plot legend">
    <span className="legend-item"><i className="legend-dot positive" aria-hidden="true" /><span data-author-copy="legend_blue">{authorExcerpts.legend_blue.text}</span></span>
    <span className="legend-item"><i className="legend-dot negative" aria-hidden="true" /><span data-author-copy="legend_red">{authorExcerpts.legend_red.text}</span></span>
    <span className="legend-item"><span className="bubble-key" aria-hidden="true"><i /><i /><i /></span><span data-author-copy="legend_size">{authorExcerpts.legend_size.text}</span></span>
  </div>;
}
// Lay out the author's exact recipe strings as routes plus descriptions.
function RecipeRoute({ value }: { value: string }) {
  return <span className="recipe-route">{value.split(/(Frozen I2I|I2I|I2T|Mixed|→)/g).map((part, i) => {
    const kind = part === 'I2I' || part === 'Frozen I2I' ? 'generation' : part === 'I2T' ? 'understanding' : part === 'Mixed' ? 'mixed' : part === '→' ? 'arrow' : 'suffix';
    return <span key={i} className={`route-${kind}`}>{part}</span>;
  })}</span>;
}
function RecipeNote() {
  const ids: AuthorId[] = ['recipe_r1', 'recipe_r2', 'recipe_r3', 'recipe_r4', 'recipe_r5', 'recipe_r6'];
  return <aside className="recipe-note" id="training-recipes" role="note" aria-label="Training recipes">
    <div className="recipe-note-intro"><AuthorPassage id="recipe_intro" /><sup>1</sup></div>
    <ol className="recipe-list">{ids.map((id, index) => {
      const value = authorExcerpts[id].text;
      const colon = value.indexOf(':');
      const stop = value.indexOf('. ');
      return <li key={id} className={`recipe-item recipe-${index + 1}`} data-author-copy={id}>
        <div className="recipe-item-header"><span className="recipe-id">{value.slice(0, colon + 1)}</span>{' '}<RecipeRoute value={value.slice(colon + 2, stop + 1)} /></div>{' '}
        <p className="recipe-description">{formatted(value.slice(stop + 2), ['updating', 'frozen'])}</p>
      </li>;
    })}</ol>
  </aside>;
}
function Heading({ id, number }: { id: ExcerptId; number: string }) {
  return <div className="section-heading"><span className="section-index" aria-hidden="true">{number}</span><h2 data-manuscript-excerpt={id} data-source={source(id)}>{text(id)}</h2></div>;
}
function Figure({ name, caption, width, height, eager = false, className = '', note, showCaption = true }: { name: string; caption: ExcerptId; width: number; height: number; eager?: boolean; className?: string; note?: string; showCaption?: boolean }) {
  return <figure className={className}>
    <a className="figure-link" href={`/figures/${name}.png`} target="_blank" rel="noreferrer" aria-label="Open full-resolution figure">
      <img src={`/figures/${name}.png`} alt={text(caption)} width={width} height={height} loading={eager ? 'eager' : 'lazy'} />
      <span className="figure-expand">View full size ↗</span>
    </a>
    {showCaption && <figcaption><span data-manuscript-excerpt={caption} data-source={source(caption)}>{formatted(text(caption), emphasis[caption])}</span>{note && <a href={`#${note}`} className="footnote-ref" aria-label="Training recipe definitions"><sup>1</sup></a>}</figcaption>}
  </figure>;
}

function InteractiveFigure({ name, caption, width, height, children }: { name: string; caption: ExcerptId; width: number; height: number; children: ReactNode }) {
  return <figure className="interactive-figure">
    {children}
    <figcaption><span data-manuscript-excerpt={caption} data-source={source(caption)}>{formatted(text(caption), emphasis[caption])}</span></figcaption>
    <details className="original-figure"><summary>Original paper figure</summary><a className="figure-link" href={'/figures/' + name + '.png'} target="_blank" rel="noreferrer"><img src={'/figures/' + name + '.png'} alt={text(caption)} width={width} height={height} loading="lazy" /><span className="figure-expand">View full size ↗</span></a></details>
  </figure>;
}

export default function Home() {
  const title = text('title');
  const titleBreak = title.indexOf(' Help ');
  return <>
    <a className="skip-link" href="#overview">Skip to content</a>
    <header className="paper-header shell" id="top">
      <h1 data-manuscript-excerpt="title" data-source={source('title')}><span>{formatted(title.slice(0, titleBreak))}</span><span className="title-second">{formatted(title.slice(titleBreak))}</span></h1>
      <div className="resource-buttons" aria-label="Project resources">
        <ResourceButton label="Paper" href={resourceLinks.paper}><FileText size={17} aria-hidden="true" /></ResourceButton>
        <ResourceButton label="GitHub" href={resourceLinks.github}><Code size={18} aria-hidden="true" /></ResourceButton>
        <ResourceButton label="Hugging Face" href={resourceLinks.huggingface}><span className="hf-icon" aria-hidden="true">🤗</span></ResourceButton>
      </div>
    </header>

    <section className="overview shell" id="overview">
      <h2 className="tldr-heading">TL;DR</h2>
      <div className="tldr-box">
        <div className="tldr-step"><span className="tldr-number" aria-hidden="true">1</span><div>
          <Passage id="tldr_paired" />
          <div className="task-pair"><span data-manuscript-excerpt="tldr_i2i">{formatted(text('tldr_i2i'))}</span><span className="pair-separator" aria-hidden="true">→</span><span data-manuscript-excerpt="tldr_i2t">{formatted(text('tldr_i2t'))}</span></div>
        </div></div>
        <div className="tldr-step"><span className="tldr-number" aria-hidden="true">2</span><div><Passage id="tldr_taxonomy_compact" /></div></div>
      </div>
      <div className="overview-notes">
        <div><h3 className="finding-label">Finding 1</h3><Passage id="finding_a" /></div>
        <div><h3 className="finding-label">Finding 2</h3><Passage id="finding_b" /></div>
        <div><h3 className="finding-label">Finding 3</h3><Passage id="alignment_finding" /></div>
      </div>
      <Figure name="overview" caption="overview_caption_short" width={1608} height={478} eager className="teaser" />
      <PlotLegend />
    </section>

    <nav className="section-nav" aria-label="Page sections"><div className="nav-inner"><a href="#top">Top ↑</a>{sections.map(([id, label]) => <a key={id} href={`#${id}`} data-manuscript-excerpt={label}>{text(label)}</a>)}</div></nav>
    <main>
      <section id="controlled" className="chapter"><div className="shell">
        <Heading id="controlled_heading" number="01" />
        <Passage id="controlled_lead" className="section-lead" />
        <Figure name="controlled-tasks" caption="controlled_caption" width={1604} height={260} />
        <div className="two-columns supporting-copy"><Passage id="controlled_inputs" /><Passage id="controlled_output" /></div>
      </div></section>

      <section id="recipe" className="chapter chapter-tinted"><div className="shell">
        <Heading id="recipe_heading" number="02" />
        <RecipeNote />
        <Figure name="scaling" caption="scaling_caption" width={1604} height={496} note="training-recipes" />
        <Passage id="recipe_result" className="section-lead" />
        <blockquote className="finding"><Passage id="recipe_finding" /></blockquote>
      </div></section>

      <section id="taxonomy" className="chapter"><div className="shell">
        <Heading id="taxonomy_heading" number="03" />
        <Passage id="taxonomy_lead" className="section-lead" />
        <InteractiveFigure name="unitaskonomy" caption="taxonomy_caption" width={1604} height={1128}><InteractiveTaxonomy /></InteractiveFigure>
        <Passage id="taxonomy_quantity" className="prose supporting-copy" />
        <aside className="method-note"><h3>Annotation protocol</h3><Passage id="taxonomy_annotation" /></aside>
      </div></section>

      <section id="transfer" className="chapter chapter-tinted"><div className="shell">
        <Heading id="transfer_heading" number="04" />
        <aside className="method-note experiment-setup"><Passage id="transfer_setup" /><Passage id="transfer_scope" /></aside>
        <InteractiveFigure name="transfer-matrix" caption="transfer_caption" width={1616} height={1190}><InteractiveTransferMap /></InteractiveFigure>
        <Passage id="transfer_lead" className="section-lead" />
        <div className="two-columns results-notes">
          <div><h3 data-manuscript-excerpt="related_heading">{text('related_heading')}</h3><Passage id="related_example" /><Passage id="depth_example" /></div>
          <div><h3 data-manuscript-excerpt="cross_heading">{text('cross_heading')}</h3><Passage id="cross_results" /></div>
        </div>
      </div></section>

      <section id="alignment" className="chapter"><div className="shell">
        <Heading id="alignment_heading" number="05" />
        <aside className="method-note experiment-setup"><Passage id="alignment_setup" /></aside>
        <Figure name="gradient-alignment" caption="alignment_caption" width={1476} height={674} showCaption={false} />
        <div className="analysis-copy prose"><Passage id="alignment_results" /><Passage id="alignment_lead" /></div>
        <blockquote className="finding"><Passage id="alignment_finding" /></blockquote>
      </div></section>

      <section className="acknowledgments shell" id="acknowledgments">
        <h2 data-manuscript-excerpt="ack_heading">{text('ack_heading')}</h2>
        <Passage id="ack_names" className="ack-names" />
        <p data-site-credit="design" className="site-credit">This project page’s design and presentation are inspired by <a href="https://beyond-llms.github.io/" target="_blank" rel="noreferrer">Beyond Language Modeling: An Exploration of Multimodal Pretraining</a>. We thank its authors for the inspiration.</p>
      </section>
    </main>
    <footer className="shell"><span data-manuscript-excerpt="title">{text('title')}</span><a href="#top">Back to top ↑</a></footer>
  </>;
}
