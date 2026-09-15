import payload from '@/content/unitaskonomy-v12.json';
import authorCorrections from '@/content/unitaskonomy-author-corrections.json';

export type Pair = [number, number];
export type Mode = 'delta' | 'accuracy';
export type Subset = 'main' | 'all';
export type Sample = { uid: string; benchmark: string; question: string; choices: string[] | null; answer: string; images: string[]; reason: string };
export type Leaf = { id: string; family: string; role: string; name: string; definition: string; n: number; sample: Sample | null };
export type Model = { id: string; name: string; group: string; leaf?: string };
const original = payload as unknown as {
  heatmap: {
    models: Model[]; nodes: { id: string; name: string; type: string }[];
    scopes: { id: string; label: string; n: number }[];
    baseline: string; expected: Record<string, Record<string, number>>;
    metrics: Record<string, Record<string, Record<string, Pair>>>;
  };
  tree: { families: { id: string; name: string; definition: string; n: number }[]; leaves: Leaf[] };
  source: { heatmap: string; viewer: string; samples: string; hash: string; exported: string };
};
// Preserve the supplied v12 export; apply only the author's later figure correction.
const correctedLeaves = original.tree.leaves.map(leaf => ({
  ...leaf,
  family: (authorCorrections.leaf_families as Record<string, string>)[leaf.id] ?? leaf.family,
}));
const orderedModels = authorCorrections.i2i_column_order.map(id => {
  const model = original.heatmap.models.find(model => model.leaf === id);
  const leaf = correctedLeaves.find(leaf => leaf.id === id);
  const family = original.tree.families.find(family => family.id === leaf?.family);
  if (!model || !family) throw new Error('Unknown author-corrected I2I task: ' + id);
  return { ...model, group: family.name + ' I2I' };
});
export const data: typeof original = {
  ...original,
  tree: { ...original.tree, leaves: correctedLeaves },
  heatmap: { ...original.heatmap, models: [...original.heatmap.models.filter(model => model.id === original.heatmap.baseline), ...orderedModels] },
};
export const familyColors: Record<string, string> = { REC: '#b77939', RCN: '#527eaf', RORG: '#3d8b71' };
export const leaves = new Map(data.tree.leaves.map(l => [l.id, l]));
export const models = new Map(data.heatmap.models.map(m => [m.id, m]));
export function accuracy(pair?: Pair) { return pair && pair[1] > 0 ? 100 * pair[0] / pair[1] : null; }
export function metric(scope: string, row: string, model: string) {
  const pair = data.heatmap.metrics[scope]?.[row]?.[model];
  const base = data.heatmap.metrics[scope]?.[row]?.[data.heatmap.baseline];
  const acc = accuracy(pair), baseline = accuracy(base);
  return { pair, base, accuracy: acc, baseline, delta: acc === null || baseline === null ? null : acc - baseline };
}
export function number(value: number | null, precision = 2, signed = false) {
  if (value === null || !Number.isFinite(value)) return '—';
  if (Math.abs(value) < 0.5 * 10 ** -precision) value = 0;
  return (signed && value > 0 ? '+' : '') + value.toFixed(precision);
}
export function rowsFor(subset: Subset) {
  return data.heatmap.nodes.filter(n => n.type === 'leaf' && (subset === 'all' || data.heatmap.expected.ALL[n.id] > 100));
}
export function modelsFor(mode: Mode) {
  return data.heatmap.models.filter(m => mode === 'accuracy' || m.id !== data.heatmap.baseline);
}
export function fill(value: number | null, mode: Mode) {
  if (value === null) return '#f1f3f6';
  const t = mode === 'delta' ? Math.min(Math.abs(value) / 15, 1) : Math.max(0, Math.min(value / 100, 1));
  const rgb = mode === 'delta' && value < 0 ? [218, 81, 100] : [56, 127, 217];
  return 'rgb(' + rgb.map(a => Math.round(255 + (a - 255) * t)).join(',') + ')';
}
// These keys preserve the supplied wording. Only counts receive display formatting.
export function sourceCopy(key: string): string {
  const [kind, id, field] = key.split('|');
  if (kind === 'leaf') {
    const leaf = leaves.get(id)!;
    return field === 'n' ? leaf.n.toLocaleString('en-US') : String(leaf[field as 'name' | 'definition']);
  }
  if (kind === 'family') {
    const f = data.tree.families.find(f => f.id === id)!;
    if (field === 'count') {
      const children = data.tree.leaves.filter(l => l.family === id);
      return ['i2i', 'i2t'].flatMap(role => {
        const count = children.filter(l => l.role === role).length;
        return count ? [count + ' ' + role.toUpperCase()] : [];
      }).join(' · ');
    }
    return f[field as 'name' | 'definition'];
  }
  if (kind === 'model') return models.get(id)!.name;
  if (kind === 'scope') return data.heatmap.scopes.find(s => s.id === id)!.label;
  if (kind === 'sample') {
    const s = leaves.get(id)!.sample!;
    return field.startsWith('choice:') ? s.choices![Number(field.split(':')[1])] : String(s[field as 'question' | 'answer' | 'benchmark' | 'uid' | 'reason']);
  }
  throw new Error('Unknown v12 source key: ' + key);
}
export function viewLabel(scope: string, subset: Subset) {
  const rows = rowsFor(subset);
  const n = rows.reduce((sum, row) => sum + (data.heatmap.expected[scope]?.[row.id] ?? 0), 0);
  return rows.length + ' capabilities · ' + n.toLocaleString('en-US') + ' evaluation samples';
}
