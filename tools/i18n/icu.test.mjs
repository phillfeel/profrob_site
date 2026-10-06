// Run: node --test tools/i18n/icu.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, format, collect, quote, IcuError } from './icu.mjs';
import { parse as parseHtml, elements, attr, decode } from './html.mjs';

const ru = (msg, args) => format(parse(msg), args, 'ru');
const en = (msg, args) => format(parse(msg), args, 'en');

test('interpolation and plain text', () => {
  assert.equal(ru('Привет, {name}!', { name: 'мир' }), 'Привет, мир!');
  assert.equal(ru('24/7 · РФ'), '24/7 · РФ');
});

test('russian plural has three forms plus other', () => {
  const m = '{n, plural, one {# месяц} few {# месяца} many {# месяцев} other {# месяца}}';
  assert.equal(ru(m, { n: 1 }), '1 месяц');
  assert.equal(ru(m, { n: 3 }), '3 месяца');
  assert.equal(ru(m, { n: 11 }), '11 месяцев');
  assert.equal(ru(m, { n: 21 }), '21 месяц');
  assert.equal(ru(m, { n: 1.5 }), '1,5 месяца');
});

test('english plural, exact match and offset', () => {
  assert.equal(en('{n, plural, =0 {no robots} one {# robot} other {# robots}}', { n: 0 }), 'no robots');
  assert.equal(en('{n, plural, =0 {no robots} one {# robot} other {# robots}}', { n: 1 }), '1 robot');
  assert.equal(en('{n, plural, offset:1 one {you} other {you and # others}}', { n: 3 }), 'you and 2 others');
});

test('select, number formats', () => {
  assert.equal(ru('{g, select, f {Она} other {Они}}', { g: 'f' }), 'Она');
  assert.equal(ru('{g, select, f {Она} other {Они}}', { g: 'x' }), 'Они');
  assert.equal(ru('{n, number}', { n: 30000 }).replace(/\s/g, ' '), '30 000');
  assert.equal(en('{n, number}', { n: 30000 }), '30,000');
  assert.equal(ru('≈ {n, number, ::.0} млн ₽', { n: 2 }), '≈ 2,0 млн ₽');
  assert.equal(en('≈ {n, number, ::.0}M', { n: 1.14 }), '≈ 1.1M');
});

test('tags are kept and reported', () => {
  const ast = parse('<b>{n}</b> text<br/><a>link</a>');
  assert.equal(format(ast, { n: 5 }, 'en'), '<b>5</b> text<br/><a>link</a>');
  const { vars, tags } = collect(ast);
  assert.deepEqual([...vars.keys()], ['n']);
  assert.deepEqual([...tags].sort(), ['a', 'b', 'br/']);
});

test('quoting follows ICU', () => {
  assert.equal(ru("It''s {n}", { n: 1 }), "It's 1");
  assert.equal(ru("'{'literal'}'"), '{literal}');
  assert.equal(ru("d'accord"), "d'accord");
  assert.equal(ru(quote("a 'b' {c} <d>")), "a 'b' {c} <d>");
  assert.equal(ru('a < b'), 'a < b');
});

test('invalid messages are rejected with a position', () => {
  for (const bad of ['{n', '{n, plural, one {x}}', '<b>x', 'x</b>', '{n, date}', '}', '{n, plural, one {a} other {b} one {c}}', '<b class="x">y</b>']) {
    assert.throws(() => parse(bad), IcuError, bad);
  }
});

test('missing value is an error', () => {
  assert.throws(() => ru('{n} робот'), /missing value/);
});

test('html reader: offsets, void tags, raw text, entities', () => {
  const src = '<p class="a">x &amp; y&nbsp;z<br><b>b</b></p><script>if (a < b) {}</script>';
  const tree = parseHtml(src);
  const [p, br, b, script] = [...elements(tree)];
  assert.equal(p.tag, 'p');
  assert.equal(attr(p, 'class'), 'a');
  assert.equal(src.slice(p.openEnd, p.closeStart), 'x &amp; y&nbsp;z<br><b>b</b>');
  assert.equal(decode(p.children[0].value), 'x & y\u00a0z');
  assert.equal(br.closeStart, null);
  assert.equal(b.parent, p);
  assert.equal(script.children[0].value, 'if (a < b) {}');
  assert.throws(() => decode('&unknown;'), /unknown character reference/);
});
