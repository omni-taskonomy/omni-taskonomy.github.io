"""Check the interactive bars against the exact current-paper figure data."""
from pathlib import Path
import hashlib, json, subprocess, sys
SITE=Path(__file__).resolve().parents[1]
PAPER=Path(sys.argv[1]).resolve()
payload=json.loads((SITE/'content/gradient-bars-v13.json').read_text())
source=payload['source']
assert source['paper_commit']==subprocess.check_output(['git','-C',str(PAPER),'rev-parse','HEAD'],text=True).strip()
for field in ('data','script','figure'):
    path=PAPER/source[field+'_file']
    assert hashlib.sha256(path.read_bytes()).hexdigest()==source[field+'_sha256'],field
assert (SITE/'public/figures/gradient-transfer-overview.svg').read_bytes()==(PAPER/source['figure_file']).read_bytes()
raw=json.loads((PAPER/source['data_file']).read_text())
for field,rawfield,n in (('module_values','modules',15),('layer_values','layers',28)):
    for task in ('jigsaw','zoomin'):
        assert payload[field][task]==raw[rawfield][task] and len(payload[field][task])==n,(field,task)
assert len(payload['module_labels'])==15
print('86 exact plotted gradient-bar values and current full figure verified')
