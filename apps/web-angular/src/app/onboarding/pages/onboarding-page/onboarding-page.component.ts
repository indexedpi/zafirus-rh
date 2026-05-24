import { Component, inject, OnInit } from '@angular/core';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { CaseListComponent } from '../../components/case-list/case-list.component';
import { CaseDetailComponent } from '../../components/case-detail/case-detail.component';
import { CandidatePanelComponent } from '../../candidate/candidate-panel/candidate-panel.component';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [CaseListComponent, CaseDetailComponent, CandidatePanelComponent],
  template: `
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- RRHH Panel -->
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <!-- Case list sidebar -->
        <div class="border-r border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex-shrink-0 overflow-hidden flex flex-col"
          [class]="svc.selectedCase() ? 'hidden md:flex md:w-64 lg:w-[260px]' : 'flex w-full'"
        >
          <app-case-list />
        </div>
        <!-- Case detail -->
        <div class="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-[var(--bg-base)]"
          [class]="svc.selectedCase() ? 'flex' : 'hidden md:flex'"
        >
          <app-case-detail />
        </div>
      </div>

      <!-- Candidate panel -->
      <div class="hidden min-[1180px]:flex flex-col bg-[var(--bg-subtle)] min-h-0 overflow-hidden border-l border-[var(--border-subtle)]"
        style="width: clamp(360px, 30vw, 460px)">
        <div class="flex h-[57px] flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--brand-primary-subtle)] text-[11px] font-semibold text-[var(--brand-primary)] tracking-[0.06em] uppercase">
            Formulario del Candidato
          </span>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <app-candidate-panel />
        </div>
      </div>
    </div>
  `,
})
export class OnboardingPageComponent implements OnInit {
  readonly svc = inject(OnboardingMockService);

  ngOnInit(): void {
    if (this.svc.cases().length === 0) {
      this.svc.seedDemo();
    }
  }
}
