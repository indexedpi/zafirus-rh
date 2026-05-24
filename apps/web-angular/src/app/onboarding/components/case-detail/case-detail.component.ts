import { Component, inject, signal } from '@angular/core';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { CaseActionsComponent } from '../case-actions/case-actions.component';
import { OverviewTabComponent } from '../tabs/overview-tab/overview-tab.component';
import { DataTabComponent } from '../tabs/data-tab/data-tab.component';
import { EmailTabComponent } from '../tabs/email-tab/email-tab.component';
import { TasksTabComponent } from '../tabs/tasks-tab/tasks-tab.component';
import { AuditTabComponent } from '../tabs/audit-tab/audit-tab.component';

const TABS = [
  { id: 'overview', label: 'Resumen',    icon: 'file-text' },
  { id: 'data',     label: 'Datos',      icon: 'database' },
  { id: 'email',    label: 'Email',      icon: 'mail' },
  { id: 'tasks',    label: 'Tareas',     icon: 'check-square' },
  { id: 'audit',    label: 'Auditoría',  icon: 'clock' },
];

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CaseActionsComponent, OverviewTabComponent, DataTabComponent, EmailTabComponent, TasksTabComponent, AuditTabComponent],
  template: `
    @if (!svc.selectedCase()) {
      <div class="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div class="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-default)]" style="box-shadow: var(--shadow-sm)">
          <svg class="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 class="text-sm font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider">No hay un caso seleccionado</h3>
        <p class="text-xs text-[var(--text-secondary)] max-w-sm">
          Seleccioná un caso de la lista para revisar datos, estado de activación y tareas pendientes.
        </p>
      </div>
    } @else {
      <div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-base)]">
        <!-- Tab strip -->
        <div class="flex items-center gap-1 px-2 lg:px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex-shrink-0">
          <button
            (click)="svc.selectCase(null)"
            class="md:hidden flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            aria-label="Volver a la lista"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div role="tablist" class="flex gap-1 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            @for (tab of tabs; track tab.id) {
              <button
                role="tab"
                [attr.aria-selected]="activeTab() === tab.id"
                (click)="activeTab.set(tab.id)"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold flex-shrink-0 outline-none"
                [class]="activeTab() === tab.id
                  ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'"
              >
                {{ tab.label }}
                @if (tab.id === 'tasks' && taskBadgeCount() > 0) {
                  <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold min-w-[18px] text-center border"
                    [class]="hasFailedTasks()
                      ? 'bg-[var(--status-error-subtle)] text-[var(--status-error)]'
                      : 'bg-[var(--status-info-subtle)] text-[var(--status-info)]'"
                    [style.borderColor]="hasFailedTasks() ? 'rgba(220,38,38,0.15)' : 'rgba(2,132,199,0.15)'"
                  >
                    {{ taskBadgeCount() }}
                  </span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Tab content -->
        <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-12 pt-4 lg:px-6 lg:pb-16 relative">
          @switch (activeTab()) {
            @case ('overview') { <app-overview-tab (navigateTo)="activeTab.set($event)" /> }
            @case ('data')     { <app-data-tab /> }
            @case ('email')    { <app-email-tab /> }
            @case ('tasks')    { <app-tasks-tab /> }
            @case ('audit')    { <app-audit-tab /> }
          }
        </div>

        <div class="shrink-0">
          <app-case-actions />
        </div>
      </div>
    }
  `,
})
export class CaseDetailComponent {
  readonly svc = inject(OnboardingMockService);
  readonly activeTab = signal('overview');
  readonly tabs = TABS;

  taskBadgeCount(): number {
    const c = this.svc.selectedCase();
    if (!c) return 0;
    const failed = c.tasks.filter(t => t.status === 'failed').length;
    const running = c.tasks.filter(t => t.status === 'running').length;
    return failed > 0 ? failed : running;
  }

  hasFailedTasks(): boolean {
    const c = this.svc.selectedCase();
    return c ? c.tasks.some(t => t.status === 'failed') : false;
  }
}
