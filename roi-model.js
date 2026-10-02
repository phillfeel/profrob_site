/* ПРОФРОБОТ — модель ROI-калькулятора.
   Все цифры и допущения описаны во внутреннем документе «ROI-калькулятор ПРОФРОБОТ: как считаем».
   Меняются только здесь: страница roi.html читает пресеты и считает через calc(). */
(function (root) {
  'use strict';

  const TYPES = {
    office:    { name: 'Офис / БЦ', floor: 0.60, norm: 800,  price: 2200000, speed: 550,  manual: 1000, area: [3500, 50000],  area0: 6000,  mode0: 'one' },
    mall:      { name: 'ТЦ',        floor: 0.75, norm: 1000, price: 2600000, speed: 650,  manual: 1100, area: [4000, 50000],  area0: 8000,  mode0: 'one' },
    warehouse: { name: 'Склад',     floor: 0.85, norm: 2000, price: 3500000, speed: 1100, manual: 2500, area: [10000, 100000], area0: 20000, mode0: 'two', modes: ['two', 'h24'] },
    clinic:    { name: 'Клиника',   floor: 0.55, norm: 500,  price: 2200000, speed: 500,  manual: 900,  area: [3500, 50000],  area0: 6000,  mode0: 'one' },
    hotel:     { name: 'Отель',     floor: 0.40, norm: 600,  price: 2200000, speed: 500,  manual: 900,  area: [5000, 50000],  area0: 10000, mode0: 'one' },
  };

  const MODES = {
    one: { name: '1 смена', hours: 8,  passes: 1,   staff: 1.0, cap: 2 },
    two: { name: '2 смены', hours: 14, passes: 1.5, staff: 1.3, cap: 3 },
    h24: { name: '24/7',    hours: 18, passes: 2,   staff: 1.4, cap: 3.5 },
  };

  const K = {
    payroll: 1.3,            // страховые взносы 30%
    contractorMargin: 1.2,   // маржа клининговой компании
    manualLeft: 0.7,         // 30% работы по полу остаётся людям
    staffShareMax: 0.5,      // робот не высвобождает больше половины штата
    serviceRate: 0.08,       // сервис, доля цены в год
    consumables: 60000,      // щётки, скребки, электричество, ₽/год на робота
    operator: 120000,        // доля оператора платформы, ₽/год на робота
    chemistry: 4,            // химия и вода, ₽/м² в месяц
    chemistrySaved: 0.4,     // робот тратит на 40% меньше
    lifeYears: 5,
    leaseAdvance: 0.2, leaseMonths: 36, leaseMarkup: 1.3,
    wage: [55000, 120000], wage0: 67000,
    hoursPerFte: 1980,       // рабочих часов в год на ставку
  };

  /** Сколько уборщиков подставить по умолчанию. */
  function autoStaff(type, area, mode) {
    const t = TYPES[type], m = MODES[mode];
    return Math.max(2, Math.ceil(area / t.norm * m.staff));
  }

  /** Допустимый диапазон ползунка «уборщиков»: от 60% до 200% от нормы для площади. */
  function staffRange(type, area, mode) {
    const a = autoStaff(type, area, mode);
    return [Math.max(2, Math.round(a * 0.6)), Math.max(4, Math.round(a * 2))];
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /**
   * @param {{type:string, area:number, mode:string, staff?:number, wage?:number, contractor?:boolean, lease?:boolean}} input
   */
  function calc(input) {
    const t = TYPES[input.type];
    if (!t) throw new Error('Неизвестный тип объекта');
    // Режим, недоступный для типа (склад в 1 смену), заменяем режимом по умолчанию
    const modeKey = MODES[input.mode] && (!t.modes || t.modes.includes(input.mode)) ? input.mode : t.mode0;
    const m = MODES[modeKey];
    input = Object.assign({}, input, { mode: modeKey });

    const area = clamp(Number(input.area) || t.area0, t.area[0], t.area[1]);
    const [sLo, sHi] = staffRange(input.type, area, input.mode);
    const staff = clamp(Math.round(Number(input.staff) || autoStaff(input.type, area, input.mode)), sLo, sHi);
    const wage = clamp(Number(input.wage) || K.wage0, K.wage[0], K.wage[1]);

    const robotArea = area * t.floor * m.passes;
    const robots = Math.max(1, Math.ceil(robotArea / (t.speed * m.hours)));
    // Сколько ставок робот высвобождает при штате по норме. Если людей больше нормы, каждый убирает
    // меньше, и та же работа робота равна пропорционально большему числу ставок (и наоборот).
    const freedAtNorm = Math.min(robotArea / t.manual * K.manualLeft, robots * m.cap);
    const normStaff = autoStaff(input.type, area, input.mode);
    const freed = Math.min(freedAtNorm * staff / normStaff, staff * K.staffShareMax);

    const payrollMult = K.payroll * (input.contractor ? K.contractorMargin : 1);
    const savedPeople = freed * wage * 12 * payrollMult;
    const savedChem = area * t.floor * K.chemistry * 12 * K.chemistrySaved;
    const upkeep = robots * (t.price * K.serviceRate + K.consumables + K.operator);

    const net = savedPeople + savedChem - upkeep;          // экономия в год, ₽
    const invest = robots * t.price;
    const payback = net > 0 ? invest / (net / 12) : Infinity;
    const fiveYears = net * K.lifeYears - invest;

    const leaseMonthly = invest * (1 - K.leaseAdvance) * K.leaseMarkup / K.leaseMonths;
    const leaseAdvance = invest * K.leaseAdvance;
    const leasePlus = net / 12 - leaseMonthly;             // плюс в месяц при лизинге

    const costBefore = staff * wage * 12 * payrollMult + area * t.floor * K.chemistry * 12;

    return {
      mode: modeKey, area, staff, wage, staffRange: [sLo, sHi],
      robots, freed, net, invest, payback, fiveYears,
      leaseMonthly, leaseAdvance, leasePlus,
      hoursFreed: freed * K.hoursPerFte,
      costBefore,
    };
  }

  const api = { TYPES, MODES, K, calc, autoStaff, staffRange };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ROI = api;
})(typeof self !== 'undefined' ? self : this);
