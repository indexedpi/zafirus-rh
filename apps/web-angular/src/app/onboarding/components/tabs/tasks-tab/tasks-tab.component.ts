import { Component, inject } from '@angular/core';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { OnboardingTask, TaskType, TASK_LABELS } from '../../../models/onboarding-case.model';

@Component({
  selector: 'app-tasks-tab',
  standalone: true,
  template: `
    @if (svc.selectedCase(); as c) {
      <div class="space-y-6">
        @if (c.tasks.length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <p class="text-sm text-[var(--text-tertiary)]">Las tareas se crean al activar el onboarding.</p>
          </div>
        } @else {
          <!-- Progress header -->
          <div class="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
            <div class="flex items-center gap-4">
              <div class="relative flex-shrink-0" style="width: 44px; height: 44px">
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-subtle)" stroke-width="3"/>
                  <circle cx="22" cy="22" r="18" fill="none"
                    [attr.stroke]="allDone() ? 'var(--status-success)' : 'var(--brand-primary)'"
                    stroke-width="3" stroke-linecap="round"
                    [attr.stroke-dasharray]="circumference"
                    [attr.stroke-dashoffset]="circumference - (percent() / 100) * circumference"
                    transform="rotate(-90 22 22)"
                    style="transition: stroke-dashoffset 300ms ease-out"/>
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                  [style.color]="allDone() ? 'var(--status-success)' : 'var(--brand-primary)'">
                  {{ percent() }}%
                </span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-[var(--text-primary)]">Progreso de activación</h3>
                <p class="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {{ completedCount() }} de {{ c.tasks.length }} tareas completadas
                  @if (failedCount() > 0) { · {{ failedCount() }} fallidas }
                </p>
              </div>
            </div>
          </div>

          <!-- Task list -->
          <div class="space-y-2">
            @for (task of c.tasks; track task.id) {
              <div class="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-4 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  @switch (task.status) {
                    @case ('success') {
                      <svg class="w-4 h-4 text-[var(--status-success)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    }
                    @case ('failed') {
                      <svg class="w-4 h-4 text-[var(--status-error)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    }
                    @case ('running') {
                      <svg class="w-4 h-4 text-[var(--status-info)] flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    }
                    @case ('skipped') {
                      <svg class="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                    }
                    @default {
                      <svg class="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>
                    }
                  }
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-[var(--text-primary)] truncate">{{ taskLabel(task) }}</p>
                    @if (task.lastError) {
                      <p class="text-xs text-[var(--status-error)] mt-0.5 truncate">{{ task.lastError }}</p>
                    }
                    <p class="text-[10px] text-[var(--text-tertiary)] mt-0.5">{{ statusLabel(task.status) }} · {{ ownerLabel(task.owner) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  @if (task.status === 'failed') {
                    <button (click)="svc.retryTask(c.id, task.id)" class="px-2.5 py-1 rounded text-[10px] font-bold uppercase text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] hover:opacity-80">Reintentar</button>
                    <button (click)="svc.skipTask(c.id, task.id)" class="px-2.5 py-1 rounded text-[10px] font-bold uppercase text-[var(--text-tertiary)] bg-[var(--bg-subtle)] hover:opacity-80">Omitir</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
export class TasksTabComponent {
  readonly svc = inject(OnboardingMockService);
  readonly circumference = 2 * Math.PI * 18;

  taskLabel(task: OnboardingTask): string {
    if (task.type === 'ANNOUNCE_IN_GROUPS' && task.metadata?.['groupName']) return `Anunciar en ${task.metadata['groupName']}`;
    return TASK_LABELS[task.type] || task.type;
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { pending: 'Pendiente', running: 'En curso', success: 'Completada', failed: 'Fallida', skipped: 'Omitida', manual_required: 'Requiere intervención' };
    return m[s] || s;
  }

  ownerLabel(o: string): string {
    const m: Record<string, string> = { system: 'Automático', it: 'IT', admin: 'Administración', rrhh: 'RRHH' };
    return m[o] || o;
  }

  percent(): number {
    const c = this.svc.selectedCase();
    if (!c || c.tasks.length === 0) return 0;
    return Math.round((this.completedCount() / c.tasks.length) * 100);
  }

  completedCount(): number {
    const c = this.svc.selectedCase();
    return c ? c.tasks.filter(t => t.status === 'success' || t.status === 'skipped').length : 0;
  }

  failedCount(): number {
    const c = this.svc.selectedCase();
    return c ? c.tasks.filter(t => t.status === 'failed').length : 0;
  }

  allDone(): boolean { return this.percent() === 100; }
}
