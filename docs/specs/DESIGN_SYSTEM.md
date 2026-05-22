# DESIGN_SYSTEM.md
# Sistema de diseño unificado — Zafirus Onboarding

> Fusión de los dos sistemas de marca: tokens de app (dark theme) construidos sobre la paleta de marca de zafirus.tech.
> Este documento es la fuente única de verdad para todo lo visual del demo y de producción.

---

## 1. Fundación de marca

### Logo
```
URL principal:  https://zafirus.tech/images/zafirus-logo.svg
Favicon:        https://zafirus.tech/favicon-32x32.svg
Isotipo:        https://zafirus.tech/images/icons/ISOTIPO_ORIGINAL_ZAFIRUS.jpg
```
Uso: siempre sobre fondo `--bg-base` o `--bg-surface`. Mantener margen mínimo equivalente a la altura de la letra "Z" del logo a cada lado.

### Tipografía: Sora
```
Pesos disponibles: 300 (Light) · 400 (Regular) · 500 (Medium) · 600 (SemiBold) · 700 (Bold)
Fallback stack:    'Sora', 'Inter', system-ui, -apple-system, sans-serif
Importación:       Google Fonts (https://fonts.google.com/specimen/Sora)
```

CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## 2. Color tokens

### Brand
| Token | Hex | Uso |
|---|---|---|
| `--brand-primary` | `#549dd6` | Acción principal, CTAs, links, iconos activos |
| `--brand-primary-hover` | `#6bb5e8` | Hover de elementos azules |
| `--brand-primary-active` | `#3d85be` | Estado pressed/active |
| `--brand-primary-subtle` | `rgba(84,157,214,0.10)` | Fondos de estado activo sutil |
| `--brand-primary-glow` | `rgba(84,157,214,0.22)` | Box-shadow de foco y hover |
| `--brand-navy` | `#101d30` | Color navy principal de marca |

### Backgrounds (de más oscuro a más claro)
| Token | Hex | Uso |
|---|---|---|
| `--bg-base` | `#05080f` | Fondo base de toda la app |
| `--bg-subtle` | `#0c1120` | Sidebars, fondos de secciones alternadas |
| `--bg-surface` | `#101d30` | Cards, panels, modales |
| `--bg-elevated` | `#162240` | Cards elevadas, dropdowns, tooltips |
| `--bg-overlay` | `rgba(5,8,15,0.88)` | Overlay de modales |

### Texto
| Token | Valor | Uso |
|---|---|---|
| `--text-primary` | `#ffffff` | Títulos, texto principal |
| `--text-secondary` | `rgba(255,255,255,0.55)` | Subtítulos, body text |
| `--text-tertiary` | `rgba(255,255,255,0.38)` | Placeholders, metadata, hints |
| `--text-disabled` | `rgba(255,255,255,0.22)` | Elementos deshabilitados |
| `--text-link` | `#6bb5e8` | Links en texto corrido |
| `--text-error` | `#ef4444` | Mensajes de error |
| `--text-success` | `#22c55e` | Mensajes de éxito |

### Bordes
| Token | Valor | Uso |
|---|---|---|
| `--border-subtle` | `rgba(255,255,255,0.05)` | Divisores muy suaves |
| `--border-default` | `rgba(255,255,255,0.09)` | Bordes de inputs y cards en reposo |
| `--border-strong` | `rgba(255,255,255,0.14)` | Bordes en hover |
| `--border-focus` | `#549dd6` | Borde de foco en inputs |
| `--border-error` | `#ef4444` | Borde en estado error |
| `--border-success` | `#22c55e` | Borde en estado éxito |

### Status
| Token | Hex | Uso |
|---|---|---|
| `--status-success` | `#22c55e` | Verde — validaciones positivas, estados operativos |
| `--status-error` | `#ef4444` | Rojo — errores, alertas críticas |
| `--status-warning` | `#f59e0b` | Ámbar — advertencias, atención requerida |
| `--status-info` | `#549dd6` | Azul — información |

