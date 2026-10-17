MOBILE APP CONSTITUTION

Production-Grade Expo + React Native iOS & Android App

UI/UX + Interaction + Navigation + Functional Logic + Native Behavior + Performance + QA

This document is the mobile-specific execution constitution for this project.

It works together with:

- "CLAUDE.md"
- "UI_UX.md"
- "UI_UX_RESOURCES.md"
- "PRODUCT.md"
- "ARCHITECTURE.md"
- "SECURITY.md"
- "DATA.md"
- "TESTING.md"
- other project context files

Do not replace those documents.

This document adds the rules required to turn the existing product into a genuinely excellent iOS + Android application.

---

1. ROLE

Act as a senior mobile product designer, UX architect, React Native/Expo engineer, design-systems engineer, accessibility specialist, performance engineer and QA engineer working together.

Do not behave like a generic AI UI generator.

Do not redesign the application from scratch simply because you can.

First understand the existing product, existing UI/UX system, existing codebase, existing requirements, existing backend, existing state management, existing navigation and existing user/admin roles.

Then improve and implement it coherently.

The objective is:

«Make the application feel like a mature, intentionally designed, professionally engineered native mobile product.»

It must feel:

- fast
- polished
- natural
- responsive
- stable
- intuitive
- accessible
- visually distinctive
- platform-aware
- trustworthy
- production-ready

It must NOT feel:

- AI-generated
- web UI placed inside a phone
- template-generated
- overloaded with cards
- excessively rounded
- unnecessarily animated
- generic SaaS
- copied from another app
- dependent on decorative effects

---

2. FIRST RULE: UNDERSTAND THE EXISTING PROJECT

Before changing anything:

Inspect the complete repository.

Understand:

- package.json
- Expo SDK version
- React Native version
- Expo Router version
- app directory
- route structure
- layouts
- authentication
- authorization
- user roles
- admin roles
- API layer
- backend integration
- database integration
- state management
- caching
- persistence
- storage
- notifications
- deep linking
- environment variables
- native configuration
- app.json/app.config
- eas.json
- assets
- fonts
- icons
- design tokens
- reusable components
- hooks
- utilities
- services
- error handling
- analytics
- logging
- tests
- existing UI/UX

Do not guess architecture that already exists.

---

3. DO NOT BREAK EXISTING FUNCTIONALITY

Before modifying a screen, determine:

- what currently works
- what API it calls
- what data it consumes
- what state it changes
- what navigation it triggers
- what permissions it requires
- what user role can access it
- what side effects occur
- what other screens depend on it

A UI change must not silently break existing functionality.

---

4. COMPLETE FEATURE TRACE

For every feature, understand the complete chain:

User action
→ UI state
→ validation
→ local state
→ API/service call
→ authentication
→ authorization
→ backend logic
→ database
→ response
→ cache/state update
→ UI update
→ feedback
→ analytics/logging where appropriate

Do not implement only the visible screen.

The feature is complete only when the entire flow works.

---

5. USER AND ADMIN ARE DIFFERENT PRODUCTS

This application has two major experiences:

USER APP
ADMIN APP

Do not treat admin as a normal user with extra buttons.

They have different:

- goals
- permissions
- information density
- navigation
- actions
- terminology
- risk levels
- workflows
- dashboards
- states
- confirmation requirements

Design both experiences intentionally.

---

6. USER EXPERIENCE

The user application should prioritize:

- simplicity
- clarity
- speed
- discoverability
- task completion
- trust
- personalization
- useful feedback
- low cognitive load

The user should not need to understand the underlying system.

---

7. ADMIN EXPERIENCE

The admin application should prioritize:

- operational visibility
- information density
- efficient workflows
- search
- filtering
- sorting
- bulk actions
- auditability
- permissions
- system status
- error visibility
- safe destructive actions

Admin UX may be denser than consumer UX.

Do not make admin screens artificially spacious merely to look pretty.

---

8. ADMIN SECURITY

Never rely on the mobile UI to enforce admin access.

The client may hide unavailable controls for UX.

The backend must independently enforce:

- authentication
- authorization
- role
- permissions
- ownership
- resource access

Never trust:

role stored only in client state
isAdmin boolean from the client
hidden buttons
navigation guards alone

---

