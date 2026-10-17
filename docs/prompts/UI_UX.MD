UI/UX DESIGN SYSTEM CONSTITUTIONYE

Production-Grade UI/UX Rules for AI-Coded Products

This document governs how the UI and UX of this product must be designed and implemented.

It is a companion to "CLAUDE.md".

"CLAUDE.md" defines the product, architecture, engineering, security, and project-level rules.

This document defines the visual and interaction language.

---

1. PRIMARY PRINCIPLE

Build interfaces that feel deliberately designed by an excellent product design and design-engineering team.

The result must not feel:

- AI-generated
- template-generated
- component-library-generated
- visually repetitive
- overloaded with cards
- unnecessarily animated
- excessively rounded
- dependent on gradients
- dependent on glassmorphism
- visually noisy
- copied from another product
- like a generic SaaS dashboard

The user should never think:

«"This was made with AI."»

They should think:

«"Someone clearly understood how this product should work."»

Use AI for implementation leverage, not uncontrolled design authorship.

---

2. DESIGN FROM PRODUCT, NOT FROM TRENDS

Never begin visual design with:

- "make it modern"
- "make it premium"
- "add gradients"
- "use glassmorphism"
- "make it futuristic"
- "make it Apple-like"
- "make it minimal"

These are not design systems.

First understand:

1. Who is using the screen?
2. What are they trying to accomplish?
3. What information matters most?
4. What action matters most?
5. What must be visible immediately?
6. What can remain secondary?
7. What could go wrong?
8. What should happen after the action?
9. What should the user remember?
10. What should the user never have to think about?

Then design the interface.

---

3. VISUAL HIERARCHY

Every screen must have a deliberate hierarchy.

Use hierarchy through:

- typography
- scale
- spacing
- contrast
- position
- density
- grouping
- alignment
- color
- motion

Do not use all of these simultaneously.

A strong interface often uses:

1. position
2. size
3. spacing
4. typography
5. contrast
6. color
7. motion

as progressively stronger signals.

Do not make everything visually important.

If everything is emphasized, nothing is emphasized.

---

4. LAYOUT PRINCIPLES

Prefer:

- strong alignment
- intentional whitespace
- consistent containers
- predictable grids
- readable content widths
- clear grouping
- asymmetric layouts when appropriate
- purposeful visual rhythm

Avoid:

- arbitrary centering
- excessive empty space
- cramped content
- random card placement
- inconsistent gutters
- arbitrary widths
- unnecessary nested containers
- every section having the same layout

The layout should communicate information architecture.

---

5. CONTAINER SYSTEM

Use a deliberate container system.

Recommended baseline:

Mobile:
16px horizontal padding

Small screens:
20px

Tablet:
24px

Desktop:
32px

Large desktop:
32px to 48px depending on product density

Do not blindly apply these values.

Content type determines width.

Examples:

Reading content:
640px - 760px

Forms:
420px - 560px

Application workspace:
100% available width

Dashboards:
1200px - 1600px+

Marketing pages:
1100px - 1400px

Dense data interfaces:
maximize usable width

Do not create unnecessarily narrow dashboards.

Do not stretch reading-heavy content across the entire viewport.

---

6. SPACING SYSTEM

Use a consistent spacing scale.

Preferred base:

4
8
12
16
20
24
32
40
48
64
80
96
128

Use spacing intentionally.

Typical relationships:

Icon → text:
8px

Label → input:
6px - 8px

Input → input:
12px - 16px

Related controls:
8px - 12px

Related sections:
24px - 32px

Major sections:
48px - 80px

Hero sections:
80px - 128px

Do not use random values such as:

13px
17px
23px
37px
51px

unless there is a genuine optical or component-specific reason.

Consistency matters more than mathematical purity.

---

7. OPTICAL SPACING

Do not assume mathematical equality always looks visually equal.

Icons, text, buttons, logos and asymmetric shapes may require optical correction.

Examples:

- circular icons may need slightly different padding
- text may appear vertically lower than its bounding box
- logos may require custom spacing
- large headings may need tighter line-height
- icons may require 1px visual adjustment

Design for what the eye perceives, not only what CSS calculates.

---

8. GRID SYSTEM

Use a coherent grid.

Recommended:

Mobile:
4-column conceptual grid

Tablet:
8-column