### Status subtle (para badges y backgrounds de estado)
```css
--status-success-subtle: rgba(34,197,94,0.12);
--status-error-subtle:   rgba(239,68,68,0.12);
--status-warning-subtle: rgba(245,158,11,0.12);
--status-info-subtle:    rgba(84,157,214,0.12);
```

---

## 3. Tipografía aplicada (escala app)

> Nota: los tamaños de la landing (57px h1) son para hero marketing. La app usa una escala compacta funcional.

| Rol | Tamaño | Peso | Line-height | Uso |
|---|---|---|---|---|
| `display` | 40px | 700 | 1.1 | Solo en candidato form, paso 1 (bienvenida) |
| `h1` | 28px | 700 | 1.2 | Títulos de página |
| `h2` | 22px | 600 | 1.3 | Secciones |
| `h3` | 18px | 600 | 1.3 | Cards, sub-secciones |
| `h4` | 15px | 600 | 1.4 | Pequeños encabezados, etiquetas de campo destacadas |
| `body-lg` | 16px | 400 | 1.5 | Lectura cómoda, descripciones |
| `body` | 14px | 400 | 1.5 | Texto principal de UI |
| `body-sm` | 13px | 400 | 1.5 | Texto secundario |
| `caption` | 12px | 500 | 1.4 | Metadata, timestamps, badges |
| `overline` | 11px | 600 | 1.4 | Etiquetas en mayúsculas, tracking 0.06em |
| `code` | 13px | 500 | 1.4 | JetBrains Mono, IDs, valores monoespaciados |

---

## 4. Spacing scale

Sistema basado en múltiplos de 4px:
```
--space-0:   0
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

Padding interno estándar:
- Buttons: 8px 16px (sm), 10px 20px (md), 14px 28px (lg)
- Inputs: 10px 14px
- Cards: 20px (compact), 24px (default), 32px (spacious)
- Modal: 32px

---

## 5. Border radius

```
--radius-none:  0
--radius-sm:    4px       Inputs, badges, chips
--radius-md:    8px       Buttons, cards pequeñas
--radius-lg:    12px      Cards, modales
--radius-xl:    16px      Hero cards, contenedores especiales
--radius-full:  9999px    Pill buttons, avatars circulares
```

---

## 6. Shadows / Elevations

```css
--shadow-sm:   0 1px 2px rgba(0,0,0,0.4);
--shadow-md:   0 4px 12px rgba(0,0,0,0.35);
--shadow-lg:   0 12px 24px rgba(0,0,0,0.45);
--shadow-xl:   0 24px 48px rgba(0,0,0,0.55);
--shadow-glow: 0 0 0 3px var(--brand-primary-glow);
--shadow-focus: 0 0 0 3px var(--brand-primary-glow);
```

Uso:
- `sm` para cards en reposo
- `md` para dropdowns y popovers
- `lg` para modales
- `xl` para overlays principales
- `glow` para foco de inputs y hover de botones primarios

---

## 7. Patrones de componentes

### 7.1 Button

**Primary**
```
background: var(--brand-primary);
color: #ffffff;
border-radius: var(--radius-md);
padding: 10px 20px;
font-family: 'Sora';
font-weight: 600;
font-size: 14px;
border: none;
transition: all 150ms ease;

:hover {
  background: var(--brand-primary-hover);
  box-shadow: var(--shadow-glow);
}

:active {
  background: var(--brand-primary-active);
}

:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Secondary (outline)**
```
background: transparent;
color: var(--text-primary);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 10px 20px;

:hover {
  border-color: var(--border-strong);
  background: rgba(255,255,255,0.03);
}
```

**Ghost**
```
background: transparent;
color: var(--text-secondary);
border: none;

:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.05);
}
```

**Danger**
```
background: var(--status-error);
color: #ffffff;

:hover {
  background: #dc2626;
}
```

### 7.2 Input

```
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 10px 14px;
color: var(--text-primary);
font-family: 'Sora';
font-size: 14px;

::placeholder {
  color: var(--text-tertiary);
}

:hover {
  border-color: var(--border-strong);
}

:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

[aria-invalid="true"] {
  border-color: var(--border-error);
}
```

