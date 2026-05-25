const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  // Helper to take a screenshot and log
  const takeScreenshot = async (name) => {
    const filename = `${name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`[SCREENSHOT] Saved: ${filename}`);
  };

  try {
    // 1. Open dashboard
    console.log('Navigating to app...');
    await page.goto('http://localhost:4200/');
    await page.waitForTimeout(2000); // wait for Angular to bootstrap
    await takeScreenshot('01_dashboard_initial');

    // 2. Select María Pérez (she should be selected by default, let's click her just in case)
    console.log('Selecting María Pérez...');
    await page.click('app-case-list button:has-text("María Pérez")');
    await page.waitForTimeout(500);
    await takeScreenshot('02_selected_maria');

    // 3. Send candidate form
    console.log('Clicking "Enviar formulario" in actions bar...');
    await page.click('app-case-actions button:has-text("Enviar formulario")');
    await page.waitForTimeout(1000);
    await takeScreenshot('03_form_sent_invited');

    // 4. Fill candidate wizard - Step 1: Identificación fiscal
    console.log('Filling candidate wizard - Step 1...');
    // We target the right pane (app-candidate-panel / app-candidate-wizard)
    await page.selectOption('app-candidate-wizard select', 'CUIT');
    await page.waitForTimeout(500);
    await page.fill('app-candidate-wizard input', '20-30123456-8');
    await page.waitForTimeout(500);
    await takeScreenshot('04_candidate_step1_filled');
    
    await page.click('app-candidate-wizard button:has-text("Siguiente")');
    await page.waitForTimeout(1000);
    await takeScreenshot('05_candidate_step2_initial');

    // 5. Fill candidate wizard - Step 2: Datos de cobro
    console.log('Filling candidate wizard - Step 2...');
    await page.click('app-candidate-wizard button:has-text("Transferencia bancaria")');
    await page.fill('app-candidate-wizard input[placeholder="22 dígitos"]', '1234567890123456789012');
    await page.waitForTimeout(500);
    await takeScreenshot('06_candidate_step2_filled');

    await page.click('app-candidate-wizard button:has-text("Siguiente")');
    await page.waitForTimeout(1000);
    await takeScreenshot('07_candidate_step3_initial');

    // 6. Fill candidate wizard - Step 3: Referencias
    console.log('Filling candidate wizard - Step 3...');
    await page.click('app-candidate-wizard button:has-text("+ Agregar referencia")');
    await page.fill('app-candidate-wizard input[placeholder="Nombre completo"]', 'Carlos Tester');
    await page.fill('app-candidate-wizard input[placeholder="Relación"]', 'Jefe Directo');
    await page.fill('app-candidate-wizard input[placeholder="Empresa"]', 'Zafirus Corp');
    await page.fill('app-candidate-wizard input[placeholder="Email"]', 'carlos@zafirus.tech');
    await page.fill('app-candidate-wizard input[placeholder="Teléfono"]', '+54 11 5555-5555');
    await page.waitForTimeout(500);
    await takeScreenshot('08_candidate_step3_filled');

    await page.click('app-candidate-wizard button:has-text("Siguiente")');
    await page.waitForTimeout(1000);
    await takeScreenshot('09_candidate_step4_initial');

    // 7. Fill candidate wizard - Step 4: Archivos
    console.log('Filling candidate wizard - Step 4...');
    await page.click('app-candidate-wizard button:has-text("Simular carga de archivo")');
    await page.waitForTimeout(500);
    await takeScreenshot('10_candidate_step4_filled');

    await page.click('app-candidate-wizard button:has-text("Enviar datos")');
    await page.waitForTimeout(1500);
    await takeScreenshot('11_candidate_submitted_view');

    // 8. HR Review - Start review
    console.log('HR Panel: Clicking "Iniciar revisión"...');
    await page.click('app-case-actions button:has-text("Iniciar revisión")');
    await page.waitForTimeout(1000);
    await takeScreenshot('12_hr_review_started');

    // 9. HR Review - Request Correction
    console.log('HR Panel: Requesting correction...');
    await page.click('app-case-actions button:has-text("Solicitar corrección")');
    await page.waitForTimeout(500);
    await page.fill('app-modal textarea[placeholder*="motivo"]', 'Por favor revisá el CUIT y volvé a cargarlo.');
    await takeScreenshot('13_hr_correction_modal_filled');

    await page.click('app-modal button:has-text("Enviar solicitud")');
    await page.waitForTimeout(1500);
    await takeScreenshot('14_hr_correction_requested_invited');

    // 10. Candidate Wizard - Resubmit corrected data
    console.log('Candidate Wizard: Resubmitting corrected data...');
    // We should see the correction notice. Let's step through the wizard again
    await page.click('app-candidate-wizard button:has-text("Siguiente")'); // Step 1 (already filled)
    await page.waitForTimeout(500);
    await page.click('app-candidate-wizard button:has-text("Siguiente")'); // Step 2 (already filled)
    await page.waitForTimeout(500);
    await page.click('app-candidate-wizard button:has-text("Siguiente")'); // Step 3 (already filled)
    await page.waitForTimeout(500);
    await page.click('app-candidate-wizard button:has-text("Enviar datos")'); // Step 4 (already filled, click submit)
    await page.waitForTimeout(1500);
    await takeScreenshot('15_corrected_data_resubmitted');

    // 11. HR Review - Iniciar revisión again
    console.log('HR Panel: Iniciar revisión (second time)...');
    await page.click('app-case-actions button:has-text("Iniciar revisión")');
    await page.waitForTimeout(1000);
    await takeScreenshot('16_hr_review_started_second_time');

    // 12. HR Review - Consolidate Data
    console.log('HR Panel: Navigating to "Datos" tab...');
    await page.click('button[role="tab"]:has-text("Datos")');
    await page.waitForTimeout(800);
    await takeScreenshot('17_hr_data_tab_unconsolidated');

    console.log('HR Panel: Consolidating candidate data...');
    await page.click('app-data-tab button:has-text("Consolidar datos")');
    await page.waitForTimeout(1000);
    await takeScreenshot('18_hr_data_consolidated');

    // 13. HR Review - Approve Case
    console.log('HR Panel: Navigating back to "Resumen" tab...');
    await page.click('button[role="tab"]:has-text("Resumen")');
    await page.waitForTimeout(500);
    
    console.log('HR Panel: Approving case...');
    await page.click('app-case-actions button:has-text("Aprobar caso")');
    await page.waitForTimeout(1000);
    await takeScreenshot('19_hr_case_approved');

    // 14. HR Activation - Start activation
    console.log('HR Panel: Clicking "Iniciar activación"...');
    await page.click('app-case-actions button:has-text("Iniciar activación")');
    await page.waitForTimeout(1000);
    await takeScreenshot('20_hr_activation_started');

    // 15. Wait for automation background tasks to run and complete
    console.log('Waiting for background tasks to complete...');
    // We check the Tasks tab to see them execute
    await page.click('button[role="tab"]:has-text("Tareas")');
    await page.waitForTimeout(2000);
    await takeScreenshot('21_hr_tasks_running');
    
    await page.waitForTimeout(4000); // wait longer for all tasks (approx 4 tasks sequential + parallel)
    await page.click('button[role="tab"]:has-text("Resumen")');
    await page.waitForTimeout(1000);
    await takeScreenshot('22_hr_case_operative');

    console.log('Onboarding flow completed successfully!');
  } catch (error) {
    // Write summary result
    const result = error ? `Test failed: ${error}` : 'Onboarding flow completed successfully!';
    const summaryPath = path.join(__dirname, 'test_flights', 'summary.md');
    try {
      await fs.promises.mkdir(path.dirname(summaryPath), { recursive: true });
      await fs.promises.writeFile(summaryPath, `# Test Flight Summary\n\n${result}\n`);
      console.log(`[RESULT] Summary written to ${summaryPath}`);
    } catch (writeErr) {
      console.error('Failed to write summary:', writeErr);
    }
    console.log('Closing browser...');
    await browser.close();
  }
})();
