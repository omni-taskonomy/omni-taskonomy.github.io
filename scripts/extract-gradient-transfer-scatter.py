"""Build the two interactive alignment/transfer scatter plots from paper data."""
from __future__ import annotations

from pathlib import Path
from hashlib import sha256
import csv
import json
import math
import sys

ROOT = Path(__file__).resolve().parents[1]
PAPER = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 and sys.argv[1] != "--check" else Path("/Users/xieji/69d99c42c6f3e61ae13f54f1")
CHECK = "--check" in sys.argv
DATA = PAPER / "analysis/section6/data"
OUT = ROOT / "content/gradient-transfer-scatter.json"


def read_csv(name: str) -> list[dict[str, str]]:
    with (DATA / name).open(newline="") as handle:
        return list(csv.DictReader(handle))


summary = json.loads((DATA / "analysis_summary.json").read_text())
tasks = summary["tasks"]
capabilities = summary["cats"]
selected = [capabilities[i] for i in summary["idx7"]]
task_by_id = {row["id"]: row for row in tasks}
capability_by_id = {row["id"]: row for row in capabilities}

gradients = {
    (row["i2i_task"], row["i2t_category"]): float(row["mean"])
    for row in read_csv("gradient_records.csv")
    if row["variant"] == "adaptive" and row["metric"] == "post_pca_cosine"
}
transfer = {
    (row["task_id"], row["capability_id"]): float(row["delta"])
    for row in read_csv("transfer_full.csv")
}

pairs = []
for capability in selected:
    for task in tasks:
        key = (task["id"], capability["id"])
        pairs.append({
            "source_id": task["id"],
            "source": task["name"],
            "source_family": task["family"],
            "target_id": capability["id"],
            "target": capability["name"],
            "target_family": capability["family"],
            "alignment": gradients[key],
            "transfer": transfer[key],
        })

capability_points = []
for capability in selected:
    rows = [row for row in pairs if row["target_id"] == capability["id"]]
    capability_points.append({
        "id": capability["id"],
        "name": capability["name"],
        "family": capability["family"],
        "n_sources": len(rows),
        "alignment": sum(row["alignment"] for row in rows) / len(rows),
        "transfer": sum(row["transfer"] for row in rows) / len(rows),
    })


def regression(rows: list[dict], x_key: str, y_key: str) -> dict[str, float]:
    xs = [row[x_key] for row in rows]
    ys = [row[y_key] for row in rows]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
    return {"slope": slope, "intercept": my - slope * mx}


def covariance_ellipse(rows: list[dict]) -> list[list[float]]:
    xs = [row["alignment"] for row in rows]
    ys = [row["transfer"] for row in rows]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    n = len(rows) - 1
    a = sum((x - mx) ** 2 for x in xs) / n
    d = sum((y - my) ** 2 for y in ys) / n
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
    trace = a + d
    root = math.sqrt((a - d) ** 2 + 4 * b * b)
    high, low = (trace + root) / 2, (trace - root) / 2
    if abs(b) > 1e-12:
        vx, vy = b, high - a
        length = math.hypot(vx, vy)
        vx, vy = vx / length, vy / length
    elif a >= d:
        vx, vy = 1.0, 0.0
    else:
        vx, vy = 0.0, 1.0
    wx, wy = -vy, vx
    points = []
    for step in range(65):
        angle = 2 * math.pi * step / 64
        u, v = math.sqrt(high) * math.cos(angle), math.sqrt(low) * math.sin(angle)
        points.append([mx + u * vx + v * wx, my + u * vy + v * wy])
    return points


correlations = {row["subset"] + ":" + row["centering"]: row for row in read_csv("correlations.csv")}
payload = {
    "source": {
        "paper_commit": (ROOT / "content/manuscript-revision.txt").read_text().strip(),
        "analysis_summary_sha256": sha256((DATA / "analysis_summary.json").read_bytes()).hexdigest(),
        "gradient_records_sha256": sha256((DATA / "gradient_records.csv").read_bytes()).hexdigest(),
        "transfer_full_sha256": sha256((DATA / "transfer_full.csv").read_bytes()).hexdigest(),
        "definition": "Adaptive post-PCA cosine at the pretrained checkpoint; transfer is accuracy gain over the I2T-only baseline.",
    },
    "families": {"REC": "Recognition", "RCN": "Reconstruction", "RORG": "Reorganization"},
    "capability": {
        "points": capability_points,
        "regression": regression(capability_points, "alignment", "transfer"),
        "correlation": float(correlations["balanced7:capability_mean"]["pearson"]),
        "domain": {"x": [-0.32, 0.29], "y": [-2.65, 2.45]},
    },
    "pairs": {
        "points": pairs,
        "regression": regression(pairs, "alignment", "transfer"),
        "ellipse": covariance_ellipse(pairs),
        "correlation": float(correlations["balanced7:raw"]["pearson"]),
        "domain": {"x": [-0.55, 0.39], "y": [-7.4, 7.4]},
    },
}

serialized = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
if CHECK:
    assert OUT.read_text() == serialized, "Stored scatter data do not match the paper sources"
    print(f"Verified {len(capability_points)} capability means and {len(pairs)} task pairs")
else:
    OUT.write_text(serialized)
    print(f"Wrote {len(capability_points)} capability means and {len(pairs)} task pairs to {OUT}")
