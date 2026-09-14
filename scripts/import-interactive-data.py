"""Import the author-provided v12 payload without modifying names, counts or images."""
from pathlib import Path
import base64, hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'unitaskonomy-interactive'
html = (SOURCE / 'dist/index.html').read_text()
data = json.loads(re.search(r'<script[^>]*id="data"[^>]*>(.*?)</script>', html, re.S).group(1))
assets = ROOT / 'public/interactive/examples'
assets.mkdir(parents=True, exist_ok=True)
images = {}
for leaf in data['tree']['leaves']:
    if not leaf['sample']:
        continue
    for i, encoded in enumerate(leaf['sample']['images']):
        mime, content = encoded.split(';base64,')
        ext = {'data:image/png': 'png', 'data:image/jpeg': 'jpg'}[mime]
        filename = f"{leaf['id']}-{i+1}.{ext}"
        raw = base64.b64decode(content)
        (assets / filename).write_bytes(raw)
        leaf['sample']['images'][i] = f'/interactive/examples/{filename}'
        images[filename] = hashlib.sha256(raw).hexdigest()
(ROOT / 'content/unitaskonomy-v12.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
manifest = json.loads((SOURCE / 'source-manifest.json').read_text())
manifest['images'] = images
(ROOT / 'content/unitaskonomy-v12-provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f"Imported {len(data['tree']['leaves'])} leaves and {len(images)} original example images.")
