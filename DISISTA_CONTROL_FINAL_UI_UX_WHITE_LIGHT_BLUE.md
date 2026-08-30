# DISISTA CONTROL — LIGHT PROFESSIONAL UI/UX DESIGN SYSTEM
## White + Light Blue Production Theme
### Final UI/UX Regeneration Prompt — Single Source of Truth

---

# 0. PURPOSE

Regenerate the entire DISISTA CONTROL interface into a simple, elegant, professional production UI designed for real workplace use.

The existing product structure, role-based navigation, core workflows, functionality, and information architecture should be preserved. This is a visual and UX refinement, not a feature rewrite.

The new visual direction is:

**70% white / neutral surfaces + 30% light-blue visual language**

The interface must feel:
- Professional
- Clean
- Calm
- Modern
- Trustworthy
- Easy to scan
- Comfortable for long work sessions
- Accessible and production-ready

Avoid a cyberpunk, gaming, neon, or overly decorative command-center appearance.

---

# 1. DESIGN DIRECTION

## 1.1 Core visual ratio

Use the approximate visual ratio:

- **70% White / near-white:** page backgrounds, cards, tables, forms, primary content
- **30% Light blue:** navigation emphasis, selected states, section accents, information surfaces, controls, subtle highlights

The 70:30 ratio is a visual guideline, not a requirement to force exact percentages on every screen.

Blue must communicate interaction, selection, information, or product identity. Do not cover large areas in saturated blue.

## 1.2 Visual personality

The product should look like a serious professional operations platform rather than a futuristic dashboard.

Prioritize:
1. Content clarity
2. Information hierarchy
3. Consistent spacing
4. Clear actions
5. Accessibility
6. Low visual fatigue
7. Fast scanning
8. Consistent status communication

---

# 2. THEME TOKENS

Use these tokens globally. Do not create arbitrary colors on individual screens.

```css
:root {
  /* =========================
     BASE / 70% WHITE SYSTEM
     ========================= */

  --bg-app: #F7FAFC;
  --surface: #FFFFFF;
  --surface-soft: #F8FBFF;
  --surface-muted: #F2F6F9;

  --border: #E2EAF2;
  --border-strong: #D2DEE8;

  /* =========================
     LIGHT BLUE / 30% SYSTEM
     ========================= */

  --blue-50: #EFF8FF;
  --blue-100: #DCEFFF;
  --blue-200: #B9DEFF;
  --blue-300: #8CC9F5;
  --blue-500: #4EA8E8;
  --blue-600: #318ED0;
  --blue-700: #2474AE;
  --blue-800: #1E5F8F;

  /* =========================
     TEXT
     ========================= */

  --text-primary: #172B3A;
  --text-secondary: #5F7180;
  --text-muted: #8A9AA8;
  --text-on-blue: #FFFFFF;

  /* =========================
     STATUS
     ========================= */

  --status-safe: #20A66A;
  --status-safe-bg: #E8F8F0;

  --status-caution: #D99116;
  --status-caution-bg: #FFF4DB;

  --status-critical: #D94B55;
  --status-critical-bg: #FDEBED;

  --status-info: #318ED0;
  --status-info-bg: #EFF8FF;

  /* =========================
     SHAPE
     ========================= */

  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  /* =========================
     SPACING
     ========================= */

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  /* =========================
     TYPOGRAPHY
     ========================= */

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 19px;
  --text-xl: 23px;
  --text-2xl: 28px;

  --font-sans: 'Inter', 'IBM Plex Sans', system-ui, sans-serif;

  /* =========================
     ELEVATION
     ========================= */

  --shadow-card: 0 2px 10px rgba(30, 70, 100, 0.07);
  --shadow-hover: 0 6px 20px rgba(30, 70, 100, 0.10);
  --focus-ring: 0 0 0 3px rgba(78, 168, 232, 0.22);

  /* =========================
     MOTION
     ========================= */

  --motion-fast: 120ms;
  --motion-base: 200ms;
  --ease: cubic-bezier(.2,.8,.2,1);
}
```

---

# 3. COLOR RULES

## 3.1 White is the default

White and near-white surfaces should dominate the interface.

Use:
- `--bg-app` for the application background
- `--surface` for cards and content containers
- `--surface-soft` for subtle grouped areas
- `--surface-muted` for secondary areas

Do not use dark page backgrounds.

## 3.2 Blue is the product accent

Use blue for:
- Primary buttons
- Active navigation
- Selected tabs
- Focus states
- Links
- Important UI accents
- Information banners
- Progress/trend visualization where appropriate

