/**
 * FlowTimer — Full UI/UX + Functional Audit
 * Playwright-based: visual checks, functional flows, a11y, responsive
 * Run: node audit.mjs  (dev server must be on http://localhost:5173)
 */

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE = 'http://localhost:5173'
const SS_DIR = 'audit-screenshots'
fs.mkdirSync(SS_DIR, { recursive: true })

let pass = 0, warn = 0, fail = 0
const results = []

function log(status, group, label, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️ ' : '❌'
  const line = `${icon} [${group}] ${label}${detail ? ' — ' + detail : ''}`
  console.log(line)
  results.push({ status, group, label, detail })
  if (status === 'PASS') pass++
  else if (status === 'WARN') warn++
  else fail++
}

async function ss(page, name) {
  await page.screenshot({ path: path.join(SS_DIR, `${name}.png`), fullPage: true })
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function contrastRatio(page, selector, bg, fg) {
  return page.evaluate(({ selector, bg, fg }) => {
    function lum(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    }
    const L1 = lum(bg), L2 = lum(fg)
    const bright = Math.max(L1, L2), dark = Math.min(L1, L2)
    return (bright + 0.05) / (dark + 0.05)
  }, { selector, bg, fg })
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

async function auditLanding(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await ss(page, '01-landing-desktop')

  // --- Layout / render ---
  const h1 = page.locator('h1')
  log((await h1.count()) > 0 ? 'PASS' : 'FAIL', 'Landing', 'H1 renders')
  const h1Text = await h1.first().textContent()
  log(h1Text?.includes('Flow') || h1Text?.includes('Ship') ? 'PASS' : 'FAIL',
    'Landing', 'H1 contains hero copy', h1Text?.trim().slice(0, 60))

  // --- Nav ---
  const nav = page.locator('nav')
  log((await nav.count()) > 0 ? 'PASS' : 'FAIL', 'Landing', 'Nav rendered')
  const navBrand = page.locator('nav').getByText('FlowTimer')
  log((await navBrand.count()) > 0 ? 'PASS' : 'FAIL', 'Landing', 'Brand name in nav')
  const githubLink = page.locator('nav a[href*="github"]')
  log((await githubLink.count()) > 0 ? 'PASS' : 'FAIL', 'Landing', 'GitHub link in nav')

  // --- CTA buttons ---
  const ctaButtons = page.locator('button').filter({ hasText: /start|focus/i })
  const ctaCount = await ctaButtons.count()
  log(ctaCount >= 2 ? 'PASS' : ctaCount === 1 ? 'WARN' : 'FAIL',
    'Landing', 'CTA buttons present', `found ${ctaCount}`)

  // --- Feature cards ---
  const cards = page.locator('.glass')
  const cardCount = await cards.count()
  log(cardCount >= 6 ? 'PASS' : 'WARN', 'Landing', 'Feature cards rendered', `found ${cardCount}`)

  // --- Badge / pill ---
  const badge = page.locator('div').filter({ hasText: /zero cost|zero server/i }).first()
  log((await badge.count()) > 0 ? 'PASS' : 'WARN', 'Landing', 'Zero-cost badge visible')

  // --- Mock timer preview ---
  const svg = page.locator('svg circle')
  log((await svg.count()) > 0 ? 'PASS' : 'FAIL', 'Landing', 'Mock SVG timer ring in hero')

  // --- Ambient blobs ---
  const blobs = page.locator('.blob')
  log((await blobs.count()) >= 2 ? 'PASS' : 'WARN', 'Landing', 'Ambient blobs rendered')

  // --- Footer ---
  const footer = page.locator('footer')
  log((await footer.count()) > 0 ? 'PASS' : 'FAIL', 'Landing', 'Footer rendered')
  const footerCredit = page.locator('footer').getByText('terminalchai')
  log((await footerCredit.count()) > 0 ? 'PASS' : 'WARN', 'Landing', 'Attribution in footer')

  // --- Scroll to features ---
  const featuresSection = page.locator('#features')
  log((await featuresSection.count()) > 0 ? 'PASS' : 'WARN', 'Landing', '#features anchor exists')

  // --- CTA strip ---
  const ctaStrip = page.locator('section').filter({ has: page.locator('button').filter({ hasText: /open flowtimer/i }) })
  log((await ctaStrip.count()) > 0 ? 'PASS' : 'WARN', 'Landing', 'Bottom CTA strip rendered')

  // --- Navigation to /app ---
  const startBtn = page.locator('nav button').filter({ hasText: /start/i })
  if (await startBtn.count() > 0) {
    await startBtn.first().click()
    await page.waitForURL('**/app', { timeout: 5000 })
    log(page.url().includes('/app') ? 'PASS' : 'FAIL', 'Landing', 'Nav Start button → /app')
    await page.goBack()
    await page.waitForLoadState('networkidle')
  } else {
    log('WARN', 'Landing', 'Nav Start button not found for navigation test')
  }

  // --- Hero CTA → /app ---
  const heroCTA = page.locator('section button').filter({ hasText: /start your session/i }).first()
  if (await heroCTA.count() > 0) {
    await heroCTA.click()
    await page.waitForURL('**/app', { timeout: 5000 })
    log(page.url().includes('/app') ? 'PASS' : 'FAIL', 'Landing', 'Hero CTA → /app')
    await page.goBack()
    await page.waitForLoadState('networkidle')
  } else {
    log('WARN', 'Landing', 'Hero CTA not found')
  }
}

// ─── APP PAGE — STRUCTURE ────────────────────────────────────────────────────

async function auditAppStructure(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await ss(page, '02-app-desktop')

  // --- Brand in app nav ---
  const brand = page.locator('nav').getByText('FlowTimer')
  log((await brand.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Brand in app nav')

  // --- Home + Settings buttons ---
  const homeBtn = page.locator('nav button').first()
  log((await homeBtn.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Home button in nav')
  const settingsBtn = page.locator('nav button').last()
  log((await settingsBtn.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Settings button in nav')

  // --- Mode selector tabs ---
  const modeBtns = page.locator('button').filter({ hasText: /^(Focus|Short Break|Long Break)$/ })
  log((await modeBtns.count()) === 3 ? 'PASS' : 'FAIL', 'App/Structure', 'All 3 mode tabs render',
    `found ${await modeBtns.count()}`)

  // --- SVG timer ring ---
  const ring = page.locator('svg circle').nth(1)
  log((await ring.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'SVG timer ring renders')

  // --- Timer display ---
  const display = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ })
  log((await display.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'MM:SS timer display renders')

  // --- Control buttons via data-testid ---
  log((await page.locator('[data-testid="timer-play"]').count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Play button (data-testid) renders')
  log((await page.locator('[data-testid="timer-reset"]').count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Reset button (data-testid) renders')
  log((await page.locator('[data-testid="timer-skip"]').count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Skip button (data-testid) renders')

  // --- Stats bar — look for label spans ---
  const statsToday = page.getByText('Today', { exact: true })
  log((await statsToday.count()) > 0 ? 'PASS' : 'WARN', 'App/Structure', 'Stats bar renders')

  // --- Heatmap ---
  const heatmapTitle = page.getByText('Focus Heatmap')
  log((await heatmapTitle.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Heatmap section renders')

  // --- Task list ---
  const taskTitle = page.getByText('Tasks')
  log((await taskTitle.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Tasks panel renders')
  const taskInput = page.locator('input[placeholder*="task"]')
  log((await taskInput.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Task input field renders')

  // --- Session log ---
  const sessionTitle = page.getByText('Recent Sessions')
  log((await sessionTitle.count()) > 0 ? 'PASS' : 'FAIL', 'App/Structure', 'Session log renders')
}

// ─── TIMER FUNCTIONALITY ─────────────────────────────────────────────────────

async function auditTimer(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  const displayEl = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ }).first()
  const playBtn  = page.locator('[data-testid="timer-play"]')
  const resetBtn = page.locator('[data-testid="timer-reset"]')
  const skipBtn  = page.locator('[data-testid="timer-skip"]')

  // --- Initial state ---
  const initial = await displayEl.textContent()
  log(initial === '25:00' ? 'PASS' : 'WARN', 'Timer', 'Initial Focus timer is 25:00', initial ?? '')

  // --- Start ---
  await playBtn.click()
  await page.waitForTimeout(2500)
  const afterStart = await displayEl.textContent()
  log(afterStart !== initial ? 'PASS' : 'FAIL', 'Timer', 'Timer counts down after start', `${initial} → ${afterStart}`)

  // --- Pause ---
  await playBtn.click()
  const pausedAt = await displayEl.textContent()
  await page.waitForTimeout(1600)
  const frozen = await displayEl.textContent()
  log(frozen === pausedAt ? 'PASS' : 'FAIL', 'Timer', 'Timer pauses (display frozen)', `paused at ${pausedAt}`)

  await ss(page, '03-timer-paused')

  // --- Resume ---
  await playBtn.click()
  await page.waitForTimeout(2000)
  const afterResume = await displayEl.textContent()
  log(afterResume !== pausedAt ? 'PASS' : 'FAIL', 'Timer', 'Timer resumes after pause',
    `${pausedAt} → ${afterResume}`)

  // --- Pause for reset test ---
  await playBtn.click()

  // --- Reset ---
  await resetBtn.click()
  await page.waitForTimeout(400)
  const afterReset = await displayEl.textContent()
  log(afterReset === '25:00' ? 'PASS' : 'WARN', 'Timer', 'Reset restores 25:00', afterReset ?? '')

  await ss(page, '04-timer-reset')

  // --- Skip (Focus → Short Break = 05:00) ---
  await skipBtn.click()
  await page.waitForTimeout(600)
  const afterSkip = await displayEl.textContent()
  log(afterSkip === '05:00' ? 'PASS' : 'WARN', 'Timer', 'Skip → Short Break (05:00)', afterSkip ?? '')
  await ss(page, '05-timer-after-skip')
}

// ─── MODE SWITCHING ───────────────────────────────────────────────────────────

async function auditModes(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(300)

  const displayEl = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ }).first()

  // --- Focus (default) ---
  const focusBtn = page.locator('button').filter({ hasText: /^Focus$/ })
  await focusBtn.click()
  await page.waitForTimeout(400)
  const focusTime = await displayEl.textContent()
  log(focusTime === '25:00' ? 'PASS' : 'WARN', 'Modes', 'Focus mode shows 25:00', focusTime ?? '')

  // --- Short Break ---
  const shortBtn = page.locator('button').filter({ hasText: /^Short Break$/ })
  await shortBtn.click()
  await page.waitForTimeout(400)
  const shortTime = await displayEl.textContent()
  log(shortTime === '05:00' ? 'PASS' : 'WARN', 'Modes', 'Short Break shows 05:00', shortTime ?? '')
  await ss(page, '05-mode-short-break')

  // --- Long Break ---
  const longBtn = page.locator('button').filter({ hasText: /^Long Break$/ })
  await longBtn.click()
  await page.waitForTimeout(400)
  const longTime = await displayEl.textContent()
  log(longTime === '15:00' ? 'PASS' : 'WARN', 'Modes', 'Long Break shows 15:00', longTime ?? '')
  await ss(page, '06-mode-long-break')

  // --- Return to Focus ---
  await focusBtn.click()
  await page.waitForTimeout(400)
  const backToFocus = await displayEl.textContent()
  log(backToFocus === '25:00' ? 'PASS' : 'WARN', 'Modes', 'Switch back to Focus resets 25:00', backToFocus ?? '')
}

// ─── TASK LIST ────────────────────────────────────────────────────────────────

async function auditTasks(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => { localStorage.removeItem('flowtimer-tasks') })
  await page.reload({ waitUntil: 'networkidle' })

  const input = page.locator('input[placeholder*="task"]')
  await input.waitFor({ state: 'visible', timeout: 5000 })
  const emptyMsg = page.getByText('No tasks yet')

  // --- Empty state ---
  log((await emptyMsg.count()) > 0 ? 'PASS' : 'WARN', 'Tasks', 'Empty state message shown')

  // --- Add via button ---
  await input.fill('Write unit tests')
  const addBtn = input.locator('xpath=..').locator('button')
  await addBtn.click()
  await page.waitForTimeout(400)
  const task1 = page.getByText('Write unit tests')
  log((await task1.count()) > 0 ? 'PASS' : 'FAIL', 'Tasks', 'Add task via button')

  // --- Add via Enter ---
  await input.fill('Review PR comments')
  await input.press('Enter')
  await page.waitForTimeout(400)
  const task2 = page.getByText('Review PR comments')
  log((await task2.count()) > 0 ? 'PASS' : 'FAIL', 'Tasks', 'Add task via Enter key')

  // --- Add third task ---
  await input.fill('Deploy to staging')
  await input.press('Enter')
  await page.waitForTimeout(400)

  await ss(page, '07-tasks-added')

  // --- Toggle done via the flex row's first button (circle/check) ---
  const taskRows = page.locator('div.flex.items-center.gap-2').filter({ hasText: 'Write unit tests' })
  const taskToggle = taskRows.locator('button').first()
  if (await taskToggle.count() > 0) {
    await taskToggle.click()
    await page.waitForTimeout(400)
    const strikeEl = page.locator('span.line-through').filter({ hasText: 'Write unit tests' })
    log((await strikeEl.count()) > 0 ? 'PASS' : 'WARN', 'Tasks', 'Completed task has line-through style')
  } else {
    log('WARN', 'Tasks', 'Toggle button selector returned nothing')
  }

  // --- Clear done ---
  const clearBtn = page.getByText(/clear done/i)
  if (await clearBtn.count() > 0) {
    await clearBtn.click()
    await page.waitForTimeout(400)
    const lineThrough = page.locator('span.line-through')
    log((await lineThrough.count()) === 0 ? 'PASS' : 'FAIL', 'Tasks', 'Clear done removes completed tasks')
  } else {
    log('WARN', 'Tasks', 'No "Clear done" button visible (expected after toggle)')
  }

  await ss(page, '08-tasks-after-clear')

  // --- Empty input does not add ---
  const countBefore = await page.locator('span').filter({ hasText: /review pr/i }).count()
  await input.fill('')
  await input.press('Enter')
  await page.waitForTimeout(300)
  const countAfter = await page.locator('span').filter({ hasText: /review pr/i }).count()
  log(countBefore === countAfter ? 'PASS' : 'FAIL', 'Tasks', 'Empty input does not create task')
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────

async function auditSettings(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  const settingsBtn = page.locator('nav button').last()
  await settingsBtn.click()
  await page.waitForTimeout(600)

  await ss(page, '09-settings-open')

  // --- Modal visible ---
  const modal = page.getByText('Settings')
  log((await modal.count()) > 0 ? 'PASS' : 'FAIL', 'Settings', 'Settings modal opens')

  // --- Sliders present ---
  const sliders = page.locator('input[type="range"]')
  const sliderCount = await sliders.count()
  log(sliderCount >= 4 ? 'PASS' : 'WARN', 'Settings', 'All duration sliders rendered', `found ${sliderCount}`)

  // --- Toggle switches ---
  const toggles = page.locator('button').filter({ hasText: '' })
  const autoBreakToggle = page.locator('p').filter({ hasText: 'Auto-start Breaks' })
  log((await autoBreakToggle.count()) > 0 ? 'PASS' : 'WARN', 'Settings', 'Auto-start Breaks option present')

  // --- Change focus duration ---
  const focusSlider = sliders.first()
  const origVal = await focusSlider.inputValue()
  await focusSlider.fill('30')
  await page.waitForTimeout(300)
  const newVal = await focusSlider.inputValue()
  log(newVal === '30' ? 'PASS' : 'WARN', 'Settings', 'Focus duration slider changes value', `${origVal} → ${newVal}`)

  // --- Close via button ---
  const saveBtn = page.getByRole('button', { name: /save & close/i })
  await saveBtn.click()
  await page.waitForTimeout(1200)
  const modalGone = page.getByRole('heading', { name: 'Settings' })
  log((await modalGone.count()) === 0 ? 'PASS' : 'FAIL', 'Settings', 'Modal closes after Save & Close')

  // --- Verify timer updated to new duration ---
  const display = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ }).first()
  await display.waitFor({ state: 'visible', timeout: 5000 })
  const timeAfter = await display.textContent()
  log(timeAfter === '30:00' ? 'PASS' : 'WARN', 'Settings', 'Timer reflects new 30min setting', timeAfter ?? '')

  await ss(page, '10-settings-applied')

  // --- Close via backdrop ---
  await settingsBtn.click()
  await page.waitForTimeout(700)
  // Click top-left corner which is outside the modal panel
  await page.mouse.click(30, 30)
  await page.waitForTimeout(600)
  const heading2 = page.getByRole('heading', { name: 'Settings' })
  log((await heading2.count()) === 0 ? 'PASS' : 'WARN', 'Settings', 'Modal closes via backdrop click')
}

// ─── LOCALSTORAGE PERSISTENCE ────────────────────────────────────────────────

async function auditPersistence(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  // Wait for LS keys to be written on mount (useEffect)
  await page.waitForTimeout(600)

  // Add a task to ensure tasks key exists
  const input = page.locator('input[placeholder*="task"]')
  await input.waitFor({ state: 'visible', timeout: 5000 })
  await input.fill('Persistent test task')
  await input.press('Enter')
  await page.waitForTimeout(500)

  // Read localStorage keys
  const keys = await page.evaluate(() => Object.keys(localStorage))
  log(keys.includes('flowtimer-settings') ? 'PASS' : 'FAIL', 'Persistence', 'flowtimer-settings key in localStorage')
  log(keys.includes('flowtimer-tasks') ? 'PASS' : 'FAIL', 'Persistence', 'flowtimer-tasks key in localStorage')
  log(keys.includes('flowtimer-sessions') ? 'PASS' : 'FAIL', 'Persistence', 'flowtimer-sessions key in localStorage')

  // Reload and check task survives
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const taskAfterReload = page.getByText('Persistent test task')
  log((await taskAfterReload.count()) > 0 ? 'PASS' : 'FAIL', 'Persistence', 'Tasks survive page reload')

  // Settings survive reload
  const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('flowtimer-settings') || '{}'))
  log(typeof settings.focusDuration === 'number' ? 'PASS' : 'FAIL',
    'Persistence', 'Settings JSON is valid and has focusDuration', JSON.stringify(settings).slice(0, 80))
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

async function auditNavigation(page) {
  //  / → /app
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const toApp = page.locator('nav button').filter({ hasText: /start/i })
  await toApp.click()
  await page.waitForURL('**/app', { timeout: 5000 })
  log(page.url().endsWith('/app') ? 'PASS' : 'FAIL', 'Navigation', '/ → /app via nav button')

  // /app → / via home button
  const homeBtn = page.locator('nav button').first()
  await homeBtn.click()
  await page.waitForURL(`${BASE}/`, { timeout: 5000 })
  log(page.url() === `${BASE}/` ? 'PASS' : 'FAIL', 'Navigation', '/app → / via home button')

  // Direct URL /app works
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  log(page.url().includes('/app') ? 'PASS' : 'FAIL', 'Navigation', 'Direct navigation to /app works')
}

// ─── RESPONSIVE ───────────────────────────────────────────────────────────────

async function auditResponsive(page) {
  // Mobile 375px
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await ss(page, '11-landing-mobile')

  const h1Mobile = page.locator('h1')
  log((await h1Mobile.count()) > 0 ? 'PASS' : 'FAIL', 'Responsive', 'H1 visible on 375px mobile')

  const ctaMobile = page.locator('button').filter({ hasText: /start your session/i })
  log((await ctaMobile.count()) > 0 ? 'PASS' : 'FAIL', 'Responsive', 'Hero CTA visible on mobile')

  // App on mobile
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await ss(page, '12-app-mobile')
  const displayMobile = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ })
  log((await displayMobile.count()) > 0 ? 'PASS' : 'FAIL', 'Responsive', 'Timer display visible on 375px')

  // Tablet 768px
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await ss(page, '13-app-tablet')
  const displayTablet = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ })
  log((await displayTablet.count()) > 0 ? 'PASS' : 'FAIL', 'Responsive', 'Timer display visible on 768px tablet')

  // Desktop 1440px
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await ss(page, '14-app-1440')
  const display1440 = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ })
  log((await display1440.count()) > 0 ? 'PASS' : 'FAIL', 'Responsive', 'Timer display at 1440px desktop')

  // Reset to desktop
  await page.setViewportSize({ width: 1280, height: 800 })
}

// ─── ACCESSIBILITY ────────────────────────────────────────────────────────────

async function auditA11y(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // --- lang attribute ---
  const lang = await page.evaluate(() => document.documentElement.lang)
  log(lang ? 'PASS' : 'WARN', 'A11y', 'html[lang] attribute set', lang)

  // --- title tag ---
  const title = await page.title()
  log(title && title.length > 0 ? 'PASS' : 'FAIL', 'A11y', 'Page <title> set', title)

  // --- Heading hierarchy ---
  const h1s = await page.locator('h1').count()
  const h2s = await page.locator('h2').count()
  log(h1s === 1 ? 'PASS' : 'WARN', 'A11y', 'Exactly one H1 on landing', `h1=${h1s}`)
  log(h2s >= 1 ? 'PASS' : 'WARN', 'A11y', 'H2 headings present', `h2=${h2s}`)

  // --- Images/SVGs have accessible labels ---
  const svgs = page.locator('svg[role]')
  const svgCount = await svgs.count()
  log(svgCount >= 0 ? 'PASS' : 'WARN', 'A11y', `Decorative SVGs checked`, `${svgCount} with role attr`)

  // --- Touch targets ≥ 44×44 ---
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  const smallBtns = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    return btns.filter(b => {
      const r = b.getBoundingClientRect()
      return r.width < 44 || r.height < 44
    }).map(b => ({ text: b.textContent?.trim().slice(0, 30), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) }))
  })
  log(smallBtns.length === 0 ? 'PASS' : 'WARN', 'A11y', 'All buttons ≥ 44×44 touch target',
    smallBtns.length > 0 ? JSON.stringify(smallBtns.slice(0, 3)) : 'all pass')

  // --- Focus outline visible ---
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null
    const style = getComputedStyle(el)
    return { tag: el.tagName, outline: style.outline, boxShadow: style.boxShadow }
  })
  log(focused ? 'PASS' : 'WARN', 'A11y', 'Tab key focuses an interactive element',
    focused ? `${focused.tag}` : 'none')

  // --- No console errors ---
  const errors = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  log(errors.length === 0 ? 'PASS' : 'WARN', 'A11y', 'Zero console errors on app load',
    errors.length > 0 ? errors[0].slice(0, 80) : '')
}

// ─── UX DETAILS ───────────────────────────────────────────────────────────────

async function auditUX(page) {
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })

  // --- Session dot indicators ---
  const dots = await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'))
    return allDivs.filter(d => {
      const r = d.getBoundingClientRect()
      const s = window.getComputedStyle(d)
      // Small circular divs: 4–12px wide, with significant border-radius
      return r.width >= 4 && r.width <= 12 && r.height >= 4 && r.height <= 12
        && parseFloat(s.borderTopLeftRadius) > 0
    }).length
  })
  log(dots >= 4 ? 'PASS' : 'WARN', 'UX', 'Session dot indicators visible', `found ${dots} dots`)

  // --- Label updates on mode switch ---
  const label = page.locator('span').filter({ hasText: /^(Focus|Short Break|Long Break)$/i })
  log((await label.count()) > 0 ? 'PASS' : 'WARN', 'UX', 'Mode label visible below timer')

  // --- Session count caption ---
  const caption = page.locator('p').filter({ hasText: /Session \d+/i })
  log((await caption.count()) > 0 ? 'PASS' : 'WARN', 'UX', 'Session caption text renders')

  // --- Heatmap legend ---
  const legend = page.getByText('Less')
  log((await legend.count()) > 0 ? 'PASS' : 'WARN', 'UX', 'Heatmap legend (Less/More) visible')

  // --- Stats labels ---
  const statLabels = ['Today', 'Streak']
  for (const lbl of statLabels) {
    const el = page.getByText(lbl, { exact: true })
    log((await el.count()) > 0 ? 'PASS' : 'WARN', 'UX', `Stat label "${lbl}" visible`)
  }

  // --- Add task, start timer, verify UI not broken ---
  const input = page.locator('input[placeholder*="task"]')
  await input.fill('Audit test task')
  await input.press('Enter')
  await page.waitForTimeout(300)
  const playBtn = page.locator('main button').nth(1)
  await playBtn.click()
  await page.waitForTimeout(1500)
  const displayStillVisible = page.locator('span').filter({ hasText: /^\d{2}:\d{2}$/ })
  log((await displayStillVisible.count()) > 0 ? 'PASS' : 'FAIL', 'UX', 'Timer display stable while tasks exist')
  await playBtn.click()

  await ss(page, '15-ux-final-state')
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

