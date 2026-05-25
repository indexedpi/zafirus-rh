import { TestBed } from '@angular/core/testing';
import { OnboardingMockService } from '../../../services/onboarding-mock.service';
import { DataTabComponent } from './data-tab.component';

describe('DataTabComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTabComponent],
      providers: [OnboardingMockService],
    }).compileComponents();
  });

  it('renders edit controls for the redesigned Datos sections', () => {
    const svc = TestBed.inject(OnboardingMockService);
    svc.ensureDemoSeeded();
    svc.selectDefaultCase();

    const fixture = TestBed.createComponent(DataTabComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[aria-label="Editar identidad"]')).toBeTruthy();
    expect(root.querySelector('[aria-label="Editar ubicación"]')).toBeTruthy();
    expect(root.querySelector('[aria-label="Editar puesto"]')).toBeTruthy();
    expect(root.querySelector('[aria-label="Editar datos declarados"]')).toBeTruthy();
  });

  it('opens the identity editor modal from the section action', () => {
    const svc = TestBed.inject(OnboardingMockService);
    svc.ensureDemoSeeded();
    svc.selectDefaultCase();

    const fixture = TestBed.createComponent(DataTabComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const editButton = root.querySelector('[aria-label="Editar identidad"]') as HTMLButtonElement | null;

    expect(editButton).toBeTruthy();
    editButton?.click();
    fixture.detectChanges();

    expect(root.querySelector('app-modal')).toBeTruthy();
    expect(root.textContent).toContain('Editar identidad');
    expect(root.textContent).toContain('Correo corporativo');
  });
});
