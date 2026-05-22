import { useStore } from '../../../store';
import { User, Briefcase, MapPin, Calendar, Mail } from 'lucide-react';
import { COUNTRIES, TEAMS, CONTRACT_TYPES } from '../../../types';
import { cn } from '../../../utils/cn';

const ACTION_LABELS: Record<string, string> = {
  case_created: 'Caso creado',
  candidate_form_sent: 'Formulario enviado al candidato',
  candidate_form_submitted: 'Candidato completó formulario',
  review_started: 'Revisión RRHH iniciada',
  correction_requested: 'Corrección solicitada',
  case_approved: 'Caso aprobado',
  case_activated: 'Caso activado',
  case_blocked: 'Caso bloqueado',
  case_unblocked: 'Caso desbloqueado',
  case_cancelled: 'Caso cancelado',
  case_operative: 'Onboarding completado',
  task_completed: 'Tarea completada',
  task_failed: 'Tarea fallida',
  task_skipped: 'Tarea omitida',
  email_approved: 'Email aprobado',
  candidate_data_consolidated: 'Datos del candidato consolidados',
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return new Date(timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export function OverviewTab() {
  const selectedCase = useStore(state => state.getSelectedCase());
  if (!selectedCase) return null;

  const { employee, auditLog } = selectedCase;
  const country = COUNTRIES.find(c => c.code === employee.countryId);
  const team = TEAMS.find(t => t.value === employee.team);
  const contractType = CONTRACT_TYPES.find(c => c.value === employee.contractType);

  const sortedEvents = [...auditLog].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-subtle)] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Empleado</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {employee.name} {employee.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-subtle)] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Rol</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{employee.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-subtle)] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Ubicación</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {employee.cityId}, {country?.name || employee.countryId}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-subtle)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Fecha de ingreso</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {new Date(employee.startDate).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Detalles</h3>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Email personal</span>
            <span className="text-sm text-[var(--text-primary)]">{employee.email}</span>
          </div>
          {employee.corporateEmail && (
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Email corporativo</span>
              <span className="text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[var(--brand-primary)]" />
                {employee.corporateEmail}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Equipo</span>
            <span className="text-sm text-[var(--text-primary)]">{team?.label || employee.team}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Tipo de contrato</span>
            <span className="text-sm text-[var(--text-primary)]">{contractType?.label || employee.contractType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Manager</span>
            <span className="text-sm text-[var(--text-primary)]">{employee.managerName}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
          Actividad del caso
        </h3>
        <div className="relative pl-6">
          {sortedEvents.map((event, i, arr) => (
            <div key={event.id} className="relative pb-5 last:pb-0">
              {/* Línea vertical: solo entre dots */}
              {i < arr.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bg-[var(--border-default)]"
                  style={{ left: '-19.5px', top: '13px', bottom: '-4px', width: '1px' }}
                />
              )}

              {/* Dot centrado */}
              <div
                className="absolute z-10 rounded-full border-2 border-[var(--brand-primary)] bg-[var(--bg-base)]"
                style={{ left: '-24px', top: '3px', width: '10px', height: '10px' }}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {ACTION_LABELS[event.action] || event.action}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide',
                      event.actorType === 'user' && 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]',
                      event.actorType === 'system' && 'bg-[var(--status-success-subtle)] text-[var(--status-success)]',
                      event.actorType === 'integration' && 'bg-[var(--status-info-subtle)] text-[var(--status-info)]',
                    )}>
                      {event.actorType === 'user' ? 'RRHH' : event.actorType === 'system' ? 'Sistema' : 'Integración'}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {sortedEvents.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)]">Sin actividad registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}
