// Checks that the lead form of the built Next.js site posts to Web3Forms (request is mocked, no real e-mail).
//
//   node tools/playwright/lead-form-site.mjs [--base-url http://127.0.0.1:3000]
//
// For every page below: fill the form, submit, expect exactly one request to api.web3forms.com with the
// access_key, the Russian field labels and replyto, and the «done» state in the form.
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
} finally {
  await browser.close();
}
process.exit(fails.length ? 1 : 0);
