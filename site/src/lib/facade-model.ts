/* Профессиональная Робототехника — модель калькулятора робота-мойщика фасадов (X-Human Lingkong K3).
   Откуда каждая цифра и что в ней допущение: docs/research/2026-10-02-facade-robot-calculator-data.md.
   Сравниваем покупку робота с тем, что клиент сейчас платит подрядчику-альпинисту за мойку остекления. */
const FACADE_MODEL = (function () {
  'use strict';

  /** Сценарии из презентации поставщика. Объём в год = остекление × число моек. */
  const SCENARIOS = {
    portfolio: { name: 'Портфель объектов', area: 30000, washes: 2 },
    bigOffice: { name: 'Крупный БЦ',        area: 25000, washes: 4 },
    small:     { name: 'Малый объект',      area: 8000,  washes: 2 },
  };

  const K = {
    price: 5450000,          // цена комплекта «под ключ» для клиента, ₽ (презентация поставщика)
    lifeYears: 5,            // срок службы для амортизации (в презентации неявно ~7)
    serviceRate: 0.08,       // сервис и ЗИП, доля цены в год (как в roi-model.js)
    wearPerM2: 1,            // щётки, скребки, присоски, вода, электричество, ₽/м²
    dailyOutput: 1500,       // м² за смену на робота: производитель даёт 1 200–2 000
    crew: 2,                 // оператор + страхующий на кровле с допуском по 782н
    payroll: 1.3,            // страховые взносы 30%
    ndfl: 0.87,              // зарплата «на руки» → начисленная
    shiftsPerMonth: 21,
    seasonDays: 183,         // 15 апреля — 15 октября: средний минимум в Москве выше нуля
    weatherLoss: 0.25,       // доля сезонных дней, потерянных на дождь и ветер
    workWeek: 5 / 7,
    robotShare: 0.9,         // доля остекления, которую робот моет; остальное — руками
    maxFrameMm: 10,          // выступающие горизонтальные рамы выше этого робот не проходит
    leaseAdvance: 0.2, leaseMonths: 36, leaseMarkup: 1.3,   // как в roi-model.js
    area: [2000, 150000], area0: 30000,
    washes: [1, 6], washes0: 2,
    manualPrice: [30, 150], manualPrice0: 60,   // ₽/м² за одну мойку у подрядчика
    wage: [80000, 200000], wage0: 125000,       // ₽/мес на руки, на человека в расчёте
  };

  function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

  /** Рабочих дней робота в сезоне. */
  function workDays() {
    return K.seasonDays * (1 - K.weatherLoss) * K.workWeek;
  }

  /** Затраты на расчёт робота за одну смену, ₽ (работодатель, с НДФЛ и взносами). */
  function crewShiftCost(wage: number) {
    return K.crew * wage / K.ndfl * K.payroll / K.shiftsPerMonth;
  }

  /**
   * @param {{area:number, washes:number, manualPrice?:number, wage?:number}} input
   */
  function calc(input: {area: number; washes: number; manualPrice?: number; wage?: number}) {
    const area = clamp(Number(input.area) || K.area0, K.area[0], K.area[1]);
    const washes = clamp(Math.round(Number(input.washes) || K.washes0), K.washes[0], K.washes[1]);
    const manualPrice = clamp(Number(input.manualPrice) || K.manualPrice0, K.manualPrice[0], K.manualPrice[1]);
    const wage = clamp(Number(input.wage) || K.wage0, K.wage[0], K.wage[1]);

    const volume = area * washes;                          // м² мойки в год
    const robotVolume = volume * K.robotShare;
    const days = workDays();
    const capacity = days * K.dailyOutput;                 // м² в год на один робот
    const robots = Math.max(1, Math.ceil(robotVolume / capacity));
    const robotDays = robotVolume / K.dailyOutput;         // смен робота в год, на всех
    const load = robotDays / (robots * days);              // загрузка сезона

    const shift = crewShiftCost(wage);
    const varPerM2 = shift / K.dailyOutput + K.wearPerM2;  // переменные расходы робота, ₽/м²
    const invest = robots * K.price;
    const amort = invest / K.lifeYears;
    const service = invest * K.serviceRate;
    const crewCost = robotDays * shift;
    const wear = robotVolume * K.wearPerM2;
    const leftManual = (volume - robotVolume) * manualPrice;

    const costBefore = volume * manualPrice;               // сейчас платят подрядчику
    const opex = service + crewCost + wear + leftManual;   // с роботом, без амортизации
    const net = costBefore - opex;                         // экономия в год, ₽
    const payback = net > 0 ? invest / net : Infinity;     // лет
    const fiveYears = net * K.lifeYears - invest;

    // Полная цена 1 м² роботом (амортизация + сервис + расчёт + расходники)
    const costPerM2 = (amort + service + crewCost + wear) / robotVolume;
    // Цена 1 м² с роботом для клиента: робот с амортизацией + домывка подрядчиком
    const withRobotPerM2 = (amort + opex) / volume;
    // Объём, при котором робот с амортизацией обходится как подрядчик (на один робот)
    const margin = K.robotShare * (manualPrice - varPerM2);
    const breakEven = margin > 0 ? (K.price / K.lifeYears + K.price * K.serviceRate) / margin : Infinity;

    const leaseMonthly = invest * (1 - K.leaseAdvance) * K.leaseMarkup / K.leaseMonths;
    const leaseAdvance = invest * K.leaseAdvance;
    const leasePlus = net / 12 - leaseMonthly;             // плюс в месяц при лизинге

    return {
      area, washes, manualPrice, wage,
      volume, robotVolume, robots, robotDays, workDays: days, capacity, load,
      shift, varPerM2, invest, amort, service, crewCost, wear, leftManual,
      costBefore, opex, net, payback, fiveYears, costPerM2, withRobotPerM2, breakEven,
      leaseMonthly, leaseAdvance, leasePlus,
    };
  }

  return { SCENARIOS, K, calc, workDays, crewShiftCost };
})();

export const { SCENARIOS, K, calc, workDays, crewShiftCost } = FACADE_MODEL;
