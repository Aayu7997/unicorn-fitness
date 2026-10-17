# UI_UX_RESOURCES.md
## Curated UI/UX, Component, Library, Tooling and Research Constitution
### Companion to CLAUDE.md + UI_UX.md

This document is the external-resource layer.

CLAUDE.md = product, architecture, engineering, security and AI workflow.
UI_UX.md = visual design, UX, spacing, color, typography, motion and interaction rules.
UI_UX_RESOURCES.md = trusted libraries, component systems, research sources, tools and selection rules.

## 1. Core rule

Do not install everything listed here. Choose the smallest trustworthy set that solves the actual product problem.

Before adding a dependency ask:
1. What concrete problem does it solve?
2. Does the existing project already solve it?
3. Does it fit the current design system?
4. Is it accessible?
5. Is it maintained and documented?
6. What is its performance/bundle impact?
7. What is its security and license impact?
8. Can the team/AI inspect and customize it?

Never add a library because an AI model called it “best” without verification.

## 2. Preferred modern React foundation

When there is no existing constraint, a strong default is:

- TypeScript
- existing framework or Next.js
- Tailwind CSS
- shadcn/ui
- ONE primitive foundation: Base UI OR Radix OR React Aria
- ONE icon family, preferably Lucide
- CSS transitions first; Motion when meaningful animation requires it
- Storybook when component isolation/documentation is valuable
- Playwright for E2E and visual regression
- axe-core plus manual accessibility testing

This is a starting point, not a mandatory stack.

## 3. shadcn/ui

Official: https://ui.shadcn.com/
Repository: https://github.com/shadcn-ui/ui

Preferred when the project wants source-owned, highly customizable components and AI-friendly code.

Useful components include:
Button, Input, Form, Dialog, Drawer, Sheet, Dropdown, Command, Combobox, Select, Tabs, Tooltip, Popover, Calendar, Date Picker, Data Table, Pagination, Sidebar, Skeleton, Toast, Table, Chart, Carousel, Scroll Area and more.

Rule: reuse existing project components first. Use shadcn second. Customize the source instead of layering random overrides.

Official shadcn currently supports Base UI, Radix and React Aria bases. New projects currently default to Base UI; Radix remains supported and React Aria is first-class:
https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
https://ui.shadcn.com/docs/changelog/2026-07-react-aria

Do NOT migrate an existing production project merely because the default changed.

## 4. Primitive selection

### Base UI
Use when starting a new project where its headless, accessible primitives fit naturally.

### Radix
https://www.radix-ui.com/primitives
Use when the project already uses Radix or needs mature accessible primitives with fine styling control. Radix handles difficult behavior such as focus management, keyboard navigation and ARIA semantics.

### React Aria
https://react-spectrum.adobe.com/react-aria/
Use when accessibility and complex interaction behavior are major requirements.

Never mix multiple primitive implementations of the same component without a real architectural reason.

## 5. Other component systems

MUI: https://mui.com/
Use for broad batteries-included/enterprise needs or existing MUI investment.

Ant Design: https://ant.design/
Use when enterprise-heavy workflows naturally fit its conventions.

Mantine, Chakra, HeroUI, Headless UI and Ark UI are alternatives, not additions to the default stack. Choose one only when project requirements justify it.

Never combine several complete visual systems.

## 6. Icons

Preferred default: Lucide
https://lucide.dev/

Other valid coherent systems:
- Heroicons
- Phosphor
- Radix Icons
- Material Symbols

Choose ONE primary family. Match stroke weight, optical size and style.

Never use emoji as professional UI icons unless intentionally part of the product identity. Never paste random SVGs from unknown sources.

## 7. Color

Radix Colors:
https://www.radix-ui.com/colors

Useful as a reference/foundation for accessible UI color scales, light/dark systems, alpha colors and wide-gamut support.

Still build semantic project tokens:
background, surface, surface-elevated, foreground, muted, border, primary, success, warning, danger, info, focus.

Do not scatter raw hex values across components.

## 8. Styling

Tailwind CSS:
https://tailwindcss.com/

Use when already adopted or when utility styling improves consistency and iteration.

Tailwind is not a design system by itself. Centralize important decisions in semantic tokens and reusable components. Do not let arbitrary utility values destroy consistency.

## 9. Animation

Motion:
https://motion.dev/

Use for:
- meaningful layout transitions
- gestures
- spring interactions
- enter/exit behavior
- complex interaction animation

For simple hover/focus/state changes, prefer CSS transitions.

Never add animation merely to make a page look impressive.

Prefer transform/opacity and respect prefers-reduced-motion.

## 10. Component development

Storybook:
https://storybook.js.org/

