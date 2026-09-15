"""Independent copy/numeric expectations for the author-supplied v12 figures."""
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = json.loads((ROOT / 'content/unitaskonomy-v12.json').read_text())
CORRECTIONS = json.loads((ROOT / 'content/unitaskonomy-author-corrections.json').read_text())
DATA = deepcopy(RAW)
for leaf in DATA['tree']['leaves']:
    leaf['family'] = CORRECTIONS['leaf_families'].get(leaf['id'], leaf['family'])
corrected_leaves = {leaf['id']: leaf for leaf in DATA['tree']['leaves']}
families = {family['id']: family for family in DATA['tree']['families']}
models_by_leaf = {model['leaf']: model for model in DATA['heatmap']['models'] if 'leaf' in model}
assert set(CORRECTIONS['i2i_column_order']) == set(models_by_leaf)
assert len(CORRECTIONS['i2i_column_order']) == len(models_by_leaf)
ordered_models = []
for ident in CORRECTIONS['i2i_column_order']:
    model = models_by_leaf[ident]
    model['group'] = families[corrected_leaves[ident]['family']]['name'] + ' I2I'
    ordered_models.append(model)
DATA['heatmap']['models'] = [m for m in DATA['heatmap']['models'] if m['id'] == DATA['heatmap']['baseline']] + ordered_models
H = DATA['heatmap']
LEAVES = {l['id']: l for l in DATA['tree']['leaves']}
MODELS = {m['id']: m for m in H['models']}
FAMILIES = {f['id']: f for f in DATA['tree']['families']}

def copy(key):
    kind, ident, *fields = key.split('|')
    field = fields[0] if fields else None
    if kind == 'leaf':
        leaf = LEAVES[ident]
        assert field in {'name', 'definition', 'n'}
        return f"{leaf['n']:,}" if field == 'n' else leaf[field]
    if kind == 'family':
        if field == 'count':
            children = [l for l in LEAVES.values() if l['family'] == ident]
            counts = [(sum(l['role']==role for l in children),role.upper()) for role in ('i2i','i2t')]
            return ' · '.join(f'{n} {role}' for n,role in counts if n)
        assert field in {'name', 'definition'}
        return FAMILIES[ident][field]
    if kind == 'model': return MODELS[ident]['name']
    if kind == 'scope': return next(s['label'] for s in H['scopes'] if s['id'] == ident)
    if kind == 'sample':
        sample = LEAVES[ident]['sample']
        if field.startswith('choice:'): return sample['choices'][int(field.split(':')[1])]
        assert field in {'question', 'answer', 'benchmark', 'uid', 'reason'}
        return sample[field]
    raise AssertionError('Unregistered v12 key: ' + key)

def accuracy(pair):
    return 100 * pair[0] / pair[1] if pair and pair[1] > 0 else None

def value(scope, row, model, mode):
    assert mode in {'delta', 'accuracy'}
    a = accuracy(H['metrics'].get(scope, {}).get(row, {}).get(model))
    b = accuracy(H['metrics'].get(scope, {}).get(row, {}).get(H['baseline']))
    return a if mode == 'accuracy' else a - b if a is not None and b is not None else None

def metric(key):
    scope, row, model, mode, precision = key.split('|')
    precision = int(precision)
    assert precision in {1, 2}
    v = value(scope, row, model, mode)
    if v is None: return '—'
    if abs(v) < .5 * 10 ** -precision: v = 0
    return ('+' if mode == 'delta' and v > 0 else '') + f'{v:.{precision}f}'

def view(key):
    scope, subset = key.split('|')
    assert subset in {'main', 'all'}
    rows = [n for n in H['nodes'] if n['type'] == 'leaf' and (subset == 'all' or H['expected']['ALL'][n['id']] > 100)]
    count = sum(H['expected'][scope].get(n['id'], 0) for n in rows)
    return f'{len(rows)} capabilities · {count:,} evaluation samples'
