"""Import author-supplied v13 evaluation and four I2I examples.

Usage: python3 scripts/import-v13-update.py HEATMAP.html SAMPLE.zip ...
"""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import json
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
heatmap_path = Path(sys.argv[1])
sample_paths = [Path(p) for p in sys.argv[2:]]
assert len(sample_paths) == 4

html = heatmap_path.read_text()
assert html.count('const D=') == 1
source, _ = json.JSONDecoder().raw_decode(html.split('const D=', 1)[1])
old = json.loads((ROOT / 'content/unitaskonomy-v12.json').read_text())
data = deepcopy(old)
sample_by_id = {}
nodes_by_id = {}
provenance = json.loads((ROOT / 'content/unitaskonomy-v12-provenance.json').read_text())
new_samples = {}
for archive in sample_paths:
    with zipfile.ZipFile(archive) as z:
        assert set(z.namelist()) == {'input.png', 'target.png', 'sample.json'}
        sample = json.loads(z.read('sample.json'))
        node = sample['node']
        ident = node['id']
        assert ident not in sample_by_id and sample['catalog_version'] == 'v13'
        nodes_by_id[ident] = node
        images = []
        hashes = {}
        for kind in ('input', 'target'):
            name = ident.replace(':', '_') + '-' + kind + '.png'
            raw = z.read(kind + '.png')
            destination = ROOT / 'public/interactive/examples' / name
            destination.write_bytes(raw)
            digest = sha256(raw).hexdigest()
            images.append('/interactive/examples/' + name)
            hashes[name] = digest
            provenance['images'][name] = digest
        sample_by_id[ident] = {
            'uid': f"{ident}::{sample['split']}::{sample['index']}",
            'benchmark': node['name'],
            'question': sample['instruction'],
            'choices': [],
            'answer': '',
            'subcategory': node['family'],
            'images': images,
            'reason': '',
        }
        new_samples[ident] = {
            'archive': archive.name,
            'archive_sha256': sha256(archive.read_bytes()).hexdigest(),
            'split': sample['split'],
            'index': sample['index'],
            'task_key': node['task_key'],
            'checkpoint_model': node['checkpoint_model'],
            'family': node['family'],
            'definition_source': sample['meta'].get('pair_definition'),
            'images': hashes,
        }
assert set(sample_by_id) == {
    'i2i:semantic_segmentation', 'i2i:inpainting', 'i2i:jigsaw', 'i2i:localization'
}

for leaf in data['tree']['leaves']:
    if leaf['id'] in sample_by_id:
        assert leaf['sample'] is None and leaf['role'] == 'i2i'
        leaf['sample'] = sample_by_id[leaf['id']]

for ident, family in (('i2i:inpainting', 'RCN'), ('i2i:localization', 'RORG')):
    assert ident not in {l['id'] for l in data['tree']['leaves']}
    node = nodes_by_id[ident]
    definition = new_samples[ident]['definition_source']
    assert definition
    data['tree']['leaves'].append({
        'id': ident, 'family': family, 'role': 'i2i', 'name': node['name'],
        'definition': definition, 'n': 0, 'sample': sample_by_id[ident],
    })

model_leaves = {m['id']: m['leaf'] for m in old['heatmap']['models'] if 'leaf' in m}
model_leaves.update({
    'BAGEL-coco-panoptic-semseg-r2-i2i38400-llava50k-seed42': 'i2i:semantic_segmentation',
    'BAGEL-v13-inpainting-coco2017-rect-r2-i2i38400-llava50k-seed42': 'i2i:inpainting',
    'BAGEL-clean-llava-from-refcocog-localize-i2i-n38400': 'i2i:localization',
})
data['heatmap'] = {
    'models': [dict(id=m['id'], name=m['abbr'], group=m['group'], **({'leaf': model_leaves[m['id']]} if m['id'] in model_leaves else {})) for m in source['models']],
    'nodes': source['nodes'],
    'scopes': source['scopes'],
    'baseline': source['default_baseline'],
    'expected': source['expected'],
    'metrics': source['metrics'],
}
assert len(data['heatmap']['models']) == 18
assert len(data['tree']['leaves']) == 42
assert source['taxonomy']['hash'] == old['source']['hash']
data['source']['heatmap'] = heatmap_path.name
data['source']['exported'] = source['generated_at']

(ROOT / 'content/unitaskonomy-v13.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
provenance['v13_heatmap'] = {
    'file': heatmap_path.name,
    'sha256': sha256(heatmap_path.read_bytes()).hexdigest(),
    'generated_at': source['generated_at'],
    'taxonomy_hash': source['taxonomy']['hash'],
    'models': len(source['models']),
    'i2t_rows': len(source['nodes']),
    'display_rows': sum(n['type'] == 'leaf' and source['expected']['ALL'][n['id']] > 100 for n in source['nodes']),
}
provenance['v13_representative_samples'] = new_samples
(ROOT / 'content/unitaskonomy-v12-provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
