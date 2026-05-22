# Zafirus RH Design Constitution

## Brand Assets
- Official Zafirus SVG must be sharp and undistorted. Minimum width is 24px.
- The logo blue center diamond must be accurate. Do not simplify or fake the logo mark.
- Use watermarks and raw logos sparingly to avoid dashboard cosplay.

## Color System
- **Brand primary:** `#459CDB` (Zafirus blue)
- **Brand primary subtle:** `rgba(69,156,219,0.10)`
- **Brand primary glow:** `rgba(69,156,219,0.22)`
- **Shell background:** Navy/Dark base with elevated surfaces.
- **Preview background:** Pure white for email previews to contrast with the dark HR shell.
- **States:** Standard semantic success/warning/error colors.
- **FORBIDDEN:** Do not use legacy `#549dd6` or `rgba(84,157,214,...)`.

## Typography
- App UI Typography: Sora (or system-ui sans-serif).
- Technical/Code fields: Monospace (for tokens, CBU, CUIT).
- Keep font sizes concise. Do not use giant dashboard metric numbers.

## Layout & Components
- Strong shell vs tab hierarchy. Sidebar contains navigation; CaseDetail header contains identity.
- Right-side panels used for summaries (Data validation, Email variables).
- Buttons use solid fill for primary, transparent/border for secondary.
- Timeline uses connected vertical lines and dots, indicating step states.

## Motion
- Calm, short, predictable CSS transitions (`transition-colors`, `transition-opacity`).
- **FORBIDDEN:** `transition: all`, `transition-all`, `ease-spring`, bounce effects.
- Prefer 150ms timing.

## Accessibility
- WCAG AA contrast compliance.
- Focus outlines must be visible (usually with primary glow).
- Avoid `select-none` on operational data text (CUIT, CBU, names).

## Copy & Language
- Visible UI copy is strictly Spanish.
- Code identifiers, variables, comments, and React components are strictly English.
- Avoid telemetry, debug jargon, or "operations room" tone. Use calm, HR-professional phrasing.
