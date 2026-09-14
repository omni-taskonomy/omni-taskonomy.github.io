"""Extract contiguous manuscript passages; only render LaTeX typography/macros."""
from pathlib import Path
import hashlib,json,re,sys
BASE=Path(__file__).resolve().parents[1]
SOURCE=BASE/'content/manuscript-sources'
REV=(BASE/'content/manuscript-revision.txt').read_text().strip()
entries={}

def visible_source(raw):
    # Keep character offsets and newlines stable while masking LaTeX comments.
    return re.sub(r'(?<!\\)%[^\n]*',lambda m:' '*len(m[0]),raw)

def render(tex):
    text=visible_source(tex)
    text=text.replace(r'\methodname','UniTaskonomy')
    text=re.sub(r'\\(?:textbf|textit|emph|section|subsection|paragraph|title|subsubsection\*?)\{([^{}]*)\}',r'\1',text)
    text=text.replace(r'\%', '%').replace('~',' ').replace('---','—').replace('--','–')
    text=text.replace('``','“').replace("''",'”').replace('$','')
    if '\\' in text or '{' in text or '}' in text:
        raise ValueError('Unresolved LaTeX in selected passage: '+text)
    return re.sub(r'\s+',' ',text).strip()

def take(key, filename, start, end=None):
    raw=(SOURCE/filename).read_text()
    masked=visible_source(raw)
    begin=masked.index(start)
    stop=begin+len(start) if end is None else masked.index(end,begin)+len(end)
    snippet=raw[begin:stop]
    assert not re.search(r'\\(?:todo|amil|hj|qin|xd|ranjay|xie)\b',visible_source(snippet)),key
    entries[key]={'text':render(snippet),'source':{'file':'iclr2026/'+('' if filename=='main.tex' else 'sections/')+filename,'start_line':raw[:begin].count('\n')+1,'end_line':raw[:stop].count('\n')+1,'raw_tex':snippet,'file_sha256':hashlib.sha256(raw.encode()).hexdigest()}}