9. MOBILE IS NOT A SMALL WEBSITE

Do not simply shrink an existing web interface.

Mobile requires:

- different navigation
- different information hierarchy
- touch-first controls
- different density
- mobile-specific gestures
- keyboard handling
- safe-area handling
- native platform behavior
- mobile loading states
- mobile error recovery
- platform-specific conventions

When necessary, create mobile-specific compositions rather than forcing desktop layouts into a phone.

---

10. EXPO ARCHITECTURE

Use the existing Expo architecture if it is sound.

For new Expo projects, prefer Expo Router unless project constraints justify another architecture.

Expo Router provides file-based routing, deep linking and native navigation patterns for Expo projects.

Do not migrate an existing production navigation system without a concrete reason.

Always verify the exact APIs against the Expo SDK version actually installed in the project.

Never blindly use an API from an older tutorial.

---

11. NAVIGATION

Design navigation around user tasks.

Choose deliberately between:

- Stack
- Tabs
- Native Tabs
- Drawer
- Modal
- Sheet
- nested navigation
- custom navigator only when necessary

Expo Router provides Stack, Tabs, Native Tabs, Drawer and custom navigator capabilities.

Do not use every navigation pattern.

---

12. NATIVE TABS

Use native tab navigation when platform-native behavior is appropriate.

Current Expo documentation provides native tabs through Expo Router, with platform-specific behavior and safe-area handling.

For SDK/version-specific APIs:

- inspect the installed Expo SDK
- consult current official documentation
- use the stable API available for that SDK
- do not copy an outdated "unstable-*" implementation into a newer SDK

---

13. TAB DESIGN

Tabs should represent major destinations.

Do not put:

- settings
- help
- logout
- random secondary actions

into primary tabs unless there is a strong product reason.

Keep primary navigation limited to genuinely important destinations.

---

14. BACK BEHAVIOR

Back navigation must feel native.

Android:

- respect the system back button/gesture
- preserve navigation history
- avoid trapping users

iOS:

- support expected navigation hierarchy
- preserve swipe-back behavior where appropriate
- avoid unnecessary custom replacements for native conventions

Never create inconsistent back behavior between screens.

---

15. DEEP LINKS

Every deep-linkable feature must define:

cold start
warm start
authenticated user
unauthenticated user
wrong role
missing resource
expired resource
offline
invalid route

Expo Router supports deep linking and universal/app links; implement routing so external links land on the correct state rather than merely opening the home screen.

---

16. AUTHENTICATION FLOW

Design complete states:

signed out
signing in
validation error
authentication error
verification required
session restoring
session expired
refreshing session
account locked/restricted
network unavailable
success
signing out

Never leave users staring at an unexplained spinner.

---

17. AUTHENTICATED APP STARTUP

Startup should determine:

1. Is the app initialized?
2. Is local session data available?
3. Is the session valid?
4. Is refresh required?
5. What role does the user have?
6. Is required profile data available?
7. Is the app online?
8. Does the user have pending deep-link/navigation intent?

Then route accordingly.

Avoid:

Splash
→ arbitrary delay
→ home
→ fetch user
→ redirect

Prefer deterministic startup logic.

---

18. SPLASH SCREEN

Do not use a fake long splash screen.

Use the native splash only for real initialization work.

Do not intentionally delay the user just to show branding.

---

19. ONBOARDING

Onboarding should exist only when it helps users understand or configure the product.

Avoid:

- five unnecessary slides
- decorative animations
- generic feature claims
- forced education before value

Prefer:

context
→ value
→ necessary setup
→ permission when needed
→ useful first action

---

20. PERMISSIONS

Never request every permission at startup.

Ask when the feature needs it.

Explain why permission is useful before the system prompt when appropriate.

Examples:

- notifications
- camera
- photos
- location
- microphone
- contacts
- Bluetooth

Handle:

granted
denied
restricted
limited
not determined
revoked

---

21. NOTIFICATIONS

Design the entire notification lifecycle:

permission
token registration
notification received
foreground
background
cold start
deep-link navigation
duplicate notification
expired notification
user disabled notifications

A notification should take the user to the relevant context.

Do not simply open the home screen.

---

22. STATE MANAGEMENT

Separate:

