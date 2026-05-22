import { useStore } from '../../../store';
import { Button } from '../../ui/Button';
import { Mail, Check, AlertCircle, Copy, FileText, Calendar, Link, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useState, useRef, useEffect } from 'react';
import { ZafirusLogo } from '../../ui/ZafirusLogo';

// ─── UTILS & CONSTANTS ──────────────────────────────────────────────
const AGENDA_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'welcomeMeetingTime', label: 'Horario onboarding RRHH', placeholder: 'ej: 19/05 - 9:30 hs' },
  { key: 'welcomeMeetingLink', label: 'Link Meet RRHH', placeholder: 'https://meet.google.com/…' },
  { key: 'managerMeetingTime', label: 'Horario reunión manager', placeholder: 'ej: 19/05 - 12:00 hs' },
  { key: 'managerMeetingLink', label: 'Link Meet manager', placeholder: 'https://meet.google.com/…' },
  { key: 'onboardingFolderUrl', label: 'Carpeta de onboarding', placeholder: 'https://drive.google.com/…' },
  { key: 'kitRedesUrl', label: 'Kit de redes', placeholder: 'https://drive.google.com/…' },
];

const VARIABLE_GROUPS = [
  {
    title: 'Colaborador',
    keys: ['firstName', 'fullName', 'startDate']
  },
  {
    title: 'Acceso',
    keys: ['corporateEmail', 'temporaryPassword']
  },
  {
    title: 'Agenda',
    keys: ['hrMeetingDate', 'hrMeetingUrl', 'managerMeetingDate', 'managerMeetingUrl', 'managerName']
  },
  {
    title: 'Recursos',
    keys: ['onboardingFolderUrl', 'kitRedesUrl']
  }
];

// ─── LOCAL COMPONENTS ────────────────────────────────────────────────

function EmailSignatureBanner() {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 mt-8 pt-6">
      <div className="flex flex-col">
        <span className="text-gray-800 font-bold text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
          Recursos Humanos
        </span>
        <span className="text-gray-500 text-xs mt-1">www.zafirus.tech</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-0.5 h-10 bg-[var(--brand-primary)]" />
        <div className="bg-[var(--bg-base)] p-3 rounded flex items-center justify-center">
          <ZafirusLogo size={24} glow={false} />
        </div>
      </div>
    </div>
  );
}

function VariableToken({ label, token, isMissing, isDemo }: { label: string, token: string, isMissing: boolean, isDemo?: boolean }) {
  return (
    <div className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded px-2.5 py-1.5 mb-1.5">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{token}</span>
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
        isMissing ? "bg-[var(--status-error-subtle)] text-[var(--status-error)]" :
        isDemo ? "bg-[var(--status-warning-subtle)] text-[var(--status-warning)]" :
        "bg-[var(--status-success-subtle)] text-[var(--status-success)]"
      )}>
        {isMissing ? 'Falta dato' : isDemo ? 'Demo' : 'Disponible'}
      </span>
    </div>
  );
}

