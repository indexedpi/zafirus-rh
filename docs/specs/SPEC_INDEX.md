> Legacy note: this file predates the Phase 7 design constitution. Current canonical design rules live in /DESIGN.md.

# SPEC_INDEX.md
# Índice de Especificaciones — Zafirus Onboarding System

> **Fuente de verdad para agentes.** Este índice cataloga todos los documentos del proyecto.
> Si un spec no está listado aquí, no existe formalmente.

---

## Catálogo de Specs

| # | Archivo | Estado | Versión | Última actualización | Propósito |
|---|---|---|---|---|---|
| 1 | `AGENTS_CONTEXT.md` | ✅ Activo | v1 | 2026-05-20 | Contexto base del proyecto — orientación para todos los agentes |
| 2 | `SPEC_INDEX.md` | ✅ Activo | v1 | 2026-05-20 | Este archivo — catálogo de todos los specs |
| 3 | `PHASE2_SCOPE.md` | ✅ Activo | v1 | Pendiente | Delta activo — qué cambia en Fase 2 vs demo aprobada |
| 4 | `EMAIL_EDITOR_SPEC.md` | ✅ Activo | v1 | Pendiente | Spec completa del editor WYSIWYG de bienvenida (pieza crítica) |
| 5 | `DEMO_SCOPE.md` | ✅ Activo | v2 | Pendiente | Scope completo del demo (Fase 1 + Fase 2 fusionadas) |
| 6 | `DATA_MODEL.md` | ✅ Activo | v2 | Pendiente | Entidades, TypeORM entities, índices de base de datos |
| 7 | `ARCHITECTURE.md` | ✅ Activo | v2 | Pendiente | Stack tecnológico, módulos NestJS, rutas Angular, infra AWS |
| 8 | `DESIGN_SYSTEM.md` | ✅ Activo | v2 | Pendiente | Tokens de diseño, componentes UI, layout del demo |
| 9 | `GROUPS_SUBSYSTEM.md` | ✅ Activo | v1 | Pendiente | Subsistema de grupos Google Workspace |

---

## Documentos Futuros (pendientes de creación)

| # | Archivo | Estado | Depende de | Propósito |
|---|---|---|---|---|
| 10 | `INTEGRATION_RESEARCH.md` | 🔲 Pendiente | TAREA 2 | Hallazgos de investigación de APIs (Google Workspace, Gmail, BullMQ, AWS) |
| 11 | `TEST_PLAN.md` | 🔲 Pendiente | TAREA 4 | Plan de testing — qué testear, cómo, con qué herramientas |
| 12 | `DEPLOYMENT.md` | 🔲 Pendiente | TAREA 3 | Guía de despliegue en AWS (ECS Fargate, RDS, ElastiCache) |
| 13 | `API_CONTRACTS.md` | 🔲 Pendiente | TAREA 6 | Contratos de la API interna de la empresa (fuera de scope actual) |

---

## Orden de Lectura Recomendado para Agentes

Cuando un agente nuevo entra al proyecto, leer en este orden:

1. **`AGENTS_CONTEXT.md`** — contexto general, restricciones, glosario
2. **`SPEC_INDEX.md`** — este archivo, para saber qué existe
3. **`DEMO_SCOPE.md`** — qué hace el sistema hoy (Fase 1)
4. **`PHASE2_SCOPE.md`** — qué cambia en Fase 2
5. **`DATA_MODEL.md`** — entidades y relaciones
6. **`ARCHITECTURE.md`** — stack y estructura técnica
7. **`EMAIL_EDITOR_SPEC.md`** — si trabaja en el editor de bienvenida
8. **`DESIGN_SYSTEM.md`** — si trabaja en UI/UX
9. **`GROUPS_SUBSYSTEM.md`** — si trabaja en grupos de Google Workspace

---

## Relación entre Specs

```
AGENTS_CONTEXT.md (contexto general)
    │
    ├── DEMO_SCOPE.md ──┐
    │                   ├── DATA_MODEL.md (entidades)
    │                   ├── ARCHITECTURE.md (stack)
    │                   └── DESIGN_SYSTEM.md (UI)
    │
    ├── PHASE2_SCOPE.md ──┐
    │                     ├── EMAIL_EDITOR_SPEC.md (pieza crítica)
    │                     └── GROUPS_SUBSYSTEM.md (grupos)
    │
    └── SPEC_INDEX.md (este archivo — catálogo)
```

---

## Historial de Versiones

| Fecha | Spec | Versión | Cambio |
|---|---|---|---|
| 2026-05-20 | `AGENTS_CONTEXT.md` | v1 | Creación inicial — contexto base completo |
| 2026-05-20 | `SPEC_INDEX.md` | v1 | Creación inicial — catálogo de specs |
| Pendiente | `PHASE2_SCOPE.md` | v1 | Pendiente de carga |
| Pendiente | `EMAIL_EDITOR_SPEC.md` | v1 | Pendiente de carga |
| Pendiente | `DEMO_SCOPE.md` | v2 | Pendiente de carga |
| Pendiente | `DATA_MODEL.md` | v2 | Pendiente de carga |
| Pendiente | `ARCHITECTURE.md` | v2 | Pendiente de carga |
| Pendiente | `DESIGN_SYSTEM.md` | v2 | Pendiente de carga |
| Pendiente | `GROUPS_SUBSYSTEM.md` | v1 | Pendiente de carga |