Do not use blue simply as decoration.

## 3.3 No violet theme

Remove the previous violet/indigo visual system completely.

Do not use:
- Violet primary buttons
- Purple navigation
- Purple glow
- Indigo page backgrounds
- Neon accents

## 3.4 Status colors remain semantic

Every status throughout the application must use the same status system:

| Meaning | Color | Background |
|---|---|---|
| Safe / confirmed / healthy | `--status-safe` | `--status-safe-bg` |
| Caution / warning / rerouted | `--status-caution` | `--status-caution-bg` |
| Critical / blocked / isolated | `--status-critical` | `--status-critical-bg` |
| Informational | `--status-info` | `--status-info-bg` |

Never introduce a fourth severity color.

Never use red, amber, or green merely for decoration.

---

# 4. TYPOGRAPHY

Use `Inter` or `IBM Plex Sans`.

Typography should be clean and highly readable.

## Screen title
- 28px
- Weight 700
- `--text-primary`
- One primary screen title per page

## Section eyebrow
- 12px
- Weight 600
- Uppercase
- Letter spacing around 0.08em
- `--text-muted`
- Small and quiet

Never render a giant decorative duplicate of a section title.

## KPI number
- 28px
- Weight 700
- Tabular numerals
- `--text-primary`

## Body text
- 14px
- Weight 400
- `--text-secondary`

## List/feed title
- 16px
- Weight 600
- `--text-primary`

Titles must always have strong contrast against their surface.

---

# 5. LAYOUT SYSTEM

## 5.1 Page structure

Every major screen should follow a consistent structure:

```text
Application Navigation
        ↓
Page Header
        ↓
Optional Filters / Actions
        ↓
KPI / Summary Row
        ↓
Primary Content
        ↓
Secondary Content
```

Do not overcrowd the first viewport.

## 5.2 Content width

Use a responsive content container.

Recommended:
- Maximum width: approximately 1440px
- Horizontal padding: 24–32px on desktop
- 16px on smaller screens

## 5.3 Spacing

Use the spacing tokens consistently.

Prefer generous whitespace over borders and decorative elements.

---

# 6. NAVIGATION

## Desktop

Use a clean white sidebar or top navigation system.

Recommended visual language:

- White background
- Thin neutral border
- Dark primary text
- Blue icon/indicator for active navigation
- Light-blue active background
- Rounded active navigation item
- Clear grouping of navigation sections

Example:

```text
┌──────────────────────────┐
│ DISISTA CONTROL          │
│                          │
│  ◉ Dashboard             │
│  ◉ Live Map              │
│  ◉ Convoy Dispatch       │
│  ◉ Shelter Board         │
│  ◉ Hazard Log            │
│  ◉ Supply Swap           │
│  ◉ Alerts                │
│                          │
│  ─────────────────────   │
│  ⚙ Settings              │
└──────────────────────────┘
```

Active item:

```css
background: var(--blue-50);
color: var(--blue-700);
```

Avoid oversized icons, excessive shadows, and decorative gradients.

---

# 7. HEADER

The header should be minimal.

Include:
- Page title or contextual title
- Current role/user information
- Field Mode state when applicable
- Important actions
- Notification access where required

Avoid filling the header with unnecessary controls.

---

# 8. CARDS

Cards should be:

