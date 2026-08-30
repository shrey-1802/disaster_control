# DISISTA CONTROL — DARK COMMAND CENTER THEME
## UI/UX Design System & Regeneration Prompt (v2 — supersedes the original light/honeydew palette)
### Paste this into Antigravity (or any agent) as the single source of truth for a full-site regeneration

---

# 0. WHY THIS VERSION EXISTS

The current build already found a strong direction: a dark, glass-card, violet-accented command-center theme — this reads as more "ops center at night" than the original light government palette, and it suits the product better. This document formalizes it as a locked system (so every future regeneration converges instead of drifting) and explicitly fixes three rendering bugs visible across the current pages:

1. **Ghosted/stacked headings** — Settings, Alerts, Supply Swap, and Shelter Board all show a large, low-opacity duplicate of the section title bleeding through behind the real title and card content (e.g. "PLATFORM CONFIGURATION" behind "Field Mode Accessibility Override," "COMMAND CENTER ALERTS" behind the alert cards). This is a z-index/opacity layering bug — a background decorative label is stacking directly under foreground text instead of sitting clearly behind the whole section.
2. **Unstyled data elements** — the Supply Swap inventory rows show a raw number ("12,000") instead of a rendered progress/level bar, and the info banner directly above the tabs shows overlapping unreadable text. Shelter Board's "sparkline" areas render as solid black/empty boxes instead of a chart or an honest empty state.
3. **Invisible feed text** — Hazard Log's recent-reports feed has report titles rendered in a color matching their own background, so entries are only readable via the badge and metadata line beneath them.

Tell the agent to treat section 6 (below) as a bug list to fix, not just a style guide to apply on top of what's broken.

---

# 1. THEME TOKENS

```css
:root {
  /* Base surfaces */
  --bg-app:        #151029;   /* app background, deep navy-indigo */
  --bg-panel:       #1E1839;   /* floating panels on the map, popovers */
  --surface-card:    #221C40;   /* default dark card fill */
  --surface-card-alt: #FFFFFF;  /* light cards used for stat/summary tiles — see 1.3 */
  --border-hairline: #352E56;   /* card borders on dark surfaces */
  --border-hairline-light: #E7E3F5; /* card borders on light surfaces */

  /* Accent */
  --violet-500:  #8B6CF6;   /* primary actions, active nav pill, focus */
  --violet-600:  #7C5CE8;   /* hover/active shade */
  --violet-100:  #EDE7FE;   /* light accent fill (chips on white cards) */

  /* Status — reuse everywhere, never invent a new hue per screen */
  --status-safe:      #34D399;  /* green — safe/confirmed/healthy */
  --status-safe-bg:    #DFF7EC;
  --status-caution:    #F5A623;  /* amber — caution/rerouted/warning */
  --status-caution-bg:  #FCEBC9;
  --status-critical:    #F2545B;  /* red — critical/blocked/isolated */
  --status-critical-bg:  #FBDDDF;
  --status-info:       #4EA1F7;  /* blue — informational only, e.g. fusion notices */

  /* Text on dark */
  --text-primary-dark:   #F5F3FC;
  --text-secondary-dark:  #A79FC7;
  --text-muted-dark:     #6E6690;

  /* Text on light cards */
  --text-primary-light:  #1E1839;
  --text-secondary-light: #6B6690;

  --radius: 14px;
  --radius-pill: 999px;
  --font-sans: 'Inter', 'IBM Plex Sans', system-ui, sans-serif;

  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:24px; --space-6:32px; --space-7:48px;

  --text-xs:12px; --text-sm:14px; --text-base:16px;
  --text-lg:19px; --text-xl:23px; --text-2xl:28px;

  --shadow-card: 0 2px 12px rgba(0,0,0,0.25);
  --shadow-glow-violet: 0 0 0 3px rgba(139,108,246,0.25);
  --motion-fast:120ms; --motion-base:200ms; --ease:cubic-bezier(.2,.8,.2,1);
}
```

## 1.1 The one rule that keeps this consistent
Every status anywhere in the app — hazard severity, convoy state, alert tier, shelter urgency — maps to exactly one of the three status colors (safe/caution/critical) plus the neutral info-blue for non-severity notices. Never introduce a fourth severity hue, and never use a status color as decoration where it isn't reporting an actual status.

## 1.2 Two card surfaces, used deliberately (not randomly)
Your current build already does this correctly in places — formalize it:
- **Dark cards** (`--surface-card` on `--bg-app`): default for content-dense panels — hazard log entries, alert cards, table containers, map side panels.
- **Light cards** (`--surface-card-alt`, white): reserved for **summary/stat tiles** — the KPI numbers at the top of Supply Swap, Shelter Board, Convoy Dispatch. This creates a visual rhythm (numbers live on light cards, detail lives on dark cards) that makes the KPI row scannable at a glance against the dark page. Keep this distinction consistent on every screen — don't let detail-list cards drift onto white, and don't let stat tiles drift onto dark.

