'use client';

import { useState } from 'react';
import source from '@/content/gradient-alignment-matrix.json';

type Metric = 'dimension_scaled' | 'post_pca_cosine';
type Cell = { row: number; column: number };

const metricNames: Record<Metric, string> = {
  dimension_scaled: 'Effective-dimension scaled cosine',
  post_pca_cosine: 'Unscaled post-PCA cosine',
};

function color(value: number, bound: number) {
  const base = value < 0 ? [217, 54, 96] : [35, 120, 255];
  const strength = Math.min(1, Math.abs(value) / bound);
  return `rgb(${base.map(channel => Math.round(255 + (channel - 255) * strength)).join(',')})`;
}

export function GradientMatrix() {
  const [metric, setMetric] = useState<Metric>('dimension_scaled');
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [pinned, setPinned] = useState<Cell | null>(null);
  const active = pinned ?? hovered ?? { row: 0, column: 0 };
  const matrix = source.matrices[metric];
  const bound = Math.max(...matrix.flat().map(cell => Math.abs(cell.mean)));
  const groups = source.tasks.reduce<{ family: string; count: number }[]>((result, task) => {
    const last = result.at(-1);
    if (last?.family === task.family) last.count++;
    else result.push({ family: task.family, count: 1 });
    return result;
  }, []);
  const selected = matrix[active.row][active.column];
  const task = source.tasks[active.column];
  const capability = source.leaves[active.row];

  return <div className="gradient-matrix">
    <div className="gradient-matrix-controls">
      <label>Metric
        <select value={metric} onChange={event => { setMetric(event.target.value as Metric); setHovered(null); setPinned(null); }}>
          {(Object.keys(metricNames) as Metric[]).map(key => <option key={key} value={key}>{metricNames[key]}</option>)}
        </select>
      </label>
      <span>Blue: positive · Red: negative</span>
    </div>
    <div className="gradient-matrix-scroll" role="region" aria-label="Scrollable I2I and I2T gradient alignment matrix" tabIndex={0}>
      <table aria-label="15 image-to-image tasks by 19 image-to-text capabilities">
        <thead>
          <tr><th rowSpan={3} scope="col">I2T capability</th><th colSpan={source.tasks.length} scope="colgroup">I2I supervision task</th></tr>
          <tr>{groups.map(group => <th key={group.family} colSpan={group.count} scope="colgroup">{source.families[group.family as keyof typeof source.families]}</th>)}</tr>
          <tr>{source.tasks.map(task => <th key={task.id} scope="col" className="gradient-matrix-column"><span>{task.name}</span></th>)}</tr>
        </thead>
        <tbody>{source.leaves.map((leaf, row) => {
          const newFamily = row === 0 || source.leaves[row - 1].family !== leaf.family;
          const maximum = Math.max(...matrix[row].map(cell => cell.mean));
          return <tr key={leaf.id} className={newFamily ? 'gradient-matrix-group-start' : ''}>
            <th scope="row"><span>{leaf.name}</span></th>
            {source.tasks.map((task, column) => {
              const cell = matrix[row][column];
              const chosen = active.row === row && active.column === column;
              return <td key={task.id}><button type="button"
                className={(chosen ? 'active ' : '') + (cell.mean === maximum ? 'row-best' : '')}
                style={{ backgroundColor: color(cell.mean, bound), color: Math.abs(cell.mean) / bound > .62 ? '#fff' : '#1d3348' }}
                aria-label={`${task.name} to ${leaf.name}: ${cell.mean.toFixed(3)}, 95% interval ${cell.ci_low.toFixed(3)} to ${cell.ci_high.toFixed(3)}`}
                aria-pressed={pinned?.row === row && pinned?.column === column}
                onMouseEnter={() => setHovered({ row, column })}
                onFocus={() => setHovered({ row, column })}
                onClick={() => setPinned(chosen && pinned ? null : { row, column })}
                onKeyDown={event => { if (event.key === 'Escape') setPinned(null); }}>
                {cell.mean.toFixed(2)}
              </button></td>;
            })}
          </tr>;
        })}</tbody>
      </table>
    </div>
    <div className="gradient-matrix-detail" role="status">
      <strong>{task.name} → {capability.name}</strong>
      <span>Mean {selected.mean.toFixed(4)}</span>
      <span>95% CI [{selected.ci_low.toFixed(4)}, {selected.ci_high.toFixed(4)}]</span>
      <span>I2I n={selected.n_i2i} · I2T n={selected.n_i2t}</span>
      <span>Batch {selected.batch_i2i} × {selected.batch_i2t}</span>
      {selected.small_pool && <span>Small sample pool{selected.very_small_pool ? ' (very small)' : ''}</span>}
    </div>
  </div>;
}
