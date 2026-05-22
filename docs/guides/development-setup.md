# Development Setup Guide

> Cómo configurar el entorno de desarrollo para el Zafirus Onboarding System.

##  Prerrequisitos

### Software requerido

| Herramienta | Versión | Instalación |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) o `scoop install nodejs` |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) o `scoop install git` |
| glab CLI | 1.99+ | `scoop install glab` |
| npm | 10+ | Viene con Node.js |

### Verificar instalación

```bash
node --version    # v20.x.x o superior
npm --version     # 10.x.x o superior
git --version     # git version 2.40.x o superior
glab --version    # glab version 1.99.0 o superior
```

##  Clonar el repositorio

```bash
# SSH (recomendado)
git clone git@gitlab.zafirus.tech:lpalombo/zafirus-rh.git
cd zafirus-rh

# HTTPS (si SSH no funciona)
git clone https://gitlab.zafirus.tech/lpalombo/zafirus-rh.git
cd zafirus-rh
```

##  Frontend (Demo)

### Instalar dependencias

```bash
npm install
```

### Correr en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

### Build para producción

```bash
npm run build
# Output en dist/
```

### Preview del build

```bash
npm run preview
# → http://localhost:4173
```

##  Backend (Futuro)

### Estructura esperada

```
backend/
├── src/
│   ├── modules/
│   │   ├── onboarding/
│   │   ├── google-workspace/
│   │   ├── devices/
│   │   └── administration/
│   ├── common/
│   ├── config/
│   └── main.ts
├── test/
├── package.json
└── tsconfig.json
```

### Instalar dependencias (cuando exista)

```bash
cd backend
npm install
```

### Correr en desarrollo

```bash
npm run start:dev
# → http://localhost:3000
```

##  Base de Datos

### PostgreSQL (local con Docker)

```bash
# Levantar PostgreSQL
docker run -d \
  --name zafirus-db \
  -e POSTGRES_USER=zafirus \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=zafirus_onboarding \
  -p 5432:5432 \
  postgres:15

# Conectar con psql
psql -h localhost -U zafirus -d zafirus_onboarding
```

### Redis (local con Docker)

```bash
# Levantar Redis
docker run -d \
  --name zafirus-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Docker Compose (todo junto)

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: zafirus
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: zafirus_onboarding
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

```bash
# Levantar todo
docker-compose up -d

# Parar todo
docker-compose down
```

##  Variables de Entorno

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000
VITE_GITLAB_URL=https://gitlab.zafirus.tech
```

### Backend (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=zafirus
DATABASE_PASSWORD=dev_password
DATABASE_NAME=zafirus_onboarding

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Google Workspace
GOOGLE_SA_EMAIL=service-account@zafirus-tech.iam.gserviceaccount.com
GOOGLE_SA_KEY_PATH=./secrets/google-sa.json
GOOGLE_DOMAIN=zafirus.tech

# SMTP (para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@zafirus.tech
SMTP_PASSWORD=app_password

# App
PORT=3000
NODE_ENV=development
```

##  Google Workspace Setup

### Service Account

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto o seleccionar existente
3. APIs & Services → Library → habilitar:
   - Admin SDK
   - Gmail API
4. IAM & Admin → Service Accounts → crear service account
5. Descargar JSON key
6. Guardar en `backend/secrets/google-sa.json` (NO commitear)

### Domain-wide Delegation

1. Google Admin Console → Security → Access and data control → API controls
2. Domain-wide delegation → Manage Domain Wide Delegation
3. Agregar Client ID del service account
4. Scopes necesarios:
   - `https://www.googleapis.com/auth/admin.directory.user`
   - `https://www.googleapis.com/auth/admin.directory.group`
   - `https://www.googleapis.com/auth/gmail.settings.sharing`
   - `https://www.googleapis.com/auth/gmail.send`

##  Testing

### Frontend

```bash
# Unit tests
npm run test

# Unit tests con coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests con UI
npm run test:e2e:ui
```

### Backend

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

##  Linting y Formateo

```bash
# Lint
npm run lint

# Lint con fix
npm run lint:fix

# Format
npm run format

# Type check
npm run type-check
```

##  Debugging

### VS Code (launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/main.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

##  Troubleshooting

### SSH no conecta

```bash
# Verificar clave
ssh -T git@gitlab.zafirus.tech

# Verificar agente
ssh-add -l

# Agregar clave manualmente
ssh-add ~/.ssh/id_ed25519
```

### node_modules con errores de permisos

```bash
# Windows: ejecutar como administrador
# O usar scoop para instalar Node.js
scoop install nodejs
```

### Puerto en uso

```bash
# Ver qué usa el puerto
netstat -ano | findstr :5173

# Matar proceso
taskkill /PID <PID> /F
```

### Docker no levanta

```bash
# Ver logs
docker logs zafirus-db
docker logs zafirus-redis

# Reiniciar contenedor
docker restart zafirus-db
```