server state
local UI state
persistent state
session/auth state
navigation state
form state
temporary interaction state

Do not put everything into one global store.

Use the existing project architecture where possible.

---

23. SERVER STATE

Server data must handle:

- loading
- cached
- stale
- refreshing
- success
- empty
- partial
- error
- retry
- optimistic update
- rollback
- offline

Do not equate "data is not currently present" with "data is empty."

---

24. OFFLINE UX

Mobile networks are unreliable.

Design:

online
offline
slow
reconnecting
request timeout
server unavailable
stale data
queued action
retry
conflict

Do not simply show:

«Network Error»

Provide an understandable recovery path.

---

25. OFFLINE-FIRST WHERE APPROPRIATE

For features where offline operation makes sense:

local action
→ local confirmation
→ queue
→ synchronize
→ resolve conflict

Never implement offline behavior for sensitive operations without understanding consistency and security requirements.

---

26. FORMS

Mobile forms must account for:

- keyboard
- focus
- scroll-to-input
- keyboard dismissal
- validation
- secure fields
- autofill
- copy/paste
- password managers
- numeric keyboards
- date pickers
- selection
- long content

Never let the keyboard cover the active field.

---

27. KEYBOARD BEHAVIOR

Every form should be tested with:

- keyboard opening
- keyboard closing
- focus changes
- next-field navigation
- multiline fields
- submit action
- landscape where relevant
- small devices

Use appropriate keyboard avoidance behavior.

Do not assume iOS and Android behave identically.

---

28. TOUCH TARGETS

Interactive elements must be comfortably tappable.

Do not make critical controls tiny merely because the icon is small.

Keep visual icon size separate from touch target size.

A 20px icon can live inside a much larger accessible touch area.

---

29. GESTURES

Use gestures when they are discoverable and meaningful:

- swipe back
- pull to refresh
- swipe actions
- drag
- pinch
- long press

Never make essential functionality available only through a hidden gesture.

Provide an accessible alternative.

---

30. HAPTICS

Use haptics sparingly.

Good uses:

- meaningful success
- selection
- toggle
- confirmation
- destructive action
- important completion

Bad uses:

- every tap
- every scroll
- every animation
- decorative vibration

Haptics should reinforce interaction, not become noise.

---

31. MOBILE MOTION

Motion should feel native and intentional.

Prioritize:

- continuity
- spatial relationships
- feedback
- hierarchy
- orientation

Do not animate everything.

Prefer short, responsive transitions.

Do not make navigation feel slower just because animation looks impressive.

---

32. PLATFORM DIFFERENCES

Do not force iOS and Android to behave identically when users expect platform-native behavior.

Allow appropriate differences in:

- navigation
- menus
- sheets
- back behavior
- keyboard
- permissions
- system dialogs
- typography
- shadows/elevation
- haptics
- system bars

Shared design language does NOT mean identical implementation.

---

33. iOS EXPERIENCE

Respect:

- navigation hierarchy
- swipe-back expectations
- safe areas
- system typography conventions
- sheets
- native-feeling controls
- Dynamic Type where practical
- accessibility settings
- system permission behavior

Do not turn iOS into an Android-looking app.

---

34. ANDROID EXPERIENCE

Respect:

- system back
- edge-to-edge behavior
- Material conventions where appropriate
- Android permission behavior
- keyboard/IME behavior
- ripple/press feedback when appropriate
- system bars
- varied device sizes

Do not turn Android into a pixel-perfect iOS imitation.

---

35. SAFE AREAS

Always account for:

- status bar
- notch
- Dynamic Island
- home indicator
- Android navigation area
- keyboard
- bottom sheets
- tab bars
- floating controls

Never place important content beneath system UI.

---

36. EDGE-TO-EDGE

Treat modern Android edge-to-edge behavior deliberately.

Do not assume:

paddingTop = 0

is safe.

Use proper inset handling.

Test on actual Android configurations.

---

37. DESIGN SYSTEM

Use the existing "UI_UX.md" design system.

Mobile should preserve:

- color language
- typography
- spacing language
- icon family
- component identity
- brand character

But mobile may adapt:

- spacing
- density
- navigation
- component composition
- interaction

Do not blindly reuse desktop dimensions.

---

38. MOBILE SPACING

Use a deliberate mobile spacing scale.

