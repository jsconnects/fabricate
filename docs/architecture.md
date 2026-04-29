# Fabricate — Architecture

This document describes how Fabricate is organized, why each layer exists, and how the pieces interact. It's intended for engineers evaluating the project and for the author's future self.

The top-level [README](../README.md) covers what Fabricate is and why it exists. This document covers *how* it's built.

## The three-layer model

Fabricate has three layers. Each runs independently. Each delivers value on its own. Together they form the complete intent-to-fabric pipeline.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Natural-Language Intent Translation               │
│  ────────────────────────────────────────                   │
│  Customer describes environment in their own terms.         │
│  LLM produces a draft workbook in ACI's vocabulary,         │
│  grounded in MIT schema and discovered fabric state.        │
│  Output: structured workbook (always reviewed by human).    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Workbook → Code                                   │
│  ────────────────────                                       │
│  Structured Excel workbook describing target fabric.        │
│  Validated against ACI's relationship constraints.          │
│  Generates Ansible (deploy) and Terraform (state).          │
│  Output: deployable IaC artifacts.                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: ACI Object Model Explorer                         │
│  ─────────────────────────────────                          │
│  Reference: MIT classes, DN patterns, REST/Ansible/         │
│  Terraform examples per class. Used by humans for           │
│  learning; used by Layer 2 and 3 as the schema source       │
│  of truth for validation.                                   │
└─────────────────────────────────────────────────────────────┘
```

The arrows go top-down at runtime (intent flows down toward generated code), but the layers were built bottom-up (Layer 1 first, because both other layers depend on its schema).

## Layer 1 — ACI Object Model Explorer

### Purpose

Two purposes, one tool:

1. **Human reference.** Browsing ACI's object model in Cisco's documentation is painful. The Explorer makes the relationships browseable — pick a class, see its DN pattern, parent and child classes, and examples of how to interact with it via REST, Ansible, and Terraform.
2. **Machine schema.** Layers 2 and 3 use the same underlying class data to validate workbook contents and ground LLM outputs. The Explorer's data store is the schema source of truth for the rest of the project.

### Implementation

- **Frontend:** React with inline styles; built with Vite. Single-page application; no backend required for the public Explorer.
- **Data:** Class metadata stored as a single recursive JSON tree, generated from a combination of Cisco's published model and hand-curated examples for the most-used classes. Lives in `explorer/data/mit-data.json`.
- **Hosting:** Static site deployed to GitHub Pages via GitHub Actions on push to `main`. Live at https://jsconnects.github.io/fabricate/.

### Boundaries

The Explorer does *not* talk to live APICs. It's a schema reference, not a fabric tool. Live fabric interaction happens in Layers 2 and 3.

## Layer 2 — Workbook → Code

### Purpose

Take a structured description of a target fabric and turn it into deployable infrastructure-as-code, with errors caught at intent-time rather than at API-call time.

### The workbook

The workbook is opinionated. It enforces ACI's relationship constraints up front — you can't define a Bridge Domain without selecting an existing VRF, you can't define an EPG outside an Application Profile, contracts must reference providers and consumers that exist in the workbook.

This is deliberate. The workbook is meant to make invalid intent *unrepresentable*, not just unrecommended.

Sheets in the current design:

| Sheet | Contents |
|---|---|
| `Tenants` | Tenant definitions and metadata |
| `VRFs` | VRF-to-tenant relationships |
| `Bridge_Domains` | BDs with VRF parents, subnets, L2 settings |
| `App_Profiles` | Application Profile definitions |
| `EPGs` | EPGs with App Profile and BD parents |
| `Contracts` | Contract definitions and subjects |
| `Contract_Bindings` | Provider/consumer relationships |
| `Physical_Domains` | Physical domain to VLAN pool mappings |
| `Interfaces` | Switch port assignments and policies |
| `Hardware` | Spine/leaf inventory and fabric numbering |

### Pipeline stages

```
Workbook (XLSX)
    │
    ▼
Parser ──────► Normalized intermediate representation (Python dicts)
    │
    ▼
Validators ──► Reject invalid intent (relationships, naming, conflicts)
    │
    ▼
Generators ──► Ansible playbooks (deploy)
            └► Terraform configuration (state)
    │
    ▼
