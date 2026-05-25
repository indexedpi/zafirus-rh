const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:4200';
const OUTPUT_JSON = '/tmp/audit-visual.json';
const SCREENSHOT_DIR = '/tmp/playwright-visual-audit';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function safeVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

async function safeCount(locator) {
  try {
    return await locator.count();
  } catch {
    return 0;
  }
}

async function screenshot(page, name, fullPage = false) {
  const file = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: file, fullPage });
  return file;
}

async function hasText(page, text) {
  return await safeVisible(page.getByText(text, { exact: false }).first());
}

async function clickTab(page, label) {
  const tab = page.getByRole('tab', { name: label, exact: true });
  await tab.click();
  await page.waitForTimeout(300);
}

async function evaluateLayout(page) {
  return await page.evaluate(() => {
    const detail = document.querySelector('app-case-detail');
    const scrollRegion = detail?.querySelector('.overflow-y-auto.overflow-x-hidden');
    if (!detail || !scrollRegion) {
      return {
        noBlankSpaces: false,
        contentFillsArea: false,
        issues: ['Case detail container not found'],
      };
    }

    const detailRect = detail.getBoundingClientRect();
    const contentRect = scrollRegion.getBoundingClientRect();
    const childRects = Array.from(scrollRegion.children)
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0);

    const viewportHeight = window.innerHeight;
    const heightFillRatio = detailRect.height / viewportHeight;
    const contentHeightRatio = contentRect.height / Math.max(detailRect.height, 1);
    const childArea = childRects.reduce((sum, rect) => sum + rect.width * rect.height, 0);
    const containerArea = Math.max(contentRect.width * contentRect.height, 1);
    const areaCoverage = childArea / containerArea;
    const bottomGap = Math.max(0, Math.round(window.innerHeight - detailRect.bottom));

    const issues = [];
    const noBlankSpaces = areaCoverage >= 0.3;
    const contentFillsArea = heightFillRatio >= 0.8 && contentHeightRatio >= 0.75 && bottomGap <= 24;

    if (!noBlankSpaces) {
      issues.push(`Visible content coverage too low (${areaCoverage.toFixed(2)})`);
    }
    if (!contentFillsArea) {
      issues.push(`Detail area underfilled (height=${heightFillRatio.toFixed(2)}, content=${contentHeightRatio.toFixed(2)}, bottomGap=${bottomGap}px)`);
    }

    return { noBlankSpaces, contentFillsArea, issues };
  });
}

