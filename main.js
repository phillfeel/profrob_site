(() => {
  'use strict';
  const EASE = 'power3.out';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmt = (v, dec) => v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // ---------- Футер: часы МСК и подсветка вордмарка (не зависят от GSAP) ----------
  const clock = document.getElementById('foot-clock');
  if (clock) {
    const fmtTime = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
    const tick = () => { clock.textContent = fmtTime.format(new Date()); };
    tick();
    setInterval(tick, 15000);
  }
  const mark = document.querySelector('.foot-mark');
  if (mark && matchMedia('(hover: hover)').matches) {
    mark.addEventListener('pointermove', (e) => {
      const r = mark.getBoundingClientRect();
      mark.style.setProperty('--mx', `${e.clientX - r.left}px`);
      mark.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // ---------- Производители: селектор, перебирающий бренды (не зависит от GSAP) ----------
  // Рамка сама переходит между ячейками; при наведении следует за курсором, вне экрана — стоит.
  const initBrands = (panel) => {
    const grid = panel.querySelector('.brands-grid');
    const cursor = panel.querySelector('.brands-cursor');
    const cells = [...panel.querySelectorAll('.brand:not(.brand--more)')];
    if (!grid || !cursor || !cells.length) return;

    let active = null;
    const select = (cell) => {
      if (cell === active) return;
      if (active) active.classList.remove('is-active');
      active = cell;
      cell.classList.add('is-active');
      cursor.style.transform = `translate(${cell.offsetLeft}px, ${cell.offsetTop}px)`;
      cursor.style.width = `${cell.offsetWidth}px`;
      cursor.style.height = `${cell.offsetHeight}px`;
      grid.classList.add('has-cursor');
    };

    const STEP = 1800;
    let timer = 0, visible = false, hovering = false;
    // Случайный соседний шаг, но не на ту же ячейку — движение выглядит как поиск, а не как бегущая строка
    const next = () => {
      const i = cells.indexOf(active);
      let j = i;
      while (j === i) j = Math.floor(Math.random() * cells.length);
      select(cells[j]);
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    const start = () => { if (!timer && !reduce && visible && !hovering) timer = setInterval(next, STEP); };

    select(cells[0]);
    window.addEventListener('resize', () => { const c = active; active = null; if (c) select(c); });

    if (matchMedia('(hover: hover)').matches) {
      grid.addEventListener('pointerover', (e) => {
        const cell = e.target.closest('.brand');
        if (!cell || !grid.contains(cell)) return;
        hovering = true; stop(); select(cell);
      });
      grid.addEventListener('pointerleave', () => { hovering = false; start(); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start(); else stop();
      }).observe(panel);
    } else { visible = true; start(); }
  };
  document.querySelectorAll('[data-brands]').forEach(initBrands);

  // Без GSAP (CDN недоступен) страница остаётся полностью читаемой: снимаем скрытие.
  if (!window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove('js');
    document.querySelectorAll('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = fmt(+el.dataset.count, +(el.dataset.dec || 0)); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ========== HERO SCENE — перенос из prototype-motion, логика та же ==========
  // Слои: button.robot — параллакс, .robot-depth — скролл-скраб, .robot-life — микрожизнь,
  // .robot-fig — ховер/спотлайт. Два твина на одном y дерутся, поэтому слои разведены.
  const initHeroScene = () => {
    const mqMobile = matchMedia('(max-width: 1023px)');
    const scene  = document.querySelector('#scene');
    const track  = document.querySelector('#track');
    if (!scene || !track) return;
    const els    = Array.from(track.querySelectorAll('.robot'));
    const cap    = document.querySelector('#caption');
    const capCat = document.querySelector('#caption-cat');
    const capRes = document.querySelector('#caption-res');
    const part = (el, sel) => el.querySelector(sel);
    const num  = (el, key, def) => (el.dataset[key] !== undefined ? parseFloat(el.dataset[key]) : def);
    const auto = () => !reduce && !mqMobile.matches;

    let inView = true;
    let stage = els;

    // ---------- Состояние сцены: одна функция красит всё ----------
    const HOVER = { y: -12, scale: 1.05, dim: .68, dur: .24 };

    function paint(i, cfg) {
      const c = cfg || {};
      const dim = c.dim === undefined ? 1 : c.dim;
      const dur = c.dur === undefined ? .4 : c.dur;
      stage.forEach((el, n) => {
        const on = i !== null && n === i;
        gsap.to(el, { opacity: i === null ? 1 : (on ? 1 : dim), duration: dur * .7, ease: EASE, overwrite: 'auto' });
        gsap.to(part(el, '.robot-fig'), { y: on ? (c.y || 0) : 0, scale: on ? (c.scale || 1) : 1, duration: dur, ease: EASE, overwrite: 'auto' });
        gsap.to(part(el, '.robot-glow'), { opacity: on ? 1 : .5, scale: on ? 1.18 : 1, duration: dur, ease: EASE, overwrite: 'auto' });
        el.classList.toggle('is-active', on);
      });
      if (i !== null && stage[i]) showCaption(stage[i]); else hideCaption();
    }

    // ---------- Панель результата: появляется на ховер/фокус, между роботами — кроссфейд ----------
    let capTl = null, capShown = false;
    function showCaption(el) {
      if (!cap || cap.hidden) return;
      const cat = el.dataset.cat, res = el.dataset.res;
      if (capShown && capCat.textContent === cat) return;
      const wasShown = capShown;
      capShown = true;
      if (capTl) capTl.kill();
      const fill = () => { capCat.textContent = cat; capRes.textContent = res; };
      if (reduce) { fill(); capTl = gsap.set(cap, { opacity: 1, y: 0 }); return; }
      capTl = gsap.timeline();
      if (wasShown) capTl.to(cap, { opacity: 0, y: -6, duration: .18, ease: EASE });
      capTl.add(fill).fromTo(cap, { y: 6 }, { opacity: 1, y: 0, duration: .28, ease: EASE });
    }
    function hideCaption() {
      if (!cap || !capShown) return;
      capShown = false;
      if (capTl) capTl.kill();
      capTl = reduce
        ? gsap.set(cap, { opacity: 0 })
        : gsap.to(cap, { opacity: 0, y: -6, duration: .24, ease: EASE });
    }

    // ---------- Микрожизнь ----------
    const life = [];
    function buildLife() {
      life.forEach((t) => t.kill());
      life.length = 0;
      if (reduce) return;
      stage.forEach((el) => {
        const amp = num(el, 'amp', 3), rot = num(el, 'rot', 0), d = num(el, 'life', 4);
        life.push(gsap.fromTo(part(el, '.robot-life'),
          { y: amp * .5, rotation: rot },
          { y: -amp * .5, rotation: -rot, duration: d / 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      });
    }

    // ---------- Лента (клоны через cloneNode, а не innerHTML) ----------
    const BELT_DUR = 48, BELT_GAP_MIN = 28;
    let beltTl = null;
    const clones = [];
    const beltGap = () => {
      const sum = els.reduce((s, el) => s + el.offsetWidth, 0);
      return Math.max(BELT_GAP_MIN, (innerWidth + 8 - sum) / 6);
    };
    function buildClones() {
      els.forEach((el) => {
        const c = el.cloneNode(true);
        c.dataset.clone = '1';
        c.setAttribute('aria-hidden', 'true');
        c.tabIndex = -1;
        [c].concat(Array.from(c.querySelectorAll('*'))).forEach((n) => {
          n.style.transform = ''; n.style.opacity = ''; n.style.willChange = '';
          n.style.translate = ''; n.style.rotate = ''; n.style.scale = '';
        });
        const img = c.querySelector('img');
        if (img) img.removeAttribute('fetchpriority');
        clones.push(c);
        track.appendChild(c);
        wire(c);
      });
    }
    // ---------- Лента по дуге подиума ----------
    // Верх подиума — эллипс шире экрана: у краёв его передняя кромка поднимается, а трек прямой,
    // и низкие фигуры (опоры Стройки) вылезали за кромку. Каждый робот поднимается на подъём дуги
    // в своей точке — все одинаково, поэтому глубина ряда не меняется. Считаем по offset* (без
    // getBoundingClientRect в тике) и пишем в CSS translate — transform слоёв занят GSAP.
    const plate = scene.querySelector('.scene-plate');
    const plateTop = scene.querySelector('.scene-plate__top');
    let arc = null;
    const measureArc = () => {
      if (!plate || !plateTop) { arc = null; return; }
      const a = plate.offsetWidth / 2;
      arc = { cx: plate.offsetLeft + a, a, b: plateTop.offsetHeight / 2, tw: track.offsetWidth, tl: track.offsetLeft };
    };
    const arcRise = (x) => {
      const t = Math.min(1, Math.abs(x - arc.cx) / arc.a);
      return arc.b * (1 - Math.sqrt(1 - t * t));
    };
    // Подпись под роботом ложится вдоль кромки: угол касательной к эллипсу в точке x.
    // t ограничен (у вершины эллипса наклон уходит в бесконечность), угол — LABEL_TILT_MAX.
    const LABEL_TILT_MAX = 12;
    const arcTilt = (x) => {
      const d = x - arc.cx;
      const t = Math.min(.97, Math.abs(d) / arc.a);
      const deg = Math.atan((arc.b / arc.a) * t / Math.sqrt(1 - t * t)) * 180 / Math.PI;
      return -Math.sign(d) * Math.min(LABEL_TILT_MAX, deg);
    };
    const labelOf = (el) => el._label || (el._label = el.querySelector('.robot-label'));
    function followArc() {
      if (!arc) return;
      const shift = arc.tl + (gsap.getProperty(track, 'xPercent') / 100) * arc.tw;
      stage.forEach((el) => {
        const x = shift + el.offsetLeft + el.offsetWidth / 2;
        el.style.translate = `0 ${(-arcRise(x)).toFixed(2)}px`;
        const label = labelOf(el);
        if (label) label.style.rotate = `${arcTilt(x).toFixed(2)}deg`;
      });
    }
    function startBelt() {
      if (beltTl) return;
      buildClones();
      setStage(els.concat(clones));
      track.style.setProperty('--belt-gap', beltGap().toFixed(2) + 'px');
      track.classList.add('is-belt');
      gsap.set(track, { xPercent: 0, willChange: 'transform' });
      beltTl = gsap.timeline({ repeat: -1 }).to(track, { xPercent: -50, duration: BELT_DUR, ease: 'none' });
      measureArc();
      followArc();
      gsap.ticker.add(followArc);
      if (!inView) beltTl.pause();
    }
    function stopBelt() {
      gsap.ticker.remove(followArc);
      els.forEach((el) => {
        el.style.translate = '';
        const label = labelOf(el);
        if (label) label.style.rotate = '';
      });
      if (beltTl) { gsap.killTweensOf(beltTl); beltTl.kill(); beltTl = null; }
      clones.forEach((c) => {
        gsap.killTweensOf([c].concat(Array.from(c.querySelectorAll('*'))));
        c.remove();
      });
      clones.length = 0;
      track.classList.remove('is-belt');
      track.style.removeProperty('--belt-gap');
      gsap.set(track, { clearProps: 'all' });
    }
    const brake = (ts, dur) => {
      if (beltTl) gsap.to(beltTl, { timeScale: ts, duration: dur, ease: EASE, overwrite: true });
    };

    // ---------- Ховер/фокус — вешаются ОДИН раз на узел ----------
    function wire(el) {
      const focusIn = () => { brake(0, .4); paint(stage.indexOf(el), HOVER); };
      const focusOut = () => { brake(1, .6); paint(null, { dur: .3 }); };
      el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') focusIn(); });
      el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') focusOut(); });
      el.addEventListener('focus', focusIn);
      el.addEventListener('blur', focusOut);
      el.addEventListener('click', () => paint(stage.indexOf(el), HOVER));
    }
    els.forEach(wire);

    // ---------- Параллакс (quickTo, пересобирается со стейджем) ----------
    let px = [], py = [];
    const pq = [];
    function buildParallax() {
      pq.forEach((t) => t.kill());
      pq.length = 0;
      const make = (el, prop) => {
        const q = gsap.quickTo(el, prop, { duration: .5, ease: 'power2.out' });
        if (q.tween) pq.push(q.tween);
        return q;
      };
      px = stage.map((el) => make(el, 'x'));
      py = stage.map((el) => make(el, 'y'));
    }
    scene.closest('.hero').addEventListener('pointermove', (e) => {
      if (reduce || mqMobile.matches || e.pointerType === 'touch') return;
      const cx = innerWidth / 2, cy = innerHeight / 2;
      stage.forEach((el, n) => {
        const d = num(el, 'depth', .014);
        if (px[n]) px[n]((e.clientX - cx) * d);
        if (py[n]) py[n]((e.clientY - cy) * d * .6);
      });
    });

    // ---------- Подъём по глубине при скролле ----------
    // Прогресс скролла хранится отдельно и красится на весь stage: клоны ленты рождаются
    // посреди скролла и должны сразу встать на ту же высоту, что и оригиналы.
    const DEPTH_RISE = 3600;
    let depthP = 0;
    function applyDepth() {
      stage.forEach((el) => gsap.set(part(el, '.robot-depth'), { y: -num(el, 'depth', .014) * DEPTH_RISE * depthP }));
    }

    function setStage(list) { stage = list; buildLife(); buildParallax(); applyDepth(); }

    // ---------- Въезд роботов ----------
    if (!reduce) {
      gsap.set(els, { willChange: 'transform' });
      gsap.from(els, {
        y: 24, opacity: 0, duration: .9, ease: EASE, stagger: .07, delay: .15,
        onComplete: () => gsap.set(els, { willChange: 'auto' }),
      });
    }

    // ---------- Скролл-скраб героя (единственный) ----------
    gsap.matchMedia().add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const syncDepth = (self) => { depthP = self.progress; applyDepth(); };
      const tl = gsap.timeline({ scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: syncDepth, onRefresh: syncDepth,
      } })
        .to('.hero-top', { y: -120, opacity: 0, ease: 'none' }, 0)
        .to(scene, { scale: 1.12, y: 40, transformOrigin: '50% 70%', ease: 'none' }, 0)
        .to(scene, { opacity: 0, ease: 'none' }, .6);
      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        depthP = 0;
        applyDepth();
      };
    });

    // ---------- Пауза вне вьюпорта ----------
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => {
        inView = self.isActive;
        if (inView) {
          life.forEach((t) => t.play());
          if (beltTl) beltTl.play();
        } else {
          life.forEach((t) => t.pause());
          if (beltTl) beltTl.pause();
        }
      },
    });

    // ---------- Запуск: лента на десктопе, статичный ряд на мобиле / reduced motion ----------
    let startTimer = null;
    function setup(initial) {
      if (startTimer) { startTimer.kill(); startTimer = null; }
      stopBelt();
      setStage(els);
      if (!initial) paint(null, { dur: .3 });
      if (cap) cap.hidden = mqMobile.matches;
      if (!auto()) return;
      // Раскладка ленты — сразу, иначе роботы сначала стоят статичным рядом и потом «разлепляются».
      // При первом запуске лента стоит, пока идёт въезд, и затем плавно разгоняется.
      startBelt();
      if (initial && beltTl) {
        beltTl.timeScale(0);
        startTimer = gsap.delayedCall(1.5, () => {
          startTimer = null;
          if (!track.querySelector('.robot:hover, .robot:focus')) brake(1, 1.2);
        });
      }
    }
    setup(true);
    mqMobile.addEventListener('change', () => setup(false));

    // Ресайз меняет ширину роботов — пересобираем ленту с сохранением фазы
    let rz = null;
    addEventListener('resize', () => {
      if (rz) rz.kill();
      rz = gsap.delayedCall(.2, () => {
        if (!beltTl) return;
        const phase = beltTl.progress();
        stopBelt(); startBelt();
        if (!beltTl) return;
        beltTl.progress(phase);
        beltTl.timeScale(track.querySelector('.robot:hover') ? 0 : 1);
        paint(null, { dur: .2 });
      });
    });
  };

  // ---------- Smooth scroll (Lenis) + якоря ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('[data-link]').forEach((a) => a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(target, { offset: 0 }) : target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  // ---------- Count-up ----------
  const countUp = (el) => {
    const to = +el.dataset.count, dec = +(el.dataset.dec || 0);
    if (reduce) { el.textContent = fmt(to, dec); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.4, ease: EASE, onUpdate: () => { el.textContent = fmt(o.v, dec); } });
  };

  // ---------- Section counter ----------
  const counter = document.querySelector('.counter');
  const cCur = counter.querySelector('.cur'), cLbl = counter.querySelector('.lbl'), cBar = counter.querySelector('.bar i');
  const sections = [...document.querySelectorAll('[data-sec]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  let activeSec = null;
  // Активный раздел = последний, чей верх выше середины экрана. Работает и для закреплённых секций.
  const syncCounter = () => {
    const mid = window.innerHeight * 0.5;
    const sec = sections.reduce((acc, s) => (s.getBoundingClientRect().top <= mid ? s : acc), sections[0]);
    if (sec === activeSec) return;
    activeSec = sec;
    cCur.textContent = sec.dataset.sec; cLbl.textContent = sec.dataset.name;
    counter.classList.toggle('on-dark', sec.hasAttribute('data-dark'));
    gsap.to(cBar, { scaleY: +sec.dataset.sec / sections.length, duration: .6, ease: EASE });
    navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + sec.id));
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: syncCounter, onRefresh: syncCounter });

  // ---------- 01 Hero ----------
  const heroIn = gsap.utils.toArray('.hero-in');
  if (!reduce) {
    gsap.from(heroIn, { y: 16, opacity: 0, duration: .6, ease: EASE, stagger: .08 });
  }
  document.querySelectorAll('.metrics [data-count]').forEach(countUp);

  // Инициализация сцены героя (режимы, микрожизнь, параллакс, скролл-скраб — всё внутри)
  initHeroScene();

  // ---------- Reveal (общий) ----------
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: .6, ease: EASE, stagger: .06 }),
  });

  // ---------- 03 Внедрение: вертикальный скролл, шаги заполняются по ходу ----------
  // Обычный поток документа + один scrub на весь список — без пина, лёгкий эффект,
  // поэтому работает на всех экранах и не гейтится под десктоп, в отличие от лент ниже.
  (() => {
    const list = document.querySelector('.vproc-list');
    if (!list) return;
    const vsteps = [...list.querySelectorAll('.vstep')];
    const vLine = list.querySelector('.vt-line i');
    const vBar = document.querySelector('.vp-bar i');
    const vCur = document.querySelector('.vp-cur');
    const total = vsteps.length;
    vsteps[0].classList.add('on');
    ScrollTrigger.create({
      trigger: list, start: 'top 60%', end: 'bottom 60%', scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(vLine, { scaleY: p });
        gsap.set(vBar, { scaleX: p });
        const i = Math.min(total, Math.floor(p * total) + 1);
        vCur.textContent = pad2(i);
        vsteps.forEach((s, k) => s.classList.toggle('on', k < i));
      },
    });
  })();

  // ---------- 04 Результат: цифры и шкалы ----------
  ScrollTrigger.create({
    trigger: '#results', start: 'top 70%', once: true,
    onEnter: () => {
      document.querySelectorAll('#results [data-count]').forEach(countUp);
      gsap.to('#results .bar i', { scaleX: (i, el) => +el.dataset.fill, duration: 1.4, ease: EASE, stagger: .1 });
    },
  });
  ScrollTrigger.create({ trigger: 'footer .stats', start: 'top 85%', once: true, onEnter: () => document.querySelectorAll('footer [data-count]').forEach(countUp) });

  // ---------- 05 Кейсы: слайдер ----------
  const cases = document.querySelector('.cases');
  const caseCards = [...cases.children];
  const cCaseCur = document.querySelector('.c-cur');
  document.querySelector('.c-total').textContent = pad2(caseCards.length);
  const [prevBtn, nextBtn] = document.querySelectorAll('.slider-ctrl .round');
  const caseIndex = () => Math.round(cases.scrollLeft / (caseCards[0].offsetWidth + 24));
  const syncCases = () => {
    const i = Math.min(caseIndex(), caseCards.length - 1);
    cCaseCur.textContent = pad2(i + 1);
    prevBtn.disabled = cases.scrollLeft < 4;
    nextBtn.disabled = cases.scrollLeft + cases.clientWidth >= cases.scrollWidth - 4;
  };
  cases.addEventListener('scroll', syncCases, { passive: true });
  document.querySelectorAll('.slider-ctrl .round').forEach((b) => b.addEventListener('click', () => {
    const i = Math.max(0, Math.min(caseCards.length - 1, caseIndex() + +b.dataset.dir));
    cases.scrollTo({ left: caseCards[i].offsetLeft - caseCards[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  }));
  syncCases();

  // ---------- Закрепления: только десктоп и без reduced-motion ----------
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {

    // 02 Задачи: горизонтальная лента (единственный остающийся data-hpin — «Внедрение»
    // теперь вертикальный скролл, см. блок выше). SLOWDOWN растягивает дистанцию скролла
    // относительно ширины ленты, чтобы карточки не проскакивали — каждую видно дольше.
    const SLOWDOWN = 1.8;
    document.querySelectorAll('[data-hpin]').forEach((sec, n) => {
      const track = sec.querySelector('.track');
      const viewport = sec.querySelector('.viewport');
      const pBar = sec.querySelector('.progress .track-bar i');
      const pCur = sec.querySelector('.p-cur');
      const dist = () => Math.max(0, track.scrollWidth - (window.innerWidth - viewport.getBoundingClientRect().left) + 80);
      const total = 6;

      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => '+=' + dist() * SLOWDOWN, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 3 - n,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(pBar, { scaleX: p });
            const i = Math.min(total, Math.floor(p * total) + 1);
            pCur.textContent = pad2(i);
          },
        },
      });
    });

    // 07 Платформа: закрепление, функции переключаются скроллом
    const feats = [...document.querySelectorAll('.feat')];
    const ui = document.querySelector('.ui');
    const setF = (n) => {
      feats.forEach((f) => f.classList.toggle('on', +f.dataset.f === n));
      ui.dataset.f = n;
      ui.querySelectorAll('.ui-side .it').forEach((it) => it.classList.toggle('on', +it.dataset.f === n));
    };
    ScrollTrigger.create({
      trigger: '#platform', start: 'top top', end: '+=' + feats.length * 55 + '%', pin: true, scrub: true, refreshPriority: 1,
      onUpdate: (self) => setF(Math.min(feats.length, Math.floor(self.progress * feats.length) + 1)),
    });

  });

  // Мобайл / reduced-motion: платформу листают по тапу на функцию
  document.querySelectorAll('.feat').forEach((f) => f.addEventListener('click', () => {
    document.querySelectorAll('.feat').forEach((x) => x.classList.toggle('on', x === f));
    const ui = document.querySelector('.ui'); ui.dataset.f = f.dataset.f;
    ui.querySelectorAll('.ui-side .it').forEach((it) => it.classList.toggle('on', it.dataset.f === f.dataset.f));
  }));

  // Триггеры созданы не сверху вниз: закрепления пересчитываем первыми, остальные — после них
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // Пересчёт после загрузки шрифтов и картинок, чтобы pin-дистанции были точными
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
