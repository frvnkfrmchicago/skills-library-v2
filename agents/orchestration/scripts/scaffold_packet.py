#!/usr/bin/env python3
"""
Scaffold a reusable orchestration packet for a new project or new wave.

Usage:
  python3 scaffold_packet.py --project-root /path/to/project --wave-id wave-001
"""

from __future__ import annotations

import argparse
from pathlib import Path


DISPATCH_TEMPLATE = """# Dispatch Ready

## Explainer
This is the active multi-agent build packet for this wave.

## TL;DR
- Fill in the product outcome for this wave.
- Add one lane brief per agent.
- Give each agent the lane brief path and the evidence contract path.

| Packet field | Value |
|---|---|
| Wave | {wave_id} |
| Active packet path | {active_packet_path} |
| Evidence contract | {evidence_contract_path} |
| Master log | {master_log_path} |
| Canonical index | {canonical_index_path} |

| Agent | Brief path | Status |
|---|---|---|
| <agent> | <path> | assigned |
"""


EVIDENCE_TEMPLATE = """# Evidence Contract

## Explainer
Every lane must rewrite its own brief file on completion so the brief becomes the evidence record.

## TL;DR
- Explainer first
- TL;DR second
- tables third
- exact paths required
- remaining gaps required

| Required table | Minimum content |
|---|---|
| Delivery Summary | requested outcome, result, evidence path |
| Files Changed | file, change |
| Commands Run | command, result, plain meaning |
| Artifacts | artifact, path, purpose |
| Remaining Gaps | gap, owner, next action |
"""


CYCLE_TEMPLATE = """# Orchestration Cycle

## Explainer
This wave follows the standard build loop: dispatch, build, evidence, lead review, tracker update, close.

## TL;DR

| Step | Output |
|---|---|
| Define wave | active packet |
| Parallel build | lane briefs |
| Evidence rewrite | completed lane files |
| Lead review | accepted / needs-rerun / rejected |
| Tracker update | master log row updates |
| Close wave | move to completed or archive |
"""


MASTER_LOG_TEMPLATE = """# Master Log

| Wave | Lane | Owner | Review status | Summary | Updated doc path | Next action | Archive state |
|---|---|---|---|---|---|---|---|
"""


CANONICAL_INDEX_TEMPLATE = """# Canonical Index

## Explainer
This file points to the one active packet and the one live master log.

## TL;DR

| Canonical now | Path |
|---|---|
| Active packet | {active_packet_path} |
| Master log | {master_log_path} |
"""


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True)
    parser.add_argument("--wave-id", required=True)
    args = parser.parse_args()

    root = Path(args.project_root).expanduser().resolve()
    orchestration_root = root / "orchestration"
    active_packet = orchestration_root / "active" / args.wave_id
    management = orchestration_root / "management"
    completed = orchestration_root / "completed"
    archive = orchestration_root / "archive"

    active_packet.mkdir(parents=True, exist_ok=True)
    management.mkdir(parents=True, exist_ok=True)
    completed.mkdir(parents=True, exist_ok=True)
    archive.mkdir(parents=True, exist_ok=True)

    dispatch_path = active_packet / "00-DISPATCH-READY.md"
    evidence_path = active_packet / "99-EVIDENCE-CONTRACT.md"
    cycle_path = active_packet / "90-ORCHESTRATION-CYCLE.md"
    master_log_path = management / "MASTER-LOG.md"
    canonical_index_path = management / "CANONICAL-INDEX.md"

    write_file(
        dispatch_path,
        DISPATCH_TEMPLATE.format(
            wave_id=args.wave_id,
            active_packet_path=str(active_packet),
            evidence_contract_path=str(evidence_path),
            master_log_path=str(master_log_path),
            canonical_index_path=str(canonical_index_path),
        ),
    )
    write_file(evidence_path, EVIDENCE_TEMPLATE)
    write_file(cycle_path, CYCLE_TEMPLATE)
    write_file(master_log_path, MASTER_LOG_TEMPLATE)
    write_file(
        canonical_index_path,
        CANONICAL_INDEX_TEMPLATE.format(
            active_packet_path=str(active_packet),
            master_log_path=str(master_log_path),
        ),
    )

    print(f"[OK] Created orchestration packet at {active_packet}")
    print(f"[OK] Created management files at {management}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
