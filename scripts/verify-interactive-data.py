"""Verify the v13 heatmap and I2I examples against the supplied sources."""
from pathlib import Path
import base64
import hashlib
import json
import re
import sys

from v12_audit import DATA, RAW, CORRECTIONS, ROOT, H, LEAVES

v12 = json.loads((ROOT / 'content/unitaskonomy-v12.json').read_text())
reference_root = ROOT.parent / 'unitaskonomy-interactive'
reference = json.loads(re.search(r'<script[^>]*id="data"[^>]*>(.*?)</script>', (reference_root/'dist/index.html').read_text(), re.S).group(1))
manifest = json.loads((ROOT/'content/unitaskonomy-v12-provenance.json').read_text())
assert manifest['sources'] == json.loads((reference_root/'source-manifest.json').read_text())['sources']
assert v12['heatmap'] == reference['heatmap']
assert v12['source'] == reference['source']

v12_additions = manifest['i2i_representative_samples']['samples']
v13_additions = manifest['v13_representative_samples']
assert len(v12_additions) == 12 and set(v13_additions) == {
    'i2i:semantic_segmentation', 'i2i:inpainting', 'i2i:jigsaw', 'i2i:localization'
}
original_images = 0
for current, original in zip(v12['tree']['leaves'], reference['tree']['leaves'], strict=True):
    if original['sample']:
        for path, encoded in zip(current['sample']['images'], original['sample']['images'], strict=True):
            raw = (ROOT / 'public' / path.lstrip('/')).read_bytes()
            assert raw == base64.b64decode(encoded.split(';base64,')[1])
            assert hashlib.sha256(raw).hexdigest() == manifest['images'][Path(path).name]
            original_images += 1
        original['sample']['images'] = current['sample']['images']
        assert current == original
    elif current['sample']:
        assert current['id'] in v12_additions and current['role'] == 'i2i'
        for path in current['sample']['images']:
            digest = hashlib.sha256((ROOT / 'public' / path.lstrip('/')).read_bytes()).hexdigest()
            assert digest == v12_additions[current['id']]['images'][Path(path).name]
        assert {**current, 'sample': None} == original
    else:
        assert current == original

v12_leaves = {leaf['id']: leaf for leaf in v12['tree']['leaves']}
added_images = 0
for leaf in RAW['tree']['leaves']:
    ident = leaf['id']
    if ident == 'i2i:colorization':
        assert {**leaf, 'sample': None} == v12_leaves[ident]
        assert leaf['sample'] and len(leaf['sample']['images']) == 2
        for path, asset in zip(leaf['sample']['images'], manifest['paper_colorization_example']['assets'], strict=True):
            digest = hashlib.sha256((ROOT / 'public' / path.lstrip('/')).read_bytes()).hexdigest()
            assert digest == asset['sha256'] == manifest['images'][Path(path).name]
        continue
    if ident not in v13_additions:
        assert leaf == v12_leaves[ident]
        continue
    assert leaf['role'] == 'i2i' and leaf['sample']
    assert leaf['sample']['choices'] == [] and leaf['sample']['answer'] == ''
    assert leaf['sample']['reason'] == '' and len(leaf['sample']['images']) == 2
    for path in leaf['sample']['images']:
        digest = hashlib.sha256((ROOT / 'public' / path.lstrip('/')).read_bytes()).hexdigest()
        assert digest == v13_additions[ident]['images'][Path(path).name]
        assert digest == manifest['images'][Path(path).name]
        added_images += 1
    if ident in v12_leaves:
        assert {**leaf, 'sample': None} == v12_leaves[ident]
    else:
        assert ident in {'i2i:inpainting', 'i2i:localization'}
        assert leaf['definition'] == v13_additions[ident]['definition_source']
assert RAW['tree']['families'] == v12['tree']['families']

