import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the shell chrome', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const workspace = compiled.querySelector('main > section');

    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(workspace).toBeTruthy();
    expect(workspace?.className).not.toContain('rounded-[28px]');
    expect(workspace?.className).not.toContain('shadow-');
    expect(compiled.querySelector('app-toast-container')).toBeTruthy();
  });

  it('should render the onboarding workspace at /', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-onboarding-page')).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-candidate-panel')).toBeFalsy();
  });

  it('should render the demo route without candidate parts', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/demo');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/demo');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-onboarding-page')).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-candidate-panel')).toBeFalsy();
  });
});
