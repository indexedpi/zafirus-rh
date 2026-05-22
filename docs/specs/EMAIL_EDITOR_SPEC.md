> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# EMAIL_EDITOR_SPEC.md
# Editor de email de bienvenida — Especificación completa UX/UI

> Objetivo: editor de calidad Claude.ai / Notion, embebido en la tab "Email" del dashboard oscuro.
> El área de composición del email es modo claro (paper-white). El resto del dashboard sigue oscuro.
> Variables = pills fijos. Texto = libre. Shortcuts = estándar.

---

## 1. Layout de la tab "Email"

```
┌─────────────────────────────────────────────────────────────────┐
│ TAB: Email & Grupos                                             │
├────────────────────┬────────────────────────────────────────────┤
│                    │                                            │
│  SIDEBAR (240px)   │  EDITOR AREA                               │
│  dark bg           │  bg: white (light mode)                    │
│                    │                                            │
│  📧 Email          │  ┌─ TOOLBAR ──────────────────────────┐   │
│     corporativo    │  │ B  I  U  ─  • 🔗  @var  Preview   │   │
│  jlopez@...        │  │ [dark bg, border-bottom white/20]  │   │
│                    │  └────────────────────────────────────┘   │
│  👥 Grupos         │                                            │
│  engineering@      │  Subject: [input editable]                 │
│  argentina@        │  ─────────────────────────────────────    │
│  latam@            │                                            │
│  all@              │  [CONTENTEDITABLE AREA — white bg]         │
│                    │  ¡BIENVENIDA/O A ZAFIRUS!                 │
│  ✉️ Interno        │                                            │
│  Anuncio al equipo │  ¡[firstName pill], nos alegra...          │
│                    │  Tu fecha de ingreso: [startDate pill]     │
│                    │                                            │
│                    │  💻 Google Workspace                       │
│                    │  Usuario: [corporateEmail pill]            │
│                    │  ...                                       │
│                    │                                            │
│                    │  ┌─ FOOTER ACTIONS ──────────────────┐   │
│                    │  │ [Reset template]    [Aprobar ✓]   │   │
│                    │  └────────────────────────────────────┘   │
└────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Variable pills

Los pills reemplazan `{{variable}}` en el HTML. Son elementos `span` no editables:

```html
<span
  class="var-pill"
  data-variable="firstName"
  contenteditable="false"
  title="Nombre del empleado"
>
  Juan
</span>
```

**Comportamiento:**
- Click → selecciona el pill completo
- Backspace / Delete → borra el pill completo (no carácter a carácter)
- Drag → se puede reposicionar
- No se puede hacer doble-click para editar el valor
- Hover → tooltip con nombre de la variable y valor actual

**Visual del pill (light mode):**
```css
.var-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(84, 157, 214, 0.12);
  color: #1A6EFA;             /* azul claro sobre blanco */
  border: 1px solid rgba(84, 157, 214, 0.30);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Sora', sans-serif;
  cursor: default;
  user-select: none;
  white-space: nowrap;
  vertical-align: baseline;
  margin: 0 1px;
}

