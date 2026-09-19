"""Import the current paper's plotted gradient bar values without rounding them."""
from pathlib import Path
import ast
import hashlib
import json
import subprocess
import sys

SITE = Path(__file__).resolve().parents[1]
PAPER = Path(sys.argv[1]).resolve()
data_path = PAPER / 'analysis/section6/data/initial_graph_data.json'
script_path = PAPER / 'analysis/section6/make_figures.py'
figure_path = PAPER / 'iclr2026/figures/section6/gradient_transfer_overview.svg'
raw = json.loads(data_path.read_text())
script = ast.parse(script_path.read_text())
module_labels = next(ast.literal_eval(node.value) for node in script.body
                     if isinstance(node, ast.Assign)
                     and any(isinstance(target, ast.Name) and target.id == 'modlabels' for target in node.targets))
assert len(module_labels) == 15
assert all(len(raw['modules'][task]) == 15 and len(raw['layers'][task]) == 28
           for task in ('jigsaw', 'zoomin'))
assert 'ini[\'modules\'][task]' in script_path.read_text()
assert 'ini[\'layers\'][task]' in script_path.read_text()

payload = {
    'source': {
        'paper_commit': subprocess.check_output(['git', '-C', str(PAPER), 'rev-parse', '--verify', 'HEAD'], text=True).strip(),
        'data_file': str(data_path.relative_to(PAPER)),
        'data_sha256': hashlib.sha256(data_path.read_bytes()).hexdigest(),
        'script_file': str(script_path.relative_to(PAPER)),
        'script_sha256': hashlib.sha256(script_path.read_bytes()).hexdigest(),
        'figure_file': str(figure_path.relative_to(PAPER)),
        'figure_sha256': hashlib.sha256(figure_path.read_bytes()).hexdigest(),
        'note': 'Figure vector geometry readouts, as documented in analysis/section6/README.md; plotted by make_figures.py.',
    },
    'module_labels': module_labels,
    'module_values': {task: raw['modules'][task] for task in ('jigsaw', 'zoomin')},
    'layer_values': {task: raw['layers'][task] for task in ('jigsaw', 'zoomin')},
}
(SITE / 'content/gradient-bars-v13.json').write_text(json.dumps(payload, indent=2) + '\n')
(SITE / 'public/figures/gradient-transfer-overview.svg').write_bytes(figure_path.read_bytes())