Desktop:
12-column

The exact implementation can differ.

The important rule:

Every major element should have a reason for its horizontal position.

Avoid:

random width
random margin
random transform
random absolute positioning

Use layout primitives first:

- Grid
- Flexbox
- container
- gap
- padding
- alignment

Use absolute positioning only when it represents a real visual relationship.

---

9. RESPONSIVE DESIGN

Do not design desktop first and "make it responsive later."

Design behavior across:

320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px+

Responsive design must consider:

- layout
- typography
- navigation
- tables
- forms
- dialogs
- cards
- charts
- images
- touch targets
- scrolling
- keyboard behavior
- density
- content priority

Do not simply stack everything vertically on mobile.

Redesign the interaction where necessary.

---

10. MOBILE-FIRST INTERACTION

Touch interfaces require:

- sufficiently large targets
- comfortable spacing
- predictable gestures
- minimal precision requirements
- reachable primary actions
- sensible bottom navigation where appropriate
- clear hierarchy

Avoid tiny controls.

Avoid placing destructive actions next to frequent actions without protection.

Avoid hover-dependent functionality on mobile.

---

11. DESIGN TOKENS

Do not hardcode visual decisions throughout the application.

Use semantic tokens.

Example:

--background
--surface
--surface-elevated
--surface-muted

--foreground
--foreground-muted
--foreground-subtle

--border
--border-strong

--primary
--primary-foreground

--success
--warning
--danger
--info

--focus

--radius-sm
--radius-md
--radius-lg

--shadow-sm
--shadow-md
--shadow-lg

--space-1
--space-2
...

Components should consume semantic tokens.

Do not scatter arbitrary colors throughout JSX/CSS.

---

12. COLOR SYSTEM

Color must communicate hierarchy and meaning.

Do not choose colors because they are currently trendy.

Create a deliberate palette with:

Neutral foundation

A complete neutral scale should exist.

Example conceptual structure:

Neutral 50
Neutral 100
Neutral 200
Neutral 300
Neutral 400
Neutral 500
Neutral 600
Neutral 700
Neutral 800
Neutral 900
Neutral 950

The exact hue may be warm, cool, or neutral depending on the brand.

Semantic colors

At minimum:

Primary
Success
Warning
Danger
Info

Each semantic color should have appropriate:

- background
- border
- text
- icon
- hover
- active
- disabled

variants.

---

13. COLOR USAGE RULE

Do not use primary color everywhere.

Primary color should communicate:

- primary action
- selected state
- important interaction
- brand identity
- active navigation
- meaningful emphasis

Most of the interface should rely on:

- neutral surfaces
- typography
- spacing
- borders
- hierarchy

Color should guide attention rather than decorate every element.

---

14. COLOR RATIO

A useful starting principle:

~70-80% neutral foundation
~15-25% secondary/structural colors
~5-10% strong accent

This is not a rigid mathematical rule.

Adjust according to the product.

For cybersecurity interfaces, finance, analytics and enterprise products, restraint is usually more important than visual spectacle.

---

15. DARK MODE

Dark mode must not be:

#000000 background
+
white text
+
random neon colors

Build dark mode as its own visual system.

Use multiple surface levels:

background
surface
surface-elevated
surface-overlay

Create subtle depth through:

- luminance
- borders
- shadows where appropriate
- surface differences

Do not rely entirely on shadows in dark mode.

Avoid excessively saturated neon accents.

---

16. CONTRAST

Text hierarchy must remain readable.

Use stronger contrast for:

- primary text
- critical information
- active controls

Use lower contrast carefully for:

- metadata
- secondary descriptions
- timestamps
- supporting information

Never sacrifice readability for aesthetics.

Do not use extremely light gray text on white backgrounds.

Do not use low-contrast gray-on-dark-gray interfaces.

---

17. TYPOGRAPHY

Typography is one of the primary design tools.

Choose fonts intentionally.

Prefer:

- excellent readability
- strong numeral rendering
- good multilingual support
- consistent weights
- good UI rendering

Typical hierarchy:

Display
H1
H2
H3
H4
Body
Body Small
Label
Caption

Do not create 15 different text styles without reason.

---

18. TYPE SCALE

Use a coherent scale.

Example:

12px
14px
16px
18px
20px
24px
30px
36px
48px
60px+

