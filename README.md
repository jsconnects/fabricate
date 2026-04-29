# Fabricate

**Intent-driven automation for Cisco ACI fabrics.**

Fabricate translates network design intent into validated, production-ready ACI deployments. It exists because the way most teams deploy ACI today — Excel workbooks, Visio diagrams, hand-written Ansible, and a senior engineer holding the design in their head — is brittle, slow, and hard to repeat.

This project takes a different approach: structured intent goes in, validated infrastructure-as-code comes out, and the running fabric stays in lockstep with the source of truth.

---

## Why this exists

I'm a network engineer at a VAR. I see ACI engagements end the same way most of the time: 60% of project hours go to chasing client information through spreadsheets and Visio files, reconciling it against what the fabric actually needs, and translating it into config the long way. The remaining 40% is the work the engineer was hired to do.

Two things make this worse than it needs to be:

1. ACI's object model is regular and well-documented. Most of the manual translation could be automated.
2. Clients usually understand their environment in the language of their *current* network — VLANs, subnets, firewall zones. They're learning ACI's terminology (tenants, BDs, EPGs, contracts) at the same time they're being asked to design in it. The gap between "what they have" and "what ACI calls it" is where projects stall.

Fabricate is the tool I wish I had on every ACI engagement.

---

## What it does

Fabricate is structured as three independent layers. Each works on its own; together they form a complete intent-to-fabric pipeline.

### Layer 1 — ACI Object Model Explorer

A reference tool for the ACI Management Information Tree (MIT). Browse object classes, see their distinguished name patterns, and inspect the corresponding REST API calls, Ansible task structures, and Terraform resource blocks side-by-side.

The Explorer is useful on its own as a learning aid. It's also the schema layer the rest of Fabricate uses to validate that any generated configuration is structurally sound before it ever touches an APIC.

**Status:** Working. Initial release covers ~50–60 of the most commonly deployed object classes.

### Layer 2 — Workbook → Code

A pipeline that consumes a structured Excel workbook describing a target fabric — tenants, VRFs, bridge domains, EPGs, contracts, physical and routed connectivity, hardware inventory — and emits:

- **Ansible playbooks** for initial deployment and operational change
- **Terraform configuration** for declarative ongoing management

The workbook format is opinionated. It enforces ACI's relationship constraints (you can't have a BD without a VRF, you can't have an EPG outside an Application Profile, contracts have to bind to providers and consumers that exist) at intent-time, before any code is generated. Errors get caught when they're cheap to fix, not at API-call time.

**Status:** In active development.

### Layer 3 — Natural-Language Intent Translation

The hardest and most interesting layer. The premise: a customer describes their existing or target environment in their own terms — *"three VLANs for the marketing team, isolated from finance, with internet egress through the corporate firewall"* — and Fabricate produces a draft workbook in ACI's vocabulary, validated against the Layer 1 schema and the customer's existing fabric state.

The output is always a draft. It does not push to production. A human reviews, edits if needed, and then the Layer 2 pipeline produces the deployable code.

This layer uses an LLM grounded in the ACI object model and the customer's discovered topology. The validation work happens deterministically, in code — the LLM is allowed to draft, never to ship.

**Status:** Design phase. Builds on prior work in MCP-based AI tooling for network operations.

---

## Design principles

A few things drove the architecture and are worth being explicit about:

- **AI drafts, infrastructure validates.** No LLM output goes to production unverified. The validation layer is deterministic and runs against ACI's actual object model constraints.
- **Workbook is the source of truth.** Even when natural-language intent generates the workbook, the workbook is what gets versioned, reviewed, and deployed. Plain English is for ideation; structured intent is for shipping.
- **Ansible for deploy, Terraform for state.** The two tools are complementary, not redundant. Ansible handles the operational mechanics of standing things up; Terraform manages declarative drift over time.
- **The methodology, not the substrate.** ACI is a particularly good demo because its object model is rich enough to require automation and regular enough to support it. The same approach applies to any vendor's API-driven fabric. ACI is the first target, not the only one.

---

## What this isn't

- It's not a replacement for understanding ACI. Fabricate is a force multiplier for engineers who already know what they're doing, not a substitute for the design knowledge.
- It's not a no-code product. The natural-language layer is an *acceleration* of design intent, not a way to skip having someone competent in the room.
- It's not vaporware. Layer 1 is shipping. Layer 2 is in active development. Layer 3 has a clear architecture and will follow.

---

## Roadmap

| Layer | Status | Next milestone |
|---|---|---|
| 1 — MIT Explorer | Working | Expand to 100+ classes; harden the public-facing UI |
| 2 — Workbook → Code | In development | Tenant + BD/EPG + contracts end-to-end with validation |
| 3 — NL Intent | Design | Working prototype against a known-state lab fabric |

---

## About the author

Network engineer with 13+ years across Cisco, Palo Alto, Fortinet, Juniper, WatchGuard, and Meraki. Current Cisco CCNP Enterprise and Cisco Certified Specialist — Enterprise Design, with CCNP Data Center (DCCOR + DCACI) in progress alongside this project. Active builder on Cloudflare's developer platform and on agentic AI tooling for network operations.

Other projects: [LabProof](https://labproof.app) (networking skills validation platform with live Cisco Modeling Labs validation), and Guards and Deceivers (multi-agent Red vs. Blue cybersecurity simulation on live network infrastructure).

---

## Status and contact

This is a working project, not a finished one. Progress is incremental and visible in commits. If you're hiring for a NetDevOps or network automation role and the approach here resonates, reach out — [linkedin.com/in/jsconnects](https://linkedin.com/in/jsconnects).
