# Zafirus Light Product System — Design Constitution

## Product Mode

This application uses a **persistent light workspace** model. There is no light/dark toggle.

- **Shell/TopBar:** Deep navy (`--shell-bg: #0f1729`). White logo, muted gray labels, teal/brand accents.
- **Content workspace:** Light gray canvas (`--bg-base: #f0f2f5`). White cards. Soft gray borders. No dark content surfaces.
- The split between shell (navy) and workspace (light) is the fundamental visual grammar.

## Brand Assets

- Official Zafirus SVG must be sharp and undistorted. Minimum width 24px.
- Logo renders white/brand on navy shell, brand on light workspace surfaces.
- Do not simplify or fake the logo mark.
- Use logos and watermarks sparingly — avoid dashboard cosplay.

## Color System

**Design tokens (single source of truth in `src/index.css`):**

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#f0f2f5` | App canvas |
| `--bg-subtle` | `#e8ebef` | Sidebar, subtle panels |
| `--bg-surface` | `#ffffff` | White cards |
| `--bg-elevated` | `#ffffff` | Elevated white surface |
| `--shell-bg` | `#0f1729` | TopBar / sidebar |
| `--shell-bg-soft` | `#162035` | Soft shell variant |
| `--brand-primary` | `#459CDB` | Actions, links, active states |
| `--brand-primary-subtle` | `rgba(69,156,219,0.08)` | Pill backgrounds, selected states |
| `--text-primary` | `#0f172a` | Near-black slate headings |
| `--text-secondary` | `#475569` | Muted body text |
| `--text-tertiary` | `#94a3b8` | Disabled/hint text |
| `--border-subtle` | `#e2e8f0` | Card borders, dividers |
| `--border-default` | `#cbd5e1` | Default borders |
| `--status-success` | `#16a34a` | Success (restrained green) |
| `--status-error` | `#dc2626` | Error (restrained red) |
| `--status-warning` | `#d97706` | Warning (soft amber) |
| `--status-info` | `#0284c7` | Info (calm blue) |

**FORBIDDEN colors:**
- `#549dd6` and `rgba(84,157,214,...)` — legacy alias, do not use
- Full dark content surfaces (e.g. `#05080f`, `#0c1120`, `#101d30`, `bg-slate-900`)
- Neon/glow-heavy buttons and borders
- Dashboard cosplay (large metric numbers, status-panel vibes)
- Generic SaaS cards with no relationship to the Zafirus brand

**Allowed dark usage:**
- TopBar/sidebar using `--shell-bg` shell tokens
- Task console/output panels (intentional terminal aesthetic)
- Email signature navy strip
- Logo rendering on dark backgrounds

## Typography

- App UI: Sora (system-ui fallback)
- Technical/code fields: monospace (CBU, CUIT, wallet addresses)
- Keep sizes concise. No giant dashboard metric numbers.
- Font hierarchy through weight and spacing — not through neon color contrast.

## Layout

- Shell (navy topbar, light case-list sidebar) wraps a light main workspace.
- White cards (`--bg-surface`) with 1px border (`--border-subtle` or `--border-default`) and `rounded-xl` / `rounded-2xl`.
- Right-side sticky panels for summaries (data validation, email variables).
- Rounded pill/segmented controls for filters and tabs.
- Minimal shadows only where elevation needs to be communicated.

## Controls

- Primary buttons: `--brand-primary` fill, white text.
- Secondary buttons: white/light fill, `--border-default` border, `--text-primary` text.
- Ghost/nav buttons: transparent, hover `--bg-subtle`.
- Tabs/pills: active state uses `--brand-primary-subtle` fill + `--brand-primary` text.
- No glowing sci-fi outlines. No `box-shadow` glow rings on buttons.

## Motion

- Calm, short, predictable CSS transitions: `transition-colors`, `transition-opacity`, `transition-[background-color,border-color]`.
- **FORBIDDEN:** `transition: all`, `transition-all`, `ease-spring`, bounce, elastic easing.
- Default 150ms duration. Slow operations: 300ms max.
- Respect `prefers-reduced-motion`.

## Accessibility

- WCAG 2.1 AA contrast on all text/background pairs.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]`).
- Minimum 44px practical touch targets on mobile (WCAG 2.5.5).
- No global `select-none` — operational data (CUIT, CBU, names) must remain selectable.
- Keyboard navigation for all interactive elements.

## Copy & Language

- Visible UI copy is strictly Spanish.
- Code identifiers, component names, variables, comments, commit messages: English.
- Avoid telemetry, debug jargon, or "operations room" tone. Use calm, HR-professional phrasing.

## Duplicate Identity Rule

- Case identity (name, avatar, status) appears only once per view.
- No `DataTab ProfileHero` or secondary identity header inside tab content.
- No demo controls visible outside `#demo` hash mode.

## Screenshot Resemblance Checklist

Before marking any visual work complete, verify:
- [ ] Deep navy sidebar/topbar
- [ ] Light main canvas (`#f0f2f5`)
- [ ] White cards with subtle borders
- [ ] Rounded pill/segment controls
- [ ] Teal/cyan active states
- [ ] No full dark workspace
- [ ] Professional Zafirus enterprise feel
- [ ] No neon/glow buttons
