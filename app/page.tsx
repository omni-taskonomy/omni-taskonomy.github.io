import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ReactNode } from 'react';

const manuscript = 'https://www.overleaf.com/project/69d99c42c6f3e61ae13f54f1';
const sections = [['controlled', 'Controlled tasks'], ['recipe', 'Training recipe'], ['taxonomy', 'UniTaskonomy'], ['transfer', 'Transfer map'], ['alignment', 'Why it transfers']];
const transferExamples = [
  ['Z-depth', 'Metric 3D relation', '+2.90'],
  ['Object pointing', 'Counting', '+3.57'],
  ['2.5D segmentation', '2D Ordering', '+11.58'],
  ['Colorization', 'Visual correspondence', '+5.71'],
  ['2D keypoints', 'Multi-view reasoning', '+7.38'],
];
function Figure({ name, alt, width, height, children, eager = false }: { name: string; alt: string; width: number; height: number; children: ReactNode; eager?: boolean }) {
  return <figure>
    <a className="figure-link" href={`/figures/${name}.png`} target="_blank" rel="noreferrer" aria-label={`Open full-resolution figure: ${alt}`}>
      <img src={`/figures/${name}.png`} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} />
      <span className="figure-expand" aria-hidden="true">View full size ↗</span>
    </a>
    <figcaption>{children}</figcaption>
  </figure>;
}
function Finding({ children }: { children: ReactNode }) { return <div className="finding">{children}</div>; }

