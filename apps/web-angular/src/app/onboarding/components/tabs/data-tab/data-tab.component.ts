import { Component, inject } from '@angular/core';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { COUNTRIES, TEAMS, CONTRACT_TYPES, TAX_ID_TYPES } from '../../../models/onboarding-case.model';

@Component({
  selector: 'app-data-tab',
  standalone: true,
  template: `
    @if (svc.selectedCase(); as c) {
      <div class="space-y-6">
        <!-- Directory data -->
        <section class="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
          <div class="flex items-start gap-3 pb-3 mb-4 border-b border-[var(--border-subtle)]">
            <span class="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0" style="background-color: #459CDB18">
              <svg class="w-3.5 h-3.5" style="color: #459CDB" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </span>
            <span class="text-[11px] font-bold uppercase tracking-wider" style="color: #459CDB">Datos del directorio</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Nombre completo</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.name }} {{ c.employee.lastName }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Email personal</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.email }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Email corporativo</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.corporateEmail || c.suggestedEmail || '—' }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">DNI</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.CI }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Rol</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.role }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Equipo</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ teamLabel(c.employee.team) }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Contrato</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ contractLabel(c.employee.contractType) }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Manager</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.managerName }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Ubicación</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.cityId }}, {{ countryName(c.employee.countryId) }}</span></div>
            <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Fecha de ingreso</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.employee.startDate }}</span></div>
          </div>
        </section>

        <!-- Candidate data -->
        <section class="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-6">
          <div class="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[var(--border-subtle)]">
            <div class="flex items-start gap-3">
              <span class="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0" style="background-color: #0891B218">
                <svg class="w-3.5 h-3.5" style="color: #0891B2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </span>
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider block" style="color: #0891B2">Datos declarados por el candidato</span>
                <span class="text-[11px] text-[var(--text-tertiary)] mt-0.5 block">Información provista por el candidato en el formulario de onboarding</span>
              </div>
            </div>
            <!-- Status badge -->
            @if (c.candidateData?.consolidated) {
              <span class="text-[10px] font-bold text-[var(--status-success)] bg-[var(--status-success-subtle)] px-2 py-0.5 rounded border uppercase tracking-wider flex-shrink-0" style="border-color: rgba(22,163,74,0.2)">Consolidado</span>
            } @else if (c.candidateData?.submittedAt) {
              <span class="text-[10px] font-bold text-[var(--status-info)] bg-[var(--status-info-subtle)] px-2 py-0.5 rounded border uppercase tracking-wider flex-shrink-0" style="border-color: rgba(2,132,199,0.2)">Enviado</span>
            } @else {
              <span class="text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-default)] uppercase tracking-wider flex-shrink-0">Pendiente</span>
            }
          </div>

          @if (!c.candidateData?.submittedAt) {
            <p class="text-sm text-[var(--text-tertiary)] py-8 text-center">El candidato aún no envió sus datos.</p>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @if (c.candidateData!.taxIdType) {
                <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Tipo de ID fiscal</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ taxIdLabel(c.candidateData!.taxIdType) }}</span></div>
                <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Número</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.candidateData!.taxIdValue }}</span></div>
              }
              @if (c.candidateData!.paymentMethod) {
                <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Método de cobro</span><span class="text-sm font-medium text-[var(--text-primary)]">{{ c.candidateData!.paymentMethod }}</span></div>
                @if (c.candidateData!.cbu) {
                  <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">CBU</span><span class="text-sm font-medium text-[var(--text-primary)] font-mono">{{ c.candidateData!.cbu }}</span></div>
                }
                @if (c.candidateData!.walletAddress) {
                  <div><span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Wallet</span><span class="text-sm font-medium text-[var(--text-primary)] font-mono">{{ c.candidateData!.walletAddress }}</span></div>
                }
              }
              @if (c.candidateData!.references.length > 0) {
                <div class="sm:col-span-2 lg:col-span-3">
                  <span class="block text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Referencias ({{ c.candidateData!.references.length }})</span>
                  <div class="space-y-2">
                    @for (ref of c.candidateData!.references; track ref.id) {
                      <div class="bg-[var(--bg-subtle)] rounded-lg p-3 border border-[var(--border-subtle)]">
                        <p class="text-sm font-medium text-[var(--text-primary)]">{{ ref.fullName }}</p>
                        <p class="text-xs text-[var(--text-secondary)]">{{ ref.relationship }} · {{ ref.company }}</p>
                        <p class="text-xs text-[var(--text-tertiary)]">{{ ref.email }} · {{ ref.phone }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Consolidation CTA -->
            @if (c.candidateData!.submittedAt && !c.candidateData!.consolidated && c.status === 'hr_review') {
              <div class="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <p class="text-xs text-[var(--text-tertiary)]">Confirmá los datos del candidato para avanzar con la aprobación.</p>
                <button
                  (click)="svc.consolidateCandidateData(c.id)"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]"
                >
                  Consolidar datos
                </button>
              </div>
            }
          }
        </section>
      </div>
    }
  `,
})
export class DataTabComponent {
  readonly svc = inject(OnboardingMockService);
  teamLabel(t: string): string { return TEAMS.find(x => x.value === t)?.label || t; }
  contractLabel(t: string): string { return CONTRACT_TYPES.find(x => x.value === t)?.label || t; }
  countryName(c: string): string { return COUNTRIES.find(x => x.code === c)?.name || c; }
  taxIdLabel(c: string): string { return TAX_ID_TYPES.find(x => x.code === c)?.label || c; }
}
