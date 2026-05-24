# QA Parity Checklist — React ↔ Angular

## Shell

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Navy sidebar with logo                     | ✅    | ✅      | Added icon sidebar in Angular  |
| Compact top bar                            | ✅    | ✅      |                                |
| Real Zafirus SVG logo                      | ✅    | ✅      | Same paths                     |
| Light gray workspace bg                    | ✅    | ✅      |                                |
| Sora font loaded                           | ✅    | ✅      |                                |
| CSS variables (design tokens)              | ✅    | ✅      | Same tokens                    |
| Toast notifications                        | ✅    | ✅      |                                |

## CaseList

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Case cards with avatar initials            | ✅    | ✅      |                                |
| Status chip (colored)                      | ✅    | ✅      |                                |
| Priority sorting                           | ✅    | ✅      |                                |
| Next action hint                           | ✅    | ✅      |                                |
| Updated timestamp                          | ✅    | ✅      |                                |
| Create new case button                     | ✅    | ✅      |                                |
| Empty state                                | ✅    | ✅      |                                |
| Selected state highlight                   | ✅    | ✅      |                                |

## NewCaseModal

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Grouped fields (Identity, Location, etc.)  | ✅    | ✅      |                                |
| Section color accents                      | ✅    | ✅      |                                |
| Required validation                        | ✅    | ✅      |                                |
| Live summary panel                         | ✅    | ✅      |                                |
| "Crear caso" / "Cancelar" footer           | ✅    | ✅      |                                |
| Optional agenda section                    | ✅    | ✅      |                                |

## CaseDetail

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Tab strip (5 tabs)                         | ✅    | ✅      |                                |
| Active tab pill styling                    | ✅    | ✅      |                                |
| Task badge on Tasks tab                    | ✅    | ✅      |                                |
| Back to list (mobile)                      | ✅    | ✅      |                                |
| Empty state when no case selected          | ✅    | ✅      |                                |

## CaseActions

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Contextual actions per status              | ✅    | ✅      |                                |
| Correction modal                           | ✅    | ✅      |                                |
| Block modal                                | ✅    | ✅      |                                |
| Cancel confirmation                        | ✅    | ✅      |                                |

## OverviewTab

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Identity header (avatar, name, status)     | ✅    | ✅      |                                |
| Journey stepper                            | ✅    | ✅      |                                |
| Next milestone card                        | ✅    | ✅      |                                |
| Recent activity timeline                   | ✅    | ✅      |                                |
| Blocked/cancelled banners                  | ✅    | ✅      |                                |

## DataTab

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Directory data display                     | ✅    | ✅      |                                |
| Candidate data display                     | ✅    | ✅      |                                |
| Status badge (pending/submitted/consol.)   | ✅    | ✅      |                                |
| References list                            | ✅    | ✅      |                                |
| Consolidation CTA                          | ✅    | ✅      |                                |

## EmailTab

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Editable subject                           | ✅    | ✅      |                                |
| Editable body (contenteditable)            | ✅    | ✅      |                                |
| Variable pills (var-pill spans)            | ✅    | ✅      |                                |
| Pill click → sidebar highlight             | ✅    | ✅      |                                |
| Variable sidebar with groups               | ✅    | ✅      |                                |
| Editable variable inputs                   | ✅    | ✅      |                                |
| Insert variable button (+)                 | ✅    | ✅      |                                |
| Edit / Preview toggle                      | ✅    | ✅      |                                |
| Preview with resolved variables            | ✅    | ✅      |                                |
| Zafirus signature in preview               | ✅    | ✅      |                                |
| Confidentiality footer in preview          | —     | ✅      | Added in Angular               |
| Approval workflow                          | ✅    | ✅      |                                |
| Changed-after-approval state               | ✅    | ✅      |                                |
| Signature group in sidebar                 | —     | ✅      | Added in Angular               |

## TasksTab

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Progress ring                              | ✅    | ✅      |                                |
| Task list with status icons                | ✅    | ✅      |                                |
| Retry/Skip actions for failed tasks        | ✅    | ✅      |                                |
| Task labels in Spanish                     | ✅    | ✅      |                                |

## AuditTab

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Category-colored timeline                  | ✅    | ✅      |                                |
| Filters (pill buttons)                     | ✅    | ✅      |                                |
| Summary strip                              | ✅    | ✅      |                                |
| Redacted sensitive values                  | ✅    | ✅      |                                |
| No raw JSON                                | ✅    | ✅      |                                |

## Candidate Flow

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Welcome header with Zafirus logo           | ✅    | ✅      |                                |
| 4-step wizard with progress                | ✅    | ✅      |                                |
| Fiscal data step                           | ✅    | ✅      |                                |
| Payment method step                        | ✅    | ✅      |                                |
| References step                            | ✅    | ✅      |                                |
| Files step (mock)                          | ✅    | ✅      |                                |
| Submit → data visible in DataTab           | ✅    | ✅      |                                |
| Submitted confirmation                     | ✅    | ✅      |                                |
| Correction notice                          | ✅    | ✅      |                                |

## Responsive

| Feature                                    | React | Angular | Notes                          |
|--------------------------------------------|-------|---------|--------------------------------|
| Mobile case list / detail toggle           | ✅    | ✅      |                                |
| Email tab responsive grid                  | ✅    | ✅      |                                |
| Candidate panel hidden <1180px             | ✅    | ✅      |                                |

## Security (EmailTab)

| Requirement                                | Status |
|--------------------------------------------|--------|
| No Angular template compilation from body  | ✅     |
| No `{{...}}` as Angular interpolation      | ✅     |
| Script tags stripped in preview            | ✅     |
| on* event attributes stripped in preview   | ✅     |
| javascript: URLs stripped in preview       | ✅     |
| bypassSecurityTrustHtml documented w/ TODO | ✅     |
| Prototype-safe note added                  | ✅     |