function WelcomeEmailPreview({ variables, subject }: { variables: Record<string, string>, subject: string }) {
  const resolve = (key: string) => {
    const val = variables[key];
    if (!val) return <span className="inline-block px-1 bg-red-100 text-red-700 font-mono text-[11px] rounded border border-red-200">[{key}]</span>;
    return val;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full text-gray-800" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Email Header Fake UI */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="text-xs text-gray-500 mb-1">Asunto:</div>
        <div className="text-sm font-semibold text-gray-900">{subject || '¡Bienvenido/a a Zafirus!'}</div>
      </div>

      <div className="p-6 lg:p-8 overflow-y-auto flex-1 text-[13px] leading-relaxed">
        <h1 className="text-xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--brand-primary)' }}>
          ¡BIENVENIDA/O A ZAFIRUS TECHNOLOGIES!
        </h1>

        <p className="mb-4 text-sm font-medium">
          ¡{resolve('firstName')}, nos alegra mucho que te sumes al equipo!<br />
          Tu fecha de ingreso es el: {resolve('startDate')}
        </p>

        <p className="mb-6">
          Te compartimos la información de ingreso. Quedamos atentos a la confirmación de recepción.
        </p>

        {/* Workspace */}
        <div className="mb-6">
          <h2 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2">Google Workspace</h2>
          <p>Usuario: <strong>{resolve('corporateEmail')}</strong></p>
          <p className="flex items-center gap-1.5 mt-1">
            Contraseña temporal: <span className="font-mono bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">{resolve('temporaryPassword')}</span>
          </p>
          <p className="text-xs text-gray-500 italic mt-1">* Doble autenticación requerida al iniciar sesión.</p>
        </div>

        {/* RRHH Platform */}
        <div className="mb-6">
          <h2 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2">Plataforma de Recursos Humanos</h2>
          <p className="text-gray-600">
            En el flujo actual, esta información puede convivir con PeopleForce hasta completar la migración.
          </p>
        </div>

        {/* Onboarding Folder */}
        <div className="mb-6">
          <h2 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[var(--brand-primary)]" /> Carpeta de onboarding
          </h2>
          <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-2">
            <li>Documentos y políticas internas</li>
            <li>Video institucional</li>
            <li>Materiales de referencia</li>
            <li>Fondos personalizados y otros recursos</li>
          </ul>
          <a href="#" className="text-[var(--brand-primary)] font-medium underline" onClick={e => e.preventDefault()}>
            {resolve('onboardingFolderUrl')}
          </a>
        </div>

        {/* Kit de redes */}
        <div className="mb-6">
          <h2 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2 flex items-center gap-1.5">
            <Link className="w-4 h-4 text-[var(--brand-primary)]" /> Kit de redes y comunicación
          </h2>
          <p className="text-gray-600 mb-1">Fondos, avatares y recursos de marca para tus perfiles.</p>
          <a href="#" className="text-[var(--brand-primary)] font-medium underline" onClick={e => e.preventDefault()}>
            {resolve('kitRedesUrl')}
          </a>
        </div>

        {/* Agenda */}
        <div className="mb-6">
          <h2 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--brand-primary)]" /> Agenda de los primeros días
          </h2>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-3">
            <div>
              <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Onboarding con Recursos Humanos</p>
              <p className="font-medium mt-0.5">{resolve('hrMeetingDate')}</p>
              <a href="#" className="text-[var(--brand-primary)] text-xs underline" onClick={e => e.preventDefault()}>{resolve('hrMeetingUrl')}</a>
            </div>
            <div>
              <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider">Primera reunión con responsable directo ({resolve('managerName')})</p>
              <p className="font-medium mt-0.5">{resolve('managerMeetingDate')}</p>
              <a href="#" className="text-[var(--brand-primary)] text-xs underline" onClick={e => e.preventDefault()}>{resolve('managerMeetingUrl')}</a>
            </div>
          </div>
        </div>

        {/* Computer */}
        <div className="mb-6">
          <h2 className="font-bold text-sm border-b border-gray-200 pb-1 mb-2">Computadora corporativa</h2>
          <p>Te compartiremos el comodato para confirmar la recepción del dispositivo.</p>
        </div>

        {/* Closing */}
        <p className="mb-6">
          Ante cualquier duda o necesidad previa a tu ingreso, no dudes en escribirnos.<br />
          ¡Te damos la bienvenida y nos vemos muy pronto!
        </p>

        <EmailSignatureBanner />

        {/* Confidentiality */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Confidencialidad</p>
          <p className="text-[10px] text-gray-400 leading-tight">
            Este mensaje puede contener información privada y confidencial dirigida únicamente a su destinatario.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN TAB COMPONENT ─────────────────────────────────────────────

export function EmailTab() {
  const { getSelectedCase, updateEmailTemplate, approveEmail, addToast } = useStore();
  const selectedCase = getSelectedCase();
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('preview');
  const [showHint, setShowHint] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!selectedCase) return null;

  const { employee, suggestedEmail, emailTemplate } = selectedCase;

  // Compute variables safely
  const variables: Record<string, string> = {
    firstName: employee.name,
    fullName: `${employee.name} ${employee.lastName}`,
    corporateEmail: employee.corporateEmail || suggestedEmail || '',
    temporaryPassword: emailTemplate?.temporaryPassword || 'Cambiar2026-DEMO',
    startDate: new Date(employee.startDate).toLocaleDateString('es-AR'),
    managerName: employee.managerName || '',
    onboardingFolderUrl: emailTemplate?.onboardingFolderUrl || 'https://drive.google.com/drive/folders/demo',
    kitRedesUrl: (emailTemplate as any)?.kitRedesUrl || 'https://drive.google.com/kit-redes-demo',
    hrMeetingDate: emailTemplate?.welcomeMeetingTime || '',
    hrMeetingUrl: emailTemplate?.welcomeMeetingLink || 'https://meet.google.com/demo',
    managerMeetingDate: emailTemplate?.managerMeetingTime || '',
    managerMeetingUrl: emailTemplate?.managerMeetingLink || 'https://meet.google.com/demo',
  };

  const isApproved = emailTemplate?.approvedAt != null;

  const handleApprove = () => {
    approveEmail(selectedCase.id);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(variables.corporateEmail);
    addToast({ type: 'success', title: 'Email copiado' });
  };

  const insertVariable = (varName: string) => {
    if (isApproved) return;
    const value = variables[varName] || `{{${varName}}}`;
    const pill = `<span class="var-pill bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] px-1 py-0.5 rounded font-mono text-xs border border-[var(--brand-primary)]/20 cursor-default mx-0.5" data-variable="${varName}" contenteditable="false">${value}</span>&nbsp;`;

    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const temp = document.createElement('div');
        temp.innerHTML = pill;

        const frag = document.createDocumentFragment();
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }

        const lastNode = frag.lastChild;
        range.insertNode(frag);
        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
      }
      updateEmailTemplate(selectedCase.id, { bodyHtml: editorRef.current.innerHTML });
    }
  };

  useEffect(() => {
    if (activeView === 'editor') {
      setShowHint(true);
      hintTimerRef.current = setTimeout(() => setShowHint(false), 3500);
    }
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [activeView]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  useEffect(() => {
    if (editorRef.current && emailTemplate?.bodyHtml && activeView === 'editor') {
      // Re-hydrate variables
      const hydratedHtml = emailTemplate.bodyHtml.replace(/<span([^>]*data-variable="([^"]+)"[^>]*)>.*?<\/span>/g, (_match, attrs, varName) => {
        const val = variables[varName] || `{{${varName}}}`;
        return `<span${attrs}>${val}</span>`;
      });
      if (editorRef.current.innerHTML !== hydratedHtml) {
          editorRef.current.innerHTML = hydratedHtml;
      }
    }
  }, [emailTemplate?.bodyHtml, activeView]);

  return (
    <div className={cn(
      "flex flex-col lg:flex-row overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-base)]",
      isFullscreen
        ? "fixed inset-0 z-50 rounded-none border-0"
        : "h-full -mx-4 lg:-mx-6 -my-4 rounded-lg"
    )}>

      {/* ══════════════ LEFT SIDEBAR ══════════════ */}
      <div className="w-full lg:w-72 flex-shrink-0 bg-[var(--bg-subtle)] border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] flex flex-col overflow-y-auto">

        {/* Title */}
        <div className="px-4 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <p className="text-sm font-bold text-[var(--text-primary)]">Email de bienvenida</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
            Plantilla que recibirá el colaborador cuando el caso sea aprobado.
          </p>
        </div>

        {/* Template status panel */}
        <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Estado de la plantilla</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Email corporativo</span>
              <span className={variables.corporateEmail ? "text-[var(--status-success)] font-medium" : "text-[var(--status-error)] font-medium"}>
                {variables.corporateEmail ? 'Listo' : 'Falta dato'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Agenda</span>
              <span className={variables.hrMeetingDate && variables.managerMeetingDate ? "text-[var(--status-success)] font-medium" : "text-[var(--text-tertiary)]"}>
                {variables.hrMeetingDate && variables.managerMeetingDate ? 'Listo' : 'Opcional'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Aprobación</span>
              <span className={isApproved ? "text-[var(--status-success)] font-medium" : "text-[var(--text-tertiary)]"}>
                {isApproved ? 'Aprobada' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        {/* Variables */}
        <div className="px-4 py-4 flex-1">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Variables del caso</p>

          <div className="space-y-4">
            {VARIABLE_GROUPS.map(group => (
              <div key={group.title}>
                <p className="text-[10px] text-[var(--text-tertiary)] mb-1.5">{group.title}</p>
                {group.keys.map(key => {
                  const val = variables[key];
                  const isDemo = key === 'temporaryPassword' || val?.includes('demo');
                  const label = key === 'firstName' ? 'Nombre' :
                                key === 'fullName' ? 'Nombre completo' :
                                key === 'startDate' ? 'Fecha de ingreso' :
                                key === 'corporateEmail' ? 'Email corporativo' :
                                key === 'temporaryPassword' ? 'Password temporal' :
                                key === 'managerName' ? 'Manager' :
                                key === 'onboardingFolderUrl' ? 'Link carpeta' :
                                key === 'kitRedesUrl' ? 'Kit de redes' :
                                key === 'hrMeetingDate' ? 'Fecha RRHH' :
                                key === 'hrMeetingUrl' ? 'Link RRHH' :
                                key === 'managerMeetingDate' ? 'Fecha manager' :
                                key === 'managerMeetingUrl' ? 'Link manager' : key;

                  return (
                    <button
                      key={key}
                      disabled={isApproved || activeView === 'preview'}
                      onClick={() => insertVariable(key)}
                      className={cn(
                        "w-full text-left transition-opacity",
                        isApproved || activeView === 'preview' ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"
                      )}
                      title={activeView === 'preview' ? "Cambiá a vista editable para insertar variables" : "Insertar en el editor"}
                    >
                      <VariableToken label={label} token={`{{${key}}}`} isMissing={!val} isDemo={isDemo} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            {AGENDA_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] mb-1">{f.label}</label>
                <input
                  type="text"
                  value={(emailTemplate as any)?.[f.key] || ''}
                  onChange={e => updateEmailTemplate(selectedCase.id, { [f.key]: e.target.value })}
                  disabled={isApproved}
                  placeholder={f.placeholder}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:border-[var(--border-focus)] disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN AREA ══════════════ */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top Controls */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-default)]">
            <button
              onClick={() => setActiveView('preview')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]",
                activeView === 'preview' ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Vista previa
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]",
                activeView === 'editor' ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Editor
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)]"
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {isApproved ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--status-success-subtle)] text-[var(--status-success)] rounded-lg text-sm font-bold border border-[var(--status-success)]/20">
                <Check className="w-4 h-4" />
                Plantilla aprobada
              </div>
            ) : (
              <Button onClick={handleApprove} className="min-h-[36px]">
                <Check className="w-4 h-4" />
                Aprobar plantilla
              </Button>
            )}
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-base)] p-4 lg:p-8 flex justify-center">

          {activeView === 'preview' ? (
            <div className="w-full max-w-2xl flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Vista previa del email final</h3>
                <p className="text-sm text-[var(--text-secondary)]">Así verá el colaborador el email cuando RRHH apruebe la plantilla.</p>
              </div>
              <div className="flex-1">
                <WelcomeEmailPreview variables={variables} subject={emailTemplate?.subject || 'Bienvenido a Zafirus'} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Mensaje editable</h3>
                <p className="text-sm text-[var(--text-secondary)]">Este contenido es el cuerpo interno del email. Las credenciales, agenda y enlaces se completan automáticamente.</p>
                {!isApproved && (
                  <div className="mt-2 flex items-center h-9">
                    {showHint ? (
                      <p className="text-xs text-[var(--status-info)] flex items-center gap-1.5 bg-[var(--status-info-subtle)] p-2 rounded border border-[var(--status-info)]/20 transition-opacity duration-500">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Hacé clic en los chips de la barra lateral para insertar variables en el cursor.
                      </p>
                    ) : (
                      <button
                        onClick={() => setShowHint(true)}
                        className="text-[var(--status-info)] hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-glow)] rounded"
                        title="Hacé clic en los chips de la barra lateral para insertar variables en el cursor."
                        aria-label="Ver instrucciones del editor"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-focus)] rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-16">Asunto:</span>
                  <input
                    value={emailTemplate?.subject || ''}
                    onChange={e => updateEmailTemplate(selectedCase.id, { subject: e.target.value })}
                    disabled={isApproved}
                    className="flex-1 text-sm font-medium text-[var(--text-primary)] bg-transparent outline-none disabled:opacity-60"
                  />
                </div>

                <div
                  ref={editorRef}
                  contentEditable={!isApproved}
                  suppressContentEditableWarning
                  onInput={() => {
                    if (editorRef.current) {
                      updateEmailTemplate(selectedCase.id, { bodyHtml: editorRef.current.innerHTML });
                    }
                  }}
                  className={cn(
                    'flex-1 p-6 text-[var(--text-primary)] text-sm leading-relaxed outline-none overflow-y-auto',
                    isApproved && 'opacity-75 cursor-not-allowed'
                  )}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
