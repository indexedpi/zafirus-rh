import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { ZafirusLogoComponent } from '../../../../shared/components/zafirus-logo/zafirus-logo.component';

/**
 * Prototype-safe editable HTML.
 * Production needs stricter sanitization before saving/sending.
 */

type VariableKey =
  | 'firstName' | 'lastName' | 'startDateFormatted' | 'corporateEmail'
  | 'temporaryPassword' | 'onboardingFolderUrl' | 'kitRedesUrl'
  | 'welcomeMeetingTime' | 'welcomeMeetingLink' | 'managerMeetingTime'
  | 'managerName' | 'managerMeetingLink' | 'candidateFormUrl';

interface EmailVariable {
  key: VariableKey;
  label: string;
  group: 'Colaborador' | 'Acceso' | 'Agenda' | 'Recursos' | 'Firma';
  value: string;
  required?: boolean;
  optional?: boolean;
  demo?: boolean;
}

type SignatureType = 'rrhh' | 'personal';

const VARIABLE_GROUPS = ['Colaborador', 'Acceso', 'Agenda', 'Recursos', 'Firma'] as const;

@Component({
  selector: 'app-email-tab',
  standalone: true,
  imports: [FormsModule, ZafirusLogoComponent],
  template: `
    @if (svc.selectedCase(); as c) {
      <div class="email-tab" style="height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden;">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
          <div>
            <h3 class="text-sm font-bold text-[var(--text-primary)]">Email de bienvenida</h3>
            <p class="text-xs text-[var(--text-tertiary)] mt-0.5">Editá el correo que recibirá el colaborador.</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mode toggle -->
            <div class="flex bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-default)]">
              <button (click)="mode.set('edit')"
                class="px-3 py-1.5 rounded-md text-xs font-medium"
                [class]="mode() === 'edit' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              >Editar</button>
              <button (click)="mode.set('preview')"
                class="px-3 py-1.5 rounded-md text-xs font-medium"
                [class]="mode() === 'preview' ? 'bg-[var(--brand-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              >Previsualizar</button>
            </div>
            <!-- Approval -->
            @if (isApproved()) {
              <div class="flex items-center gap-2 px-3 py-1.5 bg-[var(--status-success-subtle)] text-[var(--status-success)] rounded-lg text-xs font-bold border" style="border-color: rgba(22,163,74,0.2)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                @if (changedAfterApproval()) { Cambios posteriores a la aprobación } @else { Plantilla aprobada }
              </div>
            } @else {
              <button (click)="handleApprove()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                Aprobar plantilla
              </button>
            }
          </div>
        </div>

        <!-- Body -->
        @if (mode() === 'edit') {
          <div class="email-tab-body flex-1 min-h-0 overflow-hidden" style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px;">
            <!-- Editor card -->
            <div class="flex-1 min-h-0 bg-[var(--bg-elevated)] border border-[var(--border-focus)] rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div class="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3 flex-shrink-0">
                <span class="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-16">Asunto:</span>
                <input
                  [value]="subject()"
                  (input)="onSubjectChange($event)"
                  [disabled]="isApproved() && !changedAfterApproval()"
                  class="flex-1 text-sm font-medium text-[var(--text-primary)] bg-transparent outline-none disabled:opacity-60"
                />
              </div>

              <div #editor
                [attr.contenteditable]="!(isApproved() && !changedAfterApproval())"
                (input)="onBodyInput()"
                (click)="onEditorClick($event)"
                class="flex-1 p-6 text-[var(--text-primary)] text-sm leading-relaxed outline-none overflow-y-auto"
                [class.opacity-75]="isApproved() && !changedAfterApproval()"
              ></div>

              <div class="h-8 px-4 flex items-center border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex-shrink-0">
                <span class="text-[11px] text-[var(--text-tertiary)]">
                  {{ isApproved() && !changedAfterApproval() ? 'Plantilla aprobada · solo lectura' : 'Editando · hacé clic en las variables para revisar valores' }}
                </span>
              </div>
            </div>

            <!-- Variable sidebar -->
            <div class="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden flex flex-col min-h-0">
              <div class="px-4 py-3 border-b border-[var(--border-subtle)] flex-shrink-0">
                <h4 class="text-xs font-bold text-[var(--text-primary)]">Variables del correo</h4>
                <p class="text-[10px] text-[var(--text-tertiary)] mt-0.5">Editá los datos o insertalos en el mensaje.</p>
              </div>
              <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                @for (group of variableGroups; track group) {
                  <div>
                    <p class="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{{ group }}</p>
                    @for (v of variablesByGroup(group); track v.key) {
                      <div class="flex items-center gap-2 mb-2 p-2 rounded-lg border"
                        [class]="selectedVariable() === v.key ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]' : 'border-[var(--border-subtle)] bg-[var(--bg-base)]'"
                      >
                        <div class="flex-1 min-w-0">
                          <label class="block text-[10px] font-semibold text-[var(--text-tertiary)] mb-0.5">{{ v.label }}</label>
                          @if (group === 'Firma') {
                            @if (v.key === 'firstName') {
                              <!-- Signature type selector -->
                              <select [(ngModel)]="signatureType"
                                (ngModelChange)="onSignatureChange()"
                                class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none">
                                <option value="rrhh">Recursos Humanos</option>
                                <option value="personal">Personal</option>
                              </select>
                            } @else {
                              <input [value]="v.value"
                                (input)="onVariableEdit(v.key, $event)"
                                class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                            }
                          } @else {
                            <input [value]="v.value"
                              (input)="onVariableEdit(v.key, $event)"
                              class="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]">
                          }
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <span class="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                            [class]="!v.value ? 'bg-[var(--status-error-subtle)] text-[var(--status-error)]'
                              : v.demo ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]'
                              : 'bg-[var(--status-success-subtle)] text-[var(--status-success)]'"
                          >{{ !v.value ? 'Falta dato' : v.demo ? 'Demo' : v.optional ? 'Opcional' : 'OK' }}</span>
                          @if (group !== 'Firma') {
                            <button (click)="insertVariable(v.key)"
                              [attr.aria-label]="'Insertar variable ' + v.label"
                              class="w-6 h-6 rounded flex items-center justify-center text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] hover:opacity-80 text-xs font-bold">
                              +
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        } @else {
          <!-- Preview mode -->
          <div class="flex-1 min-h-0 overflow-y-auto flex justify-center p-4 lg:p-8">
            <div class="w-full max-w-2xl">
              <!-- Subject -->
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg">
                <div class="text-xs text-gray-500 mb-1">Asunto:</div>
                <div class="text-sm font-semibold text-gray-900">{{ subject() }}</div>
              </div>
              <!-- Body -->
              <div class="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6 lg:p-8">
                <div [innerHTML]="previewHtml()" class="text-sm leading-relaxed text-gray-800"></div>

                <!-- Signature -->
                <div class="flex items-center justify-between border-t border-gray-200 mt-8 pt-6">
                  <div class="flex flex-col">
                    <span class="text-gray-800 font-bold text-sm">{{ signatureName() }}</span>
                    <span class="text-gray-500 text-xs mt-1">{{ signatureSubtitle() }}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="w-0.5 h-10 bg-[var(--brand-primary)]"></div>
                    <div class="bg-[var(--bg-base)] p-3 rounded flex items-center justify-center">
                      <app-zafirus-logo [size]="24" />
                    </div>
                  </div>
                </div>

                <!-- Confidentiality -->
                <div class="mt-6 pt-4 border-t border-gray-100">
                  <p class="text-[10px] text-gray-400 leading-relaxed">
                    Este correo y sus adjuntos son confidenciales y están destinados exclusivamente al destinatario indicado.
                    Si lo recibiste por error, por favor eliminalo y avisá al remitente.
                  </p>
                </div>
              </div>

              <!-- Approval status -->
              <div class="mt-4 flex justify-center">
                @if (isApproved()) {
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                    [class]="changedAfterApproval() ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]' : 'bg-[var(--status-success-subtle)] text-[var(--status-success)]'"
                  >{{ changedAfterApproval() ? 'Cambios posteriores a la aprobación' : 'Plantilla aprobada' }}</span>
                } @else {
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">Pendiente de aprobación</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    @media (max-width: 768px) {
      .email-tab-body {
        grid-template-columns: 1fr !important;
        overflow-y: auto !important;
      }
    }
  `],
})
export class EmailTabComponent implements AfterViewInit {
  readonly svc = inject(OnboardingMockService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  readonly mode = signal<'edit' | 'preview'>('edit');
  readonly selectedVariable = signal<string | null>(null);
  readonly changedAfterApproval = signal(false);
  readonly variableGroups = VARIABLE_GROUPS;

  signatureType: SignatureType = 'rrhh';
  signatureVisibleName = '';
  signatureSubtitleText = 'www.zafirus.tech';

  private _variables = signal<EmailVariable[]>(this._buildInitialVariables());
  private _editorInitialized = false;

  // Computed
  readonly subject = computed(() => this.svc.selectedCase()?.emailTemplate?.subject || '');
  readonly isApproved = computed(() => !!(this.svc.selectedCase()?.emailTemplate?.approvedAt));

  ngAfterViewInit(): void {
    this._initEditor();
  }

  variablesByGroup(group: string): EmailVariable[] {
    return this._variables().filter(v => v.group === group);
  }

  signatureName(): string {
    if (this.signatureType === 'rrhh') return 'Recursos Humanos';
    return this.signatureVisibleName || 'Nombre visible';
  }

  signatureSubtitle(): string {
    return this.signatureSubtitleText || 'www.zafirus.tech';
  }

  onSubjectChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const c = this.svc.selectedCase();
    if (c) {
      this.svc.updateEmailTemplate(c.id, { subject: val });
      this._markChanged();
    }
  }

