"""Verify imported data and representative images against the existing author-data artifact."""
from pathlib import Path
import base64, hashlib, json, re
from v12_audit import DATA, ROOT, H, LEAVES, MODELS, value

source = ROOT.parent / 'unitaskonomy-interactive'
reference = json.loads(re.search(r'<script[^>]*id="data"[^>]*>(.*?)</script>', (source/'dist/index.html').read_text(), re.S).group(1))
manifest = json.loads((ROOT/'content/unitaskonomy-v12-provenance.json').read_text())
assert manifest['sources'] == json.loads((source/'source-manifest.json').read_text())['sources']
assert DATA['heatmap'] == reference['heatmap']
assert DATA['source'] == reference['source']
images = 0
for current, original in zip(DATA['tree']['leaves'], reference['tree']['leaves'], strict=True):
    if current['sample']:
        for path, encoded in zip(current['sample']['images'], original['sample']['images'], strict=True):
            raw = (ROOT / 'public' / path.lstrip('/')).read_bytes()
            assert raw == base64.b64decode(encoded.split(';base64,')[1])
            assert hashlib.sha256(raw).hexdigest() == manifest['images'][Path(path).name]
            images += 1
        original['sample']['images'] = current['sample']['images']
    assert current == original
assert DATA['tree']['families'] == reference['tree']['families']
assert len(LEAVES) == 40
assert sum(l['role'] == 'i2i' for l in LEAVES.values()) == 15
assert sum(l['role'] == 'i2t' for l in LEAVES.values()) == 25
assert sum(l['sample'] is not None for l in LEAVES.values()) == 25
assert len([n for n in H['nodes'] if n['type']=='leaf' and H['expected']['ALL'][n['id']] > 100]) == 19
assert sum(l['n'] for l in LEAVES.values()) == 9444
checks = [
    ('i2t:OBJECT_COUNTING','BAGEL-clean-llava-from-counting-i2i',3.57),
    ('i2t:METRIC_3D_RELATION','BAGEL-taskonomy-depth-zbuffer',2.90),
    ('i2t:GLOBAL_ORDERING','BAGEL-taskonomy-segment-unsup25d',11.58),
    ('i2t:CORRESPONDENCE_TRACKING','BAGEL-clean-llava-from-colorization-palette-i2i-n51200',5.71),
    ('i2t:MULTIVIEW_VIEWPOINT_REASONING','BAGEL-taskonomy-keypoints2d',7.38),
]
for row, model, expected in checks:
    assert round(value('ALL',row,model,'delta'),2)==expected
for scope in H['scopes']:
    for node in H['nodes']:
        for model in H['models']:
            pair=H['metrics'].get(scope['id'],{}).get(node['id'],{}).get(model['id'])
            if pair:
                assert 0 <= pair[0] <= pair[1]
                assert pair[1] == H['expected'][scope['id']][node['id']]
assert LEAVES['i2i:semantic_segmentation']['family']=='REC'
print(json.dumps({'unchanged_dataset':True,'unchanged_original_images':images,'tree_leaves':40,'default_cells':19*15,'verified_paper_examples':len(checks)},indent=2))
