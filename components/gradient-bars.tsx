'use client';

import { useState, type CSSProperties } from 'react';
import source from '@/content/gradient-bars-v13.json';
import manuscript from '@/content/manuscript-excerpts.json';

type View = 'modules' | 'layers';
type BarStyle = CSSProperties & { '--bar-left': string; '--bar-width': string };

function position(value: number, low: number, high: number): BarStyle {
  const span = high - low;
  const zero = -low / span;
  const start = value < 0 ? (value - low) / span : zero;
  return { '--bar-left': (100 * start) + '%', '--bar-width': (100 * Math.abs(value) / span) + '%' };
}

export function GradientBars() {
  const [view, setView] = useState<View>('modules');
  const [selected, setSelected] = useState(view === 'modules' ? 4 : 3);
  const labels = view === 'modules' ? source.module_labels : Array.from({ length: 28 }, (_, i) => String(i));
  const jigsaw = view === 'modules' ? source.module_values.jigsaw : source.layer_values.jigsaw;
  const zoomin = view === 'modules' ? source.module_values.zoomin : source.layer_values.zoomin;
  const low = view === 'modules' ? -0.18 : -0.65;
  const high = view === 'modules' ? 0.62 : 1.1;
  const zero = 100 * -low / (high - low);
  const choose = (next: View) => { setView(next); setSelected(next === 'modules' ? 4 : 3); };
  return <div className="gradient-chart" aria-label="Interactive gradient alignment bars">
    <div className="gradient-chart-head">
      <div className="gradient-chart-tabs" role="tablist" aria-label="Gradient alignment view">
        <button type="button" role="tab" aria-selected={view === 'modules'} onClick={() => choose('modules')}>Module groups</button>
        <button type="button" role="tab" aria-selected={view === 'layers'} onClick={() => choose('layers')}>RMSNorm layers</button>
      </div>
      <a href="/figures/gradient-transfer-overview.svg" target="_blank" rel="noreferrer">Full figure ↗</a>
    </div>
    <div className="gradient-chart-legend"><span><i className="jigsaw" />Jigsaw</span><span><i className="zoomin" />Zoom-In</span><span data-manuscript-excerpt="alignment_scale">{manuscript.excerpts.alignment_scale.text}</span></div>
    <div className="gradient-chart-scroll" role="region" aria-label={view === 'modules' ? 'Module alignment bars' : 'RMSNorm layer alignment bars'} tabIndex={0}>
      {labels.map((label, index) => <button type="button" key={label} className={'gradient-chart-row' + (selected === index ? ' selected' : '')}
        onClick={() => setSelected(index)} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)} aria-pressed={selected === index}
        aria-label={`${view === 'modules' ? label : 'Layer ' + label}: Jigsaw ${jigsaw[index].toFixed(2)}, Zoom-In ${zoomin[index].toFixed(2)}`}>
        <span className="gradient-chart-label">{view === 'layers' ? 'Layer ' + label : label}</span>
        <span className="gradient-chart-track" style={{ '--zero': zero + '%' } as CSSProperties}>
          <i className="gradient-chart-zero" aria-hidden="true" />
          <i className="gradient-chart-bar jigsaw" style={position(jigsaw[index], low, high)} aria-hidden="true" />
          <i className="gradient-chart-bar zoomin" style={position(zoomin[index], low, high)} aria-hidden="true" />
        </span>
      </button>)}
    </div>
    <div className="gradient-chart-detail" role="status">
      <strong>{view === 'modules' ? labels[selected] : 'Layer ' + labels[selected]}</strong>
      <span><i className="jigsaw" />Jigsaw <b>{jigsaw[selected].toFixed(2)}</b></span>
      <span><i className="zoomin" />Zoom-In <b>{zoomin[selected].toFixed(2)}</b></span>
    </div>
  </div>;
}