.var-pill::before {
  content: '⌀';
  font-size: 10px;
  opacity: 0.5;
  margin-right: 3px;
}
```

---

## 3. Variables del sistema

### Variables automáticas (resueltas por el store, RRHH no las configura)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `firstName` | Nombre del empleado | Juan |
| `lastName` | Apellido | Lopez |
| `fullName` | Nombre completo | Juan Lopez |
| `corporateEmail` | Gmail corporativo | jlopez@zafirus.tech |
| `temporaryPassword` | Contraseña temporal | Cambiar2026 (editable) |
| `startDate` | Fecha de ingreso corta | 20/05/2026 |
| `startDateFormatted` | Fecha larga | martes 20 de mayo |
| `role` | Rol del empleado | Backend Engineer |
| `team` | Equipo | Engineering |
| `candidateFormUrl` | Link del formulario | https://…/form/TOKEN |

### Variables de agenda (RRHH configura en el modal de creación)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `welcomeMeetingTime` | Horario onboarding RRHH | 19/05 - 9:30 hs |
| `welcomeMeetingLink` | Link Meet RRHH | https://meet.google.com/… |
| `managerName` | Nombre del manager | Ágata Fidani |
| `managerMeetingTime` | Horario reunión manager | 19/05 - 12:00 hs |
| `managerMeetingLink` | Link Meet manager | https://meet.google.com/… |
| `onboardingFolderUrl` | Drive onboarding | https://drive.google.com/… |
| `kitRedesUrl` | Drive Kit de Redes | https://drive.google.com/… |

---

## 4. Toolbar

```
[ B ] [ I ] [ U ]  |  [ — ]  |  [ • ]  [ 1. ]  |  [ 🔗 ]  |  [ @ ]  |  | Preview |  | Aprobar |
```

| Control | Keybind | Acción |
|---|---|---|
| **B** Bold | `Ctrl+B` | Negrita al texto seleccionado |
| _I_ Italic | `Ctrl+I` | Cursiva |
| U Underline | `Ctrl+U` | Subrayado |
| — Divider | — | Inserta `<hr>` |
| • Bullet | — | Lista no ordenada |
| 1. Numbered | — | Lista ordenada |
| 🔗 Link | `Ctrl+K` | Abre input para URL → crea anchor |
| **@** Variable | `@` en texto | Abre dropdown de variables |
| Preview | `Ctrl+P` | Alterna modo preview (pills → valores reales) |

### Variable dropdown (trigger: `@`)

Cuando el usuario escribe `@` en el editor:
1. Aparece dropdown de variables debajo del cursor
2. Lista filtrada en tiempo real con lo que escribe después del `@`
3. Teclado: `↑↓` para navegar, `Enter` para insertar, `Esc` para cerrar
4. Click también funciona

```
┌─────────────────────────────────┐
│  @ firstName     ⌀  Juan        │  ← hover highlight
│    lastName      ⌀  Lopez       │
│    corporateEmail ⌀  jlopez@... │
│    startDate     ⌀  20/05/2026  │
│    ─────────────────────────    │
│    welcomeMeetingTime  (vacío)  │ ← gris si sin valor
│    welcomeMeetingLink  (vacío)  │
│    kitRedesUrl         (vacío)  │
└─────────────────────────────────┘
```

Si la variable tiene valor vacío → se muestra en gris con warning icon.
RRHH no puede insertar variables vacías sin confirmar (muestra toast warning).

---

## 5. Modo preview

`Ctrl+P` o botón "Preview":

```
MODO EDITOR                      MODO PREVIEW
──────────                       ────────────
¡[firstName pill], bienvenido!   ¡Juan, bienvenido!
Email: [corporateEmail pill]     Email: jlopez@zafirus.tech
```

Preview renderiza el email como lo vería el destinatario.
En preview: no se puede editar. Botón cambia a "Editar".

---

## 6. Auto-save

- Cada cambio → debounce 500ms → guarda en store (`emailTemplate.bodyHtml`)
- Indicador top-right del editor: "Guardado ✓" → "Guardando..." → "Guardado ✓"
- `Ctrl+S` → save inmediato

---

## 7. Reset template

Botón "Reset template" (con confirm dialog):
→ Restaura el `bodyHtml` al DEFAULT_WELCOME_TEMPLATE (ver sección 9)
→ Re-inserta las variables de agenda del caso actual

---

## 8. Internal announcement (email secundario)

En el sidebar, debajo de los grupos, hay una sección "Anuncio interno".
Editor más pequeño (mismo componente, instancia separada).
Variables disponibles: subset (firstName, lastName, role, team, startDate, corporateEmail).
Se envía a all@zafirus.tech o al grupo que elija RRHH.

---

## 9. Template default (DEFAULT_WELCOME_TEMPLATE)

> Este es el HTML pre-cargado cuando se crea un caso.
> Las variables aparecen como pills al renderizar.
> El texto entre variables es editable libremente.

```
SUBJECT: ¡Bienvenida/o a Zafirus Technologies!

═══════════════════════════════════════
¡BIENVENIDA/O A ZAFIRUS TECHNOLOGIES!
═══════════════════════════════════════

¡{{firstName}}, nos alegra mucho que te sumes al equipo!

Tu fecha de ingreso es el: {{startDateFormatted}}

───────────────────────────────────────

💻 Google Workspace

Nuestra plataforma principal de trabajo es Google Workspace. A través de
ella gestionamos tareas y nos comunicamos como equipo, tanto por correo
electrónico como por chat y espacios compartidos para comunicaciones más
informales.

Los datos de acceso a tu cuenta son:

📩 Usuario: {{corporateEmail}}
🔐 Contraseña temporal: {{temporaryPassword}}

Tené en cuenta que el acceso a Workspace requiere doble autenticación, lo
que suma un nivel adicional de seguridad a tu cuenta. Debés cambiar la
contraseña en tu primer login.

───────────────────────────────────────

📂 Carpeta de onboarding

Te compartimos el acceso a nuestra carpeta de onboarding: {{onboardingFolderUrl}}
Ahí vas a encontrar:

• 📄 Documentos y políticas internas
• 🎥 Video de presentación institucional
• 🧑‍💻 Tutoriales y materiales de referencia
• 🎨 Fondos personalizados para Meet y LinkedIn
• 🧰 Otros recursos para acompañarte en tus primeros pasos

───────────────────────────────────────

🎨 Kit de Redes

Zafirus tiene nueva imagen. Te compartimos el Kit de Redes: {{kitRedesUrl}}

El kit incluye:
• Brandbook
• Banner para LinkedIn
• Fondo de pantalla para reuniones
• Tu nueva firma institucional

Te pedimos que configures la firma en Gmail con la imagen institucional y
la leyenda de confidencialidad obligatoria.

👉 Puntos importantes:
• La imagen debe insertarse desde el ícono de imagen de Gmail
  (no copiar y pegar).
• Usá la imagen en tamaño grande que te compartimos.
• Debajo de la imagen debe figurar la leyenda de confidencialidad.

───────────────────────────────────────

🗓️ Agenda — Onboardings

