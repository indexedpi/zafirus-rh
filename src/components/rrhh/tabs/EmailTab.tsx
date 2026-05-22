import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import { Mail, Check, Edit2, Eye, AlertCircle, Copy, CircleDot } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useState, useRef, useEffect } from 'react';

const SYSTEM_VAR_KEYS = ['firstName', 'lastName', 'fullName', 'corporateEmail', 'temporaryPassword', 'startDate', 'startDateFormatted', 'role', 'team', 'managerName'];
const AGENDA_VAR_KEYS = ['welcomeMeetingTime', 'welcomeMeetingLink', 'managerMeetingTime', 'managerMeetingLink', 'onboardingFolderUrl', 'kitRedesUrl', 'candidateFormUrl'];

// Kept for sidebar variable list (subset without fullName/startDateFormatted for compactness)
const SIDEBAR_SYSTEM_VARS = ['firstName', 'lastName', 'corporateEmail', 'startDate', 'startDateFormatted', 'temporaryPassword', 'role', 'team', 'managerName', 'candidateFormUrl'] as const;

const AGENDA_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'welcomeMeetingTime', label: 'Horario onboarding RRHH', placeholder: 'ej: 19/05 - 9:30 hs' },
  { key: 'welcomeMeetingLink', label: 'Link Meet RRHH', placeholder: 'https://meet.google.com/…' },
  { key: 'managerMeetingTime', label: 'Horario reunión manager', placeholder: 'ej: 19/05 - 12:00 hs' },
  { key: 'managerMeetingLink', label: 'Link Meet manager', placeholder: 'https://meet.google.com/…' },
  { key: 'onboardingFolderUrl', label: 'Carpeta de onboarding', placeholder: 'https://drive.google.com/…' },
  { key: 'kitRedesUrl', label: 'Kit de Redes', placeholder: 'https://drive.google.com/…' },
];

const GROUP_CATEGORY_STYLES: Record<string, string> = {
  team: 'bg-[var(--status-info-subtle)] text-[var(--status-info)]',
  country: 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]',
  all: 'bg-[var(--status-success-subtle)] text-[var(--status-success)]',
  cross: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
};