export default function Home() {
  return <>
    <a className="skip-link" href="#overview">Skip to content</a>
    <header className="hero" id="top">
      <p className="eyebrow">Generation → Understanding</p>
      <h1>When Does Image Generation<br className="desktop-break" /> Help Image Understanding?</h1>
      <p className="hero-subtitle">A capability-level study of training-time transfer</p>
      <a className="paper-button" href={manuscript} target="_blank" rel="noreferrer">Read the manuscript <span aria-hidden="true">↗</span></a>
    </header>
    <nav className="section-nav" aria-label="Page sections"><a href="#top">Top ↑</a>{sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
    <main>
      <section className="overview" id="overview">
        <div className="prose">
          <p className="eyebrow">TL;DR</p>
          <p className="lede">Learning to <span className="generation">generate images</span> can teach a model to <span className="understanding">understand them</span>—when the supervision and training recipe align.</p>
          <p>Can image generation improve visual understanding through training alone? We study this question in BAGEL, pairing image-to-image (I2I) editing with image-to-text (I2T) prediction. We find reliable transfer under two-stage training, map its benefits across visual capabilities, and examine how the two objectives update shared model parameters.</p>
        </div>
        <Figure name="overview" alt="Three findings: I2I data scaling, selective transfer between visual capabilities, and gradient alignment across parameter groups" width={1608} height={478} eager>
          <strong>When, where, and why generation helps.</strong> Transfer depends on the training recipe, the visual capability, and the compatibility of updates to shared parameters. Figures are from the manuscript.
        </Figure>
        <div className="prose"><Finding><strong>The central finding.</strong> Image editing provides useful supervision for visual understanding. The benefit is structured: different editing tasks strengthen different capabilities.</Finding></div>
      </section>

      <section id="controlled">
        <div className="prose"><p className="section-number">01 · Controlled tasks</p><h2>Same visual problem.<br />Different output modality.</h2>
          <p>To isolate the contribution of generation, we construct paired tasks with the same input and underlying visual operation. In <strong>Jigsaw</strong>, the model restores shuffled image patches. In <strong>Zoom-In</strong>, it orders views at different zoom levels. I2I supervision produces the correctly ordered image; I2T supervision predicts the permutation in text.</p>
          <p>We then evaluate the model on the corresponding I2T task. This tests training-time transfer: the model answers directly in text, without generating an intermediate image at inference time.</p>
        </div>
        <Figure name="controlled-tasks" alt="Paired Jigsaw and Zoom-In tasks: image reconstruction and text permutation prediction from the same input" width={1604} height={260}>
          <strong>One operation, two forms of supervision.</strong> The paired tasks differ primarily in how the answer is expressed. The controlled setting is instantiated on BAGEL.
        </Figure>
        <div className="prose"><Finding><strong>Controlled evidence.</strong> I2I supervision improves paired I2T performance; sharing an architecture alone does not establish that transfer will occur.</Finding></div>
      </section>

      <section id="recipe">
        <div className="prose"><p className="section-number">02 · Training recipe</p><h2>Learn from images first.<br />Then finetune for understanding.</h2>
          <p>We compare an I2T-only baseline with five recipes that vary the order of training, the mixing of objectives, and whether shared understanding parameters are updated. <strong>I2I pretraining followed by I2T finetuning</strong> is the default recipe: it yields strong, stable transfer as the I2I budget grows.</p>
          <div className="recipe-flow" aria-label="Training recipe: I2I pretraining, with shared understanding weights updated, followed by I2T finetuning"><div><span className="step-label">Stage 1</span><strong>I2I pretraining</strong><span>Update shared understanding weights</span></div><span className="flow-arrow" aria-hidden="true">→</span><div><span className="step-label">Stage 2</span><strong>I2T finetuning</strong><span>Train on direct understanding supervision</span></div></div>
        </div>
        <Figure name="scaling" alt="Jigsaw and Zoom-In exact-match accuracy as I2I and I2T training data budgets increase" width={1604} height={496}>
          <strong>More I2I data can improve I2T accuracy.</strong> Left: scale I2I data from 3k to 100k examples while holding I2T data at 1k. Right: scale I2T data from 1k to 30k, comparing I2T-only training with two-stage training using 100k I2I examples. The metric is exact-match accuracy.
        </Figure>
        <div className="prose"><p>The improvement is largest when I2T data is scarce. Increasing direct I2T supervision still helps, so image editing complements understanding data rather than fully replacing it.</p><Finding><strong>Practical takeaway.</strong> Give editing supervision a stage in which it can update shared understanding parameters, then adapt the model to the target text-output task.</Finding></div>
      </section>

      <section id="taxonomy">
        <div className="prose"><p className="section-number">03 · UniTaskonomy</p><h2>A shared language for visual capabilities.</h2>
          <p>Generation and understanding benchmarks usually organize their tasks separately. <strong>UniTaskonomy</strong> places both in one hierarchy based on the visual information they require, using the three Rs of computer vision: <strong>Recognition</strong>, <strong>Reconstruction</strong>, and <strong>Reorganization</strong>.</p>
          <p>The taxonomy contains <strong>15 I2I supervision tasks</strong> and <strong>25 I2T capabilities</strong>. Each leaf is explicitly typed as a training objective or an evaluation capability, allowing related tasks to share a visual hierarchy while preserving their distinct identities.</p>
        </div>
        <Figure name="unitaskonomy" alt="UniTaskonomy hierarchy: Recognition identifies semantic content, Reconstruction recovers geometry and appearance, and Reorganization groups, locates, and relates visual elements" width={1604} height={1128}>
          <strong>Organize by visual information.</strong> Recognition covers semantic identity and attributes; Reconstruction covers geometry and appearance; Reorganization covers grouping, localization, and relationships among visual elements.
        </Figure>
        <div className="prose"><p>Fine-grained capabilities are grounded in examples from BLINK, MMStar, MMT-Bench, CV-Bench, RealWorldQA, MMVP, and VStarBench. The vocabulary is consolidated through human review; benchmark samples receive a primary capability label by majority agreement among three independent LLM judges.</p></div>
      </section>

      <section id="transfer">
        <div className="prose"><p className="section-number">04 · Transfer map</p><h2>Which editing task helps which capability?</h2>
          <p>For each editing task, we start from the same BAGEL checkpoint, train on <strong>50k I2I examples</strong>, and then finetune on the same <strong>10k LLaVA-Instruct examples</strong>. We measure changes in capability accuracy against an I2T-only baseline trained on that same understanding data.</p>
          <p>The map shows both positive and negative transfer. Related supervision often helps—such as depth prediction for metric 3D reasoning—but useful transfer also crosses capability families.</p>
        </div>
        <Figure name="transfer-matrix" alt="Generation-to-understanding transfer matrix with 15 I2I tasks and 19 I2T capabilities; blue cells show gains and red cells show losses against the I2T-only baseline" width={1616} height={1190}>
          <strong>Transfer is selective.</strong> Each cell is the accuracy change in percentage points (pp) relative to the I2T-only baseline. Blue indicates a gain; red indicates a loss. Outlined cells mark the highest observed score in each row, including ties. The main matrix includes the 19 capabilities with more than 100 evaluation examples each.
        </Figure>
        <div className="prose">
          <h3>Selected capability gains</h3>
          <Table className="results-table"><TableHeader><TableRow><TableHead scope="col">I2I supervision</TableHead><TableHead scope="col">I2T capability</TableHead><TableHead scope="col" className="numeric">Gain (pp)</TableHead></TableRow></TableHeader><TableBody>{transferExamples.map(([task, capability, gain]) => <TableRow key={task}><TableCell>{task}</TableCell><TableCell>{capability}</TableCell><TableCell className="numeric gain">{gain}</TableCell></TableRow>)}</TableBody></Table>
          <p className="table-note">Selected task–capability pairs reported in the manuscript; these are capability-level gains, not an overall benchmark average.</p>
          <Finding><strong>Choose supervision by capability.</strong> Object pointing supports counting; depth prediction supports metric spatial reasoning. Keypoint supervision also transfers beyond its own family, improving multi-view reasoning.</Finding>
        </div>
      </section>

      <section id="alignment">
        <div className="prose"><p className="section-number">05 · Why it transfers</p><h2>Compatible updates to shared representations.</h2>
          <p>To understand where transfer occurs, we compare gradients from paired I2I and I2T examples at the same pretrained BAGEL checkpoint. The study uses <strong>500 matched source pairs per task across six tasks</strong>, before task-specific finetuning.</p>
          <p>For Jigsaw and Zoom-In, generation and understanding gradients align most strongly in <strong>pre-attention RMSNorm</strong>. Looking across transformer layers, strong positive alignment concentrates in the early layers. These patterns point to shared visual representations as a route for transfer.</p>
        </div>
        <Figure name="gradient-alignment" alt="Gradient cosine similarity for Jigsaw and Zoom-In, showing strong alignment in pre-attention RMSNorm and early transformer layers" width={1476} height={674}>
          <strong>Alignment varies across modules and depth.</strong> Left: mean gradient cosine by parameter group. Right: layer-wise RMSNorm alignment. Blue bars indicate positive alignment; purple bars indicate negative alignment.
        </Figure>
        <div className="prose"><Finding><strong>Mechanistic evidence.</strong> The gradient analysis locates compatible generation and understanding updates in early normalization layers. It provides a descriptive view of alignment, not a statistical significance test.</Finding></div>
      </section>

      <section className="prose acknowledgments" id="acknowledgments">
        <p className="section-number">Acknowledgments</p><h2>With thanks.</h2>
        <p>We thank <strong>Grace Luo</strong>, <strong>Amil Dravid</strong>, <strong>Xiaochuang Han</strong>, and <strong>Yushi Hu</strong>.</p>
        <p>This project page’s design and presentation are inspired by <a href="https://beyond-llms.github.io/" target="_blank" rel="noreferrer">Beyond Language Modeling: An Exploration of Multimodal Pretraining</a>. We thank its authors for the inspiration.</p>
      </section>
    </main>
    <footer><span>When Does Image Generation Help Image Understanding?</span><a href={manuscript} target="_blank" rel="noreferrer">Manuscript ↗</a><a href="#top">Back to top ↑</a></footer>
  </>;
}