Label sobre el input:
```
display: block;
margin-bottom: 6px;
font-size: 13px;
font-weight: 500;
color: var(--text-secondary);
```

Helper text debajo:
```
margin-top: 6px;
font-size: 12px;
color: var(--text-tertiary);
```

Error text:
```
margin-top: 6px;
font-size: 12px;
color: var(--text-error);
```

### 7.3 Card

```
background: var(--bg-surface);
border: 1px solid var(--border-default);
border-radius: var(--radius-lg);
padding: 24px;
box-shadow: var(--shadow-sm);
```

Card con header:
```
.card-header {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
```

### 7.4 Badge (state badge)

```
display: inline-flex;
align-items: center;
gap: 6px;
padding: 4px 10px;
border-radius: var(--radius-full);
font-size: 12px;
font-weight: 500;
line-height: 1;
```

Variantes (un fondo subtle + texto del color):
```
.badge-draft       → bg: rgba(255,255,255,0.06)  · text: var(--text-secondary)
.badge-invited     → bg: var(--status-info-subtle)    · text: var(--status-info)
.badge-submitted   → bg: var(--status-info-subtle)    · text: var(--status-info)
.badge-review      → bg: var(--status-warning-subtle) · text: var(--status-warning)
.badge-ready       → bg: var(--status-info-subtle)    · text: var(--status-info)
.badge-pending     → bg: var(--status-warning-subtle) · text: var(--status-warning)
.badge-operative   → bg: var(--status-success-subtle) · text: var(--status-success)
.badge-blocked     → bg: var(--status-error-subtle)   · text: var(--status-error)
.badge-cancelled   → bg: rgba(255,255,255,0.06)       · text: var(--text-tertiary)
```

Cada badge lleva un dot al inicio del mismo color del texto:
```
.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

### 7.5 Avatar

Circular, iniciales sobre fondo derivado del nombre (hash a uno de 5 colores):
```
width: 32px;  /* sm */
height: 32px;
border-radius: var(--radius-full);
font-size: 12px;
font-weight: 600;
color: #ffffff;
display: flex;
align-items: center;
justify-content: center;
```

Paleta de fondos para avatares (rotativa):
```
#549dd6, #8b5cf6, #f59e0b, #22c55e, #ec4899
```

### 7.6 Timeline / Activity log

Eventos en columna con línea vertical conectora:
```
.timeline {
  position: relative;
  padding-left: 24px;
  border-left: 1px solid var(--border-default);
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -29px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg-base);
  border: 2px solid var(--brand-primary);
}

.timeline-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.timeline-item-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
```

### 7.7 Form wizard (stepper)

Pasos horizontales con conector entre ellos:
```
.stepper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
}

.step-dot.active {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: #ffffff;
}

.step-dot.completed {
  background: var(--status-success-subtle);
  border-color: var(--status-success);
  color: var(--status-success);
}

.step-connector {
  flex: 1;
  height: 1px;
  background: var(--border-default);
}

.step-connector.completed {
  background: var(--status-success);
}
```

### 7.8 Toast (notificaciones)

```
position: fixed;
bottom: 24px;
right: 24px;
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 12px 16px;
box-shadow: var(--shadow-lg);
display: flex;
align-items: center;
gap: 12px;
max-width: 400px;
```

Variantes con borde izquierdo coloreado (4px):
- `.toast-success` → border-left: 4px solid var(--status-success)
- `.toast-error`   → border-left: 4px solid var(--status-error)
- `.toast-warning` → border-left: 4px solid var(--status-warning)
- `.toast-info`    → border-left: 4px solid var(--status-info)

---

## 8. Layout primitives

### Container max-widths
```
--container-sm:   640px
--container-md:   768px
--container-lg:   1024px
--container-xl:   1280px
--container-2xl:  1536px
```

### Sidebar
```
width: 260px (expandido) | 64px (colapsado)
background: var(--bg-subtle)
border-right: 1px solid var(--border-subtle)
```

### Topbar
```
height: 56px
background: var(--bg-surface)
border-bottom: 1px solid var(--border-subtle)
padding: 0 24px
```

### Page padding
```
padding: 32px 40px
max-width: var(--container-xl)
margin: 0 auto
```

---

## 9. Animation tokens

```
--duration-instant:  100ms     /* toggles, micro */
--duration-fast:     150ms     /* hover, focus */
--duration-base:     200ms     /* transitions estándar */
--duration-slow:     300ms     /* paneles, drawers */
--duration-slower:   500ms     /* page transitions */

