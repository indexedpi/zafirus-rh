# Zafirus UI Reference — Angular Frontend

## Visual Direction

The Angular app follows the Zafirus internal product visual style:

- **Dark navy sidebar** (`--shell-bg: #0f1729`)
- **White Zafirus SVG logo** (real paths from React source)
- **Light gray workspace** (`--bg-base: #f0f2f5`)
- **Compact header** (42px top bar)
- **Pill controls** (rounded-lg/rounded-full button shapes)
- **Quiet white cards** (bg-elevated, subtle borders, sm shadow)
- **Thin borders** (1px, border-subtle)
- **High-density internal product UI**
- **No giant dashboards**
- **No generic SaaS bloat**

## Color System

### Brand
- Primary: `#459CDB`
- Primary hover: `#2e85c2`
- Primary subtle: `rgba(69,156,219,0.08)`

### Status
- Success: `#16a34a` / subtle: `#f0fdf4`
- Error: `#dc2626` / subtle: `#fef2f2`
- Warning: `#d97706` / subtle: `#fffbeb`
- Info: `#0284c7` / subtle: `#f0f9ff`

### Section Accents
- Personal/Identity: `#459CDB`
- Location: `#27AE60`
- Work/Position: `#9B51E0`
- Fiscal: `#F2994A`
- Payment: `#2D9CDB`
- Docs: `#828282`

## Typography

- Font family: **Sora** (Google Fonts)
- Base size: 14px
- UI labels: 10-11px uppercase tracking-wider
- Body text: 13-14px
- Headers: 18-24px bold

## Forbidden Patterns

These must NOT appear in the Angular codebase:

```
#549dd6
transition-all
transition: all
border-l-2
border-l-4
Operations Room
Control Dashboard
Readiness
Simular datos
Laboratorio
Tipeá o insertá
Portal Ops
```

## UI Copy Language

- All visible copy is in **Spanish** (Argentine dialect: vos, tú avoided)
- Code identifiers are in **English**
- Button labels: "Crear caso", "Enviar formulario", "Aprobar caso", etc.

## EmailTab Variable Pills

```css
.var-pill {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--brand-primary) 25%, transparent);
  background: var(--brand-primary-subtle);
  color: var(--brand-primary);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
```
