# GROUPS_SUBSYSTEM.md
# Subsistema de grupos de Google Workspace

> Cómo el sistema asigna grupos automáticamente al crear un Gmail, y cómo se envían los mensajes de bienvenida a cada grupo.

---

## 1. Modelo conceptual

Un grupo de Google Workspace es una dirección de email (`engineering@zafirus.tech`) que tiene miembros. Cuando se envía un mensaje a esa dirección, todos los miembros lo reciben.

En este sistema:
- Cada grupo tiene un **catálogo** (existe físicamente en Workspace)
- Cada grupo tiene **reglas de asignación** (cuándo un usuario nuevo debe sumarse)
- Cada grupo tiene un **mensaje de bienvenida personalizado** (qué dice el sistema cuando alguien se suma)

---

## 2. Catálogo de grupos (`email_groups`)

Tabla maestra con todos los grupos existentes en Zafirus.

```typescript
@Entity('email_groups')
export class EmailGroup {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) email: string;        // engineering@zafirus.tech
  @Column() displayName: string;                  // "Engineering"
  @Column({ nullable: true }) description?: string;

  @Column({
    type: 'enum',
    enum: ['team', 'country', 'role', 'cross', 'all'],
  })
  category: string;

  @Column({ default: true }) active: boolean;

  // Mensaje que se envía al grupo cuando un nuevo miembro se suma
  @Column({ nullable: true }) welcomeSubjectTemplate?: string;
  @Column({ nullable: true, type: 'text' }) welcomeBodyTemplate?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

Ejemplos de grupos típicos para Zafirus:

| Email | Categoría | Display |
|---|---|---|
| `all@zafirus.tech` | all | Todo el equipo |
| `engineering@zafirus.tech` | team | Engineering |
| `design@zafirus.tech` | team | Design |
| `product@zafirus.tech` | team | Product |
| `rrhh@zafirus.tech` | team | RRHH |
| `administration@zafirus.tech` | team | Administración |
| `argentina@zafirus.tech` | country | Argentina |
| `latam@zafirus.tech` | country | LATAM |
| `international@zafirus.tech` | country | Internacional |
| `contractors@zafirus.tech` | cross | Contractors |
| `leadership@zafirus.tech` | role | Leadership |

---

## 3. Reglas de asignación (`email_group_rules`)

Cada grupo puede tener una o más reglas que definen cuándo agregar a un usuario.

```typescript
@Entity('email_group_rules')
export class EmailGroupRule {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => EmailGroup) group: EmailGroup;

  @Column() name: string;                         // descripción humana de la regla

  @Column({ type: 'jsonb' })
  conditionJson: GroupRuleCondition;              // ver estructura abajo

  @Column({ default: 100 }) priority: number;     // si hay conflicto, mayor prioridad gana
  @Column({ default: true }) active: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

### Estructura de `conditionJson`

```typescript
type GroupRuleCondition = {
  operator: 'AND' | 'OR';
  conditions: Array<
    | { field: 'role'; operator: 'equals' | 'in'; value: string | string[] }
    | { field: 'team'; operator: 'equals' | 'in'; value: string | string[] }
    | { field: 'countryOfResidence'; operator: 'equals' | 'in'; value: string | string[] }
    | { field: 'paymentMethod'; operator: 'equals' | 'in'; value: string | string[] }
    | { field: 'contractType'; operator: 'equals' | 'in'; value: string | string[] }
    | { field: 'always'; operator: 'true'; value: true }
  >;
};
```

### Ejemplos de reglas

**Regla "Todos van a all@"**
```json
{
  "operator": "AND",
  "conditions": [
    { "field": "always", "operator": "true", "value": true }
  ]
}
```

**Regla "Engineering va a engineering@"**
```json
{
  "operator": "AND",
  "conditions": [
    { "field": "team", "operator": "equals", "value": "engineering" }
  ]
}
```

**Regla "Residentes en Argentina van a argentina@ y a latam@"**
Una regla para cada grupo (`argentina@` y `latam@`):
```json
{
  "operator": "AND",
  "conditions": [
    { "field": "countryOfResidence", "operator": "equals", "value": "AR" }
  ]
}
```

**Regla "Países LATAM van a latam@"**
```json
{
  "operator": "AND",
  "conditions": [
    { "field": "countryOfResidence", "operator": "in", "value": ["AR", "BR", "CL", "CO", "PE", "UY", "VE", "EC", "BO", "PY"] }
  ]
}
```

