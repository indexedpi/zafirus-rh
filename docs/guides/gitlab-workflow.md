# GitLab Workflow Guide

> Cómo usar GitLab para el desarrollo del Zafirus Onboarding System.

##  Autenticación

### SSH (recomendado)

La clave SSH ya está configurada. Verificar conexión:

```bash
ssh -T git@gitlab.zafirus.tech
# Debería mostrar: Welcome to GitLab, @tu-usuario!
```

### Token de API (para glab CLI)

Para operaciones avanzadas con `glab` (crear MRs, issues, etc.):

```bash
glab auth login --hostname gitlab.zafirus.tech
# Seguir las instrucciones para pegar el token
```

Obtener token en: **gitlab.zafirus.tech → Settings → Access Tokens**
Scopes necesarios: `api`, `read_user`, `write_repository`

## 🌿 Ramas

### Convención de nombres

```
main              → Producción (protegida)
├── feature/*     → Nuevas funcionalidades
├── fix/*         → Corrección de bugs
├── docs/*        → Documentación
├── chore/*       → Mantenimiento, deps, configs
└── release/*     → Preparación de releases
```

### Ejemplos

```bash
# Feature
git checkout -b feature/email-editor
git checkout -b feature/candidate-wizard

# Fix
git checkout -b fix/cbu-validation
git checkout -b fix/email-naming-accents

# Docs
git checkout -b docs/gitlab-workflow
git checkout -b docs/architecture-update

# Chore
git checkout -b chore/update-dependencies
git checkout -b chore/setup-ci-pipeline
```

##  Commits

### Conventional Commits

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos

| Tipo | Cuándo usar | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad | `feat: add email editor component` |
| `fix` | Corrección de bug | `fix: resolve CBU validation error` |
| `docs` | Documentación | `docs: update GitLab workflow guide` |
| `style` | Formato, sin cambio lógico | `style: format code with prettier` |
| `refactor` | Refactorización | `refactor: extract email naming logic` |
| `test` | Tests | `test: add email naming unit tests` |
| `chore` | Mantenimiento | `chore: update dependencies` |

### Ejemplos completos

```bash
git commit -m "feat: add WYSIWYG email editor with variable pills"

git commit -m "fix: resolve email naming collision for duplicate surnames"

git commit -m "docs: add architecture decision record for Google Workspace adapter"

git commit -m "test: add unit tests for CBU validation (22 digits)"
```

## 🔄 Merge Requests

### Crear un MR

```bash
# Desde la terminal con glab
glab mr create --title "feat: add email editor" --assignee @me --label "feature"

# O desde la web
# 1. Pushear la rama: git push -u origin feature/email-editor
# 2. Ir a gitlab.zafirus.tech → Merge Requests → New MR
# 3. Seleccionar rama source y target (main)
```

### Template de MR

```markdown
## Descripción
[Qué hace este MR y por qué]

## Cambios
- [ ] Cambio 1
- [ ] Cambio 2

## Testing
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Probado manualmente en [entorno]

## Screenshots (si aplica)
[Capturas de pantalla]

## Checklist
- [ ] Código sigue convenciones del proyecto
- [ ] Documentación actualizada
- [ ] No hay console.logs ni código muerto
```

### Review de MRs

```bash
# Ver MRs abiertos
glab mr list

# Ver un MR específico
glab mr view 123

# Checkout de un MR para review local
glab mr checkout 123

# Aprobar un MR
glab mr approve 123

# Comentar en un MR
glab mr note 123 "LGTM, solo un comentario menor en línea 45"
```

## ️ Labels

| Label | Color | Uso |
|---|---|---|
| `feature` | Verde | Nuevas funcionalidades |
| `bug` | Rojo | Corrección de errores |
| `documentation` | Azul | Cambios en docs |
| `enhancement` | Púrpura | Mejoras a funcionalidades existentes |
| `wip` | Amarillo | Work in progress |
| `ready-for-review` | Cyan | Listo para revisión |
| `blocked` | Naranja | Bloqueado por dependencia externa |
| `priority:high` | Rojo oscuro | Alta prioridad |
| `priority:medium` | Amarillo oscuro | Media prioridad |
| `priority:low` | Gris | Baja prioridad |

## 📋 Issues

### Crear un issue

```bash
# Desde terminal
glab issue create --title "Bug: CBU validation fails for some banks" --label "bug" "priority:high"

# Desde web
# gitlab.zafirus.tech → Issues → New Issue
```

### Template de Issue

```markdown
## Descripción
[Descripción clara del problema o feature]

## Pasos para reproducir (si es bug)
1. Ir a '...'
2. Click en '...'
3. Ver error

## Comportamiento esperado
[Qué debería pasar]

## Comportamiento actual
[Qué pasa realmente]

## Contexto adicional
[Screenshots, logs, etc.]
```

### Flujo de Issues

```
Open → In Progress → Review → Done
         ↑              ↓
         └── Blocked ←──┘
```

##  CI/CD Pipelines

### Ver pipelines

```bash
# Listar pipelines
glab pipeline list

# Ver pipeline específico
glab pipeline view 456

# Ver jobs de un pipeline
glab pipeline job list 456
```

### Stages típicos

```yaml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  script:
    - npm run lint

test:
  stage: test
  script:
    - npm run test

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
```

## 🔧 Comandos útiles de glab

```bash
# Autenticación
glab auth login
glab auth status

# Issues
glab issue list
glab issue create
glab issue view <id>
glab issue close <id>

# Merge Requests
glab mr list
glab mr create
glab mr view <id>
glab mr checkout <id>
glab mr merge <id>

# Pipelines
glab pipeline list
glab pipeline view <id>
glab pipeline retry <id>

# Repo
glab repo view
glab repo clone <path>
```

## 🚫 Reglas de la rama main

- **Protegida**: Solo se puede mergear vía MR
- **Require approval**: Al menos 1 aprobación
- **Require CI**: Pipeline debe pasar
- **No force push**: Está deshabilitado
- **No delete**: Está deshabilitado

##  Métricas

- **Lead time**: Tiempo desde issue creado hasta merge
- **Cycle time**: Tiempo desde inicio de desarrollo hasta merge
- **Deploy frequency**: Cuántas veces se despliega a producción
- **Change failure rate**: Porcentaje de deploys que causan incidentes