Adjust according to product type.

Marketing pages can use larger typography.

Enterprise interfaces should prioritize information density and readability.

---

19. LINE HEIGHT

Typical starting points:

Large headings:
0.95 - 1.15

Normal headings:
1.1 - 1.25

Body:
1.45 - 1.7

Dense UI:
1.3 - 1.5

Do not use identical line-height for every text style.

---

20. LETTER SPACING

Use tracking intentionally.

Large display text may require slightly tighter tracking.

Small uppercase labels may require slightly wider tracking.

Normal body text should generally use natural tracking.

Never add dramatic letter spacing just to make a UI appear "premium."

---

21. FONT WEIGHTS

Prefer a restrained hierarchy:

400
500
600
700

Use 800/900 only when the visual system genuinely needs it.

Do not make everything bold.

---

22. ICONOGRAPHY

Icons must feel like one family.

Do not mix:

- filled icons
- outlined icons
- 3D icons
- emoji
- random SVG styles

without a deliberate reason.

Choose one primary icon system.

Prefer consistent:

- stroke width
- optical size
- corner treatment
- viewbox
- alignment
- visual weight

Examples of suitable systems include Lucide, Phosphor, Heroicons or another coherent icon library already used by the project.

Do not introduce multiple icon libraries unnecessarily.

---

23. ICON SIZE

Typical baseline:

12px:
micro indicators

14px:
compact metadata

16px:
normal UI

18px:
prominent UI

20px:
buttons/navigation

24px:
major actions

32px+:
feature/illustration contexts

Icon size should match surrounding typography.

---

24. ICON + TEXT ALIGNMENT

Icons must align optically with text.

Avoid:

icon slightly floating above text
icon touching text
inconsistent icon spacing

Default starting point:

8px gap

Adjust optically when necessary.

---

25. BUTTONS

Buttons should have a clear hierarchy.

Typical levels:

Primary
Secondary
Tertiary/Ghost
Destructive
Link
Icon-only

Do not create five visually competing primary buttons.

Each screen should have an obvious primary action when appropriate.

---

26. BUTTON STATES

Every interactive button should support:

Default
Hover
Focus
Active/Pressed
Loading
Disabled
Success where appropriate
Error where appropriate

Loading must not unexpectedly change the layout.

Prefer:

button text
→ spinner/loading indicator

while preserving button dimensions.

---

27. BUTTON SIZE

Typical starting sizes:

Compact:
32px

Default:
36px - 40px

Comfortable:
44px

Touch-focused:
44px+

Use product context.

Do not make every button enormous.

---

28. INPUTS AND FORMS

Forms must clearly communicate:

Label
Input
Supporting text
Validation
Error
Success
Required state
Disabled state
Loading state

Do not rely only on placeholder text as a label.

Never make users guess why validation failed.

Error messages should explain:

1. What went wrong
2. Why it happened when useful
3. How to fix it

---

29. FORM UX

Validate at the appropriate time.

Avoid aggressive validation that interrupts typing.

For complex forms:

- group related fields
- preserve entered data
- show progress when appropriate
- prevent accidental loss
- summarize errors
- focus the first actionable error

---

30. CARDS

Cards are not a default layout primitive for everything.

Use cards when content genuinely represents a distinct object, module or grouping.

Do not create:

card inside card
inside another card
inside another card

Avoid excessive borders and shadows.

A section can often be communicated better through:

- whitespace
- typography
- dividers
- alignment

instead of another card.

---

31. BORDER RADIUS

Choose a radius language.

Example:

sm:
6px

md:
8px

lg:
12px

xl:
16px

pill:
9999px

Do not randomly mix:

4px
7px
9px
13px
17px
22px

Use larger radii for larger surfaces and smaller radii for compact controls.

Do not make every component a pill.

---

32. SHADOWS

Shadows should communicate elevation, not decoration.

Use:

none
subtle
medium
high

Avoid huge blurry shadows.

Prefer borders and surface contrast where appropriate.

For dark interfaces, subtle surface separation is often better than dramatic shadows.

---

33. DEPTH

Depth can come from:

1. spacing
2. surface contrast
3. borders
4. shadows
5. blur
6. motion

Use the least visually expensive technique that communicates the relationship.

Do not use glassmorphism simply because it looks modern.