Prefer consistency around:

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

Use optical judgment.

Do not create arbitrary values everywhere.

---

39. MOBILE TYPOGRAPHY

Typography must remain readable at real phone sizes.

Test:

- small devices
- large devices
- Dynamic Type/accessibility text scaling
- long translations
- long names
- large numbers
- dark mode

Never truncate critical information unnecessarily.

---

40. MOBILE CARDS

Do not convert every desktop section into a card.

Mobile cards should represent meaningful objects or groups.

Prefer:

- whitespace
- separators
- hierarchy
- lists

when cards add no value.

---

41. LISTS

Lists are a fundamental mobile pattern.

Optimize for:

- scanability
- touchability
- stable row heights
- meaningful metadata
- loading states
- empty states
- swipe actions where appropriate

Avoid overly dense list rows.

---

42. LONG LIST PERFORMANCE

For large datasets:

- use virtualization where needed
- avoid rendering thousands of unnecessary views
- memoize expensive rows carefully
- avoid expensive inline calculations
- paginate/infinite-load appropriately
- preserve scroll position when appropriate

Do not optimize prematurely, but do not ignore large datasets.

---

43. PULL TO REFRESH

Use pull-to-refresh when users reasonably expect it.

Do not add it to every screen.

Refreshing should:

- provide immediate feedback
- preserve useful content
- handle failure
- not reset scroll position unnecessarily

---

44. SEARCH

Mobile search should handle:

idle
focused
typing
suggestions
loading
results
no results
error

Consider:

- recent searches
- filters
- keyboard submit
- clear button
- debounce
- pagination

only where useful.

---

45. BOTTOM SHEETS

Use bottom sheets for contextual actions and short workflows where they improve mobile ergonomics.

Ensure:

- drag behavior is understandable
- dismissal is reliable
- keyboard behavior works
- safe areas are handled
- focus is managed
- destructive actions are clear

Do not put complex multi-step workflows into tiny sheets merely because they look modern.

---

46. MODALS

Use a modal only when interruption is justified.

For mobile, consider:

- full-screen modal
- bottom sheet
- dedicated route

based on complexity.

Do not create modal chains.

---

47. TOASTS / SNACKBARS

Use temporary feedback for non-critical events.

Do not put essential information only in transient UI.

On mobile, ensure feedback does not:

- cover navigation
- block touch targets
- conflict with keyboard
- disappear before it can be read

---

48. LOADING

Choose the correct loading model:

initial screen:
skeleton

short action:
spinner/disabled state

long operation:
progress

streaming:
incremental content

background operation:
status indicator

Never show a spinner indefinitely without explanation.

---

49. EMPTY STATES

Every important empty state needs:

what is empty
why it is empty when useful
what the user can do next

Examples:

- no projects
- no messages
- no notifications
- no search results
- no transactions
- no security findings

Do not use the same empty illustration everywhere.

---

50. ERROR STATES

Errors must be actionable.

Include:

- clear explanation
- retry
- alternative action
- relevant technical details for admin/developer contexts

Do not expose stack traces to normal users.

---

51. SUCCESS

Use restrained confirmation.

Examples:

- subtle check
- status update
- inline confirmation
- snackbar
- navigation to completed state

Do not make every successful action trigger a full-screen celebration.

---

52. DESTRUCTIVE ACTIONS

For deletion or irreversible operations:

clear action
→ warning
→ confirmation when appropriate
→ server enforcement
→ completion
→ undo where safely possible

Avoid ambiguous labels such as:

«Continue»

Prefer:

«Delete account»

---

53. DATA PERSISTENCE

Determine which data survives:

- screen navigation
- app backgrounding
- app restart
- logout
- session expiration
- device restart
- version update

Do not persist sensitive information casually.

---

54. SECURE STORAGE

Sensitive credentials/tokens must use appropriate secure storage mechanisms.

Do not store secrets in:

- plain AsyncStorage
- arbitrary local files
- logs
- navigation params
- analytics events

Use the project's approved secure storage architecture.

---

55. NAVIGATION PARAMETERS

Do not pass sensitive data through URLs or navigation parameters.

Prefer identifiers and retrieve authorized data from the backend.

Navigation parameters should be treated as untrusted input.

---

56. DEEP-LINK SECURITY

