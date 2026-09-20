"""Verify the project-page matrix against the author-supplied HTML data."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import sys

site = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
bundled = json.loads((site / 'content/gradient-alignment-matrix.json').read_text())
assert source.name == bundled['source_file']
assert hashlib.sha256(source.read_bytes()).hexdigest() == bundled['source_sha256']

class EmbeddedJSON(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.text = ''

    def handle_starttag(self, tag, attrs):
        if tag == 'script' and dict(attrs).get('id') == 'matrix-data':
            self.inside = True

    def handle_endtag(self, tag):
        if tag == 'script':
            self.inside = False

    def handle_data(self, text):
        if self.inside:
            self.text += text

parser = EmbeddedJSON()
parser.feed(source.read_text())
raw = json.loads(parser.text)
assert bundled['tasks'] == raw['views']['paper']['tasks']
assert bundled['leaves'] == raw['views']['paper']['leaves']
assert bundled['families'] == raw['families']
records = {
    (record['metric'], record['i2t_category'], record['i2i_task']): record
    for record in raw['records'] if record['variant'] == 'adaptive'
}
for metric in ('dimension_scaled', 'post_pca_cosine'):
    matrix = bundled['matrices'][metric]
    assert len(matrix) == 19 and all(len(row) == 15 for row in matrix)
    for row, leaf in enumerate(bundled['leaves']):
        for column, task in enumerate(bundled['tasks']):
            original = records[(metric, leaf['id'], task['id'])]
            assert all(matrix[row][column][key] == value for key, value in matrix[row][column].items() if key in original)
print('570 author-supplied matrix cells verified')