**Regla "Quien cobra por crypto o W-8 va a contractors@"**
```json
{
  "operator": "OR",
  "conditions": [
    { "field": "paymentMethod", "operator": "equals", "value": "CRYPTO" },
    { "field": "paymentMethod", "operator": "equals", "value": "WIRE" }
  ]
}
```

---

## 4. Evaluador de reglas

`GroupRulesEvaluatorService` recibe el contexto del caso y devuelve la lista de grupos a los que el nuevo usuario debe sumarse.

```typescript
type CaseContext = {
  role: string;
  team: string;
  countryOfResidence: string;
  paymentMethod: 'CBU' | 'WIRE' | 'CRYPTO';
  contractType?: 'employee' | 'contractor';
};

interface GroupRulesEvaluatorService {
  evaluate(context: CaseContext): Promise<EmailGroup[]>;
}
```

Algoritmo:
```
1. Cargar todas las reglas activas
2. Para cada regla, evaluar condition contra context
3. Si evalúa true, marcar el grupo asociado
4. Deduplicar grupos
5. Retornar lista final
```

Implementación de la evaluación de condiciones:
- `AND`: todas las conditions deben pasar
- `OR`: al menos una condition debe pasar
- `equals`: comparación estricta de strings
- `in`: el valor del contexto está en el array
- `always`: siempre pasa

---

## 5. Membresías ejecutadas (`group_memberships`)

Cuando el sistema efectivamente agrega al usuario al grupo en Google Workspace, registra la membresía:

```typescript
@Entity('group_memberships')
export class GroupMembership {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Employee) employee: Employee;
  @ManyToOne(() => EmailGroup) group: EmailGroup;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'failed', 'removed'],
    default: 'pending',
  })
  status: string;

  @Column({ nullable: true }) externalMemberId?: string;   // ID que devuelve Google
  @Column({ nullable: true, type: 'timestamp' }) addedAt?: Date;
  @Column({ nullable: true, type: 'timestamp' }) removedAt?: Date;
  @Column({ nullable: true }) addedBy?: string;            // userId o 'system'

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

## 6. Flujo de welcomes a grupos

Cuando el worker termina de agregar al usuario a sus grupos, ejecuta una segunda fase: anunciar al usuario en cada grupo.

```
Worker ADD_GOOGLE_GROUPS termina
        ↓
Para cada grupo donde se sumó el usuario:
        ↓
   ¿El grupo tiene welcomeBodyTemplate?
        │
        ├── Sí → renderizar template con variables del caso
        │        → enviar email FROM system@zafirus.tech TO group@zafirus.tech
        │        → registrar AutomationRun con provider='groups', action='announceJoin'
        │
        └── No → skip (no se anuncia en grupos que no tienen template)
```

### Variables disponibles en templates de bienvenida a grupo

```
{{firstName}}            "Juan"
{{lastName}}             "Lopez"
{{fullName}}             "Juan Lopez"
{{corporateEmail}}       "jlopez@zafirus.tech"
{{role}}                 "Backend Engineer"
{{team}}                 "Engineering"
{{countryOfResidence}}   "Argentina"
{{startDate}}            "20 de noviembre"
{{groupDisplayName}}     "Engineering"  (display name del grupo destino)
```

### Ejemplos de templates

**Template para `engineering@`:**
```
Subject: Damos la bienvenida a {{firstName}} {{lastName}} al equipo de {{groupDisplayName}}

Hola equipo,

Se suma {{firstName}} {{lastName}} como {{role}} a partir del {{startDate}}.

Pueden contactarlo en {{corporateEmail}}.

¡Bienvenida/o!
RRHH Zafirus
```

**Template para `argentina@`:**
```
Subject: Nuevo miembro en Argentina: {{firstName}} {{lastName}}

Hola,

Le damos la bienvenida a {{firstName}} {{lastName}}, que se suma al equipo de {{team}} desde Argentina a partir del {{startDate}}.

Email: {{corporateEmail}}

Bienvenido/a a Zafirus.
```

**Template para `all@`:**
```
Subject: Bienvenida/o {{firstName}} {{lastName}}

Hola a todos,