Use when the project has a meaningful component system or many UI states.

Test/document:
- default
- hover
- focus
- active
- disabled
- loading
- error
- success
- empty
- long content
- mobile
- desktop
- dark mode where supported

Do not add Storybook to a tiny project if maintenance cost exceeds value.

## 11. Testing

Playwright:
https://playwright.dev/

Use for:
- critical user flows
- E2E
- responsive behavior
- screenshot/visual regression
- authentication flows
- checkout
- important forms
- destructive actions

Visual tests should cover intentional states, not meaningless pixel noise.

axe-core:
https://www.deque.com/axe/axe-core/

Use for automated accessibility testing, but never treat automation as proof of accessibility. Also perform keyboard, focus, screen-reader and contrast testing.

## 12. Accessibility standards

WCAG 2.2:
https://www.w3.org/TR/WCAG22/

Default target: WCAG 2.2 AA unless project requirements specify otherwise.

Accessibility must influence component selection, semantics, focus, keyboard behavior, contrast, motion, forms and errors from the beginning.

## 13. Performance

web.dev:
https://web.dev/

Use Core Web Vitals and real browser measurements.

Pay attention to:
- LCP
- INP
- CLS
- JavaScript cost
- image loading
- rendering
- responsiveness
- layout stability

A beautiful interface that feels slow is not high-quality UX.

## 14. Research and usability

Nielsen Norman Group:
https://www.nngroup.com/

Use its usability principles to evaluate:
- system status
- real-world language
- user control
- consistency
- error prevention
- recognition over recall
- efficiency
- minimalist design
- error recovery
- help/documentation

Do not mechanically copy heuristics. Use them to reason about actual product decisions.

## 15. Platform guidelines

Apple Human Interface Guidelines:
https://developer.apple.com/design/human-interface-guidelines/

Material Design 3:
https://m3.material.io/

Use platform conventions when designing native/mobile/platform-specific experiences. Do not blindly mix Apple and Material patterns.

## 16. Inspiration and product research

Use:
- Awwwards
- CSS Design Awards
- Framer
- Mobbin
- Godly
- Land-book
- SiteInspire
- Refero

Study:
- hierarchy
- navigation
- information architecture
- responsive behavior
- interaction
- motion
- typography
- composition

Never copy exact layouts, copy, branding or visual identity.

Mobbin is particularly useful for researching real product flows such as onboarding, search, checkout, settings and mobile navigation.

## 17. shadcn registry ecosystem

Official registry directory:
https://ui.shadcn.com/docs/directory

Community registries can provide components and blocks, but they are third-party code.

Before installation inspect:
- source
- dependencies
- license
- maintenance
- accessibility
- security
- bundle impact
- visual compatibility

Never install a registry component solely because its screenshot looks good.

shadcn also supports skills, MCP and custom/GitHub-backed registries:
https://ui.shadcn.com/docs/new
https://ui.shadcn.com/docs/registry
https://ui.shadcn.com/docs/registry/github

For AI-assisted projects, these can give the agent access to actual component source and documentation. Use them when useful, not automatically.

## 18. AI resource hierarchy

When the AI needs UI knowledge, use this order:

1. Existing project code
2. Existing design tokens
3. Existing components/patterns
4. Existing Storybook/docs
5. Official library documentation
6. Official platform guidelines
7. Trusted usability/accessibility research
8. Curated community resources
9. Design galleries
10. Random snippets

Never reverse this order without a reason.

## 19. External-code security

Every third-party component is code.

Before adoption inspect:
- dependencies
- install scripts
- network behavior
- permissions
- source
- license
- maintenance
- obfuscation
- telemetry
- outdated packages

Be especially strict for cybersecurity, authentication, finance and admin products.

“GitHub” does not mean “safe” or “free to use.”

## 20. Resource evaluation matrix

Evaluate every candidate on:
- accessibility
- customization
- ownership
- performance
- maintenance
- documentation
- type safety
- UX quality
- ecosystem fit
- security
- licensing
- AI compatibility

Do not choose from popularity alone.

## 21. Product-specific recommendations

### SaaS
shadcn + one accessible primitive foundation + Lucide + Motion when needed + Playwright + axe-core.

### Cybersecurity/SOC
shadcn/headless primitives + Lucide + dense accessible tables + command/search patterns + Storybook where useful + Playwright + axe-core. Prioritize clarity, severity structure and information density over neon/decorative effects.

### Developer tools
Compact primitives, command interfaces, keyboard shortcuts, code blocks, search, selective monospace and restrained motion.

### Finance
Precise numeric formatting, accessible tables, restrained semantic color, robust forms and strong transaction states.

