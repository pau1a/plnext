_Last updated: 2025-10-21 by gpt-5-codex_

# Front Page Architecture

## Purpose & Role
The front page is the first-contact surface for PaulaLivingstone.com. It introduces Paula’s identity, signals the portfolio’s direction, and delivers a concise narrative hook that encourages deeper reading.

## Information Hierarchy
1. **Hero** — Immediate statement of Paula’s positioning with a direct call to explore the site.
2. **Introduction** — Brief contextual biography connecting Paula’s disciplines and intent.
3. **Core Work / Themes** — Snapshot of the three through-lines that frame recent and future work.
4. **Featured Writing** — Rotating highlight of one to three flagship essays or reports.
5. **Ethos / Philosophy** — Condensed articulation of Paula’s operating principles and decision lens.
6. **Contact & Connection** — Channels for dialogue, collaboration, and subscription options.
7. **Footer** — Persistent navigation, legal copy, and quick access to secondary resources.

## Emotional & Narrative Flow
The page follows a controlled descent: an initial freefall sparked by the Hero’s stark claim, a measured landing through the Introduction and Core Work sections, and a grounded credibility close established by Featured Writing, Ethos, Contact, and Footer elements.

## Palette & Tone Reference
Use the graphite/teal palette established in the design system baseline (see [palette reference](../04-design-system-baseline/palette-graphite-teal.md)), favouring graphite for structural elements and teal for selective emphasis. Motion remains restrained per [baseline motion guidelines](../04-design-system-baseline/motion.md)—micro-interactions only, no continuous animation, and nothing that distracts within the first five seconds.

## Accessibility & SEO Expectations
Follow the baseline wireframe expectations drawn from [design system foundations](../04-design-system-baseline/index.md): semantic landmarks for each major section, descriptive alt text for hero imagery, keyboard-visible focus states, and heading structure that maps to the document outline. Hero copy should align with the primary H1 for SEO, while subsequent sections use descriptive H2 headings with supporting summary metadata.

## Dependencies
- `framer-motion`
- `next-themes`
- `font-awesome`
- `bootstrap`
- `scss`

## Implementation Notes
Each major section will map to its own component under `src/app/(site)/components`:
- `<Hero />`
- `<Intro />`
- `<CoreThemes />`
- `<FeaturedWriting />`
- `<Ethos />`
- `<ContactLinks />`
- `<SiteFooter />`

## Front Page Wireframe Script – v1.0
**Hero**
- Visual: Graphite field with subtle teal gradient edge. Static. No motion.
- Copy: “I stabilise critical systems before they fail.” (≤ 12 words.)
- CTA: Button — “See current work”. Secondary link — “Read the latest essay”.

**Introduction**
- 70-word paragraph. First-person. Summarise Paula’s roles (cybersecurity, OT, applied AI). Close with invitation to review current focus areas.
- Supporting note: Single inline link to the About page.

**Core Work / Themes**
- Three columns (desktop) / stacked cards (mobile).
- Each card: Title (2–3 words), 18-word description, icon from Font Awesome (solid set).
- Themes: “Reliability Engineering”, “Operational AI”, “Human Safeguards”.

**Featured Writing**
- Carousel constrained to manual navigation only (no autoplay).
- Up to three entries. Each entry: Article title, 24-word abstract, published date, tag pill.
- Include CTA link: “Browse all writing”.

**Ethos / Philosophy**
- Two short statements (≤ 25 words each) styled as pull-quotes.
- Supplementary bullet list of three practice commitments.

**Contact & Connection**
- Primary CTA: “Start a conversation” linking to contact form.
- Secondary: LinkedIn, email, and newsletter subscribe.
- Include footnote reminding of 48-hour response window.

**Footer**
- Compact navigation (About, Projects, Writing, Contact).
- Legal copy: “© 2025 Paula Livingstone. All rights reserved.”
- Theme toggle sits right-aligned.

_Sign-off: Ged — 2025-10-16_