Tenemos el gusto de anunciarles que {{firstName}} {{lastName}} se suma a Zafirus como {{role}} en el equipo de {{team}}, desde {{countryOfResidence}}, a partir del {{startDate}}.

Pueden saludarlo/a en {{corporateEmail}}.

¡Bienvenida/o al equipo!
```

---

## 7. APIs de Google Workspace utilizadas

### 7.1 Crear usuario
```
POST https://admin.googleapis.com/admin/directory/v1/users
```
Body:
```json
{
  "primaryEmail": "jlopez@zafirus.tech",
  "name": { "givenName": "Juan", "familyName": "Lopez" },
  "password": "<temporary_random>",
  "changePasswordAtNextLogin": true
}
```

### 7.2 Verificar disponibilidad de email
```
GET https://admin.googleapis.com/admin/directory/v1/users/jlopez@zafirus.tech
```
- 200 → email ya existe → conflicto
- 404 → email disponible

### 7.3 Agregar usuario a grupo
```
POST https://admin.googleapis.com/admin/directory/v1/groups/{groupKey}/members
```
Body:
```json
{
  "email": "jlopez@zafirus.tech",
  "role": "MEMBER"
}
```

### 7.4 Configurar firma de email
```
PUT https://gmail.googleapis.com/gmail/v1/users/jlopez@zafirus.tech/settings/sendAs/jlopez@zafirus.tech
```
Body:
```json
{
  "signature": "<html>...</html>"
}
```

Requiere delegación domain-wide para que la API key del sistema pueda actuar en nombre del usuario recién creado.

### 7.5 Enviar email desde el sistema
```
POST https://gmail.googleapis.com/gmail/v1/users/system@zafirus.tech/messages/send
```
Body: mensaje en formato RFC 2822 codificado en base64url.

---

## 8. Scopes necesarios para la integración

```
https://www.googleapis.com/auth/admin.directory.user           Crear/leer usuarios
https://www.googleapis.com/auth/admin.directory.group          Leer grupos
https://www.googleapis.com/auth/admin.directory.group.member   Agregar miembros
https://www.googleapis.com/auth/gmail.settings.sharing         Configurar firmas
https://www.googleapis.com/auth/gmail.send                     Enviar emails desde system@
```

Configuración:
- Service Account en Google Cloud Console
- Domain-wide delegation habilitada en Workspace Admin Console
- Credenciales en AWS Secrets Manager (`zafirus/google-workspace-sa-key`)

---

## 9. Settings UI (pantalla futura, no en demo)

`/settings/groups`:
- Lista del catálogo de grupos
- Por cada grupo: editar display name, editar templates de bienvenida, ver miembros actuales
- Botón "Sincronizar con Workspace" para refrescar el catálogo

`/settings/group-rules`:
- Lista de reglas activas
- Editor visual de condiciones (dropdowns de field/operator/value)
- Vista previa: "Si un nuevo caso tiene rol X, team Y, país Z → se sumaría a estos grupos: [...]"

En demo: grupos y reglas se cargan via seed, no hay UI de edición.

---

## 10. Seed inicial para el demo

```typescript
// Grupos
const SEED_GROUPS = [
  { email: 'all@zafirus.tech', displayName: 'Todo el equipo', category: 'all' },
  { email: 'engineering@zafirus.tech', displayName: 'Engineering', category: 'team' },
  { email: 'design@zafirus.tech', displayName: 'Design', category: 'team' },
  { email: 'product@zafirus.tech', displayName: 'Product', category: 'team' },
  { email: 'rrhh@zafirus.tech', displayName: 'RRHH', category: 'team' },
  { email: 'argentina@zafirus.tech', displayName: 'Argentina', category: 'country' },
  { email: 'latam@zafirus.tech', displayName: 'LATAM', category: 'country' },
  { email: 'international@zafirus.tech', displayName: 'Internacional', category: 'country' },
  { email: 'contractors@zafirus.tech', displayName: 'Contractors', category: 'cross' },
];

// Reglas (resumen)
// → all@      : always
// → team@     : team === <team_del_caso>
// → argentina@: countryOfResidence === 'AR'
// → latam@    : countryOfResidence in [AR, BR, CL, CO, PE, UY, VE, EC, BO, PY]
// → international@: countryOfResidence not in latam list
// → contractors@: paymentMethod in [CRYPTO, WIRE]
```
