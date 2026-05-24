# Contributing Guide

> Cómo contribuir al Zafirus Onboarding System.

## 🎯 Filosofía

- **Specs primero**: Todo cambio empieza con una especificación clara
- **Tests obligatorios**: No se mergea código sin tests
- **Review obligatorio**: Al menos 1 aprobación antes de mergear
- **Commits atómicos**: Cada commit debe ser una unidad de trabajo completa
- **Documentación viva**: Los specs se actualizan con el código

##  Antes de empezar

1. **Revisar issues abiertos**: Ver si alguien ya está trabajando en lo que querés hacer
2. **Crear un issue**: Si no existe, crear uno describiendo el problema o feature
3. **Discutir la solución**: Comentar en el issue la propuesta de solución
4. **Asignarse el issue**: Para evitar trabajo duplicado

## 🔄 Flujo de contribución

### 1. Fork y clone (si es externo)

```bash
# Fork desde la web de GitLab
# Luego clonar tu fork
git clone git@gitlab.zafirus.tech:tu-usuario/zafirus-rh.git
cd zafirus-rh

# Agregar remote upstream
git remote add upstream git@gitlab.zafirus.tech:lpalombo/zafirus-rh.git
```

### 2. Crear rama

```bash
# Desde main actualizado
git checkout main
git pull upstream main

# Crear rama
git checkout -b feature/tu-feature
```

### 3. Desarrollar

```bash
# Hacer cambios
# Commitear con mensajes claros
git add .
git commit -m "feat: add tu feature"

# Pushear
git push -u origin feature/tu-feature
```

### 4. Crear Merge Request

```bash
# Desde terminal
glab mr create --title "feat: add tu feature" --assignee @me

# O desde la web
# gitlab.zafirus.tech → Merge Requests → New MR
```

### 5. Review y merge

- Esperar aprobación
- Resolver comentarios si los hay
- Squash and merge (un solo commit en main)

## 📝 Convenciones de código

### Estilo

- **Idioma del código**: Inglés (variables, funciones, comentarios técnicos)
- **Idioma de la UI**: Español (labels, placeholders, mensajes)
- **Nombrado**: camelCase para variables/funciones, PascalCase para componentes
- **CSS**: Tailwind classes primero, CSS variables para tokens de diseño

### Commits

Ver [GitLab Workflow Guide](docs/guides/gitlab-workflow.md#-commits) para detalles.

### Estructura de archivos

```
src/
├── components/
│   ├── ui/             # Generic UI primitives (Button, Input, Modal, Toast…)
│   ├── rrhh/           # RRHH panel — CaseList, CaseDetail, tabs, actions
│   ├── candidate/      # Candidate intake wizard
│   └── layout/         # TopBar, AuditDrawer
├── lib/                # External integrations (Supabase persistence)
├── store.ts            # Zustand global store — DO NOT MODIFY
├── types.ts            # Product type contracts — DO NOT MODIFY
└── utils/              # Helpers (cn, etc.)
```

## 🧪 Testing

No automated test suite yet. QA is done manually against [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md).

Before merging, run the build to confirm there are no type errors or bundle failures:

```bash
npm run build
```

## 📚 Documentación

### Actualizar docs

- **README.md**: Si cambia la estructura del proyecto o setup
- **Guides**: Si cambia el workflow o setup
- **Specs**: Si cambia el comportamiento del sistema
- **ADRs**: Si se toma una decisión arquitectónica importante

### Spec-Driven Development

Todo cambio significativo sigue el flujo SDD:

1. **Exploración**: Investigar el problema y posibles soluciones
2. **Propuesta**: Definir intent, scope y approach
3. **Spec**: Escribir requisitos y escenarios detallados
4. **Design**: Definir arquitectura y estructura técnica
5. **Tasks**: Break down en tareas implementables
6. **Apply**: Implementar las tareas
7. **Verify**: Validar contra specs
8. **Archive**: Cerrar el cambio

Ver `openspec/` para artefactos SDD.

##  Reportar bugs

### Template de bug

```markdown
## Descripción
[Descripción clara del bug]

## Pasos para reproducir
1. Ir a '...'
2. Click en '...'
3. Ver error

## Comportamiento esperado
[Qué debería pasar]

## Comportamiento actual
[Qué pasa realmente]

## Environment
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [x.x.x]

## Screenshots/Logs
[Adjuntar si aplica]
```

##  Proponer features

### Template de feature

```markdown
## Problema
[Qué problema resuelve esta feature]

## Propuesta
[Cómo se resolvería]

## Alternativas consideradas
[Otras opciones y por qué se descartaron]

## Impacto
- [ ] Cambia la UI
- [ ] Cambia la API
- [ ] Cambia la base de datos
- [ ] Requiere migración
- [ ] Breaking change

## Effort estimado
[Pequeño/Mediano/Grande]
```

## 🔐 Seguridad

- **Nunca commitear**: Secrets, passwords, API keys, tokens
- **Usar .env**: Para variables de entorno locales
- **Secrets Manager**: Para secrets en producción (AWS Secrets Manager)
- **Review de seguridad**: Obligatorio para cambios que tocan autenticación o datos sensibles

##  Métricas de calidad

| Métrica | Target |
|---|---|
| Coverage | > 80% |
| Linting | 0 errores, 0 warnings |
| Type errors | 0 |
| Build time | < 30s |
| Test time | < 2min |
| Bundle size | < 800KB (single-file HTML) |

## 🤝 Code of Conduct

- **Respeto**: Tratar a todos con respeto
- **Constructivo**: Feedback constructivo y específico
- **Inclusivo**: Lenguaje inclusivo y acogedor
- **Profesional**: Mantener profesionalismo en todas las interacciones

## 📞 Contacto

- **Issues**: Para bugs y features
- **Merge Requests**: Para discusiones de código
- **Email**: Para temas sensibles o privados

---

Gracias por contribuir al Zafirus Onboarding System! 🚀