if len(sys.argv) > 1:
    html_path = Path(sys.argv[1])
    raw_html = html_path.read_bytes()
    assert hashlib.sha256(raw_html).hexdigest() == manifest['v13_heatmap']['sha256']
    html = raw_html.decode()
    source, _ = json.JSONDecoder().raw_decode(html.split('const D=', 1)[1])
    assert RAW['heatmap']['metrics'] == source['metrics']
    assert RAW['heatmap']['expected'] == source['expected']
    assert RAW['heatmap']['nodes'] == source['nodes']
    assert RAW['heatmap']['scopes'] == source['scopes']
    assert RAW['heatmap']['baseline'] == source['default_baseline']
    assert [(m['id'], m['name'], m['group']) for m in RAW['heatmap']['models']] == [(m['id'], m['abbr'], m['group']) for m in source['models']]
    assert source['taxonomy']['hash'] == RAW['source']['hash']
if len(sys.argv) > 2:
    paper_manifest_bytes = Path(sys.argv[2]).read_bytes()
    assert hashlib.sha256(paper_manifest_bytes).hexdigest() == manifest['paper_colorization_example']['manifest_sha256']
    paper_manifest = json.loads(paper_manifest_bytes)
    colorization = next(x for x in paper_manifest['examples'] if x['node_id'] == 'i2i:colorization')
    leaf = next(x for x in RAW['tree']['leaves'] if x['id'] == 'i2i:colorization')
    assert {k: leaf['sample'][k] for k in ('uid', 'question', 'choices', 'answer', 'benchmark')} == colorization['sample']
    assert leaf['definition'] == colorization['definition']

assert RAW['source']['heatmap'] == manifest['v13_heatmap']['file']
assert RAW['source']['exported'] == manifest['v13_heatmap']['generated_at']
assert len(H['models']) == 18 and len(H['nodes']) == 29
assert H['baseline'] == v12['heatmap']['baseline']
assert H['nodes'] == v12['heatmap']['nodes']
assert H['expected'] == v12['heatmap']['expected']
assert H['scopes'] == v12['heatmap']['scopes']
assert sum(n['type'] == 'leaf' and H['expected']['ALL'][n['id']] > 100 for n in H['nodes']) == 19
assert CORRECTIONS['leaf_families'] == {'i2i:semantic_segmentation': 'RORG'}
assert DATA['heatmap']['metrics'] == RAW['heatmap']['metrics']
for current, original in zip(DATA['tree']['leaves'], RAW['tree']['leaves'], strict=True):
    assert current == {**original, 'family': CORRECTIONS['leaf_families'].get(original['id'], original['family'])}
assert len(LEAVES) == 42
assert sum(l['role'] == 'i2i' for l in LEAVES.values()) == 17
assert sum(l['role'] == 'i2t' for l in LEAVES.values()) == 25
assert sum(l['sample'] is not None for l in LEAVES.values()) == 42
assert sum(l['n'] for l in LEAVES.values()) == 9444
assert LEAVES['i2i:semantic_segmentation']['family'] == 'RORG'
assert LEAVES['i2i:inpainting']['family'] == 'RCN'
assert LEAVES['i2i:localization']['family'] == 'RORG'
assert [LEAVES[m['leaf']]['family'] for m in H['models'] if 'leaf' in m] == ['RCN'] * 9 + ['RORG'] * 8
assert not any(l['role'] == 'i2i' and l['family'] == 'REC' for l in LEAVES.values())
for scope in H['scopes']:
    for node in H['nodes']:
        for model in H['models']:
            pair = H['metrics'].get(scope['id'], {}).get(node['id'], {}).get(model['id'])
            if pair:
                assert 0 <= pair[0] <= pair[1] == H['expected'][scope['id']][node['id']]
print(json.dumps({'v13_models': 18, 'visible_paper_rows': 19, 'new_i2i_nodes': 2,
                  'new_i2i_examples': 4, 'verified_new_images': added_images,
                  'preserved_original_images': original_images, 'display_cells': 19*17}, indent=2))
