"""Audit the architecture asset and its pinned source/code provenance."""
from pathlib import Path
import hashlib,json,xml.etree.ElementTree as ET
BASE=Path(__file__).resolve().parents[1]
m=json.loads((BASE/'content/bagel-architecture-provenance.json').read_text())
svg=(BASE/m['illustration']).read_bytes()
assert hashlib.sha256(svg).hexdigest()==m['illustration_sha256']
assert m['paper_commit']==(BASE/'content/manuscript-revision.txt').read_text().strip()
book=json.loads((BASE/'content/manuscript-excerpts.json').read_text())
assert book['excerpts'][m['paper_excerpt_id']]['source']['file']=='iclr2026/sections/3_poc.tex'
root=ET.fromstring(svg)
ns='{http://www.w3.org/2000/svg}'
assert root.get('viewBox') and root.find(ns+'title') is not None and root.find(ns+'desc') is not None
assert not list(root.iter(ns+'script')) and b'http://www.w3.org/1999/xlink' not in svg
visible=' '.join((e.text or '') for e in root.iter(ns+'text'))
for label in ('Q proj.','K proj.','V proj.','Q','K','V','attn output','Shared attention','Out proj.','Pre-attn','Pre-MLP','RMSNorm','MLP','Gate','Up','Down','Q norm','K norm','ViT','Conn. in','Conn. out','2D pos.','VAE latent tokens','Text + ViT tokens'):
    assert label in visible,label
for label in ('BAGEL','Mixture-of-Transformers','optional','Attention(Q, K, V; attention_mask)','packed Q, K, V','token indexes','Feed-forward','Q / K / V projections','Q norm · K norm','Gate × Up → Down'):
    assert label not in visible,label
tensor_rects=[e for e in root.iter(ns+'rect') if e.get('class')=='tensor-box']
parameter_rects=[e for e in root.iter(ns+'rect') if e.get('class') in ('g-box','u-box')]
assert len(tensor_rects)==10,len(tensor_rects)
assert len(parameter_rects)==26,len(parameter_rects)
assert m['connector_code']=='modeling/bagel/modeling_utils.py'
assert m['mlp_code']=='modeling/qwen2/modeling_qwen2.py'
print('BAGEL architecture SVG and source provenance verified')
