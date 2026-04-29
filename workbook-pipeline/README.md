# Layer 2 — Workbook → Code

The pipeline that turns a structured workbook describing a target ACI fabric into deployable infrastructure-as-code.

Input: an Excel workbook describing tenants, VRFs, BDs, EPGs, contracts, and physical/routed connectivity.

Output: an Ansible playbook for initial deployment and Terraform configuration for ongoing state management.

## Status

In active development. See [the roadmap in the top-level README](../README.md#roadmap) for current milestone.

## Why both Ansible and Terraform

They solve different problems. Ansible is procedural and good for deploy mechanics. Terraform is declarative and good for ongoing state management and drift detection. Most ACI shops end up using both eventually, so Fabricate generates both from the same workbook to remove the choice.

See [`docs/architecture.md`](../docs/architecture.md#why-this-stack) for the longer justification.

## Pipeline

```
Workbook (XLSX) ──► Parser ──► Validators ──► Generators ──► IaC bundle
```

- **Parser** (`workbook-pipeline/`): reads the XLSX into a normalized intermediate representation.
- **Validators** (`workbook-pipeline/validators/`): schema-level (each row is structurally valid) and graph-level (cross-sheet references resolve cleanly).
- **Generators** (`workbook-pipeline/generators/`): Jinja2-templated emit of Ansible playbooks and Terraform configuration.

## Workbook schema

See `workbook-pipeline/schemas/` for the current sheet definitions and validation rules. A reference workbook lives in `workbook-pipeline/examples/`.

## Boundaries

Layer 2 produces code. It does not push to APIC. Pushing is a deliberate, human-reviewed action handled outside the pipeline.

## Architecture

See [`docs/architecture.md`](../docs/architecture.md#layer-2--workbook--code) for the full design.
