"""Fail if rendered research text is not an exact registered manuscript excerpt."""
from html.parser import HTMLParser
from pathlib import Path
import json,re,sys,urllib.request
BASE=Path(__file__).resolve().parents[1]
book=json.loads((BASE/'content/manuscript-excerpts.json').read_text())
excerpts=book['excerpts']
def clean(s): return re.sub(r'\s+',' ',s).strip()
ui={'Skip to content','Read the manuscript','↗','Top ↑','View full size ↗','→','Manuscript ↗','Back to top ↑','Abstract','Training recipes','Experimental setup','Annotation protocol','01','02','03','04','05'}
credit='This project page’s design and presentation are inspired by Beyond Language Modeling: An Exploration of Multimodal Pretraining. We thank its authors for the inspiration.'
class Audit(HTMLParser):
 def __init__(self):
  super().__init__();self.depth=0;self.skip=[];self.active=None;self.matched=[];self.images=0;self.description=False;self.errors=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs);self.depth+=1
  if tag in {'head','script','style'}: self.skip.append((tag,self.depth))
  if tag=='meta' and attrs.get('name')=='description':
   assert attrs['content']==excerpts['description']['text'];self.description=True
  if tag=='img':
   assert attrs.get('alt') in {v['text'] for v in excerpts.values()},'Unmapped image alt text';self.images+=1
  key=attrs.get('data-manuscript-excerpt')
  if key or attrs.get('data-site-credit'):
   assert self.active is None,'Nested provenance records'
   self.active={'depth':self.depth,'tag':tag,'key':key,'parts':[]}
  if tag in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.depth-=1
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}:self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if self.active and self.active['depth']==self.depth:
   record=self.active;actual=clean(''.join(record['parts']));key=record['key']
   expected=excerpts[key]['text'] if key else credit
   if actual!=expected:self.errors.append({'key':key,'actual':actual,'expected':expected})
   if key:self.matched.append(key)
   self.active=None
  if self.skip and self.skip[-1]==(tag,self.depth):self.skip.pop()
  self.depth-=1
 def handle_data(self,data):
  if self.skip:return
  if self.active:self.active['parts'].append(data)
  elif clean(data) and clean(data) not in ui:self.errors.append({'unmapped_text':clean(data)})
url=sys.argv[1]
with urllib.request.urlopen(url) as response:
 assert response.status==200
 html=response.read().decode()
audit=Audit();audit.feed(html)
assert not audit.errors,json.dumps(audit.errors,ensure_ascii=False,indent=2)
assert audit.description and audit.images==6,(audit.description,audit.images)
assert len(audit.matched)>=40,audit.matched
print(json.dumps({'source_commit':book['manuscript_commit'],'rendered_excerpt_instances':len(audit.matched),'unique_rendered_excerpts':len(set(audit.matched)),'manuscript_derived_image_alts':audit.images,'metadata_verbatim':audit.description,'unmapped_research_text':0},indent=2))