### Ecommerce
Responsive media, product gallery, variants, filters, comparison, checkout and accessible forms.

### Gym/Fitness
Mobile-first interaction, quick data entry, progress visualization, charts and strong touch targets.

### Couples/Social
Emotionally appropriate visual language, subtle motion, media handling, real-time state clarity and privacy-aware UX.

### CMS/Admin
Tables, filters, search/command, bulk actions, pagination, drawers, forms and role-aware UI.

## 22. Data visualization

Possible ecosystems:
- Recharts
- Apache ECharts
- Observable Plot
- D3

Choose based on complexity, interaction, accessibility, customization, bundle cost and rendering needs.

Never add charts merely to fill dashboard space.

3D:
Use React Three Fiber or another 3D system only when 3D has genuine product/brand value. Never add random floating objects or heavy 3D backgrounds without purpose.

## 23. Fonts

Choose based on:
- readability
- numeral quality
- language coverage
- product personality
- performance
- licensing

Keep font families limited. Do not use display fonts for normal application UI without reason.

## 24. Design tokens and system tooling

For larger systems consider:
- CSS variables
- Tailwind theme tokens
- Style Dictionary
- Figma Variables
- token JSON
- internal component registries

Maintain one source of truth for important design decisions.

## 25. Figma and browser tools

Figma is useful for collaborative visual systems, complex flows and designer/developer handoff. Do not require Figma when code-first design is sufficient.

Use browser DevTools for:
- responsive inspection
- computed styles
- accessibility tree
- layout debugging
- network
- performance
- rendering diagnostics

AI must inspect the actual rendered result, not reason only from source code.

## 26. Research workflow

For a new UI feature:

1. Understand the product/user/task.
2. Inspect current components and tokens.
3. Identify existing patterns.
4. Research official docs if needed.
5. Study several real products when interaction is uncertain.
6. Extract principles rather than copying.
7. Design using the current system.
8. Implement.
9. Test all states.
10. Perform visual, accessibility and performance QA.

Research should reduce uncertainty, not become research for its own sake.

## 27. Dependency discipline

Do NOT:
- install multiple UI libraries for one feature
- install multiple icon systems
- install multiple animation systems
- replace the design system unnecessarily
- copy random registry components
- trust generated third-party code blindly
- add dependencies for tiny conveniences

Prefer the smallest coherent stack.

## 28. Official-first rule

When researching a library:
1. official documentation
2. official repository
3. official changelog
4. official examples
5. package metadata
6. reputable technical sources
7. community discussion

Verify current APIs and installation methods before using them. Old tutorials are not authoritative.

## 29. Final decision rule

The AI must be able to explain:

Why this resource?
Why not the existing stack?
What are the tradeoffs?
Does it fit the design system?
What is the accessibility/performance/security/license impact?

If it cannot answer clearly, do not add it.

## 30. Resource hierarchy

When choices conflict:

Product requirement
→ existing design system
→ accessibility
→ usability
→ performance
→ maintainability
→ platform conventions
→ official ecosystem resources
→ curated community resources
→ inspiration
→ trend

Never let visual trend outrank usability, accessibility or product requirements.

## 31. Default reference index

Component/design:
- https://ui.shadcn.com/
- https://www.radix-ui.com/primitives
- https://react-spectrum.adobe.com/react-aria/
- https://base-ui.com/
- https://m3.material.io/
- https://developer.apple.com/design/human-interface-guidelines/

Styling/animation:
- https://tailwindcss.com/
- https://motion.dev/

Icons:
- https://lucide.dev/
- https://heroicons.com/
- https://phosphoricons.com/
- https://www.radix-ui.com/icons

Testing:
- https://storybook.js.org/
- https://playwright.dev/
- https://www.deque.com/axe/axe-core/
- https://web.dev/

Standards/research:
- https://www.w3.org/TR/WCAG22/
- https://www.nngroup.com/

Inspiration:
- https://www.awwwards.com/
- https://www.cssdesignawards.com/
- https://mobbin.com/
- https://godly.website/
- https://land-book.com/
- https://www.siteinspire.com/
- https://refero.design/

## 32. Final instruction to the AI

You are not allowed to select UI resources merely because they are popular, visually impressive or frequently recommended by AI.

Choose resources because they solve a real problem in this product.

Prefer:
- official sources
- maintained projects
- accessible primitives
- source-owned/customizable components
- coherent iconography
- minimal dependencies
- production-tested patterns
- strong documentation
- security-conscious adoption

The goal is not maximum tooling.

The goal is maximum product quality with minimum unnecessary complexity.

Use the smallest trustworthy set of tools capable of producing an interface that feels intentionally designed, accessible, fast, maintainable, distinctive and production-ready.