export function EmailTab() {
  const { getSelectedCase, updateEmailTemplate, approveEmail, addToast } = useStore();
  const selectedCase = getSelectedCase();
  const [isPreview, setIsPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [varFilter, setVarFilter] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showVariables) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowVariables(false);
        setVarFilter('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVariables]);

  // Reset filter when dropdown closes
  useEffect(() => {
    if (!showVariables) setVarFilter('');
  }, [showVariables]);

  if (!selectedCase) return null;

  const { employee, suggestedEmail, suggestedGroups, emailTemplate, candidateToken } = selectedCase;

  const variables: Record<string, string> = {
    firstName: employee.name,
    lastName: employee.lastName,
    fullName: `${employee.name} ${employee.lastName}`,
    corporateEmail: employee.corporateEmail || suggestedEmail || '',
    temporaryPassword: emailTemplate?.temporaryPassword || '',
    startDate: new Date(employee.startDate).toLocaleDateString('es-AR'),
    startDateFormatted: new Date(employee.startDate).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
    role: employee.role,
    team: employee.team,
    managerName: employee.managerName,
    welcomeMeetingTime: emailTemplate?.welcomeMeetingTime || '',
    welcomeMeetingLink: emailTemplate?.welcomeMeetingLink || '',
    managerMeetingTime: emailTemplate?.managerMeetingTime || '',
    managerMeetingLink: emailTemplate?.managerMeetingLink || '',
    onboardingFolderUrl: emailTemplate?.onboardingFolderUrl || '',
    kitRedesUrl: emailTemplate?.kitRedesUrl || '',
    candidateFormUrl: `${window.location.origin}/demo#candidate=${candidateToken}`,
  };

  const resolveVariables = (html: string): string => {
    return html.replace(/<span[^>]*data-variable="([^"]+)"[^>]*>.*?<\/span>/g, (_, varName) => {
      return variables[varName] || `[${varName}]`;
    });
  };

  const updatePillValues = (html: string): string => {
    return html.replace(/<span([^>]*data-variable="([^"]+)"[^>]*)>.*?<\/span>/g, (_match, attrs, varName) => {
      const value = variables[varName] || `{{${varName}}}`;
      return `<span${attrs}>${value}</span>`;
    });
  };

  useEffect(() => {
    if (editorRef.current && emailTemplate?.bodyHtml) {
      editorRef.current.innerHTML = updatePillValues(emailTemplate.bodyHtml);
    }
  }, [emailTemplate?.bodyHtml]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      updateEmailTemplate(selectedCase.id, { bodyHtml: editorRef.current.innerHTML });
    }
  };

  const handleSubjectChange = (value: string) => {
    updateEmailTemplate(selectedCase.id, { subject: value });
  };

  const handleApprove = () => {
    approveEmail(selectedCase.id);
  };

  const insertVariable = (varName: string) => {
    const value = variables[varName] || `{{${varName}}}`;
    const pill = `<span class="var-pill" data-variable="${varName}" contenteditable="false">${value}</span>`;

    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const temp = document.createElement('div');
        temp.innerHTML = pill;
        const node = temp.firstChild;
        if (node) {
          range.insertNode(node);
          range.setStartAfter(node);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      handleEditorInput();
    }
    setShowVariables(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(suggestedEmail || '');
    addToast({ type: 'success', title: 'Email copiado' });
  };

  const isApproved = emailTemplate?.approvedAt != null;

  // ─── RENDER ────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden -mx-4 lg:-mx-6 -my-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]">
      {/* ══════════════ SIDEBAR ══════════════ */}
      <div className="w-full lg:w-60 flex-shrink-0 bg-[var(--bg-subtle)] border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] flex flex-col overflow-y-auto">

        {/* ─── Email corporativo ─── */}
        <div className="px-4 pt-4 pb-3 border-b border-[var(--border-subtle)]">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Email corporativo</p>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{suggestedEmail || '—'}</span>
            <button onClick={handleCopyEmail} className="p-1 rounded hover:bg-white/[0.06] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex-shrink-0" title="Copiar">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Grupos ─── */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Grupos ({suggestedGroups.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedGroups.map(g => (
              <span
                key={g.email}
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full',
                  GROUP_CATEGORY_STYLES[g.category] || GROUP_CATEGORY_STYLES.cross,
                )}
                title={g.email}
              >
                {g.displayName}
                {g.status === 'added' && <CircleDot className="w-3 h-3 text-[var(--status-success)]" />}
              </span>
            ))}
          </div>
        </div>

        {/* ─── Variables del sistema ─── */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Variables</p>
          <div className="space-y-0.5">
            {SIDEBAR_SYSTEM_VARS.map(varName => {
              const val = variables[varName];
              return (
                <button
                  key={varName}
                  onClick={() => insertVariable(varName)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-[var(--bg-elevated)] text-left transition-colors group"
                  title={`Insertar {{${varName}}}`}
                >
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">{varName}</span>
                  <span className={cn(
                    'text-[10px] truncate max-w-[80px]',
                    val ? 'text-[var(--text-tertiary)]' : 'text-[var(--status-error)]',
                  )}>
                    {val || '(vacío)'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Variables de agenda ─── */}
        <div className="px-4 py-3 flex-1">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Agenda</p>
          <div className="space-y-3">
            {AGENDA_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">{f.label}</label>
                <input
                  type="text"
                  value={(emailTemplate as any)?.[f.key] || ''}
                  onChange={e => updateEmailTemplate(selectedCase.id, { [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:shadow-[var(--shadow-focus)] transition-[border-color,box-shadow]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ EDITOR AREA ══════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--editor-bg)]">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 lg:px-4 py-2 bg-[var(--editor-toolbar-bg)] border-b border-[var(--editor-border)] overflow-x-auto scrollbar-hide flex-shrink-0">
          <button onClick={() => document.execCommand('bold')} className="p-2 rounded hover:bg-[var(--editor-hover-bg)] text-[var(--editor-text)] font-bold text-sm" title="Negrita (Ctrl+B)">B</button>
          <button onClick={() => document.execCommand('italic')} className="p-2 rounded hover:bg-[var(--editor-hover-bg)] text-[var(--editor-text)] italic text-sm" title="Cursiva (Ctrl+I)">I</button>
          <button onClick={() => document.execCommand('underline')} className="p-2 rounded hover:bg-[var(--editor-hover-bg)] text-[var(--editor-text)] underline text-sm" title="Subrayado (Ctrl+U)">U</button>
          <div className="w-px h-6 bg-[var(--editor-border)] mx-1" />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVariables(!showVariables)}
              className={cn(
                'p-2 rounded text-sm flex items-center gap-1',
                showVariables ? 'bg-[var(--editor-active-bg)] text-[var(--editor-active-text)]' : 'hover:bg-[var(--editor-hover-bg)] text-[var(--editor-text)]',
              )}
              title="Insertar variable"
            >
              @var
            </button>
            {showVariables && (() => {
              const lc = varFilter.toLowerCase();
              const filteredSystem = SYSTEM_VAR_KEYS.filter(k => k.toLowerCase().includes(lc));
              const filteredAgenda = AGENDA_VAR_KEYS.filter(k => k.toLowerCase().includes(lc));
              const hasResults = filteredSystem.length > 0 || filteredAgenda.length > 0;

              const renderItem = (key: string) => {
                const isEmpty = !variables[key];
                return (
                  <button
                    key={key}
                    onClick={() => { insertVariable(key); setVarFilter(''); }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[var(--editor-hover-bg)] flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-mono text-[var(--editor-text)] truncate">{key}</span>
                    <span className={`text-[11px] truncate max-w-[120px] ${isEmpty ? 'text-[var(--editor-warning-text)] font-medium' : 'text-[var(--editor-text-muted)]'}`}>
                      {isEmpty ? '⚠ (vacío)' : variables[key]}
                    </span>
                  </button>
                );
              };

              return (
                <div className="absolute top-full left-0 mt-1 bg-[var(--editor-bg)] border border-[var(--editor-border)] rounded-xl z-20 w-72 max-h-80 flex flex-col overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
                  {/* Search input */}
                  <input
                    autoFocus
                    placeholder="Buscar variable…"
                    value={varFilter}
                    onChange={e => setVarFilter(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') { setShowVariables(false); setVarFilter(''); } }}
                    className="w-full px-3 py-2 text-sm border-b border-[var(--editor-border)] outline-none bg-[var(--editor-bg)] text-[var(--editor-text)] placeholder-[var(--editor-text-hint)] flex-shrink-0"
                  />

                  <div className="overflow-y-auto flex-1">
                    {!hasResults && (
                      <p className="px-3 py-4 text-xs text-[var(--editor-text-hint)] text-center">Sin resultados para "{varFilter}"</p>
                    )}

                    {filteredSystem.length > 0 && (
                      <>
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[var(--editor-text-muted)] uppercase tracking-wider">Sistema</p>
                        {filteredSystem.map(renderItem)}
                      </>
                    )}

                    {filteredAgenda.length > 0 && (
                      <>
                        {filteredSystem.length > 0 && <div className="border-t border-[var(--editor-border)] my-1" />}
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-[var(--editor-text-muted)] uppercase tracking-wider">Agenda</p>
                        {filteredAgenda.map(renderItem)}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={cn(
              'p-2 rounded text-sm flex items-center gap-1.5',
              isPreview ? 'bg-[var(--editor-active-bg)] text-[var(--editor-active-text)]' : 'hover:bg-[var(--editor-hover-bg)] text-[var(--editor-text)]',
            )}
          >
            {isPreview ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreview ? 'Editar' : 'Preview'}
          </button>
        </div>

        {/* Subject */}
        <div className="px-4 py-2 border-b border-[var(--editor-border)] flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-[var(--editor-text-hint)] flex-shrink-0">Asunto:</span>
          <input
            value={emailTemplate?.subject || ''}
            onChange={e => handleSubjectChange(e.target.value)}
            disabled={isApproved}
            className="flex-1 text-sm text-[var(--editor-text)] bg-transparent outline-none disabled:opacity-60"
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isPreview ? (
            <div
              className="px-4 lg:px-8 py-4 lg:py-6 text-[var(--editor-text)] text-sm leading-relaxed"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              dangerouslySetInnerHTML={{ __html: resolveVariables(emailTemplate?.bodyHtml || '') }}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable={!isApproved}
              suppressContentEditableWarning
              onInput={handleEditorInput}
              className={cn(
                'px-4 lg:px-8 py-4 lg:py-6 text-[var(--editor-text)] text-sm leading-relaxed outline-none min-h-[300px] lg:min-h-[400px]',
                isApproved && 'opacity-75 cursor-not-allowed',
              )}
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--editor-toolbar-bg)] border-t border-[var(--editor-border)] flex-shrink-0">
          {isApproved ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--status-success)' }}>
              <Check className="w-4 h-4" />
              Email aprobado
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--editor-text-muted)]">
              <AlertCircle className="w-4 h-4" />
              Revisá el contenido antes de aprobar
            </div>
          )}
          {!isApproved && (
            <Button onClick={handleApprove}>
              <Check className="w-4 h-4" />
              Aprobar email
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
