# Guía de Presentación: Zafirus RH Onboarding

## 1. Propósito de la Demo
Demostrar el flujo end-to-end del sistema de onboarding de Zafirus, validando la experiencia del usuario (RRHH y candidato) antes de invertir en la integración de APIs y el desarrollo del backend.

## 2. Promesa del Producto
> **Reducir pasos omitidos, centralizar datos de alta y automatizar activación operativa.**

## 3. Rutas de Demostración
- **Modo Producto Normal**: `/` (Experiencia real de la aplicación, sin herramientas de prueba visibles).
- **Modo Presentación**: `/#demo` (Habilita el panel partido de RRHH/Candidato, el botón "Auto Demo" y las funciones de reseteo rápido de estado).

## 4. Script de Presentación (Paso a Paso)
1. **Listado de Casos**: Mostrar el panel principal con los casos existentes y sus estados operativos.
2. **Crear Caso**: Usar el modal para iniciar un nuevo caso cargando datos básicos y agenda inicial.
3. **Enviar Formulario**: Desde el panel de acciones, despachar el formulario al candidato.
4. **Portal del Candidato**: (Vía vista dividida en `#demo` o abriendo el enlace) Mostrar cómo el candidato completa DNI, referencias, métodos de cobro y carga archivos condicionales.
5. **Revisión de RRHH**: Volver al panel de RRHH y revisar los datos declarados en la pestaña "Datos".
6. **Consolidar**: Confirmar y consolidar la información fiscal y bancaria.
7. **Aprobar Email**: Revisar la pestaña "Email", verificar las variables dinámicas y aprobar la plantilla.
8. **Activar**: Confirmar el inicio de la activación operativa.
9. **Tareas**: Mostrar la pestaña "Tareas" ejecutando el flujo automatizado secuencial y condicional.
10. **Operativo**: Ver el caso finalizado y consultar el registro de la pestaña "Auditoría".

## 5. Qué es exclusivo de la Demo (Mock)
- Almacenamiento en memoria (Zustand), no hay persistencia.
- Automatizaciones de tareas simuladas con `setTimeout`.
- Carga de archivos falsa (solo registra metadatos locales).
- Tokens de candidato simulados y ruteo basado en hash.

## 6. Qué cambiará en Producción
- **Frontend**: Migración a Angular 17+ y nuestro sistema de diseño Sora.
- **Backend**: NestJS, TypeORM y base de datos PostgreSQL.
- **Infraestructura**: Despliegue en AWS (ECS Fargate, RDS, S3).
- **Integraciones**: Conexión real con Google Workspace Admin SDK (creación de usuarios/grupos) y APIs bancarias.

## 7. Limitaciones Conocidas
- Al recargar la página se reinician los datos si no hay un gestor de caché configurado en el navegador.
- El panel partido en móviles (375px) superpone la vista de RRHH y la del candidato en modo presentación.
