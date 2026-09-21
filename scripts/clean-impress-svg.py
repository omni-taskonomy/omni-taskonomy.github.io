"""Extract static vector content from an Impress slide SVG export."""

from pathlib import Path
import sys
import xml.etree.ElementTree as ET

SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)

source, destination = map(Path, sys.argv[1:3])
export = ET.parse(source).getroot()
slide = next(e for e in export.iter(f"{{{SVG}}}g") if e.get("id") == "id1")
page = next(e for e in slide if e.get("class") == "Page")
root = ET.Element(f"{{{SVG}}}svg", {"viewBox": export.attrib["viewBox"]})
_, _, width, height = export.attrib["viewBox"].split()

title = ET.Element(f"{{{SVG}}}title")
title.text = "BAGEL attention architecture"
description = ET.Element(f"{{{SVG}}}desc")
description.text = (
    "Author-edited diagram of the generation and understanding parameter "
    "branches, their shared attention, and the ViT connector path."
)
root.insert(0, description)
root.insert(0, title)
ET.SubElement(root, f"{{{SVG}}}rect", {"width": width, "height": height, "fill": "white"})
for child in page:
    # The background is explicitly supplied above. All other page children
    # are the edited, live vector shapes and text; no LO slideshow script,
    # hidden slide container, presentation metadata, or embedded SVG fonts.
    if child.tag != f"{{{SVG}}}defs":
        root.append(child)

# Impress sometimes splits a word at an editing boundary. Join spans within
# one text position so the visual spaces around the author's "&" survive in
# renderers that ignore trailing whitespace in adjacent tspans.
for position in root.iter(f"{{{SVG}}}tspan"):
    if position.get("class") != "TextPosition":
        continue
    spans = list(position)
    if len(spans) < 2:
        continue
    first = spans[0]
    first.text = "".join(span.text or "" for span in spans)
    first.set("textLength", str(sum(int(span.get("textLength", "0")) for span in spans)))
    for span in spans[1:]:
        position.remove(span)
destination.write_bytes(ET.tostring(root, encoding="utf-8", xml_declaration=True))
