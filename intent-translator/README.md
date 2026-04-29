# Layer 3 — Natural-Language Intent Translation

Bridges the vocabulary gap between how customers describe their networks today (VLANs, subnets, firewall zones) and how ACI requires intent to be expressed (tenants, BDs, EPGs, contracts).

Customers describe what they want in their own terms. Layer 3 produces a draft workbook in ACI's vocabulary, grounded in the Layer 1 schema and (when applicable) the customer's discovered fabric state. The draft is always reviewed by a human before going through the Layer 2 pipeline.

## Status

Design phase. Builds on prior work in MCP-based AI tooling for network operations. See [the roadmap in the top-level README](../README.md#roadmap) for current milestone.

## Architectural commitment

**The LLM drafts. The infrastructure validates.**

The LLM is allowed to produce candidate workbooks. It is *not* allowed to produce anything that ships to a fabric. Every draft passes through Layer 2's validators before being shown to a human. Every deploy requires explicit human approval.

This is the core constraint of Layer 3 and is non-negotiable.

## Grounding inputs

The LLM gets two structured inputs before producing a draft:

1. **The Layer 1 schema** — what classes exist, what relationships are required, what naming patterns ACI enforces.
2. **Discovered fabric state** (when applicable) — for projects against an existing fabric, a discovery pass enumerates current deployment so the LLM produces changes that fit, not changes that conflict.

## Why this is hard

The LLM gets a lot of things mostly right and some things confidently wrong. Layer 3's value depends on the validation harness catching the wrong things before they reach a human reviewer, and on the regeneration loop being good enough that the next draft fixes what the previous one broke.

This is design-phase work for a reason.

## Architecture

See [`docs/architecture.md`](../docs/architecture.md#layer-3--natural-language-intent-translation) for the full design.