---

34. MOTION PHILOSOPHY

Animation must communicate something.

Good reasons:

- state transition
- spatial relationship
- feedback
- hierarchy
- continuity
- orientation
- loading
- confirmation

Bad reasons:

- decoration
- showing off
- making a page feel expensive
- distracting the user
- slowing interaction

Motion should feel almost invisible when it is doing its job correctly.

---

35. MOTION SPEED

Use a small motion vocabulary.

Starting points:

Micro interaction:
100-160ms

Normal UI transition:
160-240ms

Panel/modal:
200-320ms

Large layout transition:
250-400ms

These are starting points, not absolute rules.

Avoid unnecessarily slow animations.

Do not make common interactions wait 500ms+ without a strong reason.

---

36. EASING

Prefer natural easing.

Typical choices:

ease-out:
elements entering

ease-in:
elements leaving

ease-in-out:
state/layout transformations

Use custom cubic-bezier curves only when they create a deliberate interaction character.

Do not animate everything with the same generic easing.

---

37. TRANSFORM-FIRST ANIMATION

When possible, animate:

transform
opacity

instead of expensive layout properties.

Prefer:

transform: translate
transform: scale
opacity

Avoid unnecessary animation of:

width
height
top
left
margin

when a compositor-friendly alternative exists.

---

38. REDUCED MOTION

Respect:

prefers-reduced-motion

When enabled:

- remove unnecessary movement
- reduce animation distance
- reduce decorative transitions
- preserve essential feedback

Accessibility is more important than visual effects.

---

39. MICROINTERACTIONS

Use subtle feedback for meaningful actions:

- button press
- toggle
- checkbox
- save
- copy
- delete
- upload
- navigation
- validation
- success
- error

Examples:

copy → temporary "Copied"

save → subtle success state

delete → confirmation + clear completion

toggle → immediate visual response

Do not animate every hover.

---

40. HOVER

Hover is enhancement, not a requirement.

Hover should usually be subtle:

- background shift
- border change
- opacity
- tiny elevation
- color transition

Avoid dramatic:

- scaling
- rotation
- bouncing
- glowing
- 3D transformations

unless the product specifically calls for it.

---

41. PRESS / ACTIVE STATES

Touch and pointer interactions should provide immediate feedback.

Examples:

scale:
0.98 - 0.99

brightness:
slight reduction

surface:
slight shift

Do not make controls appear broken when pressed.

---

42. PAGE TRANSITIONS

Do not automatically animate entire pages.

Use transitions when they establish continuity.

For navigation:

- preserve spatial context where possible
- avoid unnecessary theatrical effects
- prioritize perceived speed

The application should feel fast even when transitions exist.

---

43. LOADING STATES

Never leave users wondering whether something happened.

Use:

skeleton
spinner
progress indicator
optimistic state
placeholder
streaming state

based on the operation.

Use skeletons when the layout is known.

Use spinners for short indeterminate operations.

Use progress indicators for measurable long operations.

---

44. SKELETONS

Skeletons should resemble the actual content structure.

Do not build decorative skeletons.

Avoid excessive shimmering.

Skeleton animation should be subtle and inexpensive.

---

45. PERCEIVED PERFORMANCE

UI should feel fast.

Prioritize:

- immediate feedback
- optimistic updates where safe
- progressive loading
- streaming where useful
- skeletons
- cached data
- stable layouts
- minimal blocking
- prefetching when justified

Never make the user wait for unnecessary work.

---

46. LAYOUT STABILITY

Avoid layout shifts.

Reserve space for:

- images
- avatars
- charts
- async content
- ads if applicable
- navigation
- loading states

Do not let content jump unexpectedly.

---

47. IMAGES

Images must:

- have correct aspect ratios
- use responsive sizing
- lazy-load when appropriate
- have meaningful alt text when informative
- avoid layout shifts
- use optimized formats when appropriate

Do not use random stock imagery just to fill space.

Every image should have a product purpose.

---

48. EMPTY STATES

Empty states are part of the product.

Every meaningful empty state should answer:

1. What is empty?
2. Why is it empty?
3. What can the user do next?

Example:

No scans yet.

Run your first security scan to see findings,
risk levels and remediation recommendations.

[Run Scan]

Avoid:

Nothing here.

---

49. ERROR STATES

