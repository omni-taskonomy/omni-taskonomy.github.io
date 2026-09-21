'use client';

import { useState } from 'react';
import source from '@/content/gradient-transfer-scatter.json';

type Family = keyof typeof source.families;
type CapabilityPoint = (typeof source.capability.points)[number];
type PairPoint = (typeof source.pairs.points)[number];

const familyColors: Record<Family, string> = { REC: '#0064e0', RCN: '#76aae7', RORG: '#ac97cc' };
const familyNames = source.families as Record<Family, string>;
const capabilityLabels: Record<string, string> = {
  'i2t:CATEGORY_INSTANCE': 'Category',
  'i2t:COLOR_MATERIAL': 'Appearance',
  'i2t:DEPTH_DISTANCE': 'Depth',
  'i2t:METRIC_3D_RELATION': 'Metric 3D',
  'i2t:RELATIVE_3D_RELATION': '2D spatial',
  'i2t:OBJECT_COUNTING': 'Counting',
  'i2t:CORRESPONDENCE_TRACKING': 'Correspondence',
};
const illustrativePairs = [
  { source: 'colorization_v13', target: 'i2t:CORRESPONDENCE_TRACKING', label: 'Colorization → correspondence', x: -.53, y: 7.0, anchor: 'start' as const },
  { source: 'counting', target: 'i2t:OBJECT_COUNTING', label: 'Object pointing → counting', x: .37, y: 7.0, anchor: 'end' as const },
  { source: 'taskonomy_edge_texture', target: 'i2t:METRIC_3D_RELATION', label: '2D edges → metric 3D', x: .37, y: -2.1, anchor: 'end' as const },
  { source: 'taskonomy_segment_unsup25d', target: 'i2t:CORRESPONDENCE_TRACKING', label: '2.5D seg. → correspondence', x: .37, y: -5.1, anchor: 'end' as const },
];

function Regression({ domain, line, x, y }: { domain: { x: number[]; y: number[] }; line: { slope: number; intercept: number }; x: (v: number) => number; y: (v: number) => number }) {
  const [x1, x2] = domain.x;
  return <line className="association-fit" x1={x(x1)} y1={y(line.slope * x1 + line.intercept)} x2={x(x2)} y2={y(line.slope * x2 + line.intercept)} />;
}

function ScatterFrame({ kind, children }: { kind: 'capability' | 'pairs'; children: (helpers: { x: (v: number) => number; y: (v: number) => number; width: number; height: number; left: number; top: number; plotWidth: number; plotHeight: number; domain: { x: number[]; y: number[] } }) => React.ReactNode }) {
  const width = 560, height = 400, left = 64, top = 34, plotWidth = 466, plotHeight = 304;
  const domain = source[kind].domain;
  const x = (value: number) => left + (value - domain.x[0]) * plotWidth / (domain.x[1] - domain.x[0]);
  const y = (value: number) => top + (domain.y[1] - value) * plotHeight / (domain.y[1] - domain.y[0]);
  const xTicks = kind === 'capability' ? [-.3, -.15, 0, .15] : [-.5, -.25, 0, .25];
  const yTicks = kind === 'capability' ? [-2, -1, 0, 1, 2] : [-6, -3, 0, 3, 6];
  return <svg className="association-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={kind === 'capability' ? 'Mean gradient alignment and transfer by capability' : 'Gradient alignment and transfer for 105 task pairs'}>
    {yTicks.map(tick => <g key={'y' + tick}><line className={tick === 0 ? 'association-zero' : 'association-grid'} x1={left} x2={left + plotWidth} y1={y(tick)} y2={y(tick)} /><text className="association-tick" x={left - 10} y={y(tick) + 5} textAnchor="end">{tick}</text></g>)}
    {xTicks.map(tick => <g key={'x' + tick}><line className={tick === 0 ? 'association-zero' : 'association-grid vertical'} y1={top} y2={top + plotHeight} x1={x(tick)} x2={x(tick)} /><text className="association-tick" x={x(tick)} y={top + plotHeight + 24} textAnchor="middle">{tick}</text></g>)}
    <text className="association-axis-label" x={left + plotWidth / 2} y={height - 12} textAnchor="middle">{kind === 'capability' ? 'Mean gradient alignment across 15 sources' : 'Gradient alignment'}</text>
    <text className="association-axis-label" transform={`translate(18 ${top + plotHeight / 2}) rotate(-90)`} textAnchor="middle">{kind === 'capability' ? 'Mean transfer gain (pp)' : 'Transfer gain (pp)'}</text>
    {children({ x, y, width, height, left, top, plotWidth, plotHeight, domain })}
  </svg>;
}

