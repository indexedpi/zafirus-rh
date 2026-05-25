import { Routes } from '@angular/router';
import { OnboardingPageComponent } from './onboarding/pages/onboarding-page/onboarding-page.component';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', component: OnboardingPageComponent, title: 'Zafirus | RRHH', data: { mode: 'workspace' } },
  { path: 'demo', component: OnboardingPageComponent, title: 'Zafirus | Demo', data: { mode: 'preview' } },
  { path: '**', redirectTo: '' },
];