Errors must be useful.

Provide:

what happened
possible cause
next action
retry when appropriate
support/debug information when appropriate

Do not expose sensitive technical details to ordinary users.

Technical products may provide expandable technical diagnostics.

---

50. SUCCESS STATES

Success should be clear but restrained.

Avoid:

- huge confetti
- unnecessary modal explosions
- excessive animation

Prefer:

subtle confirmation
status update
toast where appropriate
inline state

Use stronger celebration only for genuinely meaningful milestones.

---

51. DESTRUCTIVE ACTIONS

Destructive operations need:

- clear language
- appropriate visual distinction
- confirmation for irreversible actions
- undo where feasible
- server-side enforcement

Do not hide destructive actions behind ambiguous icons.

---

52. TOASTS

Toasts should be used for:

- temporary feedback
- completed actions
- background status

Do not put critical information only in a toast.

Toasts should:

- be readable
- not cover important controls
- have appropriate duration
- support dismissal
- respect mobile safe areas

---

53. MODALS

Use modals only when interruption is justified.

Prefer:

- inline editing
- dedicated pages
- drawers
- popovers

when they preserve context better.

A modal should have:

- clear title
- clear purpose
- obvious primary action
- obvious dismissal
- keyboard support
- focus management

---

54. DRAWERS

Drawers are useful for:

- secondary details
- filters
- contextual editing
- mobile workflows
- inspector panels

Do not turn every interaction into a drawer.

---

55. TABLES AND DATA-DENSE UI

For enterprise, cybersecurity, finance and analytics products:

Prioritize:

1. scanability
2. alignment
3. filtering
4. sorting
5. density
6. status recognition
7. keyboard efficiency

Numbers should align consistently.

Dates should use consistent formatting.

Status should not rely only on color.

---

56. DATA VISUALIZATION

Charts must answer a question.

Before creating a chart ask:

«What decision does this visualization help the user make?»

Avoid decorative charts.

Use:

- meaningful labels
- clear units
- readable axes
- useful tooltips
- accessible color
- appropriate scales

Do not distort data for visual drama.

---

57. COLOR IN DATA VISUALIZATION

Never rely on color alone.

Combine color with:

- labels
- icons
- patterns
- position
- text
- shape

especially for:

danger
warning
success
status
severity

---

58. NAVIGATION

Navigation should reflect information architecture.

Avoid too many top-level items.

Use:

- primary navigation
- secondary navigation
- contextual navigation
- breadcrumbs
- tabs

only when they provide meaningful orientation.

Do not create navigation just because a component exists.

---

59. SIDEBARS

Sidebar rules:

- stable width
- clear active state
- predictable grouping
- readable labels
- tooltips only when labels are hidden
- collapsible when useful
- mobile adaptation

Do not make the sidebar visually louder than the content.

---

60. TABS

Tabs are for switching between related views at the same hierarchy.

Do not use tabs for unrelated workflows.

Tabs should:

- clearly indicate active state
- preserve context
- be keyboard accessible
- support overflow on small screens

---

61. BREADCRUMBS

Use breadcrumbs when hierarchy is genuinely deep.

Avoid breadcrumbs on simple applications where they add noise.

---

62. SEARCH

Search should communicate:

idle
typing
loading
results
no results
error

For advanced search:

- filters
- keyboard navigation
- recent searches
- suggestions
- query syntax
- result categories

only when useful.

---

63. ACCESSIBILITY

Accessibility is not an optional polish phase.

Every component must consider:

- keyboard navigation
- visible focus
- semantic HTML
- screen readers
- color contrast
- reduced motion
- touch targets
- form labels
- error association
- focus management

Do not remove focus outlines without replacing them with an equally clear accessible focus state.

---

64. KEYBOARD UX

Desktop applications should support efficient keyboard use where appropriate.

Examples:

Tab
Shift + Tab
Enter
Space
Escape
Arrow keys
Cmd/Ctrl + K
Cmd/Ctrl + S

only where those shortcuts are meaningful.

Never introduce shortcuts that conflict with browser or OS behavior without reason.

---

65. FOCUS MANAGEMENT

After:

- modal opening
- modal closing
- route changes
- validation errors
- dynamic content changes

focus should remain understandable.

Do not leave keyboard users lost.

---

