import { TestBed } from '@angular/core/testing';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { EmailTabComponent } from './email-tab.component';

describe('EmailTabComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTabComponent],
      providers: [OnboardingMockService],
    }).compileComponents();
  });

  it('keeps the edit body scrollable within the available case detail height', () => {
    const svc = TestBed.inject(OnboardingMockService);
    svc.ensureDemoSeeded();
    svc.selectDefaultCase();

    const fixture = TestBed.createComponent(EmailTabComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const tab = root.querySelector('.email-tab');
    const body = root.querySelector('.email-tab-body');

    expect(tab?.className).toContain('h-full');
    expect(tab?.className).toContain('overflow-hidden');
    expect(body?.className).toContain('min-h-0');
    expect(body?.className).toContain('overflow-y-auto');
  });
});