A deep link must never bypass:

- authentication
- authorization
- ownership
- role checks

A valid route does not imply a valid permission.

---

57. API INTEGRATION

Every API interaction must have:

request
loading
success
empty
error
timeout
retry
cancellation
stale state
authentication failure
authorization failure

Do not implement only the success response.

---

58. REQUEST CANCELLATION

Avoid stale responses overwriting newer state.

Handle:

- screen unmount
- changing search queries
- rapidly changing filters
- duplicate submissions
- navigation away
- request timeout

Use appropriate cancellation/abort mechanisms.

---

59. DOUBLE SUBMISSION

Prevent accidental duplicate operations.

Examples:

submit
→ loading
→ disable duplicate action
→ success/error

Do not permanently disable controls after an error.

---

60. OPTIMISTIC UI

Use optimistic updates only when:

- failure is recoverable
- rollback is well-defined
- the operation is not dangerously irreversible
- the backend semantics are understood

Do not use optimistic UI for security-sensitive operations merely to make the app feel faster.

---

61. CACHING

Cache according to data semantics.

Consider:

- freshness
- invalidation
- stale data
- user identity
- permissions
- offline behavior

Never let cached sensitive data leak between accounts.

Logout must invalidate appropriate user-scoped state.

---

62. REAL-TIME FEATURES

For real-time functionality:

- connection state
- reconnecting
- stale connection
- duplicate events
- ordering
- optimistic updates
- conflict
- offline recovery

must be designed.

Never assume the network is perfect.

---

63. MEDIA

For images/video/audio:

- loading
- placeholder
- failed media
- retry
- permissions
- upload progress
- compression
- cancellation
- background behavior
- storage limits

must be handled.

Never load full-resolution media unnecessarily.

---

64. IMAGE PERFORMANCE

Use:

- correct dimensions
- appropriate caching
- thumbnails
- progressive loading where useful
- compression
- lazy loading
- placeholders

Avoid enormous remote images inside small list rows.

---

65. ACCESSIBILITY

Every mobile screen must consider:

- screen readers
- VoiceOver
- TalkBack
- Dynamic Type/text scaling
- accessible labels
- accessible hints
- roles
- focus order
- reduced motion
- contrast
- touch target size

Do not use visual appearance as the only source of meaning.

---

66. ACCESSIBLE ICON BUTTONS

Icon-only buttons require meaningful accessible labels.

Bad:

button with only trash icon

Good:

accessible label:
Delete project

---

67. ACCESSIBLE STATE

Communicate states semantically:

selected
disabled
expanded
collapsed
loading
checked
unavailable
error

Do not communicate state only through color.

---

68. PERFORMANCE TARGET

The app should feel consistently responsive.

React Native explicitly treats smooth frame performance as a core goal and provides performance guidance for diagnosing frame/rendering problems.

Target:

- smooth scrolling
- responsive touch
- minimal JS-thread blocking
- minimal unnecessary renders
- stable layouts
- fast navigation
- fast initial usable state

Measure instead of assuming.

---

69. RENDERING PERFORMANCE

Watch for:

- unnecessary re-renders
- large lists
- expensive calculations
- huge component trees
- excessive context updates
- unnecessary state
- oversized images
- heavy animation
- JS-thread blocking
- unnecessary network requests

Do not blindly memoize everything.

Optimize based on evidence.

---

70. ANIMATION PERFORMANCE

Prefer:

- native/optimized animation paths
- transform
- opacity
- layout-aware animation only when justified

Avoid expensive animations on large lists.

Never allow animation to interfere with scrolling.

---

71. STARTUP PERFORMANCE

Measure:

cold start
warm start
authenticated startup
unauthenticated startup
deep-link startup
slow-network startup

Do not load every feature during startup.

Initialize only what is necessary.

---

72. MEMORY

Watch for:

- large images
- media
- retained screens
- listeners
- subscriptions
- timers
- navigation references
- cached datasets

Clean up:

- listeners
- intervals
- subscriptions
- requests
- media resources

when appropriate.

---

73. BATTERY

Avoid unnecessary:

- polling
- GPS updates
- Bluetooth scans
- background tasks
- animations
- network requests

Background execution must have a real product reason.

---

74. APP LIFECYCLE