  onBodyInput(): void {
    const c = this.svc.selectedCase();
    if (c && this.editorRef?.nativeElement) {
      this.svc.updateEmailTemplate(c.id, { bodyHtml: this.editorRef.nativeElement.innerHTML });
      this._markChanged();
    }
  }

  onEditorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('var-pill') || target.closest('.var-pill')) {
      const pill = target.classList.contains('var-pill') ? target : target.closest('.var-pill') as HTMLElement;
      const key = pill?.getAttribute('data-variable');
      if (key) this.selectedVariable.set(key);
    }
  }

  onVariableEdit(key: VariableKey, event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this._variables.update(vars => vars.map(v => v.key === key ? { ...v, value: val } : v));
    this._updatePillsInEditor(key, val);
    this._markChanged();
  }

  onSignatureChange(): void {
    this._markChanged();
  }

  insertVariable(key: VariableKey): void {
    const v = this._variables().find(x => x.key === key);
    if (!v || !this.editorRef?.nativeElement) return;

    const pillHtml = `<span class="var-pill" data-variable="${key}" contenteditable="false">${this._escapeHtml(v.value || '(falta)')}</span>&nbsp;`;

    const editor = this.editorRef.nativeElement;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement('div');
      temp.innerHTML = pillHtml;
      const frag = document.createDocumentFragment();
      while (temp.firstChild) frag.appendChild(temp.firstChild);
      range.insertNode(frag);
      range.collapse(false);
    } else {
      editor.innerHTML += pillHtml;
    }

    this.svc.updateEmailTemplate(this.svc.selectedCase()!.id, { bodyHtml: editor.innerHTML });
    this._markChanged();
  }

  handleApprove(): void {
    const c = this.svc.selectedCase();
    if (c) {
      this.svc.approveEmail(c.id);
      this.changedAfterApproval.set(false);
    }
  }

  /**
   * Resolve body HTML for preview: replace pills with plain text values.
   * Security: strips script tags and on* attributes.
   * TODO: Production needs stricter sanitization before saving/sending.
   */
  previewHtml(): SafeHtml {
    const c = this.svc.selectedCase();
    if (!c?.emailTemplate?.bodyHtml) return '';
    let html = c.emailTemplate.bodyHtml;

    // Strip script tags
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Strip on* event attributes
    html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    // Strip javascript: URLs
    html = html.replace(/javascript\s*:/gi, '');

    // Replace var-pills with plain text
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('.var-pill[data-variable]').forEach(pill => {
      const key = pill.getAttribute('data-variable') as VariableKey;
      const v = this._variables().find(x => x.key === key);
      const text = v?.value || '(falta)';
      pill.replaceWith(document.createTextNode(text));
    });
    // Remove contenteditable attributes
    doc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

    const cleanHtml = doc.body.innerHTML;
    // bypassSecurityTrustHtml is necessary here for rendering the email preview.
    // TODO: Production requires server-side sanitization before persisting.
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }

  // ── Private ──

  private _initEditor(): void {
    if (this._editorInitialized) return;
    const c = this.svc.selectedCase();
    if (c?.emailTemplate?.bodyHtml && this.editorRef?.nativeElement) {
      // Populate editor with initial HTML, replacing pill text with current variable values
      let html = c.emailTemplate.bodyHtml;
      this._variables().forEach(v => {
        const regex = new RegExp(`(<span[^>]*data-variable="${v.key}"[^>]*>)[^<]*(</span>)`, 'g');
        html = html.replace(regex, `$1${this._escapeHtml(v.value)}$2`);
      });
      this.editorRef.nativeElement.innerHTML = html;
      this._editorInitialized = true;
    }
  }

  private _updatePillsInEditor(key: VariableKey, value: string): void {
    if (!this.editorRef?.nativeElement) return;
    const pills = this.editorRef.nativeElement.querySelectorAll(`.var-pill[data-variable="${key}"]`);
    pills.forEach(pill => {
      pill.textContent = value || '(falta)';
      pill.setAttribute('contenteditable', 'false');
    });
    // Sync back
    const c = this.svc.selectedCase();
    if (c) this.svc.updateEmailTemplate(c.id, { bodyHtml: this.editorRef.nativeElement.innerHTML });
  }

  private _markChanged(): void {
    if (this.isApproved()) this.changedAfterApproval.set(true);
  }

  private _escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  private _buildInitialVariables(): EmailVariable[] {
    return [
      { key: 'firstName',            label: 'Nombre',                group: 'Colaborador', value: 'Lucas', required: true },
      { key: 'lastName',             label: 'Apellido',              group: 'Colaborador', value: 'Gómez', required: true },
      { key: 'startDateFormatted',   label: 'Fecha de ingreso',     group: 'Colaborador', value: '28/5/2026', required: true },
      { key: 'corporateEmail',       label: 'Email corporativo',    group: 'Acceso',      value: 'lgomez@zafirus.tech', required: true },
      { key: 'temporaryPassword',    label: 'Contraseña temporal',  group: 'Acceso',      value: 'JT54MJaxzkzR', demo: true },
      { key: 'onboardingFolderUrl',  label: 'Carpeta onboarding',   group: 'Recursos',    value: 'https://drive.google.com/drive/folders/demo', optional: true },
      { key: 'kitRedesUrl',          label: 'Kit de redes',         group: 'Recursos',    value: 'https://drive.google.com/kit-redes-demo', optional: true },
      { key: 'welcomeMeetingTime',   label: 'Horario RRHH',        group: 'Agenda',      value: '19/05 - 9:30 hs' },
      { key: 'welcomeMeetingLink',   label: 'Link RRHH',           group: 'Agenda',      value: 'meet.google.com/rh' },
      { key: 'managerMeetingTime',   label: 'Horario manager',     group: 'Agenda',      value: '19/05 - 12:00 hs' },
      { key: 'managerName',          label: 'Nombre manager',      group: 'Agenda',      value: 'Ana Silva' },
      { key: 'managerMeetingLink',   label: 'Link manager',        group: 'Agenda',      value: 'meet.google.com/ana' },
      { key: 'candidateFormUrl',     label: 'Formulario candidato', group: 'Recursos',   value: 'https://zafirustech.com/onboarding/form/123', optional: true },
    ];
  }
}
