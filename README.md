# Zafirus Onboarding System

> Plataforma interna de Zafirus Technologies para automatizar el proceso de onboarding de colaboradores.

## 🎯 Qué es

Sistema que reemplaza el trabajo manual de RRHH en procesos de onboarding. Actualmente 4 personas realizan tareas repetitivas (perseguir candidatos por datos, crear emails manualmente, redactar bienvenidas, notificar a Administración, coordinar dispositivos). Con este sistema, ese trabajo se automatiza y RRHH solo maneja excepciones.

## 📋 Alcance

- **Pre-onboarding**: Solicitar CUIT y referencias al candidato
- **Alta en Gmail**: Google Workspace automático
- **Gestión de pagos**: CBU para Administración, W-8 para extranjeros, QR Binance para crypto
- **Comunicación**: Email de bienvenida + firma + kit de redes automático
- **Dispositivos**: Solicitud automática de equipos

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend (Demo) | React 18 + Vite + TypeScript + Tailwind CSS |
| Frontend (Prod) | Angular 17+ + Tailwind + Sora |
| Backend | NestJS 10+ + TypeORM + PostgreSQL 15 |
| Infraestructura | AWS (RDS, S3, ECS Fargate, ElastiCache Redis, EventBridge) |
| Queue | BullMQ + Redis |
| Integraciones | Google Workspace Admin SDK, Gmail API |

## 📁 Estructura del Proyecto

```
RH/
├── docs/
│   ├── specs/          # Especificaciones técnicas (fuente de verdad)
│   ├── guides/         # Guías de desarrollo y workflows
│   ├── decisions/      # Decisiones arquitectónicas (ADRs)
│   └── templates/      # Templates para documentos
├── openspec/           # Artefactos SDD (Spec-Driven Development)
├── .atl/               # Configuración de OpenCode/Skills
└── .gitignore
```

##  Quick Start

### Prerrequisitos

- Node.js 20+
- Git
- glab CLI (GitLab command line)

### Configuración inicial

```bash
# Clonar el repo
git clone git@gitlab.zafirus.tech:lpalombo/zafirus-rh.git
cd zafirus-rh

# Instalar dependencias (cuando haya código)
npm install

# Correr en desarrollo
npm run dev
```

## 📚 Documentación

| Documento | Propósito |
|---|---|
| [AGENTS_CONTEXT.md](docs/specs/AGENTS_CONTEXT.md) | Contexto base para agentes AI |
| [SPEC_INDEX.md](docs/specs/SPEC_INDEX.md) | Índice de todas las especificaciones |
| [GitLab Workflow](docs/guides/gitlab-workflow.md) | Cómo usar GitLab en este proyecto |
| [Development Setup](docs/guides/development-setup.md) | Configuración del entorno de desarrollo |

> **Nota**: La integración de CI con OpenCode está activa. Cada MR recibirá una revisión automática.

## 🔄 Flujo de Trabajo

1. **Issues**: Crear issue para cada tarea/bug/feature
2. **Branches**: `feature/*`, `fix/*`, `docs/*`, `chore/*`
3. **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`)
4. **Merge Requests**: Crear MR desde la rama hacia `main`
5. **Review**: Al menos 1 aprobación antes de mergear
6. **CI/CD**: Pipelines automáticos para tests y builds

## 👥 Equipo

- **Product**: Zafirus Technologies - RRHH
- **Development**: Equipo de desarrollo interno

##  Licencia

Propietario - Zafirus Technologies
