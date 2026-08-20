# AGENTS.md

## Project Purpose

This repository is a reveal.js Full Setup presentation development environment. It is used to build reusable engineering-technical presentation templates and to author slides page by page with HTML, CSS, and reveal.js components. Presentations may be written in Traditional Chinese, English, or both.

## Repository Strategy

- Treat the official reveal.js source as a framework dependency.
- Do not modify `dist/`, `js/`, `plugin/`, or other official framework code for layout needs.
- Keep custom presentation content separate from the reveal.js framework.
- Future reusable templates belong under `templates/`; do not create that directory until it is needed.
- Keep template-specific HTML, CSS, and assets inside each template's own directory.
- If shared assets become necessary, create a dedicated shared directory only for that confirmed need.

## Development Workflow

- Work on one slide at a time by default.
- Before editing, inspect the existing structure and styles.
- Modify only the requested slide and directly related styles; avoid opportunistic refactors.
- Keep slides directly previewable through the reveal.js local development server.
- Prefer HTML and CSS layout. Do not make an entire slide a single background image.
- Images are content or decorative assets only; titles, dates, page numbers, and other primary information remain HTML elements.

## Design Direction

Use a light engineering, academic technical-report, engineering-paper/research-presentation, and restrained-corporate direction rather than a commercial pitch-deck style.

- Use a light gray-white or cool-white background, deep navy/blue-gray text, and blue accents.
- Use generous whitespace and low-contrast engineering structure such as fine lines, grids, technical geometry, nodes, arcs, and dividers.
- Avoid unstructured flat color backgrounds, heavy gradients, glassmorphism, neon, strong shadows, 3D effects, and decorative animation.
- Avoid startup-pitch or marketing-presentation conventions. Decoration must remain subordinate to technical content.

## Layout Rules

- Use 16:9 for all primary presentations.
- Maintain a stable layout system rather than arbitrary per-slide positioning. Account for title, content, metadata, footer, logo, page number, and optional side-information areas.
- Cover slides must have an explicit date/report-period information area, a fixed and clear company-logo area, and presenter/department-or-course/date information in the footer when applicable. Keep the main title as the strongest visual hierarchy and keep the page number in a fixed position.
- Content slides should consistently retain a header or section indicator, footer, page number, logo placement, and spacing system.

## Typography

- Prefer system-available sans-serif fonts; do not depend on commercial fonts that require extra downloads.
- Keep Chinese-English mixed text clean and establish clear hierarchy for titles, body text, captions, and metadata.
- Do not solve dense content by using excessively small type.
- Preserve technical terms in their original English form, including EtherCAT, PDO, FMMU, SyncManager, CoE, and SDO.

## CSS Rules

- Implement custom design through template-specific CSS.
- Prefer CSS variables for background, primary text, secondary text, accent, border, muted decoration, and spacing.
- Avoid repetitive inline styles. Reusable visual elements should use semantic classes, such as `.slide-header`, `.slide-footer`, `.report-period`, `.logo-area`, `.technical-grid`, and `.section-label`.
- Do not invent an abstract CSS framework without a real requirement.

## Reveal.js Rules

- Preserve the reveal.js Full Setup structure and use native `section` elements.
- Do not rewrite reveal.js navigation, scaling, or presentation-engine behavior.
- Do not add third-party packages casually. Explain the reason before adding an npm dependency; do not install one directly without that explanation.
- Use fragments and animation only when content genuinely needs progressive disclosure; never add motion solely for visual effect.

## Assets

- Put logos, diagrams, screenshots, and technical figures in the relevant template or presentation `assets/` directory.
- Do not embed large images as base64 in HTML or CSS.
- Preserve company-logo proportions and clear space. Do not stretch technical images.

## Engineering Content

Templates should prioritize readability for EtherCAT architecture, datagrams, CoE/SDO, PDO mapping, SyncManager, FMMU, state machines, packet analysis, source code, Wireshark/TShark output, tables, architecture diagrams, and protocol flows. Support code blocks, technical tables, flow and architecture diagrams, callouts, metrics/results, comparisons, and timelines/pipelines.

## Scope Discipline

- Follow the user's requested modification scope strictly. If one file is requested, do not modify other files.
- Do not clean up unrelated files, change `package.json`, upgrade reveal.js, or delete official samples/framework files unless explicitly requested.
- If the existing design conflicts with a new requirement, change only the specified scope; do not perform a broad refactor.

## Validation

- When validation is allowed, prefer existing npm scripts and confirm the page loads in the reveal.js development server.
- Check for obvious browser-console errors and, at 16:9, overflow, clipped text, and overlapping elements.
- Do not run an unnecessary build for a documentation-only change.

## Design Reference Handling

When reference slide images are supplied, analyze layout, spacing, hierarchy, line work, information zones, and visual rhythm without requiring pixel-perfect copying. Preserve the design language while keeping HTML/CSS reusable and adaptable. Do not use the reference image as a full-slide background. Stable structures such as date, logo, and footer areas should be abstracted into reusable layout components.

## Coding Style

- Keep HTML, CSS, and JavaScript readable and avoid over-abstraction.
- Simple visuals needed by one slide do not require a complex component system.
- Comment only non-obvious layout or reveal.js behavior; do not add comments that merely restate obvious CSS.
