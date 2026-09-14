import manuscriptContent from '@/content/manuscript-excerpts.json';

const manuscript = manuscriptContent.manuscript_project;
const excerpts = manuscriptContent.excerpts;
type ExcerptId = keyof typeof excerpts;
const text = (id: ExcerptId) => excerpts[id].text;
const source = (id: ExcerptId) => `${excerpts[id].source.file}:${excerpts[id].source.start_line}-${excerpts[id].source.end_line}`;
const sections: [string, ExcerptId][] = [
  ['controlled', 'nav_controlled'], ['recipe', 'nav_recipe'], ['taxonomy', 'nav_taxonomy'],
  ['transfer', 'nav_transfer'], ['alignment', 'nav_alignment'],
];
function Passage({ id, className }: { id: ExcerptId; className?: string }) {
  return <p className={className} data-manuscript-excerpt={id} data-source={source(id)}>{text(id)}</p>;
}
function Heading({ id }: { id: ExcerptId }) {
  return <h2 data-manuscript-excerpt={id} data-source={source(id)}>{text(id)}</h2>;
}
function Figure({ name, caption, width, height, eager = false }: { name: string; caption: ExcerptId; width: number; height: number; eager?: boolean }) {
  return <figure>
    <a className="figure-link" href={`/figures/${name}.png`} target="_blank" rel="noreferrer" aria-label="Open full-resolution figure">
      <img src={`/figures/${name}.png`} alt={text(caption)} width={width} height={height} loading={eager ? 'eager' : 'lazy'} />
      <span className="figure-expand" aria-hidden="true">View full size ↗</span>
    </a>
    <figcaption data-manuscript-excerpt={caption} data-source={source(caption)}>{text(caption)}</figcaption>
  </figure>;
}

export default function Home() {
  return <>
    <a className="skip-link" href="#overview">Skip to content</a>
    <header className="hero" id="top">
      <h1 data-manuscript-excerpt="title" data-source={source('title')}>{text('title')}</h1>
      <a className="paper-button" href={manuscript} target="_blank" rel="noreferrer">Read the manuscript <span aria-hidden="true">↗</span></a>
    </header>
    <nav className="section-nav" aria-label="Page sections"><a href="#top">Top ↑</a>{sections.map(([id, label]) => <a key={id} href={`#${id}`} data-manuscript-excerpt={label}>{text(label)}</a>)}</nav>
    <main>
      <section className="overview" id="overview">
        <div className="prose">
          <Passage id="abstract_open" className="lede" />
          <Passage id="abstract_map" />
          <Passage id="abstract_alignment" />
        </div>
        <Figure name="overview" caption="overview_caption" width={1608} height={478} eager />
      </section>

      <section id="controlled">
        <div className="prose">
          <Heading id="controlled_heading" />
          <Passage id="controlled_setup" />
          <Passage id="controlled_model" />
          <Passage id="controlled_inputs" />
          <Passage id="controlled_output" />
        </div>
        <Figure name="controlled-tasks" caption="controlled_caption" width={1604} height={260} />
      </section>

      <section id="recipe">
        <div className="prose">
          <Heading id="recipe_heading" />
          <Passage id="recipe_setup" />
          <Passage id="recipe_result" />
          <div className="recipe-flow"><div><strong data-manuscript-excerpt="stage_i2i">{text('stage_i2i')}</strong></div><span className="flow-arrow" aria-hidden="true">→</span><div><strong data-manuscript-excerpt="stage_i2t">{text('stage_i2t')}</strong></div></div>
        </div>
        <Figure name="scaling" caption="scaling_caption" width={1604} height={496} />
        <div className="prose"><Passage id="recipe_finding" className="finding" /></div>
      </section>

      <section id="taxonomy">
        <div className="prose">
          <Heading id="taxonomy_heading" />
          <Passage id="taxonomy_intro" />
          <Passage id="taxonomy_count" />
        </div>
        <Figure name="unitaskonomy" caption="taxonomy_caption" width={1604} height={1128} />
        <div className="prose"><Passage id="taxonomy_annotation" /></div>
      </section>

      <section id="transfer">
        <div className="prose">
          <Heading id="transfer_heading" />
          <Passage id="transfer_intro" />
          <Passage id="transfer_setup" />
        </div>
        <Figure name="transfer-matrix" caption="transfer_caption" width={1616} height={1190} />
        <div className="prose">
          <Passage id="transfer_scope" />
          <h3 data-manuscript-excerpt="related_heading">{text('related_heading')}</h3>
          <Passage id="related_results" />
          <h3 data-manuscript-excerpt="cross_heading">{text('cross_heading')}</h3>
          <Passage id="cross_results" />
        </div>
      </section>

      <section id="alignment">
        <div className="prose">
          <Heading id="alignment_heading" />
          <Passage id="alignment_intro" />
          <Passage id="alignment_setup" />
        </div>
        <Figure name="gradient-alignment" caption="alignment_caption" width={1476} height={674} />
        <div className="prose">
          <Passage id="alignment_results" />
          <Passage id="alignment_finding" className="finding" />
        </div>
      </section>

      <section className="prose acknowledgments" id="acknowledgments">
        <Heading id="ack_heading" />
        <Passage id="ack_names" />
        <p data-site-credit="design">This project page’s design and presentation are inspired by <a href="https://beyond-llms.github.io/" target="_blank" rel="noreferrer">Beyond Language Modeling: An Exploration of Multimodal Pretraining</a>. We thank its authors for the inspiration.</p>
      </section>
    </main>
    <footer><span data-manuscript-excerpt="title">{text('title')}</span><a href={manuscript}>Manuscript ↗</a><a href="#top">Back to top ↑</a></footer>
  </>;
}