Handle:

foreground
background
inactive
app resume
network change
session expiration

Do not assume the app remains mounted and active.

Refresh or invalidate state appropriately when returning from background.

---

75. APP STATE + SECURITY

When the app backgrounds:

consider whether sensitive screens should:

- obscure content
- lock
- require re-authentication
- pause operations

depending on product sensitivity and requirements.

Do not implement privacy theater without a product reason.

---

76. USER ROLE MODEL

Define role/permission behavior centrally.

Example:

authenticated
user
moderator
admin
super-admin

Exact roles depend on the product.

UI should derive available actions from the authorized capability model.

Backend remains authoritative.

---

77. ADMIN NAVIGATION

Admin navigation should prioritize operational workflows.

Possible sections:

Overview
Users
Content
Reports
Analytics
Operations
Logs
Settings
System

Only include sections actually required by the product.

---

78. ADMIN DATA TABLES ON MOBILE

Do not squeeze desktop tables into 375px screens.

Use:

- priority columns
- stacked rows
- expandable details
- horizontal scrolling when genuinely appropriate
- filters
- detail screens
- bottom sheets

Choose the representation based on task.

---

79. ADMIN BULK ACTIONS

Bulk operations need:

selection
selected count
available actions
permission validation
confirmation
progress
partial failure
success
rollback/undo where possible

Never silently partially process a bulk operation.

---

80. ADMIN AUDITABILITY

For important admin actions, preserve appropriate audit information:

- who
- what
- when
- target
- result
- relevant metadata

Do not expose unnecessary sensitive information.

---

81. ANALYTICS

Analytics should measure useful product behavior.

Consider:

- onboarding completion
- feature usage
- conversion
- retention
- errors
- performance
- failed workflows

Do not collect sensitive data unnecessarily.

Do not log secrets or private content.

---

82. OBSERVABILITY

Production apps should have appropriate:

- crash reporting
- error reporting
- performance monitoring
- structured logs
- analytics

Never expose credentials, tokens, private user data or sensitive security information in logs.

---

83. NOTIFICATION UX

Notifications must respect:

- user preferences
- frequency
- relevance
- quiet periods where applicable
- deep linking
- permission state

Do not spam.

---

84. SEARCH + FILTER STATE

When users navigate away and return, decide intentionally whether to preserve:

- search query
- filters
- sort
- selected tab
- scroll position

Preserve state when it improves continuity.

Reset when the workflow requires a clean context.

---

85. SCROLL POSITION

Do not unexpectedly jump to the top after:

- mutation
- refresh
- navigation
- state update

unless the UX intentionally requires it.

---

86. CONFIRMATION DIALOGS

Do not confirm every action.

Confirmation is appropriate when:

- irreversible
- destructive
- expensive
- security-sensitive
- difficult to undo

For safe reversible actions, immediate execution with undo may be better.

---

87. APP UPDATES

Plan for:

- app version changes
- backend compatibility
- stale cached data
- migrations
- forced update when genuinely required
- optional update messaging

Never assume all installed clients are running the latest app version.

---

88. NETWORK VERSION COMPATIBILITY

Backend APIs may receive requests from older app versions.

Do not break old clients casually.

Use:

- backward-compatible APIs
- versioning where required
- feature flags
- graceful fallback

---

89. FEATURE FLAGS

Use feature flags when appropriate for:

- staged rollout
- testing
- admin-only features
- experiments
- emergency disablement

Do not hardcode temporary feature states throughout the UI.

---

90. ERROR BOUNDARIES

Unexpected rendering failures should have a recoverable experience.

Provide:

- understandable error
- retry
- navigation recovery
- diagnostics for developers/admins where appropriate

Do not let one broken feature destroy the entire application.

---

91. TEST MATRIX

Test both:

USER

- onboarding
- authentication
- navigation
- core feature
- forms
- search
- notifications
- deep links
- offline
- errors
- logout
- account state

ADMIN

- authentication
- authorization
- dashboard
- user management
- content management
- filtering
- bulk actions
- destructive actions
- audit flows
- system states
- restricted permissions

---

92. DEVICE MATRIX

At minimum test representative:

iOS

- small phone
- standard phone
- large phone
- recent iOS
- older supported iOS

Android