Output bundle (versioned, ready for review and deploy)
```

### Implementation

- **Language:** Python.
- **Workbook parsing:** `openpyxl` for the XLSX read.
- **Validation:** Layered. Schema-level (each row is structurally valid for its sheet) and graph-level (cross-sheet references resolve, no orphans, no cycles where they're disallowed).
- **Generation:** Jinja2 templates per output target. Ansible playbooks use the `cisco.aci` collection; Terraform uses the official `ciscodevnet/aci` provider.

### Boundaries

Layer 2 does not push to APIC. It produces code. Pushing is a deliberate, human-reviewed action handled outside the pipeline. This boundary is intentional — automation is most dangerous when it removes human checkpoints from operations that affect production.

## Layer 3 — Natural-Language Intent Translation

### Purpose

Bridge the vocabulary gap. Customers entering ACI projects rarely think in tenants, BDs, and EPGs — they think in the language of the network they have today. Layer 3 translates between those vocabularies, producing a draft workbook that Layer 2 can consume.

### The premise

A customer describes a network requirement in plain language: *"three VLANs for marketing, isolated from finance, with internet egress through the corporate firewall and shared access to a file server in the datacenter VRF."*

Layer 3 produces a draft workbook capturing that intent in ACI terms — appropriate tenant structure, BDs with the right VRF parents, EPGs with the right contract bindings, and so on.

### Architecture principle

**The LLM drafts. The infrastructure validates.**

This is the core architectural commitment of Layer 3. The LLM is allowed to produce candidate workbooks. It is *not* allowed to produce anything that ships to a fabric. Every draft passes through Layer 2's validators before it's shown to a human, and every deploy requires explicit human approval.

The LLM gets two grounding inputs:

1. **The Layer 1 schema** — the LLM knows what classes exist, what relationships are required, and what naming patterns ACI enforces.
2. **Discovered fabric state** (when applicable) — for projects against an existing fabric, a discovery pass enumerates what's already deployed so the LLM can produce changes that fit, not changes that conflict.

### Implementation

- **LLM access:** model-agnostic by design; initial implementation against Claude via Anthropic's API.
- **Grounding:** structured context construction, not RAG. The schema and fabric state are small enough to fit in context for any reasonable customer engagement.
- **Output validation:** every LLM-generated workbook is round-tripped through the Layer 2 parser and validators before being surfaced. Invalid drafts are rejected and regenerated, with error context included in the regeneration prompt.

### Boundaries

Layer 3 is the layer most likely to surprise a user. It's also the layer where surprises are most expensive. Three deliberate constraints:

1. **No direct fabric writes, ever.** Layer 3 produces workbooks. Workbooks are reviewed by humans. Humans approve deploys.
2. **No silent regeneration.** When a draft is rejected for validation failures, the user sees what failed and why.
3. **Discovery is explicit, not assumed.** When fabric state matters, the user provides credentials or imports state explicitly. The system doesn't reach for fabrics on its own.

## Why this stack

A few choices worth justifying:

**Python for the pipeline.** It's the lingua franca of network automation tooling. Cisco's own ACI Ansible collection and Terraform provider are both well-supported. Hiring managers expect Python.

**Ansible *and* Terraform.** They solve different problems. Ansible is procedural; it's good for the deploy mechanics — order of operations, conditional logic, dealing with APIC's quirks during initial fabric stand-up. Terraform is declarative; it's good for ongoing state management and drift detection. Most ACI shops end up using both eventually. Fabricate generates both from the same workbook so customers don't have to choose between deploy ergonomics and state management.

**Workbook as source of truth.** Even with Layer 3, the workbook is what gets versioned, reviewed, and deployed. Plain English is for ideation. Structured intent is for shipping. The workbook is the contract between the human-facing layer and the machine-facing layer.

**React + Vite for the Explorer.** The Explorer needs to be browseable, fast, and easy to host. A static React app built with Vite and deployed to GitHub Pages meets those needs without a backend. It also keeps the project's footprint simple — no database, no API server, no auth for the reference tool. Inline styles instead of a CSS framework keep the build trivial and the dependency tree minimal.

## What's intentionally not here

- **No multi-vendor fabric support yet.** ACI is the first target because it's the hardest and most automation-deserving. The methodology is portable; the tool, today, is not. Multi-vendor is a possible future direction, not a current scope.
- **No integration with day-2 monitoring tools.** Fabricate ends at "deployable IaC." Telemetry, alerting, and observability are different problems. Could be added; not in initial scope.
- **No GUI for Layer 2.** The workbook *is* the GUI. Building a custom UI for editing fabric intent would duplicate Excel poorly. If a richer UI ever makes sense, it's a separate project layered on top.

## Open questions

Things still being worked through:

- **State import for existing fabrics.** Generating Terraform for greenfield deployments is straightforward. Importing existing ACI state into Terraform's worldview without breaking the workbook abstraction is harder. Approach is still being designed.
- **Workbook versioning and migration.** When the schema changes, existing workbooks need a path forward. Likely involves a `schema_version` field and a small migration framework.
- **Layer 3 fabric discovery scope.** How much of an existing fabric does the LLM need to see? Full state is too much context for large fabrics; selective state requires good heuristics for what's relevant. Open question.

These are documented because they're real, not because they're showstoppers.
