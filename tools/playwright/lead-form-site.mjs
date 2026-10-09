// Checks that the lead form of the built Next.js site posts to Web3Forms (request is mocked, no real e-mail).
//
//   node tools/playwright/lead-form-site.mjs [--base-url http://127.0.0.1:3000]
//
// For every page below: fill the form, submit, expect exactly one request to api.web3forms.com with the
// access_key, the Russian field labels and replyto, and the «done» state in the form.
// Phone is optional: a phone OR an e-mail is enough, neither is an error (no request). Same for the ROI form.
import { chromium } from 'playwright';

const i = process.argv.indexOf('--base-url');
const base = (i > 0 ? process.argv[i + 1] : 'http://127.0.0.1:3000').replace(/\/$/, '');
const pages = ['/ru/contacts/', '/en/contacts/', '/ru/solutions/', '/ru/about/', '/ru/industries/'];

const fails = [];
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg); };

const browser = await chromium.launch();
try {
  for (const path of pages) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const sent = [];
    await pg.route('https://api.web3forms.com/**', (r) => {
      sent.push(JSON.parse(r.request().postData() ?? '{}'));
      r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    await pg.goto(base + path);
    await pg.waitForSelector('#lead-form', { state: 'attached' });
    await pg.locator('#talk').scrollIntoViewIfNeeded().catch(() => {});
    await pg.fill('#f-name', 'Тест');
    await pg.fill('#f-phone', '9990001122');
    if (await pg.locator('#f-email').count()) await pg.fill('#f-email', 'test@example.com');
    await pg.check('#f-consent');
    await pg.locator('#lead-form button[type=submit]').click();
    await pg.waitForSelector('#lead-form.is-done', { timeout: 4000 }).catch(() => {});
    const done = await pg.locator('#lead-form.is-done').count();
    const p = sent[0] ?? {};
    check(sent.length === 1 && done === 1 && Boolean(p.access_key) && p['Имя'] === 'Тест' && p['Телефон'] === '+79990001122',
      `${path}: one request, access_key + fields, done state (requests ${sent.length}, done ${done})`);
    await pg.close();
  }
  // Phone or e-mail: each alone is enough, neither blocks the submit.
  for (const path of ['/ru/solutions/', '/ru/industries/retail/', '/ru/contacts/', '/en/about/']) {
    for (const [label, phone, email, expectSent] of [['e-mail only', '', 'a@b.ru', true], ['phone only', '9990001122', '', true], ['neither', '', '', false]]) {
      const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const sent = [];
      await pg.route('https://api.web3forms.com/**', (r) => {
        sent.push(JSON.parse(r.request().postData() ?? '{}'));
        r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
      });
      await pg.goto(base + path);
      await pg.waitForSelector('#lead-form', { state: 'attached' });
      await pg.fill('#f-name', 'Тест');
      if (phone) await pg.fill('#f-phone', phone);
      if (email) await pg.fill('#f-email', email);
      await pg.check('#f-consent');
      await pg.locator('#lead-form button[type=submit]').click();
      await pg.waitForTimeout(800);
      const p = sent[0] ?? {};
      const err = (await pg.locator('#f-phone-err').innerText()).trim();
      const ok = expectSent
        ? sent.length === 1 && (email ? p['E-mail'] === email : p['Телефон'] === '+79990001122') && !(email ? p['Телефон'] : p['E-mail'])
        : sent.length === 0 && err.length > 0;
      check(ok, `${path}: ${label} (requests ${sent.length}, phone error "${err}")`);
      await pg.close();
    }
  }

  // ROI calculator form has its own script and its own payload builder.
  for (const [label, phone, email, expectSent] of [['e-mail only', '', 'a@b.ru', true], ['phone only', '9990001122', '', true], ['neither', '', '', false]]) {
    const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const sent = [];
    await pg.route('https://api.web3forms.com/**', (r) => {
      sent.push(JSON.parse(r.request().postData() ?? '{}'));
      r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    await pg.goto(base + '/ru/roi/');
    await pg.waitForSelector('#lead-form', { state: 'attached' });
    await pg.fill('#f-name', 'Тест');
    if (phone) await pg.fill('#f-phone', phone);
    if (email) await pg.fill('#f-email', email);
    await pg.check('#f-consent');
    await pg.locator('#f-submit').click();
    await pg.waitForTimeout(800);
    const p = sent[0] ?? {};
    const done = await pg.locator('#lead-done:not([hidden])').count();
    const ok = expectSent
      ? sent.length === 1 && done === 1 && Boolean(p.access_key) && p['Имя'] === 'Тест' && Boolean(p['Параметры расчёта']) && (email ? p['E-mail'] === email : p['Телефон'] === '+7 999 000-11-22')
      : sent.length === 0 && done === 0 && (await pg.locator('#e-phone.on').count()) === 1;
    check(ok, `/ru/roi/: ${label} (requests ${sent.length}, done ${done}, phone "${p['Телефон'] ?? ''}")`);
    await pg.close();
  }
} finally {
  await browser.close();
}
process.exit(fails.length ? 1 : 0);