• {{welcomeMeetingTime}}: Onboarding virtual con el equipo de RRHH.
  Vamos a darte la bienvenida, contarte sobre la historia y la cultura de
  Zafirus, repasar temas administrativos y resolver cualquier duda.
  👉 {{welcomeMeetingLink}}

• {{managerMeetingTime}}: Primera reunión con tu responsable directo,
  {{managerName}}. Te contará sobre tus responsabilidades, cómo será el
  día a día y dónde encontrar herramientas y procesos clave para tu rol.
  👉 {{managerMeetingLink}}

Las invitaciones ya fueron enviadas a tu correo laboral y personal.
Por favor, confirmá asistencia y revisá tu Google Calendar.

───────────────────────────────────────

💻 Dispositivo

Te enviaremos un comodato para firmar, donde confirmarás que recibiste el
dispositivo en tiempo y forma y en correctas condiciones.

───────────────────────────────────────

📋 Información administrativa

Para completar tu proceso de ingreso, necesitamos algunos datos fiscales y
bancarios. Por favor, completá el formulario de onboarding:

👉 {{candidateFormUrl}}

Este formulario tiene un tiempo límite. Ante cualquier inconveniente,
contactá a RRHH.

───────────────────────────────────────

¡Te damos nuevamente la bienvenida y nos vemos muy pronto! 🙌

Saludos,
Equipo de RRHH
Zafirus Technologies
rrhh@zafirus.tech

───────────────────────────────────────

Confidencialidad: Este mensaje (incluyendo cualquier archivo anexo) es
privado y confidencial y va dirigido sólo al destinatario indicado,
pudiendo contener información de propiedad exclusiva de Zafirus
Technologies. Se prohíbe la copia, reproducción o divulgación total o
parcial de este mensaje sin autorización.
```

---

## 10. Implementación React (guía para el AI)

```tsx
// Componente principal
function EmailEditor({ caseId }: { caseId: string }) {
  const c = useCase(caseId);
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Resolver variables para preview
  const resolveVariables = (html: string): string => {
    const vars = buildVariableMap(c);
    return html.replace(/<span[^>]*data-variable="([^"]+)"[^>]*>.*?<\/span>/g,
      (_, key) => vars[key] ?? `[${key}]`
    );
  };

  // Insertar variable en posición del cursor
  const insertVariable = (varName: string) => {
    const pill = createPillElement(varName, resolveVariable(varName, c));
    insertAtCaret(editorRef.current!, pill);
    store.updateEmailTemplate(caseId, editorRef.current!.innerHTML);
  };

  // Keybinds
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); execCmd('bold'); }
      if (e.ctrlKey && e.key === 'i') { e.preventDefault(); execCmd('italic'); }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); execCmd('underline'); }
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); promptLink(); }
      if (e.ctrlKey && e.key === 'p') { e.preventDefault(); setIsPreview(p => !p); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); store.saveEmailTemplate(caseId); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-full">
      <EmailSidebar c={c} />
      <div className="flex-1 flex flex-col bg-white rounded-l-xl overflow-hidden">
        <EmailToolbar onInsertVariable={insertVariable} isPreview={isPreview} onTogglePreview={() => setIsPreview(p => !p)} />
        <div className="px-1 py-2 border-b border-gray-200">
          <input
            className="w-full text-[#101d30] text-sm font-medium px-3 py-1.5 outline-none"
            placeholder="Asunto del email..."
            value={c.emailTemplate?.subject ?? ''}
            onChange={e => store.updateEmailSubject(caseId, e.target.value)}
          />
        </div>
        {isPreview ? (
          <div
            className="flex-1 overflow-y-auto px-8 py-6 text-[#101d30] text-sm leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: resolveVariables(c.emailTemplate?.bodyHtml ?? '') }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="flex-1 overflow-y-auto px-8 py-6 text-[#101d30] text-sm leading-relaxed outline-none font-sans"
            style={{ fontFamily: 'Sora, system-ui, sans-serif' }}
            onInput={() => {
              store.updateEmailTemplate(caseId, editorRef.current!.innerHTML);
            }}
            onKeyDown={handleKeyDown}  // detecta @ para variable dropdown
          />
        )}
        <EmailFooter caseId={caseId} approved={c.emailTemplate?.approvedAt != null} />
      </div>
      <VariableDropdown onSelect={insertVariable} />
    </div>
  );
}
```

---

## 11. Colores light mode del editor (white area)

```css
/* El área blanca del editor vive dentro del dark dashboard */
.email-editor-area {
  background: #ffffff;
  color: #101d30;           /* navy para texto principal */
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  line-height: 1.7;
}

/* Toolbar (sobre el área blanca) */
.email-toolbar {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #101d30;
}

/* Botones de toolbar en hover */
.email-toolbar button:hover {
  background: rgba(84, 157, 214, 0.10);
  color: #1A6EFA;
}

/* Subject input */
.email-subject-input {
  background: #ffffff;
  color: #101d30;
  border-bottom: 1px solid #e5e7eb;
}

/* Divider del email */
.email-hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
}

/* Variables sin valor → warning */
.var-pill[data-empty="true"] {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: #d97706;
}
```