async function main() {
  ensureDir(SCREENSHOT_DIR);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  const result = {
    route_production: { empty_state_clean: false, no_demo_traces: false, issues: [] },
    route_demo: { cases_visible: false, sidebar_clean: false, issues: [] },
    tabs: { overview: 'broken', data: 'broken', email: 'broken', tasks: 'broken' },
    layout: { no_blank_spaces: false, content_fills_area: false, issues: [] },
    overall_issues: [],
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await screenshot(page, '01-production-empty-state.png', true);

    const prodEmptyLeft = await hasText(page, 'No hay casos todavía');
    const prodEmptyRight = await hasText(page, 'No hay un caso seleccionado');
    const prodCandidatePanel = await safeVisible(page.locator('app-candidate-panel'));
    const prodDemoNav = await hasText(page, 'Demo');
    const prodCaseButtons = await safeCount(page.locator('app-case-list button.w-full.flex.flex-col'));
    const prodMockNames = ['Sofía López', 'Lucas Gómez', 'Valentina Martínez', 'Diego Navarro', 'Camila Torres', 'Juan Herrera', 'Lucía Ramírez'];
    const visibleMockNames = [];

    for (const name of prodMockNames) {
      if (await hasText(page, name)) visibleMockNames.push(name);
    }

    result.route_production.empty_state_clean = prodEmptyLeft && prodEmptyRight && prodCaseButtons === 0;
    result.route_production.no_demo_traces = !prodCandidatePanel && !prodDemoNav && prodCaseButtons === 0 && visibleMockNames.length === 0;

    if (!result.route_production.empty_state_clean) {
      result.route_production.issues.push('Production empty state is not fully clean/empty.');
    }
    if (prodCandidatePanel) result.route_production.issues.push('Candidate panel is visible on production route.');
    if (prodDemoNav) result.route_production.issues.push('Demo navigation item is visible on production route.');
    if (prodCaseButtons > 0) result.route_production.issues.push(`Production route shows ${prodCaseButtons} case cards.`);
    if (visibleMockNames.length > 0) result.route_production.issues.push(`Production route exposes mock names: ${visibleMockNames.join(', ')}.`);

    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await screenshot(page, '02-demo-full-page.png', true);

    const caseCards = page.locator('app-case-list button.w-full.flex.flex-col');
    const caseCount = await safeCount(caseCards);
    const logoVisible = await safeVisible(page.locator('app-sidebar app-zafirus-logo'));
    const searchVisible = await safeVisible(page.locator('input[type="search"], input[placeholder*="Buscar" i], [aria-label*="Buscar" i]'));
    const navInicioVisible = await safeVisible(page.getByRole('link', { name: /Inicio/i }));
    const navDemoVisible = await safeVisible(page.getByRole('link', { name: /Demo/i }));
    const authFooterVisible = await safeVisible(page.getByText(/sign in|login|cerrar sesi[oó]n|mi cuenta|perfil/i).first());

    result.route_demo.cases_visible = caseCount === 7;
    result.route_demo.sidebar_clean = logoVisible && searchVisible && navInicioVisible && navDemoVisible && !authFooterVisible;

    if (caseCount !== 7) result.route_demo.issues.push(`Expected 7 visible cases, found ${caseCount}.`);
    if (!logoVisible) result.route_demo.issues.push('Sidebar logo is missing.');
    if (!searchVisible) result.route_demo.issues.push('Sidebar search is missing.');
    if (!navInicioVisible || !navDemoVisible) result.route_demo.issues.push('Sidebar nav items are incomplete.');
    if (authFooterVisible) result.route_demo.issues.push('Auth/footer controls are visible in sidebar.');

    if (caseCount > 0) {
      await caseCards.first().click();
      await page.waitForTimeout(700);
    }

    const overviewChecks = {
      journey: await hasText(page, 'Trayecto del caso'),
      milestone: await hasText(page, 'Siguiente hito'),
      recentActivity: await hasText(page, 'Actividad reciente'),
    };
    await screenshot(page, '03-demo-overview.png', true);
    result.tabs.overview = overviewChecks.journey && overviewChecks.milestone && overviewChecks.recentActivity ? 'ok' : 'broken';

    const layoutAudit = await evaluateLayout(page);
    result.layout.no_blank_spaces = layoutAudit.noBlankSpaces;
    result.layout.content_fills_area = layoutAudit.contentFillsArea;
    result.layout.issues.push(...layoutAudit.issues);

    await clickTab(page, 'Datos');
    await screenshot(page, '04-demo-data.png', true);
    result.tabs.data = await safeVisible(page.locator('app-data-tab')) ? 'ok' : 'broken';

    await clickTab(page, 'Correo');
    await screenshot(page, '05-demo-email.png', true);
    const emailEditorVisible = await safeVisible(page.locator('app-email-tab div[contenteditable], app-email-tab .ProseMirror, app-email-tab [contenteditable]').first());
    const accionesVisible = await safeVisible(page.getByRole('button', { name: /Acciones/i }));
    result.tabs.email = emailEditorVisible && accionesVisible ? 'ok' : 'broken';
    if (!emailEditorVisible) result.route_demo.issues.push('Email editor is not visible in Correo tab.');
    if (!accionesVisible) result.route_demo.issues.push('Acciones button is not visible in Correo tab.');

    await clickTab(page, 'Tareas');
    await screenshot(page, '06-demo-tasks.png', true);
    result.tabs.tasks = await safeVisible(page.locator('app-tasks-tab')) ? 'ok' : 'broken';

    const brokenTabs = Object.entries(result.tabs)
      .filter(([, status]) => status !== 'ok')
      .map(([tab]) => tab);

    if (brokenTabs.length > 0) {
      result.overall_issues.push(`Broken tabs: ${brokenTabs.join(', ')}.`);
    }
    result.overall_issues.push(...result.route_production.issues, ...result.route_demo.issues, ...result.layout.issues);
    result.overall_issues = [...new Set(result.overall_issues)];
  } finally {
    await browser.close();
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));
}

main().catch((error) => {
  const payload = {
    route_production: { empty_state_clean: false, no_demo_traces: false, issues: [`Audit failed: ${error.message}`] },
    route_demo: { cases_visible: false, sidebar_clean: false, issues: [] },
    tabs: { overview: 'broken', data: 'broken', email: 'broken', tasks: 'broken' },
    layout: { no_blank_spaces: false, content_fills_area: false, issues: [] },
    overall_issues: [`Audit failed: ${error.message}`],
  };
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2));
  process.exitCode = 1;
});