- White
- Thin neutral border
- 12–16px radius
- Very subtle shadow
- Comfortable internal padding

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}
```

On hover:
- Slight elevation
- No large transform
- No colored glow

```css
.card:hover {
  box-shadow: var(--shadow-hover);
}
```

Do not use glassmorphism.

Do not use heavy shadows.

---

# 9. KPI / STAT CARDS

KPI cards remain a major part of the dashboard rhythm.

Use:
- White background
- Large dark number
- Small eyebrow label
- Short supporting caption
- Small light-blue accent
- Optional thin left border in `--blue-500`

Example:

```text
┌────────────────────────────┐
│ ACTIVE CONVOYS             │
│                            │
│ 24                         │
│ 18 currently on route      │
└────────────────────────────┘
```

Rules:
- KPI number is the visual focus.
- Do not put excessive charts inside KPI cards.
- Do not use different colors for every KPI.
- Blue is the primary visual accent.

---

# 10. BUTTONS

## Primary

Blue filled button:

```css
background: var(--blue-600);
color: white;
```

Hover:

```css
background: var(--blue-700);
```

Use for the single most important action on a screen.

Examples:
- Dispatch New Convoy
- Authenticate & Enter Portal
- Save Changes

## Secondary

White/transparent button with neutral or blue border.

Use for:
- View
- Reset Filters
- Cancel
- Secondary navigation

## Destructive

Use red only for genuinely destructive or critical actions.

Never make routine actions red.

## Button UX

Buttons must:
- Have clear labels
- Have obvious hierarchy
- Have sufficient click/touch area
- Show hover and focus states
- Never rely on color alone to communicate meaning

---

# 11. PILLS & BADGES

Use rounded pills with content-based width.

Never use fixed-width pills if labels can vary.

## Safe

Light green background + green text.

## Caution

Light amber background + amber text.

## Critical

Light red background + red text.

## Active

Light blue background + blue text, or blue fill + white text when strong emphasis is required.

## Passive metadata

Neutral background and secondary text.

Examples:
- Synced
- Cold-Chain
- Field Mode ON

Do not use severity colors for passive metadata.

---

# 12. FORMS

Forms should be clean and compact.

Input style:

```text
Label
┌──────────────────────────────┐
│ Enter operator ID            │
└──────────────────────────────┘
Helper/error text
```

Rules:
- White input background
- Neutral border
- Clear label
- Blue focus ring
- Clear error message
- Adequate spacing between fields
- Do not use placeholder text as the only label

Focus:

```css
border-color: var(--blue-500);
box-shadow: var(--focus-ring);
```

---

# 13. TABLES

Tables should use a white professional data-table style.

Structure:

```text
┌─────────────────────────────────────────────┐
│ TABLE HEADER — very light blue background   │
├─────────────────────────────────────────────┤
│ Data row                                    │
├─────────────────────────────────────────────┤
│ Data row                                    │
├─────────────────────────────────────────────┤
│ Data row                                    │
└─────────────────────────────────────────────┘
```

Rules:
- White table body
- Light-blue header
- Thin neutral row separators
- Comfortable row height
- Subtle blue hover
- Sticky header where useful
- Status cells use badges
- Risk values use progress bars or semantic badges
- Do not use huge blocks of color

---

# 14. DATA BARS

Inventory, capacity, risk index, and progress values must render visually as actual bars.

Never show a raw number where a progress/level bar is expected.

Example:

```html
<div class="bar-track">
  <div class="bar-fill" style="width: 62%;"></div>
</div>

<span class="bar-label">12,000 / 19,300 units</span>
```

Recommended styling:

```css
.bar-track {
  height: 8px;
  background: var(--surface-muted);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--blue-500);
}
```

The fill may use safe/caution/critical colors when the value represents a semantic threshold.

---

# 15. CHARTS & SPARKLINES

If historical data exists:
- Render a real chart.
- Keep it simple.
- Use blue as the primary chart color.
- Use neutral gridlines.
- Avoid excessive gradients.

If historical data does not exist:

```text
Not enough history yet
```

Use an honest empty state.

Never show:
- Black empty boxes
- Unexplained rectangles
- Fake chart lines
- Placeholder graphics that look like real data

---

# 16. INFORMATION BANNERS

Information-only notices use light blue.

Structure:

```text
┌─────────────────────────────────────────────┐
│ ●  Sync queue contains 4 pending updates.  │
└─────────────────────────────────────────────┘
```

Use:
- `--status-info`
- `--status-info-bg`
- Small icon
- High-contrast text
- Left accent border

Do not use purple for information banners.

Do not use warning colors unless the message is actually a warning.

---

# 17. ALERTS

Alerts must have strong hierarchy.

### Informational
Blue

### Warning
Amber

### Critical
Red

Critical alerts should visually outrank routine information.

Use clear actions:
- Acknowledge
- Escalate
- View Details

Routine actions can be primary.

Consequential actions should generally be secondary/destructive-styled and require deliberate intent.

---

# 18. LOGIN SCREEN

Keep the existing role-based authentication concept.

Use:

- Very light blue/near-white full-page background
- Single centered white authentication card
- Subtle border/shadow
- Blue primary CTA
- Clean role selector
- Operator ID field
- Passcode field

Preserve the existing quick-demo reveal interaction.

The interaction should work as:

```text
Primary credential card
        ↓
Curved/light-blue tab at bottom
"Quick Demo — One-Click Login"
        ↓
Tap / click
        ↓
Role quick-select options reveal
        ↓