66. CONTENT DESIGN

UI copy must be:

- concise
- specific
- human
- actionable
- consistent

Avoid generic AI copy such as:

Unlock powerful insights.
Elevate your workflow.
Take your experience to the next level.
Revolutionize your productivity.

unless the product genuinely uses that brand voice.

Prefer concrete language.

---

67. LABELS

Prefer:

Run Scan
Create Project
Save Changes
Export Report
Delete Account

over:

Continue
Proceed
Submit
Action
Process

when the specific action can be named.

---

68. DESIGN DENSITY

Density should match the product.

Consumer products

Prefer:

- comfortable spacing
- larger touch targets
- simpler hierarchy

Developer tools

Can use:

- higher density
- monospace
- keyboard shortcuts
- compact controls

Cybersecurity/SOC

Can use:

- dense tables
- severity indicators
- filters
- command/search interfaces
- technical metadata

Finance

Prioritize:

- numeric readability
- stable layouts
- clear status
- restrained colors

Ecommerce

Prioritize:

- product imagery
- price hierarchy
- comparison
- availability
- checkout clarity

Fitness/Gym

Prioritize:

- progress
- metrics
- quick logging
- visual motivation
- mobile usability

---

69. CYBERSECURITY UI

For cybersecurity products:

Do not make everything neon green/red.

Severity should be systematic.

Example:

Critical
High
Medium
Low
Informational

Use:

- severity
- confidence
- affected asset
- evidence
- remediation
- timestamp
- status

as structured information.

Technical users should be able to move from:

Finding
→ Evidence
→ Impact
→ Root cause
→ Recommendation
→ Remediation
→ Verification

without hunting through the UI.

---

70. FINANCE UI

Financial interfaces require:

- precise numbers
- clear units
- clear dates
- predictable formatting
- careful negative-value treatment
- strong transaction states
- confirmation for irreversible actions

Do not use green/red as the only signal.

---

71. ECOMMERCE UI

Prioritize:

Product
Price
Variant
Availability
Shipping
Returns
Reviews
CTA

Avoid burying the primary purchase decision beneath decorative content.

---

72. AI PRODUCT UI

AI products require special states:

Thinking
Streaming
Generating
Tool execution
Waiting for approval
Partial result
Success
Failure
Retry
Cancelled

Do not fake intelligence with meaningless animations.

If the model is working, communicate what is happening honestly.

---

73. AI OUTPUT DESIGN

AI-generated content should be:

- editable
- copyable
- exportable
- regeneratable
- inspectable when necessary

Give users control.

Do not trap important output in decorative UI.

---

74. COMPONENT CONSISTENCY

Once a component pattern exists, reuse it.

Do not create:

ButtonA
ButtonB
ButtonC

for tiny visual differences.

Extend the component system instead.

But do not force fundamentally different interactions into one giant "universal component."

---

75. DESIGN SYSTEM BOUNDARIES

Create reusable primitives for:

- buttons
- inputs
- cards
- dialogs
- dropdowns
- tooltips
- badges
- tabs
- navigation
- tables
- alerts

Create product-specific patterns for:

- security findings
- financial transactions
- workout logs
- product cards
- AI conversations
- dashboards

Do not make every component generic.

---

76. VISUAL CONSISTENCY

Every screen should feel like part of the same product.

Check:

- typography
- color
- spacing
- radius
- shadows
- icons
- buttons
- inputs
- navigation
- motion

If a new screen looks like it belongs to another product, stop and reconcile the design system.

---

77. VISUAL VARIETY

Consistency does not mean repetition.

Do not make every section:

heading
subtitle
three cards

Use different structures where the content demands them:

- split layout
- timeline
- table
- list
- chart
- feature grid
- editorial section
- comparison
- interactive workspace
- command interface

The content determines the structure.

---

78. ANTI-AI-SLOP CHECK

Before shipping any interface, inspect for:

- excessive rounded cards
- excessive gradients
- generic purple/blue AI palette
- random glass effects
- unnecessary blur
- excessive shadows
- huge hero text
- meaningless statistics
- fake testimonials
- decorative dashboards
- repeated three-card layouts
- random icons
- emoji used as UI icons
- excessive animation
- generic marketing copy
- inconsistent spacing
- too many font sizes
- too many button styles
- unnecessary badges
- excessive pills
- visual noise

