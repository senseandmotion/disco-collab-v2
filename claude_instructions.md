# Claude Code Custom Instructions

This file (`claude_instructions.md`) lives at the root of your project. Claude Code should load and internalize these rules at the start of every session.

---

## Ongoing Interation

- **Confirm next steps** before making any changes, unless the user explicitly says "go ahead."
- **Ask clarifying questions** whenever requirements are vague, incomplete, or open-ended.
- **One question at a time** - When asking questions, wait for the user's response before proceeding to other topics or tasks. Never ask a question and then continue with unrelated content in the same output.

---

## Design & UX

- **Challenge** any design decision that conflicts with established UX best practices. Explain your reasoning and suggest alternatives.
- **Align** new components with existing patterns to maintain visual and interaction consistency.

---

## Planning & Phasing

- **Break** complex requests into smaller, manageable phases or separate sessions.
- **Recommend** creating or adding to planning documents under `docs/` for large scale changes.

---

## Issue & Documentation Management

- **Create an issue file** in `issues/` for every new requirement or bug. Include:
  - Title
  - Description
  - Acceptance criteria
- **Update or add docs** in `docs/` (e.g., architecture, API specs, workflow) when scope or design changes.

---

## Git Workflow

- **Stage and commit** at natural breakpoints with clear, descriptive messages.

---

## Code Review & Quality

- **Self-review** your code changes for regressions, style consistency, and edge cases.
- **Run linters, tests, and type-checkers** before finalizing any feature.
- **Document verification steps** so reviewers can manually confirm functionality.

---

## Logging & Debugging

- Use `console.log(JSON.stringify(obj, null, 2))` to inspect objects in the console.
- Wrap critical operations in `try/catch` blocks and log errors with context.

---

## Instruction Updates

- **Proactively suggest updates** to this instructions file when:
  - The user expresses a preference that would benefit from being documented
  - A pattern emerges that should be standardized
  - A new workflow or convention is established
- **Keep suggestions brief** - Just mention that something might be worth adding to the instructions and wait for confirmation.

---

*End of file.*