Control Room
District Admin
Warehouse Manager
Field Driver
```

The demo options should remain secondary to real authentication.

Use a smooth 200ms transition.

Do not make the login page visually heavy.

---

# 19. LIVE MAP

The real map imagery remains visible.

Floating controls should become clean white/light-blue panels:

```text
┌──────────────────────┐
│ Network Layers       │
│                      │
│ ☑ Convoys            │
│ ☑ Shelters           │
│ ☐ Hazards            │
└──────────────────────┘
```

Use:
- White panel
- Thin border
- Subtle shadow
- Light-blue active state

Do not use dark glass panels.

Do not obstruct the map unnecessarily.

---

# 20. DASHBOARD

The dashboard should prioritize quick scanning.

Recommended:

```text
Page Header
─────────────────────────────────────────────

KPI 1     KPI 2     KPI 3     KPI 4

─────────────────────────────────────────────

Primary operational overview

┌───────────────────────┐ ┌─────────────────┐
│ Main operational data │ │ Alerts / status │
│                       │ │                 │
└───────────────────────┘ └─────────────────┘

─────────────────────────────────────────────

Secondary operational information
```

Do not overload the dashboard with every available metric.

The most important information must appear first.

---

# 21. CONVOY DISPATCH

Preserve the current workflow.

Visual hierarchy:

1. KPI summary
2. Dispatch New Convoy action
3. Active convoy data
4. Risk/status information
5. Detailed table

Use:
- White KPI cards
- White table
- Light-blue table header
- Semantic status pills
- Blue primary dispatch action
- Risk bars where appropriate

"Rerouted" must consistently use caution styling.

Critical route states must use critical styling.

---

# 22. SHELTER BOARD

Priorities:

1. Shelter availability
2. Capacity
3. Critical supply conditions
4. Isolation/critical states
5. Historical trends

Fix any ghosted headings.

Replace black/empty sparkline boxes with:
- Real trend charts when data exists
- Honest empty states when data does not exist

"Isolated" should have the strongest visual severity when it represents the most serious operational condition.

---

# 23. HAZARD LOG

Feed titles must always be readable.

Use:

```css
color: var(--text-primary);
```

Do not use muted text for the primary report title.

Recommended hierarchy:

```text
HAZARD TITLE
Location / time / reporter
Severity badge
Description
Action
```

Critical hazards should use the critical status system without turning the entire card red.

---

# 24. SUPPLY SWAP

Fix the existing issues:

### Inventory

Raw values must be paired with actual progress/level bars.

Example:

```text
Hub Alpha

████████████░░░░  62%

12,000 / 19,300 units
```

### Information banner

Use one clean, readable light-blue information banner.

No overlapping text.

No duplicate messages.

### Tabs

Active tab:
- Light-blue background
- Blue text

Inactive tab:
- White/transparent
- Secondary text

---

# 25. ALERTS SCREEN

Fix ghosted background headings.

Use:

```text
COMMAND CENTER ALERTS
Small eyebrow label
```

not a giant decorative duplicate.

Alert cards should use:
- White surface
- Semantic status indicator
- Clear title
- Timestamp/metadata
- Description
- Action buttons

Routine "Acknowledge" action may be primary.

"Escalate" should require stronger intentionality.

---

# 26. SETTINGS

Use a clean settings layout.

Example:

```text
SETTINGS

General
┌──────────────────────────────────────────┐
│ Field Mode                               │
│ Description                              │
│                              [ ON ]      │
└──────────────────────────────────────────┘

Offline Sync
┌──────────────────────────────────────────┐
│ Offline synchronization                  │
│ Last synced: Just now                    │
│                              [ Sync ]     │
└──────────────────────────────────────────┘
```

Remove oversized ghosted "PLATFORM CONFIGURATION" text.

Use small eyebrow labels instead.

---

# 27. RESPONSIVE UX

The application must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

## Desktop
Use sidebar + content layout.

## Tablet
Collapse navigation where necessary.

## Mobile
Use:
- Compact header
- Bottom navigation or collapsible navigation
- Stacked KPI cards
- Horizontally scrollable tables where required
- Full-width buttons when appropriate

Never allow content to overflow horizontally unintentionally.

---

# 28. ACCESSIBILITY

Accessibility is a production requirement.

Ensure:
- Text contrast meets WCAG expectations
- Focus states are clearly visible
- Buttons have readable labels
- Interactive controls have adequate size
- Status is not communicated through color alone
- Form fields have labels
- Keyboard navigation works
- Charts have meaningful labels/empty states
- Icons are paired with text when their meaning is not obvious

Do not sacrifice readability for visual minimalism.

---

# 29. MOTION

Animations should be subtle.

Use approximately:

```css
transition-duration: 200ms;
transition-timing-function: cubic-bezier(.2,.8,.2,1);
```

Use animation for:
- Panel reveal
- Tab transitions
- Hover states
- Expand/collapse
- Quick Demo reveal

Do not use:
- Constant pulsing
- Excessive bouncing
- Neon glows
- Large page transitions

Motion must support understanding, not distract.

---

# 30. BUG FIX CHECKLIST

The following issues must be fixed during regeneration.

```text
[ ] Remove all large low-opacity duplicate/ghosted section titles.

