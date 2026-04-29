# Layer 1 — ACI Object Model Explorer

A browseable reference for Cisco ACI's Management Information Tree (MIT). Each object class shows its DN pattern, parent and child classes, and corresponding REST API, Ansible task, and Terraform resource examples.

The Explorer is useful on its own as a learning aid for engineers picking up ACI. It's also the schema source of truth for the rest of Fabricate — Layers 2 and 3 use the same class data to validate workbook contents and ground LLM outputs.

## Live demo

Deployed automatically from `main` via GitHub Pages: **https://jsconnects.github.io/fabricate/**

## Status

Initial release covers 55 of the most commonly deployed object classes, with a focus on what's needed to deploy a working multi-tenant fabric — tenants, VRFs, BDs, EPGs, contracts, L3Outs, access policies, domains, and VMM integration. Coverage is being expanded incrementally; see the roadmap in the [top-level README](../README.md#roadmap) for current progress.

## Features

- **Hierarchical tree view** of the MIT with color-coded class families.
- **Search** across class names, DN patterns, and descriptions.
- **Per-class detail panel** showing the description, child object types, REST API call (URL + method + body), Ansible task example, Terraform resource example, and DN-to-URL anatomy.
- **Study Mode toggle** (off by default) that surfaces DCACI exam objective references on each class. Useful while studying for the cert; can be left off for general reference use.

## Running locally

Requirements: Node 20+.

```bash
cd explorer
npm install
npm run dev
```

The dev server prints a local URL (typically http://localhost:5173).

## Building

```bash
npm run build       # outputs to dist/
npm run preview     # serves the production build locally
```

The `vite.config.js` `base` option is set to `/fabricate/` to match GitHub Pages deployment under that repo name. If you fork or rename the repo, update that value.

## Data format

Class metadata lives in [`data/mit-data.json`](./data/mit-data.json) as a single recursive tree. Each class entry includes:

- `cls`: the ACI class name (e.g., `fvTenant`)
- `label`: human-readable name
- `dn` and `rn`: DN pattern and relative naming pattern
- `desc`: prose description
- `rest`, `ansible`, `terraform`: usage examples for each interaction surface
- `exam` (optional): DCACI exam objective reference (only displayed when Study Mode is on)
- `children`: array of child class entries (recursive)

The same JSON is consumed by the React frontend and (eventually) by the Layer 2 validators.

## Architecture

See [`../docs/architecture.md`](../docs/architecture.md#layer-1--aci-object-model-explorer) for the full design.

## Boundaries

The Explorer does *not* talk to live APICs. It's a schema reference, not a fabric tool. Live fabric interaction happens in Layers 2 and 3.
