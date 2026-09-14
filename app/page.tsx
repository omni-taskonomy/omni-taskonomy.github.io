import { FileText } from 'lucide-react';
import manuscriptContent from '@/content/manuscript-excerpts.json';

const manuscript = manuscriptContent.manuscript_project;
const excerpts = manuscriptContent.excerpts;
type ExcerptId = keyof typeof excerpts;
const text = (id: ExcerptId) => excerpts[id].text;
const source = (id: ExcerptId) => `${excerpts[id].source.file}:${excerpts[id].source.start_line}-${excerpts[id].source.end_line}`;
const sections: [string, ExcerptId][] = [
  ['controlled', 'nav_controlled'], ['recipe', 'nav_training'], ['taxonomy', 'nav_taxonomy'],
  ['transfer', 'nav_transfer'], ['alignment', 'nav_alignment'],
];
function Passage({ id, className }: { id: ExcerptId; className?: string }) {
  return <p className={className} data-manuscript-excerpt={id} data-source={source(id)}>{text(id)}</p>;
}
function Heading({ id, number }: { id: ExcerptId; number: string }) {
  return <div className="section-heading"><span className="section-index" aria-hidden="true">{number}</span><h2 data-manuscript-excerpt={id} data-source={source(id)}>{text(id)}</h2></div>;
}
function Figure({ name, caption, width, height, eager = false, className = '' }: { name: string; caption: ExcerptId; width: number; height: number; eager?: boolean; className?: string }) {
  return <figure className={className}>
    <a className="figure-link" href={`/figures/${name}.png`} target="_blank" rel="noreferrer" aria-label="Open full-resolution figure">
      <img src={`/figures/${name}.png`} alt={text(caption)} width={width} height={height} loading={eager ? 'eager' : 'lazy'} />
      <span className="figure-expand">View full size ↗</span>
    </a>
    <figcaption data-manuscript-excerpt={caption} data-source={source(caption)}>{text(caption)}</figcaption>
  </figure>;
}

export default function Home() {
  const title = text('title');
  const titleBreak = title.indexOf(' Help ');
  return <>
    <a className="skip-link" href="#overview">Skip to content</a>
    <header className="paper-header shell" id="top">
      <h1 data-manuscript-excerpt="title" data-source={source('title')}><span>{title.slice(0, titleBreak)}</span><span className="title-second">{title.slice(titleBreak)}</span></h1>
      <Passage id="hero_lead" className="hero-lead" />
      <a className="paper-button" href={manuscript} target="_blank" rel="noreferrer"><FileText size={17} aria-hidden="true" />Read the manuscript<span aria-hidden="true">↗</span></a>
    </header>

    <section className="overview shell" id="overview">
      <Figure name="overview" caption="overview_caption_short" width={1608} height={478} eager className="teaser" />
      <div className="overview-notes"><Passage id="overview_panel_a" /><Passage id="overview_panel_b" /><Passage id="overview_panel_c" /></div>
      <details className="paper-details abstract-details"><summary>Abstract</summary><div className="details-content prose"><Passage id="abstract_open" /><Passage id="abstract_map" /><Passage id="abstract_alignment" /></div></details>
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
        <Passage id="recipe_result" className="section-lead" />
        <div className="recipe-flow"><strong data-manuscript-excerpt="stage_i2i">{text('stage_i2i')}</strong><span aria-hidden="true">→</span><strong data-manuscript-excerpt="stage_i2t">{text('stage_i2t')}</strong></div>
        <Figure name="scaling" caption="scaling_caption" width={1604} height={496} />
        <blockquote className="finding"><Passage id="recipe_finding" /></blockquote>
        <details className="paper-details"><summary>Training recipes</summary><div className="details-content prose"><Passage id="recipe_setup" /></div></details>
      </div></section>

      <section id="taxonomy" className="chapter"><div className="shell">
        <Heading id="taxonomy_heading" number="03" />
        <Passage id="taxonomy_lead" className="section-lead" />
        <Figure name="unitaskonomy" caption="taxonomy_caption" width={1604} height={1128} className="taxonomy-figure" />
        <Passage id="taxonomy_quantity" className="prose supporting-copy" />
        <details className="paper-details"><summary>Annotation protocol</summary><div className="details-content prose"><Passage id="taxonomy_annotation" /></div></details>
      </div></section>

      <section id="transfer" className="chapter chapter-tinted"><div className="shell">
        <Heading id="transfer_heading" number="04" />
        <Passage id="transfer_lead" className="section-lead" />
        <Figure name="transfer-matrix" caption="transfer_caption" width={1616} height={1190} className="matrix-figure" />
        <div className="two-columns results-notes">
          <div><h3 data-manuscript-excerpt="related_heading">{text('related_heading')}</h3><Passage id="related_example" /><Passage id="depth_example" /></div>
          <div><h3 data-manuscript-excerpt="cross_heading">{text('cross_heading')}</h3><Passage id="cross_results" /></div>
        </div>
        <details className="paper-details"><summary>Experimental setup</summary><div className="details-content prose"><Passage id="transfer_setup" /><Passage id="transfer_scope" /></div></details>
      </div></section>

      <section id="alignment" className="chapter"><div className="shell">
        <Heading id="alignment_heading" number="05" />
        <Passage id="alignment_lead" className="section-lead" />
        <Figure name="gradient-alignment" caption="alignment_caption" width={1476} height={674} />
        <blockquote className="finding"><Passage id="alignment_finding" /></blockquote>
        <details className="paper-details"><summary>Experimental setup</summary><div className="details-content prose"><Passage id="alignment_setup" /><Passage id="alignment_results" /></div></details>
      </div></section>

      <section className="acknowledgments shell" id="acknowledgments">
        <h2 data-manuscript-excerpt="ack_heading">{text('ack_heading')}</h2>
        <Passage id="ack_names" className="ack-names" />
        <p data-site-credit="design" className="site-credit">This project page’s design and presentation are inspired by <a href="https://beyond-llms.github.io/" target="_blank" rel="noreferrer">Beyond Language Modeling: An Exploration of Multimodal Pretraining</a>. We thank its authors for the inspiration.</p>
      </section>
    </main>
    <footer className="shell"><span data-manuscript-excerpt="title">{text('title')}</span><a href={manuscript}>Manuscript ↗</a><a href="#top">Back to top ↑</a></footer>
  </>;
}
