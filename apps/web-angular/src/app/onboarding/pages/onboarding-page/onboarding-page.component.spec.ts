import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { OnboardingPageComponent } from './onboarding-page.component';
import { OnboardingMockService } from '../../services/onboarding-mock.service';

const demoRouteMock = {
  snapshot: { fragment: null, data: { demoMode: true }, routeConfig: { path: 'demo' }, paramMap: convertToParamMap({}) },
  fragment: { pipe: () => ({ subscribe: () => ({ unsubscribe: () => void 0 }) }) },
};

describe('OnboardingPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPageComponent],
      providers: [
        OnboardingMockService,
        {
          provide: ActivatedRoute,
          useValue: demoRouteMock,
        },
      ],
    }).compileComponents();
  });

  it('seeds the demo and stays in the internal workspace for unsupported fragments', () => {
    const fixture = TestBed.createComponent(OnboardingPageComponent);
    const svc = TestBed.inject(OnboardingMockService);

    fixture.componentInstance.applyDemoFragment('mode=unknown&case=missing');
    fixture.detectChanges();
    const root = (fixture.nativeElement as HTMLElement).querySelector('div');

    expect(svc.cases().length).toBeGreaterThan(0);
    expect(svc.selectedCase()).toBeTruthy();
    expect(svc.candidateViewOpen()).toBeFalse();
    expect(root?.className).toContain('w-full');
    expect(root?.className).toContain('flex-1');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-candidate-panel')).toBeFalsy();
  });

  it('selects a valid token without exposing candidate parts', () => {
    const fixture = TestBed.createComponent(OnboardingPageComponent);
    const svc = TestBed.inject(OnboardingMockService);

    fixture.componentInstance.applyDemoFragment(null);
    const token = svc.cases()[0]?.candidateToken;

    expect(token).toBeTruthy();

    fixture.componentInstance.applyDemoFragment(`token=${token}`);
    fixture.detectChanges();

    expect(svc.selectedCase()?.candidateToken).toBe(token);
    expect(svc.candidateViewOpen()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-candidate-panel')).toBeFalsy();
  });
});