function CapabilityScatter() {
  const [selected, setSelected] = useState<CapabilityPoint>(source.capability.points[0]);
  return <article className="association-card">
    <div className="association-title"><strong>(c) Transfer by capability</strong><span>r = {source.capability.correlation.toFixed(3)}</span></div>
    <ScatterFrame kind="capability">{({ x, y, domain }) => <>
      <Regression domain={domain} line={source.capability.regression} x={x} y={y} />
      {source.capability.points.map(point => {
        const active = point.id === selected.id;
        return <g key={point.id} className={active ? 'association-point active' : 'association-point'} onMouseEnter={() => setSelected(point)} onFocus={() => setSelected(point)} onClick={() => setSelected(point)} role="button" tabIndex={0} aria-label={`${point.name}: mean alignment ${point.alignment.toFixed(3)}, mean transfer ${point.transfer.toFixed(2)} percentage points`}>
          <circle cx={x(point.alignment)} cy={y(point.transfer)} r={active ? 8 : 6.5} fill={familyColors[point.family as Family]} />
          <text x={x(point.alignment) + 9} y={y(point.transfer) - 9}>{capabilityLabels[point.id]}</text>
        </g>;
      })}
    </>}</ScatterFrame>
    <div className="association-detail" role="status"><strong>{selected.name}</strong><span>{familyNames[selected.family as Family]}</span><span>Mean alignment <b>{selected.alignment.toFixed(3)}</b></span><span>Mean transfer <b>{selected.transfer >= 0 ? '+' : ''}{selected.transfer.toFixed(2)} pp</b></span></div>
  </article>;
}

function PairScatter() {
  const [selected, setSelected] = useState<PairPoint>(source.pairs.points[0]);
  return <article className="association-card">
    <div className="association-title"><strong>(d) Transfer by task pair</strong><span>105 pairs · r = {source.pairs.correlation.toFixed(3)}</span></div>
    <ScatterFrame kind="pairs">{({ x, y, domain }) => {
      const ellipse = source.pairs.ellipse;
      return <>
        <path className="association-ellipse" d={ellipse.map((point, index) => `${index ? 'L' : 'M'}${x(point[0])},${y(point[1])}`).join(' ') + ' Z'} />
        <Regression domain={domain} line={source.pairs.regression} x={x} y={y} />
        {source.pairs.points.map((point, index) => {
          const active = point.source_id === selected.source_id && point.target_id === selected.target_id;
          return <circle key={point.source_id + point.target_id} className={active ? 'association-pair active' : 'association-pair'} cx={x(point.alignment)} cy={y(point.transfer)} r={active ? 7 : 4.2} fill={familyColors[point.target_family as Family]}
            role="button" tabIndex={index === 0 || active ? 0 : -1} aria-label={`${point.source} to ${point.target}: alignment ${point.alignment.toFixed(3)}, transfer ${point.transfer.toFixed(2)} percentage points`}
            onMouseEnter={() => setSelected(point)} onFocus={() => setSelected(point)} onClick={() => setSelected(point)} />;
        })}
        {illustrativePairs.map(label => {
          const point = source.pairs.points.find(item => item.source_id === label.source && item.target_id === label.target)!;
          const tx = x(label.x), ty = y(label.y);
          return <g className="association-annotation" key={label.source + label.target}>
            <line x1={x(point.alignment)} y1={y(point.transfer)} x2={tx} y2={ty + 4} />
            <text x={tx} y={ty} textAnchor={label.anchor}>{label.label}</text>
          </g>;
        })}
      </>;
    }}</ScatterFrame>
    <div className="association-detail" role="status"><strong>{selected.source} → {selected.target}</strong><span>{familyNames[selected.target_family as Family]} target</span><span>Alignment <b>{selected.alignment.toFixed(3)}</b></span><span>Transfer <b>{selected.transfer >= 0 ? '+' : ''}{selected.transfer.toFixed(2)} pp</b></span></div>
  </article>;
}

export function GradientTransferScatter() {
  return <div className="association-figure" data-visual-source="section6-gradient-and-transfer-csv">
    <div className="association-guide"><span>Hover or focus a point to inspect it</span><span className="association-legend">{(Object.keys(familyNames) as Family[]).map(family => <span key={family}><i style={{ background: familyColors[family] }} />{familyNames[family]}</span>)}</span></div>
    <div className="association-grid"><CapabilityScatter /><PairScatter /></div>
  </div>;
}
