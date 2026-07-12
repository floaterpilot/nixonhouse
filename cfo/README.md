# The Autonomous CFO

A personal financial operating system: a read-only, advisory web application
that helps a household make repeatable financial decisions, answer "can we
afford this?", and measure progress toward financial freedom in units of
**time** (the Financial Freedom Index).

**Status: Phase 1 — planning complete, awaiting product-owner review. No
application code yet.**

This app is self-contained within `cfo/` and is independent of the
NixonHouse dashboard that shares this repository (separate stack, database,
and authentication).

## Planning documents

| Doc | Contents |
|-----|----------|
| [01-product-summary.md](docs/01-product-summary.md) | What we're building, requirement priority order, assumptions & ambiguities |
| [02-architecture.md](docs/02-architecture.md) | Stack, structure, deployment, environment |
| [03-data-model.md](docs/03-data-model.md) | All entities and versioning strategy |
| [04-threat-model.md](docs/04-threat-model.md) | Threats T1–T14, mitigations, accepted residual risks |
| [05-ffi-calculations.md](docs/05-ffi-calculations.md) | Immediate / Accessible / Lifetime FFI formulas, confidence, attribution |
| [06-recommendation-engine.md](docs/06-recommendation-engine.md) | Deterministic rule pipeline R1–R10, explanations, alternatives |
| [07-mvp-scope.md](docs/07-mvp-scope.md) | MVP contents, deferred list, seed household |
| [08-roadmap.md](docs/08-roadmap.md) | Phases 2–7 and major risks |
| [09-decision-log.md](docs/09-decision-log.md) | Decisions D1–D12 with rationale |
| [docs/source/](docs/source/) | The three governing product documents |

## Governing documents & conflict priority

1. Security and user trust
2. `docs/source/02-ffi-functional-spec-v0.1.md`
3. `docs/source/03-prd-v0.1.md`
4. `docs/source/01-vision-framework-v0.2.md`
5. Implementation convenience

## First-release guarantees

- Read-only and advisory: never moves money, trades, or changes accounts.
- Every recommendation is deterministic, explainable, and auditable.
- Every projection carries a range and a confidence level — no false
  precision.
- Recommendations are never influenced by advertising, commissions, or
  affiliate relationships.
