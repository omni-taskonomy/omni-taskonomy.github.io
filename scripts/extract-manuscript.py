"""Extract only contiguous passages from the current, active manuscript."""
from pathlib import Path
import hashlib, json, re, sys
BASE = Path(__file__).resolve().parents[1]
SOURCE = BASE / 'content/manuscript-sources'
REV = (BASE / 'content/manuscript-revision.txt').read_text().strip()
assert r'\newcommand{\methodname}{OmniTaskonomy\xspace}' in (SOURCE / 'paper_layout.tex').read_text()
entries = {}

def visible(raw):
    return re.sub(r'(?<!\\)%[^\n]*', lambda m: ' ' * len(m[0]), raw)

def render(raw):
    s = visible(raw).replace(r'\methodname', 'OmniTaskonomy')
    s = re.sub(r'\\(?:textbf|textit|emph|section|subsection|paragraph|title)\{([^{}]*)\}', r'\1', s)
    s = s.replace(r'\(', '').replace(r'\)', '').replace(r'\%', '%').replace('~', ' ')
    s = s.replace('---', '—').replace('--', '–').replace('``', '“').replace("''", '”').replace('$', '')
    if re.search(r'\\[A-Za-z]+|[{}]', s): raise ValueError('Unresolved LaTeX: ' + s)
    return re.sub(r'\s+', ' ', s).strip()

def take(key, filename, start, end=None):
    raw = (SOURCE / filename).read_text()
    masked = visible(raw)
    begin = masked.index(start)
    stop = begin + len(start) if end is None else masked.index(end, begin) + len(end)
    snippet = raw[begin:stop]
    folder = '' if filename in {'main.tex', 'paper_layout.tex'} else 'sections/'
    entries[key] = {'text': render(snippet), 'source': {'file': 'iclr2026/' + folder + filename,
        'start_line': raw[:begin].count('\n') + 1, 'end_line': raw[:stop].count('\n') + 1,
        'raw_tex': snippet, 'file_sha256': hashlib.sha256(raw.encode()).hexdigest()}}

A='0_abstract.tex'; I='1_introduction_clean.tex'; P='3_poc.tex'; T='4_taxonomy.tex'; X='5_analysis.tex'; G='6_gradient.tex'
take('title','main.tex',r'\title{\methodname: How Image Generation Improves Visual Understanding}')
take('description',A,'Image generation provides dense supervision, yet its benefits for visual understanding remain unclear.')
take('tldr_question_1',I,r'Can generation supervision improve visual understanding, and under what training setup does this transfer emerge?')
take('tldr_question_2',I,r'Which kinds of generation data help which kinds of understanding tasks?')
take('tldr_question_3',I,r'What makes generation supervision transfer successfully to a particular understanding task?')
take('finding_a',I,'We find that schedules starting with I2I training scale consistently with additional generation data.')
take('finding_b',X,'Image-generation supervision benefits complementary visual capabilities: useful transfer can follow shared visual requirements and cross task-family boundaries.')
take('alignment_finding',G,'I2I and I2T gradients align most strongly in early pre-attention normalization layers.','larger average transfer gains.')
take('overview_caption_short',I,r'\textbf{When does generation help understanding?}')
take('legend_size',I,'Bubble sizes modestly emphasize row maxima among the shown sources.')
take('controlled_heading',P,r'\section{Does image generation help visual understanding?}')
take('controlled_lead',P,'To isolate the effect of output modality, we construct paired I2I and I2T tasks','as text.')
take('controlled_caption',P,'(a) Controlled Jigsaw and Zoom-In tasks with image and text outputs.')
take('controlled_inputs',P,'in Jigsaw, image patches are shuffled, and in Zoom-In, five views','are shuffled.')
take('controlled_output',P,'For both tasks, the I2I objective generates the correctly ordered image','in text.')
take('recipe_heading',P,r'\paragraph{Which Training Recipe Transfers Best?}')
take('recipe_result',P,'We therefore use I2I training followed by I2T finetuning as the default recipe in subsequent experiments.')
take('recipe_finding',P,'I2I supervision complements but does not replace direct I2T supervision,','with the largest gains in low-I2T settings.')
take('scaling_caption',P,'(b) I2T evaluation accuracy','100k I2I samples.')
take('taxonomy_heading',T,r'\section{\methodname: A Unified Taxonomy of Visual Capabilities}')
take('taxonomy_lead',T,r'We introduce \methodname, a shared hierarchy','rather than their output modality.')
take('taxonomy_caption',T,'A unified taxonomy of visual tasks organized into three broad families:','without conflating their task identities.')
take('taxonomy_annotation',T,'Once the capability vocabulary is finalized','samples without a two-of-three consensus are excluded.')
take('transfer_heading',X,r'\section{Which generation data help which visual capabilities?}')
take('transfer_scope',X,'We now evaluate the 15 I2I task types','across its 25 I2T capabilities.')
take('taxonomy_extensions',X,'We now evaluate the 15 I2I task types','across its 25 I2T capabilities.')
take('transfer_caption',X,'Each column corresponds to an I2I supervision task','including ties.')
take('transfer_lead',X,'Useful generation supervision thus extends across recognition, geometry, and spatial reasoning, with different sources benefiting different capabilities.')
take('related_heading',X,r'\paragraph{Useful source-target pairs can share visual requirements.}')
take('related_example',X,'Counting improves with all 17 sources,','objects to be counted.')
take('depth_example',X,'Geometry supervision also benefits metric 3D relation:','all $p<0.03$).')
take('cross_heading',X,r'\paragraph{Different sources benefit complementary capabilities.}')
take('cross_results',X,'Inpainting improves category recognition','All four gains have $p<0.01$.')
take('alignment_heading',G,r'\section{What Explains Generation-to-Understanding Transfer?}')
take('alignment_setup',G,'We sample 500 matched source pairs','at the pretrained checkpoint.')
take('alignment_results',G,'We observe a strong positive correlation','larger average gains from I2I training.')
take('alignment_lead',G,'Alignment and transfer are positively correlated across these 105 pairs ($r=0.496$).')
take('alignment_caption',G,'(a,b) Jigsaw and Zoom-In gradients','held-out post-PCA cosines.')
take('alignment_scale',G,'Scores are dimension-scaled, held-out post-PCA cosines.')
take('nav_controlled',P,'image generation help visual understanding?')
take('nav_training',P,'Training Recipe')
take('nav_taxonomy',T,r'\methodname')
take('nav_transfer',X,'generation data help which visual capabilities?')
take('nav_alignment',G,'Generation-to-Understanding Transfer?')
result={'manuscript_project':'https://www.overleaf.com/project/69d99c42c6f3e61ae13f54f1','manuscript_commit':REV,'rendering':'Contiguous source excerpts with only LaTeX typography and method macro expanded.','excerpts':entries}
out=BASE/'content/manuscript-excerpts.json'
serialized=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if '--check' in sys.argv:
    assert out.read_text()==serialized,'Stored excerpts do not match current source'
    print(f'{len(entries)} current excerpts verified at {REV}')
else:
    out.write_text(serialized)
    print(f'Extracted {len(entries)} current excerpts')