- small device
- standard device
- large device
- different aspect ratios
- different Android versions
- navigation mode variations
- keyboard variations

Do not test only on one flagship device.

---

93. REAL DEVICE TESTING

Simulator/emulator testing is necessary but insufficient.

Test real devices for:

- performance
- keyboard
- gestures
- permissions
- camera
- notifications
- background behavior
- memory
- network transitions
- haptics
- system UI

---

94. VISUAL QA

Every major screen should be inspected at:

small phone
normal phone
large phone
tablet if supported
iOS
Android
light
dark
large text
offline
loading
empty
error
success

Compare against the intended design system.

---

95. FUNCTIONAL QA

For every feature verify:

UI
→ interaction
→ validation
→ state
→ API
→ backend
→ database
→ response
→ cache
→ UI

A screen that looks correct but does not complete the actual workflow is not complete.

---

96. AI-SLOP MOBILE CHECK

Before shipping, inspect for:

- generic rounded cards everywhere
- excessive gradients
- excessive glassmorphism
- giant headings
- random illustrations
- generic purple/blue AI aesthetic
- fake dashboard metrics
- meaningless animations
- excessive badges
- random icons
- inconsistent spacing
- web-like navigation
- tiny controls
- cramped forms
- unnecessary bottom sheets
- modal overload
- generic empty states
- spinner everywhere
- fake loading animations
- desktop UI squeezed into mobile
- iOS and Android forced into identical behavior

Remove anything that exists only because AI commonly generates it.

---

97. MOBILE WOW FACTOR

The “wow” should come from:

- excellent hierarchy
- smooth transitions
- precise typography
- beautiful spacing
- tactile interactions
- thoughtful empty states
- meaningful motion
- fast response
- excellent media handling
- native-feeling navigation
- subtle details
- strong visual identity

NOT from:

- excessive gradients
- random 3D
- excessive blur
- neon colors
- animation everywhere
- oversized cards
- visual noise

---

98. MICRO-DETAILS

Polish:

- icon alignment
- text baseline
- divider placement
- press states
- keyboard transitions
- safe-area spacing
- loading transitions
- scroll behavior
- status colors
- disabled opacity
- corner radii
- shadows/elevation
- image cropping
- text truncation
- number formatting
- date formatting

These details create perceived quality.

---

99. CONTENT QUALITY

Never use placeholder copy in production UI.

Use realistic:

- names
- numbers
- dates
- statuses
- errors
- descriptions
- long text
- empty states

Test the UI with ugly/realistic data, not only ideal data.

---

100. LOCALIZATION READINESS

Even if only one language currently exists, avoid layouts that depend on fixed text widths.

Prepare for:

- longer text
- RTL where relevant
- translated dates
- translated numbers
- pluralization

Do not concatenate user-facing strings in ways that make translation difficult.

---

101. FORMATTING

Centralize:

- currency
- dates
- time
- percentages
- numbers
- file sizes
- durations

Do not duplicate formatting logic throughout screens.

---

102. SECURITY UX

Security should be understandable.

For sensitive actions:

- explain risk
- provide confirmation
- require appropriate authentication
- clearly show current account
- avoid accidental account switching
- protect secrets
- avoid leaking sensitive information through notifications/screenshots/logs

---

103. PRIVACY UX

Give users understandable control over:

- notifications
- account data
- permissions
- connected services
- privacy settings
- sessions/devices where relevant

Do not hide important privacy controls.

---

104. BUILD AND RELEASE

Use Expo's current supported build/deployment workflow for the installed SDK.

Verify:

- app identifiers
- bundle identifiers
- Android package
- signing
- environment variables
- production API
- permissions
- notification configuration
- deep links
- universal/app links
- icons
- splash
- versioning
- update strategy

Do not copy configuration from another project without understanding it.

---

105. EAS / NATIVE CONFIGURATION

When using EAS:

- inspect "eas.json"
- inspect app config
- verify build profiles
- verify environment variables
- verify native plugins
- verify credentials
- verify production configuration

Do not change native configuration casually.

---

106. DEPENDENCY RULE

Before adding a package:

1. Search the existing project.
2. Check whether Expo already provides the capability.
3. Check official Expo documentation.
4. Check compatibility with installed SDK.
5. Check maintenance.
6. Check bundle/runtime impact.
7. Check permissions.
8. Check native configuration requirements.
9. Check license/security.
10. Only then install.

