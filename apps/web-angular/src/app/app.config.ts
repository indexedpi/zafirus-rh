import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { MockWorkspaceApiService } from './onboarding/services/mock-workspace-api.service';
import { WORKSPACE_API } from './onboarding/services/workspace-api.interface';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    MockWorkspaceApiService,
    { provide: WORKSPACE_API, useExisting: MockWorkspaceApiService },
  ]
};