If several appear without product justification, redesign the interface.

---

79. REFERENCE USE

References may be used for:

- interaction ideas
- hierarchy
- spacing
- composition
- motion principles
- information architecture
- component behavior

Never copy a reference literally.

Do not reproduce:

- exact layouts
- exact copy
- exact visual identity
- exact illustrations
- exact component arrangement

Extract principles, then create an original system.

---

80. DESIGN INSPIRATION SOURCES

When research is useful, study high-quality work from:

- Awwwards
- CSS Design Awards
- Framer Awards
- Mobbin
- Godly
- Land-book
- SiteInspire
- Refero
- Apple Human Interface Guidelines
- Material Design
- Nielsen Norman Group
- Vercel design engineering
- Raycast
- Linear
- Stripe
- GitHub
- Notion
- Figma

These are references for principles, not templates to copy.

---

81. INTERACTION FEEL

The interface should feel:

- immediate
- predictable
- responsive
- calm
- deliberate
- tactile
- stable

Avoid:

- delayed feedback
- excessive motion
- unpredictable state changes
- layout jumps
- surprise navigation
- accidental destructive actions

---

82. SPEED

Perceived speed is part of UX.

Prefer:

instant local feedback
→ background operation
→ progress/status
→ completion

where technically safe.

Do not block the UI for operations that can safely happen asynchronously.

---

83. ERROR RECOVERY

Every meaningful failure must have a recovery path.

Examples:

Retry
Undo
Edit
Reconnect
Refresh
Go back
Contact support
View details

Never design dead ends.

---

84. OFFLINE AND NETWORK STATES

For applications where connectivity matters, design:

online
offline
reconnecting
slow network
request timeout
server unavailable
rate limited
partial data
stale data

Do not let the UI simply freeze.

---

85. RESPONSIVE NAVIGATION

Desktop navigation and mobile navigation do not have to be identical.

Choose the interaction that best fits each context.

Possible mobile patterns:

- bottom navigation
- compact header
- drawer
- command/search access
- contextual toolbar

Do not simply shrink desktop navigation.

---

86. SAFE AREAS

Mobile interfaces must respect:

notches
status bars
home indicators
browser UI
keyboard

Use appropriate safe-area handling.

---

87. SCROLLING

Avoid unnecessary nested scrolling.

Nested scroll areas should exist only when they improve usability.

Prefer one primary page scroll where possible.

For dense applications, intentional secondary scroll areas may be appropriate.

---

88. STICKY ELEMENTS

Sticky headers, toolbars and filters should be used when they improve task completion.

Do not make everything sticky.

Sticky elements must not consume excessive screen space.

---

89. Z-INDEX

Use a documented layering system.

Example:

base
sticky
dropdown
popover
modal
toast
system overlay

Do not use random values such as:

z-index: 999999

throughout the application.

---

90. VISUAL QA

After implementing a screen, inspect it visually at:

320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px

Check:

- spacing
- alignment
- overflow
- typography
- hierarchy
- contrast
- icon alignment
- responsive behavior
- loading states
- error states
- empty states
- animation
- keyboard navigation

---

91. COMPONENT QA

Every reusable component should be tested in:

normal
hover
focus
active
disabled
loading
error
success
empty
long content
short content
mobile
desktop
dark mode if supported

Do not only test the happy path.

---

92. LONG CONTENT

Components must survive:

- long names
- long email addresses
- long URLs
- large numbers
- translated text
- multiple lines
- missing data
- huge datasets

Do not assume ideal content.

---

93. DATA STATES

For dynamic applications support:

initial
loading
partial
success
empty
no results
validation error
permission denied
unauthorized
offline
rate limited
conflict
expired
server error
maintenance

Every state must have intentional UX.

---

94. ACCESSIBILITY CHECK

Before declaring UI complete:

Keyboard navigation works.
Focus is visible.
Forms have labels.
Errors are understandable.
Color is not the only signal.
Contrast is sufficient.
Touch targets are usable.
Reduced motion is respected.
Screen-reader semantics are meaningful.

---

95. PERFORMANCE CHECK

Before declaring UI complete:

No unnecessary heavy animation.
No layout thrashing.
Images are optimized.
Large components are lazy-loaded where appropriate.
No unnecessary client-side JavaScript.
No obvious rendering loops.
No unnecessary dependencies.
No avoidable layout shift.

