import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { CreateCaseData, Team, ContractType, COUNTRIES, TEAMS, CONTRACT_TYPES } from '../../models/onboarding-case.model';

const EMPTY_FORM: CreateCaseData = {
  firstName: '', lastName: '', CI: '', birthday: '', personalEmail: '',
  countryId: 'AR', provinceId: '', cityId: '', startDate: '',
  role: '', team: 'engineering', contractType: 'employee', managerName: '',
  welcomeMeetingTime: '', welcomeMeetingLink: '', managerMeetingTime: '',
  managerMeetingLink: '', onboardingFolderUrl: '', kitRedesUrl: '',
};

const REQUIRED_KEYS: (keyof CreateCaseData)[] = [
  'firstName', 'lastName', 'CI', 'birthday', 'personalEmail',
  'countryId', 'provinceId', 'cityId', 'role', 'team', 'contractType', 'managerName', 'startDate',
];

@Component({
  selector: 'app-new-case-modal',
  standalone: true,
  imports: [ModalComponent, FormsModule],
  template: `
    <app-modal [isOpen]="isOpen" title="Nuevo caso de onboarding" size="xl" (onClose)="handleClose()">
      <div class="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--border-subtle)]">
        <p class="text-sm text-[var(--text-secondary)] leading-relaxed">
          Creá el perfil base del colaborador. Después vas a poder enviarle el formulario para completar datos fiscales, cobro y documentación.
        </p>
        <span class="inline-flex text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full border border-[var(--border-default)] uppercase tracking-wider whitespace-nowrap flex-shrink-0">
          Borrador inicial
        </span>
      </div>

      <form (ngSubmit)="handleSubmit()" novalidate>
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="flex-1 min-w-0 space-y-6">
            <!-- Identidad -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0" style="background-color: #459CDB18">
                  <svg class="w-3 h-3" style="color: #459CDB" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </span>
                <span class="text-[11px] font-bold uppercase tracking-wider" style="color: #459CDB">Identidad</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Nombre *</label>
                  <input [(ngModel)]="form.firstName" name="firstName" placeholder="Ej.: María"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.firstName">
                  @if (attempted() && !form.firstName) { <p class="text-xs text-[var(--status-error)] mt-1">Este dato es necesario</p> }
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Apellido *</label>
                  <input [(ngModel)]="form.lastName" name="lastName" placeholder="Ej.: García"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.lastName">
                  @if (attempted() && !form.lastName) { <p class="text-xs text-[var(--status-error)] mt-1">Este dato es necesario</p> }
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Email personal *</label>
                  <input [(ngModel)]="form.personalEmail" name="personalEmail" type="email" placeholder="Ej.: maria&#64;email.com"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.personalEmail">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Documento / DNI *</label>
                  <input [(ngModel)]="form.CI" name="CI" placeholder="Ej.: 38123456"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.CI">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Fecha de nacimiento *</label>
                  <input [(ngModel)]="form.birthday" name="birthday" type="date"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.birthday">
                </div>
              </div>
            </div>

            <!-- Ubicación -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0" style="background-color: #27AE6018">
                  <svg class="w-3 h-3" style="color: #27AE60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </span>
                <span class="text-[11px] font-bold uppercase tracking-wider" style="color: #27AE60">Ubicación</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">País *</label>
                  <select [(ngModel)]="form.countryId" name="countryId"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                    @for (c of countries; track c.code) { <option [value]="c.code">{{ c.name }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Provincia *</label>
                  <input [(ngModel)]="form.provinceId" name="provinceId" placeholder="Ej.: Buenos Aires"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.provinceId">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Ciudad *</label>
                  <input [(ngModel)]="form.cityId" name="cityId" placeholder="Ej.: CABA"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.cityId">
                </div>
              </div>
            </div>

            <!-- Posición -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0" style="background-color: #9B51E018">
                  <svg class="w-3 h-3" style="color: #9B51E0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </span>
                <span class="text-[11px] font-bold uppercase tracking-wider" style="color: #9B51E0">Posición</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Rol / Puesto *</label>
                  <input [(ngModel)]="form.role" name="role" placeholder="Ej.: Frontend Developer"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.role">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Equipo *</label>
                  <select [(ngModel)]="form.team" name="team"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                    @for (t of teams; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Tipo de contrato *</label>
                  <select [(ngModel)]="form.contractType" name="contractType"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                    @for (ct of contractTypes; track ct.value) { <option [value]="ct.value">{{ ct.label }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Responsable directo *</label>
                  <input [(ngModel)]="form.managerName" name="managerName" placeholder="Ej.: Carlos Méndez"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.managerName">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Fecha de ingreso *</label>
                  <input [(ngModel)]="form.startDate" name="startDate" type="date"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
                    [class.border-red-400]="attempted() && !form.startDate">
                </div>
              </div>
            </div>

            <!-- Agenda (optional) -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="flex items-center justify-center w-6 h-6 rounded-lg flex-shrink-0" style="background-color: #64748B18">
                  <svg class="w-3 h-3" style="color: #64748B" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </span>
                <span class="text-[11px] font-bold uppercase tracking-wider" style="color: #64748B">Agenda inicial</span>
                <span class="text-[10px] text-[var(--text-tertiary)] font-medium">· opcional</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Horario onboarding RRHH</label>
                  <input [(ngModel)]="form.welcomeMeetingTime" name="welcomeMeetingTime" placeholder="Ej.: 19/05 - 9:30 hs"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Link Meet RRHH</label>
                  <input [(ngModel)]="form.welcomeMeetingLink" name="welcomeMeetingLink" placeholder="https://meet.google.com/..."
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Horario reunión con manager</label>
                  <input [(ngModel)]="form.managerMeetingTime" name="managerMeetingTime" placeholder="Ej.: 19/05 - 12:00 hs"
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Link Meet manager</label>
                  <input [(ngModel)]="form.managerMeetingLink" name="managerMeetingLink" placeholder="https://meet.google.com/..."
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Link carpeta de onboarding</label>
                  <input [(ngModel)]="form.onboardingFolderUrl" name="onboardingFolderUrl" placeholder="https://drive.google.com/..."
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">Link Kit de Redes</label>
                  <input [(ngModel)]="form.kitRedesUrl" name="kitRedesUrl" placeholder="https://drive.google.com/..."
                    class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                </div>
              </div>
            </div>
          </div>

          <!-- Summary panel -->
          <div class="w-full lg:w-[240px] flex-shrink-0 lg:sticky lg:top-0 lg:self-start">
            <div class="bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] p-4">
              <div class="flex items-center justify-between mb-3 pb-3 border-b border-[var(--border-subtle)]">
                <span class="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Resumen</span>
                @if (pendingCount() === 0) {
                  <span class="text-[10px] font-bold text-[var(--status-success)] bg-[var(--status-success-subtle)] px-1.5 py-0.5 rounded border uppercase tracking-wider" style="border-color: rgba(22,163,74,0.2)">Listo</span>
                } @else {
                  <span class="text-[10px] font-medium text-[var(--text-tertiary)]">{{ pendingCount() }} pendientes</span>
                }
              </div>
              <div class="space-y-3">
                <div class="flex flex-col gap-0.5"><span class="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Colaborador</span><span class="text-xs font-medium text-[var(--text-primary)]">{{ form.firstName || '—' }} {{ form.lastName }}</span></div>
                <div class="flex flex-col gap-0.5"><span class="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Posición</span><span class="text-xs font-medium text-[var(--text-primary)]">{{ form.role || '—' }}</span></div>
                <div class="flex flex-col gap-0.5"><span class="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Manager</span><span class="text-xs font-medium text-[var(--text-primary)]">{{ form.managerName || '—' }}</span></div>
              </div>
            </div>
          </div>
        </div>

        @if (errorMsg()) {
          <div class="mt-5 p-3 bg-[var(--status-error-subtle)] border rounded-lg flex items-center gap-2.5" style="border-color: rgba(220,38,38,0.2)" role="alert">
            <svg class="w-4 h-4 text-[var(--status-error)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p class="text-sm font-medium text-[var(--status-error)]">{{ errorMsg() }}</p>
          </div>
        }

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--border-subtle)]">
          <p class="text-xs text-[var(--text-tertiary)] hidden sm:block">El caso quedará en borrador hasta enviar el formulario al candidato.</p>
          <div class="flex justify-end gap-3 w-full sm:w-auto">
            <button type="button" (click)="handleClose()"
              class="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">
              Cancelar
            </button>
            <button type="submit"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]">
              Crear caso
            </button>
          </div>
        </div>
      </form>
    </app-modal>
  `,
})
export class NewCaseModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  private readonly svc = inject(OnboardingMockService);
  readonly countries = COUNTRIES;
  readonly teams = TEAMS;
  readonly contractTypes = CONTRACT_TYPES;
  readonly attempted = signal(false);
  readonly errorMsg = signal<string | null>(null);

  form: CreateCaseData = { ...EMPTY_FORM };

  readonly pendingCount = () => REQUIRED_KEYS.filter(k => !this.form[k]).length;

  handleClose(): void {
    this.form = { ...EMPTY_FORM };
    this.attempted.set(false);
    this.errorMsg.set(null);
    this.closed.emit();
  }

  handleSubmit(): void {
    if (REQUIRED_KEYS.some(k => !this.form[k])) {
      this.attempted.set(true);
      this.errorMsg.set('Completá los campos obligatorios para crear el caso.');
      return;
    }
    this.svc.createCase(this.form);
    this.handleClose();
  }
}