--ease-standard:     cubic-bezier(0.4, 0, 0.2, 1);
--ease-out:          cubic-bezier(0, 0, 0.2, 1);
--ease-in:           cubic-bezier(0.4, 0, 1, 1);
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1);
```

Patrones recomendados:
- Hover de elementos interactivos: `transition: all 150ms ease`
- Aparición de toasts: slide-in desde abajo, 200ms, ease-out
- Cambio de estado de badge: fade rápido, 150ms
- Apertura de drawer: 300ms, ease-standard
- Pulse de elemento que cambió: 2 ciclos de 600ms cada uno

---

## 10. Iconografía

Sistema: **Lucide Icons** (https://lucide.dev)
Tamaños estándar:
```
--icon-xs:  12px    /* dentro de badges pequeños */
--icon-sm:  14px    /* dentro de buttons y labels */
--icon-md:  16px    /* default UI */
--icon-lg:  20px    /* destacados */
--icon-xl:  24px    /* navegación, header */
```

Stroke-width estándar: `1.5px` (más liviano que el default de Lucide).

Iconos clave para este sistema:
```
user-plus          Crear caso nuevo
file-text          Formulario candidato
shield-check       Estado verificado
mail               Email subsystem
users              Grupos
laptop             Solicitud de dispositivo
banknote           CBU / cuenta bancaria
qr-code            QR Binance
file-signature     W-8
clock              Pendiente
check-circle       Operative
x-circle           Bloqueado / cancelado
refresh-cw         Reintentar
external-link      Abrir en nueva pestaña
copy               Copiar al portapapeles
chevron-right      Navegación
search             Búsqueda
filter             Filtros
more-horizontal    Acciones secundarias
```

---

## 11. Layout específico del demo: split-screen

Para el demo en `/demo`, el layout es de dos paneles verticales con un divisor central:

```
┌────────────────────────────────────────────────────────────────────────┐
│  TOPBAR  (--bg-surface, height: 56px)                                  │
│  [Logo Zafirus] [Onboarding Demo] · · · · · [↻ Reset] [📋 Audit Log]  │
├──────────────────────────────────────────┬─────────────────────────────┤
│                                          │                             │
│  RRHH PANEL                              │  CANDIDATE VIEW             │
│  bg: var(--bg-base)                      │  bg: var(--bg-subtle)       │
│  width: 50%                              │  width: 50%                 │
│                                          │                             │
│  ┌──────────────────────────────────┐    │   ┌─────────────────────┐  │
│  │ Cases List (sticky top)          │    │   │ Wizard del candidato│  │
│  │ + Botón "Nuevo caso"             │    │   │ (centro vertical)   │  │
│  └──────────────────────────────────┘    │   │                     │  │
│                                          │   │ Paso X de 6         │  │
│  ┌──────────────────────────────────┐    │   │                     │  │
│  │ Detalle del caso seleccionado    │    │   │ Pregunta + input    │  │
│  │ - Datos del candidato            │    │   │                     │  │
│  │ - Email sugerido                 │    │   │ [Atrás] [Siguiente] │  │
│  │ - Tareas + estados               │    │   └─────────────────────┘  │
│  │ - Acciones disponibles           │    │                             │
│  │ - Timeline de audit              │    │   Estado vacío si no hay   │
│  └──────────────────────────────────┘    │   caso con candidato       │
│                                          │   invitado.                 │
└──────────────────────────────────────────┴─────────────────────────────┘
```

Divisor central:
```
width: 1px
background: var(--border-default)
```

Sincronización:
- Cuando RRHH selecciona un caso en estado `candidate_invited` → el panel derecho muestra el formulario del candidato con ese token cargado
- Cuando el candidato hace submit en el panel derecho → el caso del panel izquierdo refresca a `candidate_submitted` con animación de highlight
- Toasts aparecen en la esquina inferior derecha de la pantalla completa, no de cada panel

Indicador visual del actor activo:
- Header de cada panel con tag pequeño: `[RRHH]` o `[CANDIDATO]` en `--brand-primary`
- Cuando una acción se ejecuta, el otro panel parpadea sutilmente

Modo móvil (no requerido para demo, pero documentar):
- En viewport < 1024px, los paneles se apilan verticalmente con un toggle para alternar entre ellos

---

## 12. Estados visuales clave

### Estado vacío (no hay casos)
```
Container centrado vertical
Icon grande (48px) con --text-tertiary
Título: "No hay casos de onboarding"
Subtítulo: "Crea un nuevo caso para comenzar"
Botón primario: "+ Nuevo caso"
```

### Loading state
```
Skeleton screens con --bg-elevated y shimmer animation
Duración del shimmer: 1.5s, infinite
Color del shimmer: gradient de var(--bg-elevated) a var(--bg-surface) y vuelta
```

### Error state
```
Icon: alert-circle, color --status-error, 32px
Mensaje en --text-primary
Descripción técnica en --text-tertiary debajo
Botón "Reintentar" como secondary
```

---

## 13. Reglas de accesibilidad

- Contraste mínimo entre texto y fondo: 4.5:1 para body, 3:1 para texto grande
- Todos los elementos interactivos con `:focus-visible` estilo: `outline: 2px solid var(--brand-primary); outline-offset: 2px;`
- Labels asociados a inputs vía `for` / `id`
- ARIA roles donde corresponda (alert para toasts, dialog para modales, status para badges de estado dinámico)
- Navegación por teclado funcional en formularios

---

## 14. Implementación en Tailwind

Configuración de `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#549dd6',
          'primary-hover': '#6bb5e8',
          'primary-active': '#3d85be',
          navy: '#101d30',
        },
        bg: {
          base: '#05080f',
          subtle: '#0c1120',
          surface: '#101d30',
          elevated: '#162240',
        },
        status: {
          success: '#22c55e',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#549dd6',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        glow: '0 0 0 3px rgba(84,157,214,0.22)',
      },
    },
  },
  plugins: [],
};
```

CSS global (`styles.css`):

```css
@import "tailwindcss";

