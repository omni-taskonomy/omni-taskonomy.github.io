"""Import the current 19-source OmniTaskonomy and paired transfer results."""
from __future__ import annotations

from collections import defaultdict
from hashlib import sha256
from pathlib import Path
import json
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PAPER = Path(sys.argv[1]).resolve()
PAIRED = PAPER / "analysis/transfer_v13/data/paired_results.json"
INVENTORY = PAPER / "analysis/transfer_v13/data/i2i_inventory.json"
FIGURE_SOURCES = PAPER / "analysis/figure_labels/sources"

old = json.loads((ROOT / "content/unitaskonomy-v13.json").read_text())
paired = json.loads(PAIRED.read_text())
inventory = json.loads(INVENTORY.read_text())
paper_commit = subprocess.check_output(
    ["git", "-C", str(PAPER), "rev-parse", "--verify", "HEAD"], text=True
).strip()

assert len(inventory) == 19
assert [x["family"] for x in inventory] == ["REC"] * 2 + ["RCN"] * 9 + ["RORG"] * 8
assert {x["model"] for x in inventory} == {x["id"] for x in paired["models"]}

nodes = paired["nodes"]
node_by_id = {x["id"]: x for x in nodes}
rows = paired["rows"]
baseline = paired["metadata"]["baseline_id"]
scopes = paired["scopes"]

expected: dict[str, dict[str, int]] = defaultdict(dict)
metrics: dict[str, dict[str, dict[str, list[int]]]] = defaultdict(lambda: defaultdict(dict))
pvalues: dict[str, dict[str, dict[str, float | None]]] = defaultdict(lambda: defaultdict(dict))
for row in rows:
    scope, node, model = row["scope"], row["node_id"], row["model"]
    n = int(row["n"])
    previous_n = expected[scope].setdefault(node, n)
    assert previous_n == n
    model_pair = [int(row["correct"]), n]
    base_pair = [int(row["baseline_correct"]), n]
    metrics[scope][node][model] = model_pair
    pvalues[scope][node][model] = row["p_value"]
    previous_base = metrics[scope][node].setdefault(baseline, base_pair)
    assert previous_base == base_pair

assert set(expected) == {x["id"] for x in scopes}
assert all(len(nodes_for_scope) == len(nodes) for nodes_for_scope in expected.values())
assert all(
    len(models_for_node) == 20
    for nodes_for_scope in metrics.values()
    for models_for_node in nodes_for_scope.values()
)

old_i2t = {x["id"]: x for x in old["tree"]["leaves"] if x["role"] == "i2t"}
i2t_leaves = []
for node in nodes:
    if node["type"] != "leaf":
        continue
    previous = old_i2t[node["id"]]
    i2t_leaves.append({
        **previous,
        "family": node["parent"],
        "name": node["name"],
        "definition": node["definition"],
        "n": expected["ALL"][node["id"]],
    })
assert len(i2t_leaves) == 25

old_i2i = {x["id"]: x for x in old["tree"]["leaves"] if x["role"] == "i2i"}
new_examples = {
    "i2i:object_replacement": (
        "object_editing_input.jpg", "object_editing_target.jpg",
        "An image with an object replaced by one of the requested category.",
    ),
    "i2i:attribute_editing": (
        "attribute_editing_input.jpg", "attribute_editing_target.jpg",
        "An image with a specified color, material, or other appearance attribute changed.",
    ),
}
image_hashes = {}
i2i_leaves = []
for item in inventory:
    ident = item["node_id"]
    sample = old_i2i.get(ident, {}).get("sample")
    if ident in new_examples:
        input_name, target_name, question = new_examples[ident]
        web_paths = []
        for source_name, role in ((input_name, "input"), (target_name, "target")):
            source = FIGURE_SOURCES / source_name
            destination_name = ident.replace(":", "_") + f"-{role}.jpg"
            destination = ROOT / "public/interactive/examples" / destination_name
            shutil.copyfile(source, destination)
            image_hashes[destination_name] = sha256(destination.read_bytes()).hexdigest()
            web_paths.append("/interactive/examples/" + destination_name)
        sample = {
            "uid": f"current-paper::{ident}",
            "benchmark": item["name"],
            "question": question,
            "choices": [],
            "answer": "",
            "images": web_paths,
            "reason": "",
        }
    i2i_leaves.append({
        "id": ident,
        "family": item["family"],
        "role": "i2i",
        "name": item["name"],
        "definition": item["definition"],
        "n": 0,
        "sample": sample,
    })

families = old["tree"]["families"]
for family in families:
    family["n"] = sum(x["n"] for x in i2t_leaves if x["family"] == family["id"])

models = [{"id": baseline, "name": "Clean-base", "group": "Baselines"}]
for item in inventory:
    models.append({
        "id": item["model"],
        "name": item["name"],
        "group": {"REC": "Recognition", "RCN": "Reconstruction", "RORG": "Reorganization"}[item["family"]] + " I2I",
        "leaf": item["node_id"],
    })

result = {
    "heatmap": {
        "models": models,
        "nodes": nodes,
        "scopes": scopes,
        "baseline": baseline,
        "expected": expected,
        "metrics": metrics,
        "pvalues": pvalues,
    },
    "tree": {"families": families, "leaves": i2i_leaves + i2t_leaves},
    "source": {
        "heatmap": "analysis/transfer_v13/data/paired_results.json",
        "samples": "analysis/figure_labels/sources",
        "hash": "sha256:" + sha256(PAIRED.read_bytes()).hexdigest(),
        "exported": paired["metadata"]["generated_at"],
        "paper_commit": paper_commit,
    },
}
(ROOT / "content/unitaskonomy-v13.json").write_text(
    json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n"
)

order = [x["node_id"] for x in inventory]
corrections = {
    "source": {
        "type": "current-paper-inventory",
        "file": "analysis/transfer_v13/data/i2i_inventory.json",
        "sha256": sha256(INVENTORY.read_bytes()).hexdigest(),
        "paper_commit": paper_commit,
    },
    "leaf_families": {},
    "i2i_column_order": order,
    "i2i_tree_order": order,
}
(ROOT / "content/unitaskonomy-author-corrections.json").write_text(
    json.dumps(corrections, ensure_ascii=False, indent=2) + "\n"
)

provenance = {
    "paper_commit": paper_commit,
    "paired_results": {"path": str(PAIRED.relative_to(PAPER)), "sha256": sha256(PAIRED.read_bytes()).hexdigest()},
    "i2i_inventory": {"path": str(INVENTORY.relative_to(PAPER)), "sha256": sha256(INVENTORY.read_bytes()).hexdigest()},
    "new_example_images": image_hashes,
    "models_including_baseline": len(models),
    "i2i_tasks": len(i2i_leaves),
    "understanding_capabilities": len(i2t_leaves),
    "main_map_capabilities": sum(x["type"] == "leaf" and expected["ALL"][x["id"]] > 100 for x in nodes),
}
(ROOT / "content/current-transfer-provenance.json").write_text(
    json.dumps(provenance, ensure_ascii=False, indent=2) + "\n"
)
print(json.dumps(provenance, indent=2))
