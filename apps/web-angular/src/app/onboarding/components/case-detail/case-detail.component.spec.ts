import { TestBed } from '@angular/core/testing';
import { OnboardingMockService } from '../../services/onboarding-mock.service';
import { CaseDetailComponent } from './case-detail.component';

describe('CaseDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseDetailComponent],
      providers: [OnboardingMockService],
    }).compileComponents();
  });

  it('keeps the selected-case layout stretched with the footer anchored at the bottom', () => {
    const svc = TestBed.inject(OnboardingMockService);
    svc.ensureDemoSeeded();
    svc.selectDefaultCase();

    const fixture = TestBed.createComponent(CaseDetailComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const shell = root.querySelector('div');

    expect(shell?.className).toContain('grid');
    expect(shell?.className).toContain('h-full');
    expect(shell?.className).toContain('grid-rows-[auto_minmax(0,1fr)_auto]');
    expect(shell?.querySelector('app-case-actions')).toBeTruthy();
    expect(shell?.querySelector('div[class*="overflow-y-auto"]')).toBeTruthy();
  });
});
