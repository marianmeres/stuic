# Agent Documentation Creation Guide

> Instructions for creating token-efficient documentation that enables AI coding agents to work effectively within a codebase.

---

## 1. Core Principles

| Principle | Description |
|-----------|-------------|
| Declarative over narrative | State facts; avoid prose |
| Scannable over readable | Consistent structure, headers, lists |
| Modular over monolithic | Linked documents by concern |
| Actionable over descriptive | What to do, not backstory |
| Explicit over implicit | Never assume context |

**Token budgets**: Entry point ~1,000 tokens; domain docs 500–2,000 each. Front-load critical info.

**Information hierarchy**:
```
Level 0: Entry Point (always consumed)
  └─ Level 1: Architecture & Conventions
       └─ Level 2: Domain Documentation
            └─ Level 3: Inline Documentation
```

---

## 2. Documentation Structure

```
/project-root
├── AGENTS.md                    # Entry point
├── /docs
│   ├── architecture.md          # System design
│   ├── conventions.md           # Code standards
│   ├── tasks.md                 # Common procedures
│   └── /domains
│       └── [domain-name].md     # Per-domain context
└── [module]/README.md           # Inline docs (optional)
```

---

## 3. Document Specifications

### 3.1 Entry Point (AGENTS.md)

```markdown
# [Project Name] — Agent Guide

## Quick Reference
- **Stack**: [technologies]
- **Run**: `[command]` | **Test**: `[command]` | **Build**: `[command]`

## Project Structure
/src    — [purpose]
/tests  — [purpose]

## Critical Conventions
1. [Rule]
2. [Rule]

## Before Making Changes
- [ ] Check existing patterns in similar files
- [ ] Run tests
- [ ] Follow docs/conventions.md

## Documentation Index
- [Architecture](./docs/architecture.md)
- [Conventions](./docs/conventions.md)
- [Tasks](./docs/tasks.md)
- Domains: [Auth](./docs/domains/auth.md), [Billing](./docs/domains/billing.md)
```

### 3.2 Architecture (architecture.md)

Sections: Overview, Component Map, Data Flow, External Dependencies, Key Files, Security Boundaries

Use ASCII diagrams. Focus on relationships, not implementation.

### 3.3 Conventions (conventions.md)

Sections: File Organisation, Naming, Patterns, Anti-Patterns, Error Handling, Testing

Use Do/Don't format:
```markdown
✅ Do:
```js
return { data, error };
```

❌ Don't:
```js
throw new Error();
```
```

### 3.4 Tasks (tasks.md)

Structure per task:
```markdown
## [Task Name]
### Steps
1. [Step with file path]
2. [Step with pattern]
### Template
[Code template]
### Checklist
- [ ] [Verification]
```

### 3.5 Domain Documents (docs/domains/*.md)

```markdown
# [Domain Name]

## Overview
[One paragraph]

## Key Files
| File | Purpose |
|------|---------|

## Data Model
[Schema/types]

## Business Rules
- [Rule]

## Integration Points
- [Connection to other domains]
```

### 3.6 Inline Documentation

Use header comments for complex modules:
```javascript
/**
 * [Module Name]
 * Purpose: [description]
 * Invariants: [rules]
 * See: [link to domain doc]
 */
```

---

## 4. Writing Guidelines

- Imperative mood: "Create the file" not "You should create"
- Minimal examples: show only what's necessary
- Use tables for structured data
- Use relative cross-references: `[Error Handling](./conventions.md#error-handling)`

---

## 5. Iterative Updates

### 5.1 Update Modes

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| **Create** | No docs exist | Generate full structure |
| **Extend** | Gaps in coverage | Add missing; preserve existing |
| **Refresh** | Stale content | Update references; preserve accurate content |
| **Restructure** | Non-standard format | Migrate to recommended structure |

### 5.2 Update Rules

1. **Preserve accurate content** — Don't delete valid documentation
2. **Identify deltas** — Mark new additions during review period
3. **No duplication** — Consolidate; use cross-references
4. **Maintain references** — Update AGENTS.md index when adding domains

### 5.3 Update Sequence

```
1. AUDIT   → Scan docs and codebase; identify gaps
2. PLAN    → List changes; determine mode
3. UPDATE  → Domains → Tasks → Conventions → Architecture → Entry point
4. VALIDATE → Paths, references, token budgets
```

### 5.4 Change Detection Signals

| Signal | Indicates |
|--------|-----------|
| New directories | New domain |
| New dependencies | New integrations |
| New migrations | Schema changes |
| Deleted files in docs | Outdated content |
| Pattern in 3+ files | Convention to document |

### 5.5 Update Summary Template

```markdown
## Documentation Update Summary
**Date**: [Date] | **Mode**: [Mode]

### Added
- [item]

### Modified
- [item]

### Flagged for Review
- [item]
```

---

## 6. Maintenance

**Update when**: New patterns introduced, structure changes, domains added, behaviour changes, agent errors indicate missing context.

**Review checklist**:
- [ ] Entry point current
- [ ] File paths valid
- [ ] Examples match conventions
- [ ] No contradictions
- [ ] Token budgets respected

---

## 7. Anti-Patterns

| Anti-Pattern | Alternative |
|--------------|-------------|
| Monolithic docs | Modular, linked documents |
| Narrative style | Declarative statements |
| Outdated examples | Maintain with code |
| Implicit assumptions | Explicit statements |
| Duplicate information | Single source + references |

---

## 8. Validation

Test by simulating: "Can an agent with no context complete common tasks?"

Trace a task like "Add new API endpoint" through your docs — agent should find all needed information without guessing.

---

## 9. Final Checklist

- [ ] Entry point at root with quick reference
- [ ] Architecture explains system design
- [ ] Conventions with examples
- [ ] Tasks for common procedures
- [ ] Domain docs for each subsystem
- [ ] All paths verified
- [ ] All examples tested
- [ ] Cross-references valid

---

*Adapt to project needs. Goal: effective agent enablement through clear, efficient documentation.*