:root {
  /* Brand */
  --brand-primary: #549dd6;
  --brand-primary-hover: #6bb5e8;
  --brand-primary-active: #3d85be;
  --brand-primary-subtle: rgba(84,157,214,0.10);
  --brand-primary-glow: rgba(84,157,214,0.22);
  --brand-navy: #101d30;

  /* Backgrounds */
  --bg-base: #05080f;
  --bg-subtle: #0c1120;
  --bg-surface: #101d30;
  --bg-elevated: #162240;
  --bg-overlay: rgba(5,8,15,0.88);

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.55);
  --text-tertiary: rgba(255,255,255,0.38);
  --text-disabled: rgba(255,255,255,0.22);
  --text-link: #6bb5e8;
  --text-error: #ef4444;
  --text-success: #22c55e;

  /* Borders */
  --border-subtle: rgba(255,255,255,0.05);
  --border-default: rgba(255,255,255,0.09);
  --border-strong: rgba(255,255,255,0.14);
  --border-focus: #549dd6;
  --border-error: #ef4444;
  --border-success: #22c55e;

  /* Status */
  --status-success: #22c55e;
  --status-error: #ef4444;
  --status-warning: #f59e0b;
  --status-info: #549dd6;

  --status-success-subtle: rgba(34,197,94,0.12);
  --status-error-subtle: rgba(239,68,68,0.12);
  --status-warning-subtle: rgba(245,158,11,0.12);
  --status-info-subtle: rgba(84,157,214,0.12);
}

html, body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Sora', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  margin: 0;
  padding: 0;
}

*, *::before, *::after {
  box-sizing: border-box;
}
```
