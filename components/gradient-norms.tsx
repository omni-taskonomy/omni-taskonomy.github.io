'use client';

import { useState } from 'react';
import data from '@/content/gradient-checkpoint-norms.json';

const points = data.records;
const x = (index: number) => 72 + index * 170;
const y = (value: number) => 224 - value * 18;
const checkpoint = (name: string) => name === 'base' ? 'BAGEL base' : name;

export function GradientNorms() {
  const [selected, setSelected] = useState(0);
  const current = points[selected];
  const series = [
    { key: 'jigsaw_i2t' as const, name: 'Jigsaw', className: 'jigsaw' },
    { key: 'zoomin_i2t' as const, name: 'Zoom-In', className: 'zoomin' },
  ];

  return <div className="gradient-norm-chart" data-visual-source="checkpoint-norm-csv">
    <div className="gradient-chart-head">
      <strong>I2T gradient norms</strong>
    </div>
    <div className="gradient-chart-legend"><span><i className="jigsaw" />Jigsaw</span><span><i className="zoomin" />Zoom-In</span></div>
    <div className="gradient-chart-scroll" role="region" aria-label="Checkpoint gradient norms" tabIndex={0}>
      <svg className="gradient-norm-plot" viewBox="0 0 650 284" width="650" height="284" role="img" aria-label="Jigsaw and Zoom-In I2T gradient norms at four reported checkpoints">
        {[0, 2, 4, 6, 8, 10].map(tick => <g key={tick}>
          <line x1="54" x2="604" y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'gradient-axis-zero' : 'gradient-axis-grid'} />
          <text x="43" y={y(tick) + 5} textAnchor="end" className="gradient-axis-tick">{tick}</text>
        </g>)}
        <rect x={x(selected) - 54} y="36" width="108" height="188" className="gradient-selection" />
        {series.map(item => <g key={item.key} className={item.className}>
          <polyline points={points.map((point, index) => `${x(index)},${y(point[item.key])}`).join(' ')} className="gradient-norm-line" />
          {points.map((point, index) => <circle key={point.checkpoint} cx={x(index)} cy={y(point[item.key])} r="5" className="gradient-norm-dot" />)}
        </g>)}
        {points.map((point, index) => <g key={point.checkpoint}>
          <text x={x(index)} y="253" textAnchor="middle" className="gradient-x-label">{checkpoint(point.checkpoint)}</text>
          <rect x={x(index) - 58} y="36" width="116" height="208" fill="transparent" role="button" tabIndex={0}
            aria-label={`${checkpoint(point.checkpoint)}: Jigsaw I2T ${point.jigsaw_i2t}, Zoom-In I2T ${point.zoomin_i2t}`}
            aria-pressed={selected === index} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)} onClick={() => setSelected(index)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(index); } }} />
        </g>)}
      </svg>
    </div>
    <div className="gradient-chart-detail" role="status">
      <strong>{checkpoint(current.checkpoint)}</strong>
      <span><i className="jigsaw" />Jigsaw <b>{current.jigsaw_i2t}</b></span>
      <span><i className="zoomin" />Zoom-In <b>{current.zoomin_i2t}</b></span>
    </div>
    <details className="gradient-norm-source">
      <summary>All reported I2I and I2T values</summary>
      <div className="gradient-chart-scroll">
        <table>
          <thead><tr><th>Checkpoint</th><th>Jigsaw I2I</th><th>Jigsaw I2T</th><th>Zoom-In I2I</th><th>Zoom-In I2T</th></tr></thead>
          <tbody>{points.map(point => <tr key={point.checkpoint}><th>{checkpoint(point.checkpoint)}</th><td>{point.jigsaw_i2i}</td><td>{point.jigsaw_i2t}</td><td>{point.zoomin_i2i}</td><td>{point.zoomin_i2t}</td></tr>)}</tbody>
        </table>
      </div>
    </details>
  </div>;
}