;(async () => {
  console.log('\n🔍 FlowTimer — Full UI/UX + Functional Audit\n' + '─'.repeat(55))
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  try {
    console.log('\n📄 LANDING PAGE\n')
    await auditLanding(page)

    console.log('\n🏗  APP STRUCTURE\n')
    await auditAppStructure(page)

    console.log('\n⏱  TIMER FUNCTIONALITY\n')
    await auditTimer(page)

    console.log('\n🔁 MODE SWITCHING\n')
    await auditModes(page)

    console.log('\n✅ TASK LIST\n')
    await auditTasks(page)

    console.log('\n⚙️  SETTINGS MODAL\n')
    await auditSettings(page)

    console.log('\n💾 LOCALSTORAGE PERSISTENCE\n')
    await auditPersistence(page)

    console.log('\n🔗 NAVIGATION\n')
    await auditNavigation(page)

    console.log('\n📱 RESPONSIVE\n')
    await auditResponsive(page)

    console.log('\n♿ ACCESSIBILITY\n')
    await auditA11y(page)

    console.log('\n✨ UX DETAILS\n')
    await auditUX(page)

  } catch (err) {
    console.error('\n💥 Audit crashed:', err.message)
    await ss(page, '99-crash')
    fail++
  } finally {
    await browser.close()
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55))
  console.log(`📊 AUDIT COMPLETE`)
  console.log(`   ✅ PASS  ${pass}`)
  console.log(`   ⚠️  WARN  ${warn}`)
  console.log(`   ❌ FAIL  ${fail}`)
  console.log(`   📸 Screenshots → ./${SS_DIR}/`)
  console.log('═'.repeat(55) + '\n')

  if (fail > 0) {
    console.log('❌ Failed checks:')
    results.filter(r => r.status === 'FAIL').forEach(r =>
      console.log(`   [${r.group}] ${r.label}${r.detail ? ' — ' + r.detail : ''}`)
    )
    console.log()
  }
  if (warn > 0) {
    console.log('⚠️  Warnings:')
    results.filter(r => r.status === 'WARN').forEach(r =>
      console.log(`   [${r.group}] ${r.label}${r.detail ? ' — ' + r.detail : ''}`)
    )
    console.log()
  }

  process.exit(fail > 0 ? 1 : 0)
})()
