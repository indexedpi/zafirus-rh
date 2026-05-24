# React → Angular Component Map

## Shell

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `App.tsx`                    | `app.component.ts` + `onboarding-page.component.ts`|
| `TopBar.tsx`                 | `shared/components/top-bar/`                       |
| `ZafirusLogo.tsx`            | `shared/components/zafirus-logo/`                  |
| (no sidebar in React)        | `shared/components/sidebar/`                       |

## RRHH Components

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `CaseList.tsx`               | `onboarding/components/case-list/`                 |
| `CaseDetail.tsx`             | `onboarding/components/case-detail/`               |
| `CaseActions.tsx`            | `onboarding/components/case-actions/`              |
| `NewCaseModal.tsx`           | `onboarding/components/new-case-modal/`            |

## Tabs

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `tabs/OverviewTab.tsx`       | `onboarding/components/tabs/overview-tab/`         |
| `tabs/DataTab.tsx`           | `onboarding/components/tabs/data-tab/`             |
| `tabs/EmailTab.tsx`          | `onboarding/components/tabs/email-tab/`            |
| `tabs/TasksTab.tsx`          | `onboarding/components/tabs/tasks-tab/`            |
| `tabs/AuditTab.tsx`          | `onboarding/components/tabs/audit-tab/`            |

## Candidate

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `CandidatePanel.tsx`         | `onboarding/candidate/candidate-panel/`            |
| `CandidateWizard.tsx`        | `onboarding/candidate/candidate-wizard/`           |

## State Management

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `store.ts` (Zustand)         | `onboarding/services/onboarding-mock.service.ts`   |
| `useStore()`                 | `inject(OnboardingMockService)`                    |
| `set(state => ...)` mutation | `signal.update(...)` mutation                      |
| `create<StoreState>()`       | `@Injectable({ providedIn: 'root' })`              |

## Models / Types

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `types.ts`                   | `onboarding/models/onboarding-case.model.ts`       |

## UI Primitives

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `Button.tsx`                 | Inline Tailwind button classes                     |
| `Input.tsx`                  | Inline Tailwind input classes                      |
| `Modal.tsx`                  | `shared/components/modal/`                         |
| `Toast.tsx`                  | `shared/components/toast/`                         |
| `Avatar.tsx`                 | Inline initials div                                |
| `Badge.tsx`                  | Inline status span                                 |
| `Select.tsx`                 | Native `<select>` with Tailwind                    |

## Utilities

| React                        | Angular                                            |
|------------------------------|----------------------------------------------------|
| `cn()` (clsx+twMerge)        | `[class]` binding or `[class.xxx]` conditionals    |
| `demoPersistence.ts`         | Not migrated (Supabase demo persistence)           |
| `supabase.ts`                | Not migrated                                       |