## 1.3 Elevation
Dark and light cards both get `--shadow-card` (a soft, low dark shadow) — not a hard drop shadow, not flat. On hover/focus, add `--shadow-glow-violet` instead of increasing the shadow — a soft violet glow ring reads as "interactive" without breaking the calm dark aesthetic.

---

# 2. TYPOGRAPHY

- **Screen title** (`--text-2xl`, 700, `--text-primary-dark`): one per screen, top-left under the nav.
- **Section eyebrow label** (`--text-xs`, 600, uppercase, 0.08em tracking, `--text-muted-dark`): this is the element currently bugged as a giant ghosted duplicate (§0.1) — it should render as a **small, quiet, single-line label**, never a large heading-sized element stacked behind the real title.
- **KPI numeral** (`--text-2xl`, 700, tabular-nums, `--text-primary-light` on light cards / `--text-primary-dark` on dark): the heaviest element on any stat card, always.
- **Body** (`--text-sm`, 400, `--text-secondary-dark`/`--text-secondary-light` depending on surface).
- **Feed/list item title** (`--text-base`, 600, `--text-primary-dark`): must always contrast against its card background — this is the fix for the invisible Hazard Log titles (§0.3). Never set a title's color equal to or lower-contrast than its own surface.

---

# 3. COMPONENTS

## 3.1 Pills & badges
Rounded-full (`--radius-pill`), icon + label, sized to content (`min-width` + padding, never a fixed width — translated labels run longer). Three status variants map directly to §1's status colors; a neutral pill (e.g. "SYNCED JUST NOW," "Cold-Chain," "Field Mode ON") uses `--violet-500` fill with white text for anything that's an active/selected state, and a light neutral gray/white pill for passive metadata.

| Pill meaning | Fill | Text/icon |
|---|---|---|
| Safe / confirmed / healthy | `--status-safe-bg` | `--status-safe` text + circle-check |
| Caution / rerouted / warning | `--status-caution-bg` | `--status-caution` text + triangle |
| Critical / blocked / isolated | `--status-critical-bg` | `--status-critical` text + diamond/octagon |
| Active/selected state (nav, "Field Mode ON") | `--violet-500` solid | white text |
| Passive metadata ("Synced," "Cold-Chain") | white/`--surface-card-alt` or transparent outline | `--text-secondary` |

