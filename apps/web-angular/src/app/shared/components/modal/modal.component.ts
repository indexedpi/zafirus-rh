import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4"
           (click)="onClose.emit()" (keydown.escape)="onClose.emit()">
        <div class="fixed inset-0 bg-[var(--bg-overlay)]" aria-hidden="true"></div>
        <div
          class="relative bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-xl w-full overflow-hidden animate-fade-in"
          [class.max-w-lg]="size === 'md'"
          [class.max-w-3xl]="size === 'lg'"
          [class.max-w-5xl]="size === 'xl'"
          style="max-height: 90vh"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 class="text-base font-bold text-[var(--text-primary)]">{{ title }}</h2>
            <button
              (click)="onClose.emit()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              aria-label="Cerrar"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="px-6 py-5 overflow-y-auto" style="max-height: calc(90vh - 65px)">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'md' | 'lg' | 'xl' = 'md';
  @Output() onClose = new EventEmitter<void>();
}