Never install a package merely because an AI answer mentions it.

---

107. PLATFORM-SPECIFIC CODE

Use:

*.ios.*
*.android.*
Platform.select()

when platform behavior genuinely differs.

Do not duplicate entire screens unnecessarily.

Keep shared product logic shared.

---

108. SHARED BUSINESS LOGIC

Keep business logic separate from presentation.

Prefer:

UI
↓
hooks/view-model logic
↓
service/API layer
↓
domain logic
↓
backend

Do not put:

- API calls
- business rules
- authorization assumptions
- complex data transformations

directly inside giant screen components.

---

109. COMPONENT ARCHITECTURE

Prefer:

primitives
→ reusable components
→ domain components
→ screen compositions
→ navigation

Examples:

Button
Input
Card
ListRow

SecurityFindingCard
WorkoutEntry
TransactionRow
MessageBubble

DashboardScreen
FindingDetailsScreen
WorkoutScreen

Do not create a giant universal component.

---

110. SCREEN ARCHITECTURE

A screen should primarily compose:

- data
- domain components
- layout
- navigation
- user interactions

Complex business logic should live elsewhere.

---

111. STATE MATRIX

Every major screen must consider:

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
reconnecting
rate limited
conflict
expired
server error
maintenance

Not every screen requires every state, but every relevant state must be intentional.

---

112. FEATURE COMPLETION RULE

A feature is NOT complete because:

- the screen renders
- navigation works
- the button exists
- the API request exists
- the happy path works

It is complete when:

UX
+
UI
+
navigation
+
state
+
validation
+
API
+
backend integration
+
error handling
+
security
+
accessibility
+
responsive behavior
+
performance
+
testing

work together.

---

113. IMPLEMENTATION WORKFLOW

For every feature:

Phase 1

Inspect.

Phase 2

Understand.

Phase 3

Map the complete user/admin flow.

Phase 4

Identify affected backend/data logic.

Phase 5

Design mobile interaction.

Phase 6

Reuse existing components.

Phase 7

Implement smallest coherent change.

Phase 8

Integrate all real functionality.

Phase 9

Test all states.

Phase 10

Visual QA.

Phase 11

Performance QA.

Phase 12

Security/accessibility QA.

Phase 13

Fix.

Phase 14

Regression test.

Phase 15

Only then declare complete.

---

114. BEFORE EVERY CODE CHANGE

Ask:

1. What existing behavior does this touch?
2. What user role does it affect?
3. What admin role does it affect?
4. What screens depend on it?
5. What API/data changes are involved?
6. What states can occur?
7. What platform differences exist?
8. What accessibility implications exist?
9. What performance implications exist?
10. What tests must change?

---

115. AFTER EVERY SIGNIFICANT CHANGE

Run appropriate:

- TypeScript check
- lint
- unit tests
- integration tests
- E2E tests
- accessibility checks
- platform tests
- visual inspection
- performance inspection

Do not assume compilation means correctness.

---

116. FINAL MOBILE REVIEW

Before release, ask:

Product

Does the app help users accomplish the intended task?

UX

Can a first-time user understand it?

Navigation

Can users move naturally?

UI

Does it feel coherent and distinctive?

Native behavior

Does it feel appropriate on iOS and Android?

Performance

Does it feel fast and smooth?

Accessibility

Can VoiceOver/TalkBack users operate it?

Reliability

Does it survive bad networks and failures?

Security

Are sensitive operations protected?

Admin

Can administrators perform operational tasks efficiently?

Data

Is state correct after navigation, restart, logout and reconnect?

Quality

Does it feel like a real shipped product rather than an AI prototype?

---

117. FINAL NON-NEGOTIABLE RULE

Do not optimize for:

«“The code looks complete.”»

Optimize for:

«“A real user can successfully complete the intended task on a real iPhone or Android device under realistic conditions.”»

The application must be:

beautiful
+
usable
+
native-feeling
+
fast
+
accessible
+
reliable
+
secure
+
fully functional
+
maintainable

The user should never think:

«“This is an AI-generated app.”»

They should think:

«“This feels like a professionally designed mobile product.”»