## 3.2 Buttons
- **Primary:** `--violet-500` → `--violet-600` on hover, white text, used once per screen for the single most important action ("Dispatch New Convoy," "Authenticate & Enter Portal").
- **Secondary:** outline, `--border-hairline`/`--border-hairline-light` border, transparent fill, used for "View," "Reset Filters," navigation-adjacent actions.
- **Critical/destructive:** `--status-critical` outline or fill, reserved for genuinely critical actions ("Escalate to HQ Command," "Mark Route Unsafe") — never for routine actions.
- Never leave a button in a state where its label and its function disagree (e.g. don't ship a purple "Acknowledge Alert" next to a white "Escalate to HQ Command" without a clear visual priority — the more consequential action should be visually secondary by default, requiring intent, while the routine action can be primary).

## 3.3 Stat/KPI cards (light surface)
White card, `--radius`, thin left accent border in `--violet-500` (this is already working well in the current build — keep it), eyebrow label top, large numeral, short caption beneath. No sparkline or bar inside this card type — those belong on the detail card below it.

## 3.4 Data bars (progress / level / risk index)
**This must always render as an actual bar, never raw text** (fixing §0.2). Structure:
```html
<div class="bar-track">
  <div class="bar-fill" style="width: 62%; background: var(--status-caution);"></div>
</div>
<span class="bar-label">12,000 / 19,300 units</span>
```
The fill color follows the same three-tier status system (e.g. a risk-index bar uses caution/critical coloring based on value, an inventory-level bar uses safe/caution/critical based on days-of-cover thresholds). The numeric label sits beside or below the bar, never replaces it.

## 3.5 Sparklines / trend charts
If historical data exists, render an actual small line chart in `--violet-500` on transparent background. **If it doesn't exist yet, show an honest empty state** — a short line of muted text ("Not enough history yet") — never a solid black/empty box (fixing the Shelter Board bug). An empty state is not a bug; an unexplained black rectangle is.

## 3.6 Info banners (non-severity notices)
Fusion-conflict notices, sync-queue explainers, and similar informational text use `--status-info` as a left accent bar + small icon, on a card background — never purple (reserve violet for interactive/active elements) and never a status color that implies severity when there isn't any. Text inside must always be set at full contrast against the banner's own background — this fixes the unreadable overlapping text seen in the current Supply Swap banner.

## 3.7 Tables
Dark surface, sticky header row in a slightly lighter dark shade than the body rows (not pure black), row hover state uses a subtle `--surface-card` lightening, not a violet tint (reserve violet for genuinely interactive/selected rows). Status-tier and risk-index cells use the pill/bar components above, never plain colored text.

---

# 4. THE LOGIN SCREEN — ADOPT THE REFERENCE INTERACTION

Your reference image's core idea — a card with a curved white tab peeking up from the bottom edge, inviting a tap to reveal the alternate action ("Login" tab peeking below a "Sign up" card) — is worth adopting here, adapted to this product's actual login pattern (role-based sign-in, not sign-up/login toggle):

```text
Primary card (current state): full credential form — role select,
operator ID, passcode, "Authenticate & Enter Portal."
                        ↓
Curved tab peeking from the bottom edge, labeled
"Quick Demo — One-Click Login" ↑
                        ↓
Tapping/dragging it up reveals the four role quick-select buttons
(Control Room / District Admin / Warehouse Manager / Field Driver)
sliding up over the credential form, same physical card, not a
separate page.
```

This is more polished than the current implementation, where the quick-login buttons sit as a static second block below the form at all times — the reveal interaction makes the primary path (real credentials) the default view and the demo shortcut a deliberate, discoverable action, which is the right hierarchy for a platform that's meant to look production-grade even in a demo build.

Implementation note for the agent: this can be built with a simple CSS `transform: translateY()` transition on a second `<div>` positioned absolutely at the bottom of the card, triggered by click or a small drag gesture — no animation library needed.

---

# 5. SCREEN-BY-SCREEN NOTES (apply the system above; only calling out what's specific)

- **`login.html`** — dark full-bleed background, single centered card, curved reveal interaction from §4. Keep the current role dropdown + credential fields for the "real" login state.
- **`dashboard.html`** — role-specific landing; reuse the KPI stat-card row pattern from Supply Swap/Shelter Board as the top section regardless of role.
- **`live-map.html`** — map itself stays on real tile imagery (light, since that's how map providers render); floating panels (`Network Layers`, `Network Inspector`) use `--bg-panel`, not pure `--bg-app`, so they read as overlays on top of the map rather than a hole in it. This is already correct in the current build — preserve it.
- **`convoy-dispatch.html`** — KPI row on light cards, table on dark surface, risk-index and cargo/status pills per §3.1/§3.4. Fix: "Ack Timeout" and "Rerouted" pills must use `--status-caution`/`--status-critical` consistently — confirm the current amber "Rerouted" pill isn't drifting toward a color already reserved for something else.
- **`shelter-board.html`** — fix the ghosted eyebrow label (§0.1) and the black sparkline boxes (§3.5). "Isolated" badge is the most severe visual on the screen — confirm it currently outranks "Critical Supply" in visual weight, not just in the label.
- **`hazard-log.html`** — fix invisible feed titles (§0.3) as the top priority on this screen; everything else here is already close to right.
- **`supply-swap.html`** — fix the ghosted/ovelapping banner text (§0.2) and replace the raw-number inventory rows with actual bars (§3.4).
- **`alerts.html`** — fix the ghosted "COMMAND CENTER ALERTS" heading (§0.1) bleeding through the alert card titles; keep the escalate/acknowledge button hierarchy but apply §3.2's priority rule (routine action primary, consequential action secondary-styled).
- **`settings.html`** — fix the ghosted "PLATFORM CONFIGURATION" heading (§0.1); everything else (Field Mode card, Offline Sync card) is already well-structured, keep it.

---

# 6. BUG FIX CHECKLIST (give this to the agent explicitly, as a punch list separate from the style system)

```text
[ ] Remove/reposition the large low-opacity duplicate section titles
    bleeding through card content on: settings.html, alerts.html,
    supply-swap.html, shelter-board.html. These should be small
    uppercase eyebrow labels (Section 2), not oversized ghosted text.
[ ] Supply Swap: the horizontal banner above the tabs renders
    overlapping/unreadable text — rebuild as a single-line info banner
    per Section 3.6, full contrast, one message.
[ ] Supply Swap: inventory rows (Hub Alpha, Hub Bravo, etc.) show a
    raw number instead of a level bar — implement Section 3.4.
[ ] Shelter Board: "View Sparkline" areas render as solid black boxes
    — implement either a real trend line or the honest empty state
    from Section 3.5, never an unexplained empty rectangle.
[ ] Hazard Log: feed entry titles are invisible against their own
    background — fix contrast per Section 2's feed-title rule.
[ ] Confirm every status pill across every screen maps to exactly one
    of the three status colors from Section 1 — audit for drift
    (e.g. an amber used for something that should be red, or a
    passive metadata pill accidentally using a status color).
```

---

# 7. WHAT NOT TO CHANGE

The current build already has several things right — tell the agent explicitly to preserve these rather than "improving" them into something else:
- The light-card-for-KPIs / dark-card-for-detail rhythm (Section 1.2).
- The left-accent-border treatment on stat cards.
- The live map's floating dark panels over real map tiles.
- The role-based nav and Field Mode toggle behavior already implemented.
- The pill-badge shape language generally — it's the fix-the-bugs-not-the-concept situation.
