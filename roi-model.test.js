// Запуск: node --test roi-model.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('./roi-model.js');

test('офис 6 000 м², 1 смена: пример из документа', () => {
  const r = R.calc({ type: 'office', area: 6000, mode: 'one' });
  assert.equal(r.staff, 8);
  assert.equal(r.robots, 1);
  assert.equal(r.freed, 2);
  assert.ok(Math.abs(r.net - 1800000) < 50000, `экономия ${r.net}`);
  assert.ok(r.payback > 14 && r.payback < 16, `окупаемость ${r.payback}`);
});

test('при любых допустимых вводах экономия положительная', () => {
  for (const type of Object.keys(R.TYPES)) {
    const t = R.TYPES[type];
    for (let area = t.area[0]; area <= t.area[1]; area += 500) {
      for (const mode of t.modes || Object.keys(R.MODES)) {
        const [lo, hi] = R.staffRange(type, area, mode);
        for (const staff of [lo, hi]) {
          for (const wage of R.K.wage) {
            const r = R.calc({ type, area, mode, staff, wage });
            assert.ok(r.net > 0 && Number.isFinite(r.payback), `${type} ${area} ${mode} ${staff} ${wage}: ${r.net}`);
          }
        }
      }
    }
  }
});

test('ввод за пределами диапазонов прижимается к границам', () => {
  const r = R.calc({ type: 'office', area: 100, mode: 'one', staff: 999, wage: 1 });
  assert.equal(r.area, 3500);
  assert.equal(r.wage, R.K.wage[0]);
  assert.equal(r.staff, r.staffRange[1]);
});

test('склад в 1 смену недоступен и считается в режиме по умолчанию', () => {
  const r = R.calc({ type: 'warehouse', area: 20000, mode: 'one' });
  assert.equal(r.mode, 'two');
});

test('подрядчик даёт экономию больше, чем свой штат', () => {
  const own = R.calc({ type: 'mall', area: 8000, mode: 'one' });
  const out = R.calc({ type: 'mall', area: 8000, mode: 'one', contractor: true });
  assert.ok(out.net > own.net);
});

test('при штате по норме робот окупается за 30 мес. и лизинг в плюсе', () => {
  for (const type of Object.keys(R.TYPES)) {
    const t = R.TYPES[type];
    for (let area = t.area[0]; area <= t.area[1]; area += 500) {
      for (const mode of t.modes || Object.keys(R.MODES)) {
        for (const wage of R.K.wage) {
          const r = R.calc({ type, area, mode, wage });
          assert.ok(r.payback <= 30, `${type} ${area} ${mode} ${wage}: ${r.payback}`);
          assert.ok(r.leasePlus > 0, `${type} ${area} ${mode} ${wage}: лизинг ${r.leasePlus}`);
        }
      }
    }
  }
});

test('больше уборщиков — больше экономия, меньше — меньше', () => {
  for (const type of Object.keys(R.TYPES)) {
    const t = R.TYPES[type];
    const base = R.calc({ type, area: t.area0, mode: t.mode0 });
    const [lo, hi] = base.staffRange;
    const more = R.calc({ type, area: t.area0, mode: t.mode0, staff: hi });
    const less = R.calc({ type, area: t.area0, mode: t.mode0, staff: lo });
    assert.ok(more.net > base.net, `${type}: ${more.net} <= ${base.net}`);
    assert.ok(less.net < base.net, `${type}: ${less.net} >= ${base.net}`);
    assert.ok(more.freed <= more.staff * R.K.staffShareMax);
  }
});

test('неизвестный тип объекта — ошибка', () => {
  assert.throws(() => R.calc({ type: 'spaceship', area: 5000, mode: 'one' }));
});