[ ] Settings:
    Remove the oversized "PLATFORM CONFIGURATION" background heading.
    Replace it with a small eyebrow label.

[ ] Alerts:
    Remove the oversized "COMMAND CENTER ALERTS" ghosted heading.
    Ensure it does not bleed through alert cards.

[ ] Supply Swap:
    Rebuild the information banner as one clean,
    readable light-blue information banner.

[ ] Supply Swap:
    Replace raw inventory numbers with actual
    progress/level bars.

[ ] Shelter Board:
    Replace black/empty sparkline boxes with
    real trend charts when data exists.

[ ] Shelter Board:
    If trend data does not exist, display an
    honest empty state such as "Not enough history yet."

[ ] Hazard Log:
    Fix invisible feed/report titles.
    Titles must use high-contrast primary text.

[ ] Audit every status pill across the application.

[ ] Safe = green.

[ ] Caution / warning / rerouted = amber.

[ ] Critical / blocked / isolated = red.

[ ] Informational = blue.

[ ] Passive metadata must not accidentally use severity colors.

[ ] Remove violet/indigo primary styling.

[ ] Remove dark command-center backgrounds.

[ ] Remove unnecessary glassmorphism.

[ ] Remove excessive gradients and neon effects.

[ ] Ensure buttons have clear visual hierarchy.

[ ] Ensure tables are readable and responsive.

[ ] Ensure all interactive elements have visible focus states.

[ ] Ensure mobile layouts do not overflow.

[ ] Ensure charts never appear as unexplained empty rectangles.
```

---

# 31. WHAT MUST NOT CHANGE

The following product concepts should remain intact:

- Existing role-based navigation
- Field Mode toggle behavior
- Core page structure
- Existing operational workflows
- Live map functionality
- KPI/stat-card concept
- Convoy dispatch workflow
- Shelter workflow
- Hazard Log workflow
- Supply Swap workflow
- Alerts workflow
- Settings workflow
- Login role selection
- Quick Demo login concept

This is a **visual and UX refinement**, not a replacement of the application's core functionality.

---

# 32. DESIGN ANTI-PATTERNS

Do NOT introduce:

- Dark purple backgrounds
- Neon violet
- Cyberpunk aesthetics
- Excessive glassmorphism
- Large decorative ghost headings
- Giant gradients
- Excessive rounded containers
- Huge shadows
- Too many colored buttons
- Red/green/amber decoration without semantic meaning
- Fake charts
- Empty black chart boxes
- Raw values where visual data representation is expected
- Low-contrast text
- Overcrowded dashboards
- Inconsistent spacing
- Inconsistent button styles
- Inconsistent status colors

---

# 33. FINAL VISUAL TARGET

The final application should visually communicate:

**Clean + Professional + Operational + Trustworthy + Modern**

Think:

```text
WHITE
████████████████████████████████████████

        DISISTA CONTROL

    Light-blue navigation
    Clean white cards
    Dark readable typography
    Blue actions
    Semantic status colors
    Generous whitespace

████████████████████████████████████████
```

The interface should feel suitable for a real organization using the platform every day.

The user should immediately understand:
- Where they are
- What is important
- What requires attention
- What action they can take
- What the current status is

The design must be elegant because of **clarity and restraint**, not because of decoration.

---

# 34. FINAL IMPLEMENTATION RULE

Treat this document as the single source of truth for the visual design.

When regenerating any screen:

1. Preserve existing functionality.
2. Preserve existing data relationships.
3. Apply the global design tokens.
4. Maintain the 70:30 white/light-blue visual balance.
5. Use semantic status colors consistently.
6. Fix the listed rendering bugs.
7. Maintain accessibility.
8. Maintain responsive behavior.
9. Avoid introducing new visual systems on individual pages.
10. Prefer simple, readable, production-quality UI over decorative effects.

**Final theme: White + Light Blue, approximately 70:30.**
