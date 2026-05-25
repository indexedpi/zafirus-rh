import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { CandidateData, CandidateFile, ContractType, COUNTRIES, TEAMS, CONTRACT_TYPES, TAX_ID_TYPES, Team, Employee } from '../../../models/onboarding-case.model';
import { formatCuit, isFutureDate, isPastDate, isValidEmail, todayIsoDate, validateCuit } from '../../../../shared/utils/cuit-validator';

type EditMode = 'identity' | 'location' | 'position' | 'candidate';

interface EmployeeDraft {
  name: string;
  lastName: string;
  CI: string;
  birthday: string;
  email: string;
  corporateEmail: string;
  countryId: string;
  provinceId: string;
  cityId: string;
  startDate: string;
  role: string;
  team: Team;
  contractType: ContractType;
  managerName: string;
}

interface CandidateDraft {
  taxIdType: string;
  taxIdValue: string;
  paymentMethod: '' | 'CBU' | 'WIRE' | 'CRYPTO';
  cbu: string;
  bankName: string;
  accountNumber: string;
  swift: string;
  beneficiaryAddress: string;
  needsW8: boolean;
  walletType: string;
  walletAddress: string;
  hasQrBinance: boolean;
}

@Component({
  selector: 'app-data-tab',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      height: 100%;
      min-height: 0;
    }
  `],
  template: `
    @if (svc.selectedCase(); as c) {
      <div class="flex min-h-full w-full min-w-0 flex-col gap-6">
        <!-- Identity header -->
        <header class="rounded-2xl border bg-[var(--section-identity-subtle)] p-6 shadow-sm lg:p-7" style="border-color: color-mix(in oklab, var(--section-identity) 18%, var(--border-subtle));">
          <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div class="flex min-w-0 flex-1 items-start gap-4">
              <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border bg-[var(--section-identity-subtle)] text-lg font-bold text-[var(--section-identity)]" style="border-color: color-mix(in oklab, var(--section-identity) 24%, var(--border-default));">
                {{ initials(c.employee.name, c.employee.lastName) }}
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Datos del colaborador</p>
                <h2 class="mt-1 truncate text-[1.35rem] font-bold leading-tight text-[var(--text-primary)] lg:text-[1.45rem]">
                  {{ c.employee.name }} {{ c.employee.lastName }}
                </h2>
                <p class="mt-1 text-sm text-[var(--text-secondary)]">
                  {{ c.employee.role }} · {{ teamLabel(c.employee.team) }} · {{ c.employee.cityId }}, {{ countryName(c.employee.countryId) }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                    <span class="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-[var(--section-identity-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]" style="border-color: color-mix(in oklab, var(--section-identity) 18%, var(--border-default));">
                    Ingreso {{ formatDate(c.employee.startDate) }}
                  </span>
                    <span class="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-[var(--section-identity-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]" style="border-color: color-mix(in oklab, var(--section-identity) 18%, var(--border-default));">
                    Personal {{ c.employee.email }}
                  </span>
                    <span class="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-[var(--section-identity-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]" style="border-color: color-mix(in oklab, var(--section-identity) 18%, var(--border-default));">
                    Corporativo {{ c.employee.corporateEmail || c.suggestedEmail || 'Pendiente' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 xl:justify-end">
              <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {{ contractLabel(c.employee.contractType) }}
              </span>
              <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {{ c.employee.status === 'active' ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </header>

        <!-- Directory data -->
        <section class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-sm lg:p-7" aria-labelledby="directory-data-title">
          <div class="flex items-start gap-3 pb-4">
            <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style="background-color: color-mix(in oklab, var(--section-identity) 14%, var(--bg-elevated));">
              <svg class="h-3.5 w-3.5" style="color: var(--section-identity)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <div class="min-w-0">
              <h3 id="directory-data-title" class="text-sm font-bold text-[var(--text-primary)]">Datos del directorio</h3>
              <p class="mt-1 text-sm text-[var(--text-secondary)]">Base operativa del caso: identidad, ubicación y puesto con lectura rápida.</p>
            </div>
          </div>

          <div class="grid gap-4 xl:grid-cols-3">
            <article id="data-identity" class="rounded-2xl border bg-[var(--section-identity-subtle)] p-5" style="border-color: color-mix(in oklab, var(--section-identity) 18%, var(--border-subtle));">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: var(--section-identity-subtle);">
                    <svg class="h-3 w-3" style="color: var(--section-identity)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-identity)">Identidad</h4>
                </div>

                <button
                  type="button"
                  (click)="openEdit('identity')"
                  aria-label="Editar identidad"
                  class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--section-identity)]"
                  style="border-color: color-mix(in oklab, var(--section-identity) 24%, var(--border-default)); background-color: var(--section-identity-subtle); color: var(--section-identity);"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.625 2.625 0 113.712 3.712L8.207 20.566l-4.875 1.163 1.163-4.875L16.862 4.487z" />
                  </svg>
                  Editar
                </button>
              </div>

              <dl class="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Nombre completo</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ c.employee.name }} {{ c.employee.lastName }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Documento</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ c.employee.CI }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Correo personal</dt>
                  <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ c.employee.email }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Correo corporativo</dt>
                  <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ c.employee.corporateEmail || c.suggestedEmail || 'Pendiente' }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Fecha de nacimiento</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ formatDate(c.employee.birthday) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Estado</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ c.employee.status === 'active' ? 'Activo' : 'Inactivo' }}</dd>
                </div>
              </dl>
            </article>

            <article id="data-location" class="rounded-2xl border bg-[var(--section-location-subtle)] p-5" style="border-color: color-mix(in oklab, var(--section-location) 18%, var(--border-subtle));">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: var(--section-location-subtle);">
                    <svg class="h-3 w-3" style="color: var(--section-location)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-location)">Ubicación</h4>
                </div>

                <button
                  type="button"
                  (click)="openEdit('location')"
                  aria-label="Editar ubicación"
                  class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--section-location)]"
                  style="border-color: color-mix(in oklab, var(--section-location) 24%, var(--border-default)); background-color: var(--section-location-subtle); color: var(--section-location);"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.625 2.625 0 113.712 3.712L8.207 20.566l-4.875 1.163 1.163-4.875L16.862 4.487z" />
                  </svg>
                  Editar
                </button>
              </div>

              <dl class="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">País</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ countryName(c.employee.countryId) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Provincia</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ display(c.employee.provinceId) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Ciudad</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ display(c.employee.cityId) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Fecha de ingreso</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ formatDate(c.employee.startDate) }}</dd>
                </div>
              </dl>
            </article>

            <article id="data-position" class="rounded-2xl border bg-[var(--section-position-subtle)] p-5" style="border-color: color-mix(in oklab, var(--section-position) 18%, var(--border-subtle));">
              <div class="mb-4 flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: var(--section-position-subtle);">
                    <svg class="h-3 w-3" style="color: var(--section-position)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-position)">Puesto</h4>
                </div>

                <button
                  type="button"
                  (click)="openEdit('position')"
                  aria-label="Editar puesto"
                  class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--section-position)]"
                  style="border-color: color-mix(in oklab, var(--section-position) 24%, var(--border-default)); background-color: var(--section-position-subtle); color: var(--section-position);"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.625 2.625 0 113.712 3.712L8.207 20.566l-4.875 1.163 1.163-4.875L16.862 4.487z" />
                  </svg>
                  Editar
                </button>
              </div>

              <dl class="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Rol / puesto</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ display(c.employee.role) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Equipo</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ teamLabel(c.employee.team) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Contrato</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ contractLabel(c.employee.contractType) }}</dd>
                </div>
                <div>
                  <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Responsable</dt>
                  <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ display(c.employee.managerName) }}</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        <!-- Candidate data -->
        <section id="data-candidate" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-sm lg:p-7" aria-labelledby="candidate-data-title">
          @if (c.candidateData; as candidateData) {
            <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div class="flex min-w-0 items-start gap-3">
                <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style="background-color: color-mix(in oklab, var(--section-fiscal) 14%, var(--bg-elevated));">
                  <svg class="h-3.5 w-3.5" style="color: var(--section-fiscal)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div class="min-w-0">
                  <h3 id="candidate-data-title" class="text-sm font-bold text-[var(--text-primary)]">Datos declarados por el candidato</h3>
                  <p class="mt-1 text-sm text-[var(--text-secondary)]">Formulario recibido, comprobantes y referencias para validar antes de consolidar.</p>
                </div>
              </div>

              <div class="flex flex-col items-start gap-2 xl:items-end">
                @if (candidateData.consolidated) {
                  <span class="inline-flex items-center rounded-full border border-[rgba(22,163,74,0.16)] bg-[var(--status-success-subtle)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--status-success)]">Consolidado</span>
                } @else if (svc.autoRun() && c.status === 'candidate_invited') {
                  <span class="inline-flex items-center rounded-full border border-[rgba(2,132,199,0.16)] bg-[var(--status-info-subtle)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--status-info)]">En vivo</span>
                } @else if (candidateData.submittedAt) {
                  <span class="inline-flex items-center rounded-full border border-[rgba(2,132,199,0.16)] bg-[var(--status-info-subtle)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--status-info)]">Enviado</span>
                } @else {
                  <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Pendiente</span>
                }

                <button
                  type="button"
                  (click)="openEdit('candidate')"
                  aria-label="Editar datos declarados"
                  class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                  style="border-color: color-mix(in oklab, var(--section-fiscal) 24%, var(--border-default)); background-color: color-mix(in oklab, var(--section-fiscal) 8%, var(--bg-elevated)); color: var(--section-fiscal);"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.625 2.625 0 113.712 3.712L8.207 20.566l-4.875 1.163 1.163-4.875L16.862 4.487z" />
                  </svg>
                  Editar declarados
                </button>

                @if (candidateData.submittedAt) {
                  <div class="flex flex-wrap gap-2 xl:justify-end">
                    <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      Recibido {{ formatDateTime(candidateData.submittedAt) }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      Paso {{ candidateData.currentStep }}
                    </span>
                    <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      {{ candidateData.completedSteps.length }} completados
                    </span>
                    <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      {{ candidateData.references.length }} referencias
                    </span>
                    <span class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      {{ candidateData.files.length }} archivos
                    </span>
                  </div>
                }
              </div>
            </div>

            @if (!candidateData.submittedAt && !(svc.autoRun() && c.status === 'candidate_invited')) {
              <div class="mt-6 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-base)] p-6 text-sm text-[var(--text-secondary)]">
                <p class="font-medium text-[var(--text-primary)]">El candidato todavía no envió su formulario.</p>
                <p class="mt-1 leading-relaxed">Cuando llegue, vas a ver aquí su identificación fiscal, método de cobro, archivos y referencias sin salir de la vista del caso.</p>
              </div>
            } @else {
              @if (svc.autoRun() && c.status === 'candidate_invited') {
                <div class="mt-6 rounded-2xl border border-[rgba(2,132,199,0.18)] bg-[var(--status-info-subtle)] p-4 text-sm text-[var(--text-secondary)] shadow-sm">
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--status-info)]">Simulación guiada</p>
                      <p class="mt-1 leading-relaxed text-[var(--text-primary)]">El formulario del candidato se está completando en vivo desde RRHH.</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="inline-flex items-center rounded-full border border-[rgba(2,132,199,0.18)] bg-white/60 px-3 py-1 text-[11px] font-semibold text-[var(--status-info)]">Paso {{ svc.wizardCandidateStep() || 0 }}/5</span>
                      @if (svc.candidateResponseCountdown() !== null) {
                        <span class="inline-flex items-center rounded-full border border-[rgba(2,132,199,0.18)] bg-white/60 px-3 py-1 text-[11px] font-semibold text-[var(--status-info)]">Envía en {{ svc.candidateResponseCountdown() }}s</span>
                      }
                      <span class="inline-flex items-center rounded-full border border-[rgba(2,132,199,0.18)] bg-white/60 px-3 py-1 text-[11px] font-semibold text-[var(--status-info)]">{{ wizardStepLabel() }}</span>
                    </div>
                  </div>
                </div>
              }

              <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div class="space-y-6">
                <div id="data-fiscal" [class]="wizardSectionClass('taxId', 'space-y-4')">
                  <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: color-mix(in oklab, var(--section-fiscal) 14%, var(--bg-elevated));">
                      <svg class="h-3 w-3" style="color: var(--section-fiscal)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-fiscal)">Datos fiscales</h4>
                  </div>

                  <dl class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Tipo de identificación</dt>
                      <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ taxIdLabel(candidateData.taxIdType) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Número</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.taxIdValue) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Requiere W-8</dt>
                      <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ candidateData.needsW8 ? 'Sí' : 'No' }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Paso actual</dt>
                      <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ candidateData.currentStep }} de {{ candidateData.completedSteps.length + 1 }}</dd>
                    </div>
                  </dl>
                </div>

                <div id="data-payment" [class]="wizardSectionClass('cbu', 'space-y-4')">
                  <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: color-mix(in oklab, var(--section-payment) 14%, var(--bg-elevated));">
                      <svg class="h-3 w-3" style="color: var(--section-payment)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h5M6 19h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-payment)">Cobro</h4>
                  </div>

                  <dl class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Método</dt>
                      <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ paymentMethodLabel(candidateData.paymentMethod) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Banco</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.bankName) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Número de cuenta</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.accountNumber) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">SWIFT</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.swift) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">CBU</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.cbu) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Dirección beneficiario</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.beneficiaryAddress) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Tipo de wallet</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.walletType) }}</dd>
                    </div>
                    <div>
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Wallet</dt>
                      <dd class="mt-1 break-all text-sm font-medium text-[var(--text-primary)]">{{ display(candidateData.walletAddress) }}</dd>
                    </div>
                    <div class="sm:col-span-2">
                      <dt class="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Comprobante Binance</dt>
                      <dd class="mt-1 text-sm font-medium text-[var(--text-primary)]">{{ candidateData.hasQrBinance ? 'Adjunto' : 'No adjunto' }}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div class="space-y-6">
                <div [class]="wizardSectionClass('files', 'space-y-4')">
                  <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: color-mix(in oklab, var(--section-docs) 14%, var(--bg-elevated));">
                      <svg class="h-3 w-3" style="color: var(--section-docs)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h10M7 12h10M7 17h6" />
                      </svg>
                    </span>
                    <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-docs)">Archivos</h4>
                  </div>

                  @if (candidateData.files.length === 0) {
                    <div class="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-base)] p-4 text-sm text-[var(--text-secondary)]">
                      Sin archivos adjuntos por ahora.
                    </div>
                  } @else {
                    <ul class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] divide-y divide-[var(--border-subtle)]">
                      @for (file of candidateData.files; track file.id) {
                        <li class="flex items-start justify-between gap-4 px-4 py-3">
                          <div class="min-w-0">
                            <p class="text-sm font-medium text-[var(--text-primary)]">{{ file.name }}</p>
                            <p class="mt-1 text-xs text-[var(--text-tertiary)]">{{ fileTypeLabel(file.fileType) }} · {{ formatBytes(file.sizeBytes) }}</p>
                          </div>
                          <span class="inline-flex flex-shrink-0 items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                            Archivo
                          </span>
                        </li>
                      }
                    </ul>
                  }
                </div>

                <div [class]="wizardSectionClass('references', 'space-y-4')">
                  <div class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-lg" style="background-color: color-mix(in oklab, var(--section-docs) 14%, var(--bg-elevated));">
                      <svg class="h-3 w-3" style="color: var(--section-docs)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M7 15h10M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <h4 class="text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--section-docs)">Referencias ({{ candidateData.references.length }})</h4>
                  </div>

                  @if (candidateData.references.length === 0) {
                    <div class="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-base)] p-4 text-sm text-[var(--text-secondary)]">
                      Aún no hay referencias cargadas.
                    </div>
                  } @else {
                    <ul class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-base)] divide-y divide-[var(--border-subtle)]">
                      @for (ref of candidateData.references; track ref.id) {
                        <li class="px-4 py-4">
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <p class="text-sm font-semibold text-[var(--text-primary)]">{{ ref.fullName }}</p>
                              <p class="mt-1 text-xs text-[var(--text-secondary)]">{{ ref.relationship }} · {{ ref.company }}</p>
                            </div>
                            <span class="inline-flex flex-shrink-0 items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                              Referencia
                            </span>
                          </div>

                          <div class="mt-3 grid gap-2 text-xs text-[var(--text-tertiary)] sm:grid-cols-2">
                            <span class="break-words">{{ ref.email }}</span>
                            <span class="break-words sm:text-right">{{ ref.phone }}</span>
                          </div>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </div>
            </div>

            @if (!candidateData.consolidated && c.status === 'hr_review') {
              <div class="mt-6 flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-xs text-[var(--text-tertiary)]">
                  Revisá los datos declarados y consolidalos antes de aprobar el alta.
                </p>
                <button
                  type="button"
                  (click)="svc.consolidateCandidateData(c.id)"
                  class="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                >
                  Consolidar datos
                </button>
              </div>
            }
          }
          } @else {
            <div class="mt-6 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-base)] p-6 text-sm text-[var(--text-secondary)]">
              <p class="font-medium text-[var(--text-primary)]">No hay datos del candidato cargados todavía.</p>
              <p class="mt-1 leading-relaxed">La información aparecerá acá cuando el formulario del candidato quede disponible.</p>
            </div>
          }
        </section>

        <app-modal [isOpen]="editMode() !== null" [title]="modalTitle()" size="xl" (onClose)="closeEditModal()">
          @if (editMode(); as mode) {
            <div class="space-y-5">
              <p class="text-sm leading-relaxed text-[var(--text-secondary)]">{{ modalDescription() }}</p>

              @switch (mode) {
                @case ('identity') {
                  <div class="space-y-4">
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Nombre</label>
                        <input [(ngModel)]="employeeDraft.name" name="identityName" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Apellido</label>
                        <input [(ngModel)]="employeeDraft.lastName" name="identityLastName" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Documento</label>
                        <input [(ngModel)]="employeeDraft.CI" name="identityCI" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Fecha de nacimiento *</label>
                        <input [(ngModel)]="employeeDraft.birthday" name="identityBirthday" type="date" [attr.max]="todayDate()" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Correo personal *</label>
                        <input [(ngModel)]="employeeDraft.email" name="identityEmail" type="email" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Correo corporativo</label>
                        <input [(ngModel)]="employeeDraft.corporateEmail" name="identityCorporateEmail" type="email" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div class="sm:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 py-3 text-xs text-[var(--text-secondary)]">
                        Estado actual: <span class="font-semibold text-[var(--text-primary)]">{{ c.employee.status === 'active' ? 'Activo' : 'Inactivo' }}</span>. La activación se gestiona desde las acciones del caso.
                      </div>
                    </div>
                  </div>
                }

                @case ('location') {
                  <div class="space-y-4">
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">País</label>
                        <select [(ngModel)]="employeeDraft.countryId" name="locationCountry" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]">
                          @for (country of countries; track country.code) { <option [value]="country.code">{{ country.name }}</option> }
                        </select>
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Provincia</label>
                        <input [(ngModel)]="employeeDraft.provinceId" name="locationProvince" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Ciudad</label>
                        <input [(ngModel)]="employeeDraft.cityId" name="locationCity" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Fecha de ingreso *</label>
                        <input [(ngModel)]="employeeDraft.startDate" name="locationStartDate" type="date" [attr.min]="todayDate()" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                    </div>
                  </div>
                }

                @case ('position') {
                  <div class="space-y-4">
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Rol / puesto</label>
                        <input [(ngModel)]="employeeDraft.role" name="positionRole" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Equipo</label>
                        <select [(ngModel)]="employeeDraft.team" name="positionTeam" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]">
                          @for (team of teams; track team.value) { <option [value]="team.value">{{ team.label }}</option> }
                        </select>
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Tipo de contrato</label>
                        <select [(ngModel)]="employeeDraft.contractType" name="positionContractType" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]">
                          @for (contract of contractTypes; track contract.value) { <option [value]="contract.value">{{ contract.label }}</option> }
                        </select>
                      </div>
                      <div>
                        <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Responsable directo</label>
                        <input [(ngModel)]="employeeDraft.managerName" name="positionManagerName" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                      </div>
                    </div>
                  </div>
                }

                @case ('candidate') {
                  <div class="space-y-5">
                    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 py-3 text-xs text-[var(--text-secondary)]">
                      Editá los datos fiscales y de cobro ya recibidos. Archivos y referencias siguen en solo lectura desde esta vista.
                    </div>

                    <div class="grid gap-4 lg:grid-cols-2">
                      <div class="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
                        <div>
                          <h5 class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--section-fiscal)]">Datos fiscales</h5>
                        </div>
                        <div class="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Tipo de identificación *</label>
                            <select [(ngModel)]="candidateDraft.taxIdType" (ngModelChange)="onCandidateTaxIdTypeChange($event)" name="candidateTaxIdType" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]">
                              @for (taxId of taxIds; track taxId.code) { <option [value]="taxId.code">{{ taxId.label }}</option> }
                            </select>
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Número *</label>
                            <input [(ngModel)]="candidateDraft.taxIdValue" (ngModelChange)="onCandidateTaxIdValueChange($event)" name="candidateTaxIdValue" [attr.maxlength]="isArgentineTaxIdType(candidateDraft.taxIdType) ? 13 : null" [attr.inputmode]="isArgentineTaxIdType(candidateDraft.taxIdType) ? 'numeric' : null" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] font-mono" />
                            @if (candidateTaxIdError()) { <p class="mt-1 text-xs text-[var(--status-error)]">{{ candidateTaxIdError() }}</p> }
                          </div>
                          <label class="sm:col-span-2 flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]">
                            <input [(ngModel)]="candidateDraft.needsW8" name="candidateNeedsW8" type="checkbox" class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
                            Requiere W-8
                          </label>
                        </div>
                      </div>

                      <div class="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
                        <div>
                          <h5 class="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--section-payment)]">Cobro</h5>
                        </div>
                        <div class="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Método *</label>
                            <select [(ngModel)]="candidateDraft.paymentMethod" name="candidatePaymentMethod" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]">
                              <option value="">Pendiente</option>
                              <option value="CBU">CBU</option>
                              <option value="WIRE">Transferencia internacional</option>
                              <option value="CRYPTO">Cripto</option>
                            </select>
                            @if (candidatePaymentError()) { <p class="mt-1 text-xs text-[var(--status-error)]">{{ candidatePaymentError() }}</p> }
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Banco</label>
                            <input [(ngModel)]="candidateDraft.bankName" name="candidateBankName" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Número de cuenta</label>
                            <input [(ngModel)]="candidateDraft.accountNumber" name="candidateAccountNumber" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">SWIFT</label>
                            <input [(ngModel)]="candidateDraft.swift" name="candidateSwift" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                          </div>
                          <div class="sm:col-span-2">
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Dirección beneficiario</label>
                            <input [(ngModel)]="candidateDraft.beneficiaryAddress" name="candidateBeneficiaryAddress" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Tipo de wallet</label>
                            <input [(ngModel)]="candidateDraft.walletType" name="candidateWalletType" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                          </div>
                          <div>
                            <label class="mb-1 block text-[11px] font-medium text-[var(--text-tertiary)]">Wallet</label>
                            <input [(ngModel)]="candidateDraft.walletAddress" name="candidateWalletAddress" class="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)]" />
                          </div>
                          <label class="sm:col-span-2 flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]">
                            <input [(ngModel)]="candidateDraft.hasQrBinance" name="candidateHasQrBinance" type="checkbox" class="h-4 w-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
                            Comprobante Binance adjunto
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              }

              <div class="flex flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  (click)="closeEditModal()"
                  class="inline-flex items-center justify-center rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="saveEdit()"
                  [disabled]="!canSaveEdit()"
                  class="inline-flex items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          }
        </app-modal>
      </div>
    }
  `,
})
export class DataTabComponent {
  readonly svc = inject(OnboardingMockService);
  readonly editMode = signal<EditMode | null>(null);
  readonly countries = COUNTRIES;
  readonly teams = TEAMS;
  readonly contractTypes = CONTRACT_TYPES;
  readonly taxIds = TAX_ID_TYPES;

  employeeDraft: EmployeeDraft = this.buildEmployeeDraft();
  candidateDraft: CandidateDraft = this.buildCandidateDraft();

  openEdit(mode: EditMode): void {
    const c = this.svc.selectedCase();
    if (!c) return;

    this.employeeDraft = this.buildEmployeeDraft(c.employee);
    this.candidateDraft = this.buildCandidateDraft(c.candidateData);
    this.editMode.set(mode);
  }

  todayDate(): string {
    return todayIsoDate();
  }

  isArgentineTaxIdType(type: string): boolean {
    return type === 'CUIT' || type === 'CUIL';
  }

  onCandidateTaxIdTypeChange(type: string): void {
    this.candidateDraft.taxIdType = type;
    if (this.isArgentineTaxIdType(type)) {
      this.candidateDraft.taxIdValue = formatCuit(this.candidateDraft.taxIdValue);
    }
  }

  onCandidateTaxIdValueChange(value: string): void {
    this.candidateDraft.taxIdValue = this.isArgentineTaxIdType(this.candidateDraft.taxIdType)
      ? formatCuit(value)
      : value;
  }

  candidateTaxIdError(): string | null {
    if (!this.candidateDraft.taxIdType.trim()) return 'Este dato es necesario.';
    if (!this.candidateDraft.taxIdValue.trim()) return 'Este dato es necesario.';

    if (this.isArgentineTaxIdType(this.candidateDraft.taxIdType)) {
      const validation = validateCuit(this.candidateDraft.taxIdValue);
      return validation.valid ? null : validation.error ?? 'El CUIT no es válido.';
    }

    return null;
  }

  candidatePaymentError(): string | null {
    if (!this.candidateDraft.paymentMethod) return 'Este dato es necesario.';

    return null;
  }

  employeeDraftValid(): boolean {
    const birthdayValid = !!this.employeeDraft.birthday && !isFutureDate(this.employeeDraft.birthday);
    const startDateValid = !!this.employeeDraft.startDate && !isPastDate(this.employeeDraft.startDate);
    const corporateEmailValid = !this.employeeDraft.corporateEmail.trim() || isValidEmail(this.employeeDraft.corporateEmail);

    return !!this.employeeDraft.name.trim()
      && !!this.employeeDraft.lastName.trim()
      && !!this.employeeDraft.CI.trim()
      && !!this.employeeDraft.email.trim()
      && isValidEmail(this.employeeDraft.email)
      && corporateEmailValid
      && !!this.employeeDraft.countryId.trim()
      && !!this.employeeDraft.provinceId.trim()
      && !!this.employeeDraft.cityId.trim()
      && birthdayValid
      && startDateValid
      && !!this.employeeDraft.role.trim()
      && !!this.employeeDraft.team
      && !!this.employeeDraft.contractType
      && !!this.employeeDraft.managerName.trim();
  }

  candidateDraftValid(): boolean {
    return !this.candidateTaxIdError() && !this.candidatePaymentError();
  }

  canSaveEdit(): boolean {
    return this.editMode() === 'candidate'
      ? this.candidateDraftValid()
      : this.employeeDraftValid();
  }

  closeEditModal(): void {
    this.editMode.set(null);
  }

  saveEdit(): void {
    const c = this.svc.selectedCase();
    const mode = this.editMode();
    if (!c || !mode) return;
    if (!this.canSaveEdit()) return;

    if (mode === 'candidate') {
      this.svc.updateCandidateData(c.id, {
        ...this.candidateDraft,
      });
      this.svc.addToast('success', 'Datos declarados actualizados', 'Se guardaron los cambios del candidato.');
    } else {
      this.svc.updateEmployee(c.id, {
        name: this.employeeDraft.name,
        lastName: this.employeeDraft.lastName,
        CI: this.employeeDraft.CI,
        birthday: this.employeeDraft.birthday,
        email: this.employeeDraft.email,
        corporateEmail: this.normalizeOptional(this.employeeDraft.corporateEmail),
        countryId: this.employeeDraft.countryId,
        provinceId: this.employeeDraft.provinceId,
        cityId: this.employeeDraft.cityId,
        startDate: this.employeeDraft.startDate,
        role: this.employeeDraft.role,
        team: this.employeeDraft.team,
        contractType: this.employeeDraft.contractType,
        managerName: this.employeeDraft.managerName,
      });
      this.svc.addToast('success', 'Datos del directorio actualizados', 'Se guardaron los cambios del colaborador.');
    }

    this.closeEditModal();
  }

  wizardStepLabel(): string {
    switch (this.svc.wizardCandidateField()) {
      case 'taxId': return 'CUIL';
      case 'cbu': return 'CBU';
      case 'bank': return 'Banco';
      case 'references': return 'Referencias';
      case 'files': return 'Archivos';
      default: return 'Preparando formulario';
    }
  }

  wizardSectionClass(field: string, baseClass: string): string {
    const currentField = this.svc.wizardCandidateField();
    const active = this.svc.autoRun()
      && this.svc.selectedCase()?.status === 'candidate_invited'
      && (currentField === field || (field === 'cbu' && currentField === 'bank'));
    return active
      ? `${baseClass} rounded-2xl bg-[rgba(2,132,199,0.06)] outline outline-2 outline-offset-4 outline-[rgba(2,132,199,0.24)] transition-all duration-300`
      : `${baseClass} transition-all duration-300`;
  }

  modalTitle(): string {
    switch (this.editMode()) {
      case 'identity': return 'Editar identidad';
      case 'location': return 'Editar ubicación';
      case 'position': return 'Editar puesto';
      case 'candidate': return 'Editar datos declarados';
      default: return '';
    }
  }

  modalDescription(): string {
    switch (this.editMode()) {
      case 'identity': return 'Actualizá los datos personales y de contacto del colaborador.';
      case 'location': return 'Ajustá el país, la provincia, la ciudad y la fecha de ingreso.';
      case 'position': return 'Modificá el rol, el equipo, el contrato y el responsable directo.';
      case 'candidate': return 'Editá los datos fiscales y de cobro ya recibidos.';
      default: return '';
    }
  }

  private buildEmployeeDraft(employee?: Employee): EmployeeDraft {
    return {
      name: employee?.name ?? '',
      lastName: employee?.lastName ?? '',
      CI: employee?.CI ?? '',
      birthday: employee?.birthday ?? '',
      email: employee?.email ?? '',
      corporateEmail: employee?.corporateEmail ?? '',
      countryId: employee?.countryId ?? '',
      provinceId: employee?.provinceId ?? '',
      cityId: employee?.cityId ?? '',
      startDate: employee?.startDate ?? '',
      role: employee?.role ?? '',
      team: employee?.team ?? 'engineering',
      contractType: employee?.contractType ?? 'employee',
      managerName: employee?.managerName ?? '',
    };
  }

  private buildCandidateDraft(candidateData?: CandidateData | null): CandidateDraft {
    return {
      taxIdType: candidateData?.taxIdType ?? '',
      taxIdValue: candidateData?.taxIdValue ?? '',
      paymentMethod: candidateData?.paymentMethod ?? '',
      cbu: candidateData?.cbu ?? '',
      bankName: candidateData?.bankName ?? '',
      accountNumber: candidateData?.accountNumber ?? '',
      swift: candidateData?.swift ?? '',
      beneficiaryAddress: candidateData?.beneficiaryAddress ?? '',
      needsW8: candidateData?.needsW8 ?? false,
      walletType: candidateData?.walletType ?? '',
      walletAddress: candidateData?.walletAddress ?? '',
      hasQrBinance: candidateData?.hasQrBinance ?? false,
    };
  }

  private normalizeOptional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  initials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  teamLabel(team: Team): string {
    return TEAMS.find(x => x.value === team)?.label || team;
  }

  contractLabel(contractType: ContractType): string {
    return CONTRACT_TYPES.find(x => x.value === contractType)?.label || contractType;
  }

  countryName(code: string): string {
    return COUNTRIES.find(x => x.code === code)?.name || code;
  }

  taxIdLabel(code: string): string {
    return TAX_ID_TYPES.find(x => x.code === code)?.label || code || 'Pendiente';
  }

  paymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      CBU: 'CBU',
      WIRE: 'Transferencia internacional',
      CRYPTO: 'Cripto',
    };
    return labels[method] || 'Pendiente';
  }

  fileTypeLabel(fileType: CandidateFile['fileType']): string {
    return fileType === 'w8' ? 'Formulario W-8' : 'Comprobante QR Binance';
  }

  display(value: string | null | undefined, fallback = '—'): string {
    return value && value.trim() ? value : fallback;
  }

  formatDate(value: string): string {
    if (!value) return '—';
    return new Date(`${value}T00:00:00`).toLocaleDateString('es-AR', { dateStyle: 'medium' });
  }

  formatDateTime(value: number | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    const rounded = size >= 10 || unit === 0 ? Math.round(size) : Math.round(size * 10) / 10;
    return `${rounded} ${units[unit]}`;
  }
}
