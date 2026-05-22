# Guía de Presentación: Zafirus RH Onboarding

## 1. Pitch de apertura
> **Zafirus RH centraliza el alta operativa para reducir pasos omitidos, ordenar datos y automatizar tareas de activación.**

Una sola superficie reemplaza tickets dispersos, planillas y mensajes sueltos durante el alta de un colaborador.

## 2. Rutas de demostración
- **Modo producto normal**: `/` — experiencia real, sin herramientas de presentación visibles.
- **Modo presentación**: `/#demo` — habilita el panel partido RRHH / Candidato, el botón **Auto Demo** y **Reiniciar**.

## 3. Camino de demostración (paso a paso)
1. **Crear caso** — desde la lista, abrir el modal y cargar los datos básicos del nuevo colaborador.
2. **Enviar formulario** — desde la barra inferior de acciones, despachar el formulario al candidato.
3. **Intake del candidato** — abrir el formulario del candidato (panel derecho en modo `#demo`) y completar identificación fiscal, datos de cobro, referencias y archivos condicionales.
4. **Enviar formulario** — el candidato confirma y vuelve el caso al panel de RRHH.
5. **Revisar datos** — pestaña **Datos**, validar todo lo declarado por el candidato.
6. **Consolidar datos** — confirmar CBU/CUIT y marcar los datos como consolidados.
7. **Aprobar caso** — en la barra de acciones, aprobar para liberar la activación.
8. **Activar onboarding** — disparar la activación; las tareas operativas comienzan a ejecutarse.
9. **Inspeccionar tareas** — pestaña **Tareas**, observar el avance, los reintentos y la evidencia simulada.
10. **Llegar a operativo** — el caso queda **Operativo** y aparece el overlay de confirmación.
11. **Inspeccionar auditoría** — pestaña **Auditoría** (o el atajo "Ver auditoría completa" en Resumen) para revisar la traza cronológica.

## 4. Qué es real en este demo
- Flujo end-to-end del frontend.
- Validaciones en cada paso (intake, revisión, activación).
- Simulación realista de tareas de activación con estados pending/running/success/failed/skipped.
- Registro de auditoría cronológico con filtros y redacción de datos sensibles.
- Vista previa del email de bienvenida con la identidad visual de Zafirus.

## 5. Qué está mockeado
- Persistencia en memoria (Zustand) — al recargar se pierden los datos a menos que se haya hecho seed.
- Carga de archivos (solo metadatos locales, no hay upload real).
- Automatizaciones (`setTimeout` simulado, sin Google Workspace ni Admin SDK reales).
- Envío de emails (solo preview, no se envía nada).
- Tokens del candidato y ruteo por hash.

## 6. Próximos pasos hacia producción
- Migración del frontend a Angular 17+ y al design system Sora.
- Backend en NestJS con TypeORM y PostgreSQL.
- Infraestructura sobre AWS (ECS Fargate, RDS, S3).
- Integración real con Google Workspace Admin SDK (creación de usuarios, grupos, firma).
- Carga real de archivos con storage y validaciones de seguridad.
- Notificaciones reales por email y enlaces de candidato con expiración firmada.

## 7. Limitaciones conocidas para el demo
- Al recargar la página se reinicia el estado salvo que se vuelva a sembrar el demo (`Reiniciar` en modo `#demo`).
- A 375 px el panel partido en modo `#demo` se vuelve un solo panel con interruptor RRHH / Candidato.
- Algunos detalles de auditoría se muestran como **"Dato sensible oculto"**: es intencional; en producción se exponen vía permisos.
