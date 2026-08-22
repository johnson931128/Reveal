# AGENTS.md

1. Only do what the current prompt explicitly asks.
2. Do not expand scope, refactor unrelated code, or add extra features.
3. Only modify files explicitly allowed by the prompt.
4. Do not modify reveal.js framework files unless explicitly requested.
5. Preserve the existing engineering-light visual style unless asked to redesign it.
6. Reuse existing HTML/CSS patterns when practical; avoid unnecessary new systems.
7. For slide work, target 1600×900 and avoid overflow or clipping.
8. Do not run PDF export, install dependencies, or perform environment diagnostics unless requested.
9. Before commit, check git diff and ensure only requested changes are included.
10. If a tool fails, use a normal alternative if possible; do not turn the task into unrelated debugging.