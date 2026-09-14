"""Independent copy/numeric expectations for the author-supplied v12 figures."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'content/unitaskonomy-v12.json').read_text())
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
            return f"{sum(l['role']=='i2i' for l in children)} I2I · {sum(l['role']=='i2t' for l in children)} I2T"
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