---

96. DESIGN REVIEW QUESTIONS

Before shipping, ask:

Hierarchy

Can I immediately tell what matters?

Navigation

Can I understand where I am?

Interaction

Can I predict what will happen when I click?

Feedback

Does every meaningful action provide feedback?

Errors

Can I recover when something fails?

Density

Is there enough information without feeling crowded?

Visual identity

Does this feel like one coherent product?

Originality

Does this look intentionally designed rather than assembled from templates?

Accessibility

Can keyboard and assistive technology users operate it?

Performance

Does it feel fast?

Mobile

Does it remain genuinely usable on a phone?

---

97. FINAL UI QUALITY BAR

A screen is not complete because:

- it renders
- it looks good in one screenshot
- the animation works
- the colors match
- the happy path works

A screen is complete when:

Visual hierarchy
+
Information architecture
+
Interaction design
+
Responsive behavior
+
Accessibility
+
State handling
+
Motion
+
Performance
+
Content quality
+
Design-system consistency
+
Error recovery

all work together.

---

98. AI IMPLEMENTATION RULE

When implementing UI:

1. Inspect existing design tokens.
2. Inspect existing components.
3. Reuse existing patterns.
4. Do not introduce a new visual language.
5. Do not introduce a new icon library without justification.
6. Do not introduce arbitrary colors.
7. Do not introduce arbitrary spacing.
8. Do not introduce unnecessary animations.
9. Do not create duplicate components.
10. Do not redesign unrelated screens.

Prefer extending the existing system over creating another system.

---

99. BEFORE CODING

Before writing UI code, determine:

Purpose
User
Primary action
Secondary actions
Information hierarchy
Content model
Responsive behavior
States
Accessibility requirements
Motion requirements
Performance requirements

Then implement.

---

100. AFTER CODING

After implementation:

Run the application.

Inspect the actual rendered result.

Test realistic content.

Test mobile.

Test desktop.

Test keyboard.

Test loading.

Test empty.

Test error.

Test long content.

Test dark mode if supported.

Inspect animation.

Inspect spacing.

Inspect alignment.

Inspect performance.

Fix visual problems before declaring completion.

---

101. DO NOT OVERDESIGN

A sophisticated interface is not necessarily visually complicated.

Prefer:

clarity
+
hierarchy
+
restraint
+
precision

over:

effects
+
gradients
+
animation
+
decoration

The strongest design decision is sometimes removing something.

---

102. DO NOT UNDERDESIGN

Minimalism does not mean:

- empty
- unfinished
- plain
- lacking feedback
- missing states
- missing hierarchy

A simple interface can still have:

- excellent typography
- precise spacing
- subtle motion
- strong interaction feedback
- excellent accessibility
- clear information architecture

---

103. PRODUCT-SPECIFIC VISUAL DNA

Before creating a major screen, define:

Visual personality:
Typography:
Color character:
Surface character:
Radius language:
Icon language:
Motion language:
Density:
Photography/illustration style:
Interaction character:

These should remain consistent across the product.

---

104. DESIGN TOKEN DISCIPLINE

If a value appears repeatedly, consider making it a token.

If a value appears only once for a legitimate optical reason, local CSS may be appropriate.

Do not create tokens for every pixel.

The goal is a coherent system, not abstraction for its own sake.

---

105. DESIGN SYSTEM EVOLUTION

When a repeated pattern appears:

1. identify it
2. validate that it is genuinely reusable
3. extract it
4. document it
5. update existing usage when appropriate

Do not prematurely abstract every component.

---

106. FINAL ANTI-GENERIC RULE

Never use a visual decision simply because:

«"AI commonly does this."»

Instead ask:

«"Does this decision improve this product for this user?"»

If yes, keep it.

If not, remove it.

---

107. FINAL STANDARD

The interface should feel like the result of:

experienced product design
+
strong UX research
+
excellent visual design
+
design-system discipline
+
professional frontend engineering
+
careful accessibility
+
performance engineering
+
real product understanding

Not:

prompt
→ generate
→ ship

The goal is not to make the most visually impressive interface.

The goal is to make the most appropriate interface that feels effortless, coherent, fast, accessible, distinctive and production-ready.