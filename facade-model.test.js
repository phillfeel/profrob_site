// Запуск: node --test facade-model.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('./facade-model.js');

test('крупный БЦ 25 000 м² × 4 мойки по 60 ₽: пример из документа', () => {
  const r = F.calc({ area: 25000, washes: 4, manualPrice: 60 });
  assert.equal(r.volume, 100000);
  assert.equal(r.robots, 1);
  assert.ok(Math.abs(r.net - 3800000) < 50000, `экономия ${r.net}`);
  assert.ok(r.payback > 1.3 && r.payback < 1.6, `окупаемость ${r.payback}`);
});

test('при цене подрядчика 100 ₽ безубыточность близка к 19 400 м² из презентации', () => {
  const r = F.calc({ area: 30000, washes: 2, manualPrice: 100 });
  assert.ok(Math.abs(r.breakEven - 19400) < 1000, `безубыточность ${r.breakEven}`);
});

test('объём выше годовой мощности одного робота требует второго', () => {
  const one = F.calc({ area: 70000, washes: 2 });
  const two = F.calc({ area: 100000, washes: 2 });
  assert.equal(one.robots, 1);
  assert.equal(two.robots, 2);
  assert.ok(two.load <= 1);
});

test('малый объект 8 000 м² × 2 не окупается за срок службы', () => {
  const r = F.calc({ area: 8000, washes: 2, manualPrice: 60 });
  assert.ok(r.payback > F.K.lifeYears, `окупаемость ${r.payback}`);
  assert.ok(r.fiveYears < 0);
  assert.ok(r.leasePlus < 0);
});

test('дешёвый подрядчик и малый объём: экономии нет, окупаемость бесконечна', () => {
  const r = F.calc({ area: 2000, washes: 1, manualPrice: 30 });
  assert.ok(r.net <= 0, `экономия ${r.net}`);
  assert.equal(r.payback, Infinity);
});

test('выше цена подрядчика и больше моек — больше экономия', () => {
  const base = F.calc({ area: 30000, washes: 2, manualPrice: 60 });
  assert.ok(F.calc({ area: 30000, washes: 2, manualPrice: 90 }).net > base.net);
  assert.ok(F.calc({ area: 30000, washes: 3, manualPrice: 60 }).net > base.net);
  assert.ok(F.calc({ area: 30000, washes: 2, manualPrice: 60, wage: 200000 }).net < base.net);
});

test('цена 1 м² роботом падает с ростом объёма', () => {
  const a = F.calc({ area: 10000, washes: 2 }).costPerM2;
  const b = F.calc({ area: 30000, washes: 2 }).costPerM2;
  const c = F.calc({ area: 60000, washes: 2 }).costPerM2;
  assert.ok(a > b && b > c, `${a} ${b} ${c}`);
});

test('ввод за пределами диапазонов прижимается к границам', () => {
  const r = F.calc({ area: 10, washes: 99, manualPrice: 1, wage: 1e9 });
  assert.equal(r.area, F.K.area[0]);
  assert.equal(r.washes, F.K.washes[1]);
  assert.equal(r.manualPrice, F.K.manualPrice[0]);
  assert.equal(r.wage, F.K.wage[1]);
});

test('пустой ввод считается по значениям по умолчанию', () => {
  const r = F.calc({});
  assert.equal(r.area, F.K.area0);
  assert.equal(r.washes, F.K.washes0);
  assert.ok(Number.isFinite(r.net));
});

test('цена 1 м² с роботом учитывает домывку вручную и сходится с экономией', () => {
  const r = F.calc({ area: 30000, washes: 2, manualPrice: 60 });
  assert.ok(r.withRobotPerM2 > r.manualPrice * (1 - F.K.robotShare));
  // Подрядчик минус робот, умноженное на объём, равно экономии за вычетом амортизации
  assert.ok(Math.abs((r.manualPrice - r.withRobotPerM2) * r.volume - (r.net - r.amort)) < 1);
});
