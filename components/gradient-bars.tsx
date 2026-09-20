'use client';

import { useState } from 'react';
import source from '@/content/gradient-bars-v13.json';
import manuscript from '@/content/manuscript-excerpts.json';

type View = 'modules' | 'layers';

export function GradientBars() {
  const [view, setView] = useState<View>('modules');
  const [selected, setSelected] = useState(4);
  const labels = view === 'modules' ? source.module_labels : Array.from({ length: 28 }, (_, i) => String(i));
  const jigsaw = view === 'modules' ? source.module_values.jigsaw : source.layer_values.jigsaw;
  const zoomin = view === 'modules' ? source.module_values.zoomin : source.layer_values.zoomin;
  const low = view === 'modules' ? -0.18 : -0.65;
  const high = view === 'modules' ? 0.62 : 1.1;
  const ticks = view === 'modules' ? [-0.1, 0, 0.2, 0.4, 0.6] : [-0.5, 0, 0.5, 1];
  const plotLeft = 52;
  const plotTop = 22;
  const plotHeight = 286;
  const plotWidth = view === 'modules' ? 630 : 840;
  const step = plotWidth / labels.length;
  const width = plotLeft + plotWidth + 20;
  const height = view === 'modules' ? 400 : 372;
  const y = (value: number) => plotTop + (high - value) * plotHeight / (high - low);
  const baseline = y(0);
  const choose = (next: View) => { setView(next); setSelected(next === 'modules' ? 4 : 3); };

  return <div className="gradient-chart" aria-label="Interactive gradient alignment bars">
    <div className="gradient-chart-head">
      <div className="gradient-chart-tabs" role="tablist" aria-label="Gradient alignment view">
        <button type="button" role="tab" aria-selected={view === 'modules'} onClick={() => choose('modules')}>Model components</button>
        <button type="button" role="tab" aria-selected={view === 'layers'} onClick={() => choose('layers')}>RMSNorm layers</button>
      </div>
      <a href="/figures/gradient-transfer-overview.svg" target="_blank" rel="noreferrer">Full figure ↗</a>
    </div>
    <div className="gradient-chart-legend"><span><i className="jigsaw" />Jigsaw</span><span><i className="zoomin" />Zoom-In</span><span data-manuscript-excerpt="alignment_scale">{manuscript.excerpts.alignment_scale.text}</span></div>
    <div className="gradient-chart-scroll" role="region" aria-label={view === 'modules' ? 'Module alignment bars' : 'RMSNorm layer alignment bars'} tabIndex={0}>
      <svg className={'gradient-chart-plot ' + view} viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={view === 'modules' ? 'Jigsaw and Zoom-In alignment by model module' : 'Jigsaw and Zoom-In alignment by RMSNorm layer'}>
        {ticks.map(tick => <g key={tick}>
          <line x1={plotLeft} x2={plotLeft + plotWidth} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'gradient-axis-zero' : 'gradient-axis-grid'} />
          <text x={plotLeft - 8} y={y(tick) + 5} textAnchor="end" className="gradient-axis-tick">{tick.toFixed(1)}</text>
        </g>)}
        {labels.map((label, index) => {
          const center = plotLeft + step * (index + .5);
          const barWidth = view === 'modules' ? 13 : 10;
          const bars = [{ value: jigsaw[index], x: center - barWidth - 1, kind: 'jigsaw' }, { value: zoomin[index], x: center + 1, kind: 'zoomin' }];
          return <g key={label} className={selected === index ? 'gradient-selected' : ''}>
            {selected === index && <rect x={center - step / 2} y={plotTop} width={step} height={plotHeight} className="gradient-selection" />}
            {bars.map(bar => <rect key={bar.kind} className={'gradient-column ' + bar.kind} x={bar.x} y={Math.min(y(bar.value), baseline)} width={barWidth} height={Math.max(2, Math.abs(y(bar.value) - baseline))} />)}
            <text className="gradient-x-label" transform={view === 'modules' ? `translate(${center},${plotTop + plotHeight + 16}) rotate(-48)` : undefined} x={view === 'modules' ? 0 : center} y={view === 'modules' ? 0 : plotTop + plotHeight + 24} textAnchor={view === 'modules' ? 'end' : 'middle'}>{label}</text>
            <rect x={center - step / 2} y={plotTop} width={step} height={height - plotTop} fill="transparent" role="button" tabIndex={0}
              aria-label={`${view === 'modules' ? label : 'Layer ' + label}: Jigsaw ${jigsaw[index].toFixed(2)}, Zoom-In ${zoomin[index].toFixed(2)}`}
              aria-pressed={selected === index} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)} onClick={() => setSelected(index)}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(index); } }} />
          </g>;
        })}
      </svg>
    </div>
    <div className="gradient-chart-detail" role="status">
      <strong>{view === 'modules' ? labels[selected] : 'Layer ' + labels[selected]}</strong>
      <span><i className="jigsaw" />Jigsaw <b>{jigsaw[selected].toFixed(2)}</b></span>
      <span><i className="zoomin" />Zoom-In <b>{zoomin[selected].toFixed(2)}</b></span>
    </div>
  </div>;
}