A='0_abstract.tex'; I='1_introduction_clean.tex'; P='3_poc.tex'; T='4_taxonomy.tex'; X='5_analysis.tex'; G='6_overall.tex'
take('title','main.tex',r'\title{When Does Image Generation Help Image Understanding?}')
take('description',A,'Image generation provides dense supervision over visual structure, yet prior work has found surprisingly limited transfer from generation data to visual understanding.')
take('abstract_open',A,'Image generation provides dense supervision','more I2I data is added.')
take('abstract_map',A,'To characterize transfer beyond matched task pairs','interfering with others.')
take('abstract_alignment',A,'Finally, in our controlled setting','what visual capability it supervises.')
take('overview_caption',I,r'\textbf{When does generation help understanding?}',r'generation helps understanding.')
take('controlled_heading',P,r'\section{Does image generation help visual understanding?}')
take('controlled_setup',P,'We first study whether image generation','useful supervision for visual understanding.')
take('controlled_model',P,'Our controlled framework is model-agnostic','Mixture-of-Transformers (MoT) architecture.')
take('controlled_inputs',P,'In Jigsaw, patches','different zoom levels are shuffled.')
take('controlled_output',I,'For example, given a shuffled image','corresponding I2T task.')
take('controlled_caption',P,'The two objectives therefore solve the same task from the same input, differing only in the output modality.')
take('recipe_heading',P,r'\subsection{How Should Generation and Understanding Be Combined?}')
take('recipe_setup',P,'We next study how I2I and I2T supervision','followed by mixed training.')
take('recipe_result',P,'We therefore use I2I pretraining','default recipe in subsequent experiments.')
take('stage_i2i',P,'I2I pretraining')
take('stage_i2t',P,'I2T finetuning')
take('scaling_caption',P,r'\textbf{Scaling I2I and I2T supervision.}')
take('recipe_finding',P,'I2I supervision complements but does not replace direct I2T supervision,','with the largest gains in low-I2T settings.')
take('taxonomy_heading',T,r'\section{\methodname: A Unified Taxonomy of Visual Capabilities}')
take('taxonomy_intro',T,'Existing benchmarks organize visual tasks','rather than their output modality.')
take('taxonomy_count',T,'The resulting taxonomy contains 15','without asserting task equivalence.')
take('taxonomy_caption',T,r'\textbf{UniTaskonomy.}','without conflating their task identities.')
take('taxonomy_annotation',T,'Once the capability vocabulary is finalized','samples without a two-of-three consensus are excluded.')
take('transfer_heading',X,r'\section{Which image-editing tasks help which visual capabilities?}')
take('transfer_intro',X,'The controlled experiments above show','downstream I2T capabilities.')
take('transfer_setup',X,'We use 50k I2I training samples per task.','same LLaVA-Instruct data.')
take('transfer_caption',X,r'\textbf{Generation-to-understanding transfer across visual capabilities.}',r'Rows and columns are organized according to \methodname for readability.')
take('transfer_scope',X,r'Our main analysis considers the 19 capabilities with more than 100 evaluation examples in \methodname.')
take('related_heading',X,r'\paragraph{I2I supervision improves related visual capabilities.}')
take('related_results',X,'Several I2I tasks yield gains','related visual questions.')
take('cross_heading',X,r'\paragraph{Gains also extend across capability families.}')
take('cross_results',X,'Useful transfer is not limited','outside the target capability\'s family.')
take('alignment_heading',G,r'\section{Understanding generation-to-understanding transfer}')
take('alignment_intro',G,'The previous experiments show','objectives update the model.')
take('alignment_setup',G,'We select six tasks and sample 500 source pairs per task','before any task-specific fine-tuning.')
take('alignment_caption',G,'The gradient cosine similarity of generation and understanding training data.')
take('alignment_results',G,'A layer-wise analysis of these modules further reveals','profiles across layers.')
take('alignment_finding',G,'Tasks that transfer to visual understanding produce more aligned gradients, with the strongest alignment occurring in early normalization layers.')
take('ack_heading','main.tex','Acknowledgments')
take('ack_names','main.tex','Grace Luo, Amil Dravid, Xiaochuang Han, Yushi Hu')
# Navigation uses exact heading fragments, not newly written research claims.
take('nav_controlled',P,'Transfer Setup')
take('nav_recipe',P,'Generation and Understanding')
take('nav_taxonomy',T,r'\methodname')
take('nav_transfer',X,'Transfer patterns')
take('nav_alignment',G,'Gradient alignment')
# Short, contiguous source selections for the redesigned reading layout.
take('hero_lead',I,'In this work, we study generation as a source of training supervision for visual understanding.')
take('controlled_lead',I,'To isolate generation-to-understanding transfer, we construct paired generation and understanding tasks that require the same underlying visual operation while differing only in output modality.')
take('taxonomy_lead',T,r'We introduce \methodname, a shared hierarchy','rather than their output modality.')
take('taxonomy_quantity',T,'The resulting taxonomy contains 15','training objective or an evaluation capability.')
take('transfer_lead',I,'Some gains follow intuitive capability correspondences','interfering with others.')
take('alignment_lead',I,'These results suggest that optimization compatibility between generation and understanding objectives may be one factor associated with successful transfer.')
take('overview_caption_short',I,r'\textbf{When does generation help understanding?}')
take('overview_panel_a',I,'(a) Increasing I2I supervision','training recipe.')
take('overview_panel_b',I,'(b) Across visual capabilities','bubble size denotes magnitude).')
take('overview_panel_c',I,'(c) This selectivity is also reflected inside the model','pre-attention normalization.')
take('related_example',X,r'The clearest example is \textit{Object pointing}',r'\textit{Counting} ($+3.57$ pp).')
take('depth_example',X,r'Similarly, \textit{Z-depth}',r'metric spatial reasoning.')
take('nav_training',P,'Training')
# TL;DR sequence requested by the author: paired tasks, taxonomy, findings.
take('tldr_paired',P,'We construct paired generation and understanding tasks that require the same visual operation but produce answers in different modalities.')
take('tldr_i2i',A,'image-to-image (I2I)')
take('tldr_i2t',A,'image-to-text (I2T)')
take('tldr_taxonomy',I,r'We therefore introduce \methodname, a unified capability taxonomy','within the same visual capability space.')
take('tldr_systematic',I,'This shared structure allows us to systematically measure transfer from each I2I task to each understanding capability.')
take('tldr_findings',A,'Taken together, our results challenge the view','what visual capability it supervises.')
result={'manuscript_project':'https://www.overleaf.com/project/69d99c42c6f3e61ae13f54f1','manuscript_commit':REV,'rendering':'Whitespace and LaTeX typography only; expand methodname using the manuscript macro. No rewritten or synthesized scientific prose.','excerpts':entries}
output=BASE/'content/manuscript-excerpts.json'
serialized=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
    assert output.read_text()==serialized,'Excerpt file no longer matches its source passages'
    print(f'{len(entries)} exact source excerpts verified at manuscript {REV}')
else:
    output.write_text(serialized)
    print(f'Extracted {len(entries)} manuscript passages')
