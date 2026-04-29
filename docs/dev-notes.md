# Development Notes

This is a working journal for Fabricate. It captures decisions, dead-ends, and reasoning as the project evolves. It's meant to be useful for the author's future self and informative for engineers evaluating the project.

It is not meant to be exhaustive or polished.

## Format

Reverse-chronological. New entries on top. Each entry is dated. Entries can be design decisions, status updates, problem reports, or anything else worth a future engineer's attention.

---

## 2026-04-28 — Project scaffolded

Initial public commit. Three-layer architecture documented in [`architecture.md`](./architecture.md). Layer 1 (Explorer) draft already exists from earlier private work; brought into the public repo with cleanup pending. Layer 2 in active design — workbook schema is the immediate blocker. Layer 3 is design-phase only.

Decision: ship Layer 1 polish before Layer 2 starts in earnest. A working Explorer is itself useful; Layer 2 needs the schema data the Explorer already curates, so the work compounds.

Open question for the next two weeks: workbook sheet design. Considering whether contracts should bind in a separate sheet or be embedded as columns on the EPG sheet. Leaning toward separate sheet because contract relationships are many-to-many — embedding will create awkward cell semantics.

---

## Working principles

A few decisions made up front that I want to be deliberate about not forgetting:

**Validation is the product.** Anything Fabricate generates needs to be validated before it ships. The LLM in Layer 3 is the obvious case, but the same principle applies to Layer 2 — generated Ansible and Terraform should be checkable before deploy, not just after. Every layer needs a checkpoint where intent gets matched against ACI's actual constraints.

**Boring beats clever.** Workbooks beat custom DSLs. Jinja2 templates beat code generators that emit code. Static React beats anything with a backend. The point is to ship a working tool, not to write the most interesting version of every component.

**Progress is visible.** Public repo, public roadmap, public dev notes. If the project stalls, that's visible too. The visibility is the accountability.
