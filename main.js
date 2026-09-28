(() => {
  'use strict';
  const EASE = 'power3.out';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 1024;
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmt = (v, dec) => v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Без GSAP (CDN недоступен) страница остаётся полностью читаемой: снимаем скрытие.
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = fmt(+el.dataset.count, +(el.dataset.dec || 0)); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ========== HERO SCENE ANIMATION ==========
  const robots = [...document.querySelectorAll('.robot')];
  const sceneCaption = document.querySelector('.scene-caption');
  const captionText = document.querySelector('.caption-text');
  
  // Данные результатов для каждого робота
  const robotResults = {
    agro: 'роботизация сельского хозяйства',
    demolition: 'снижение трудозатрат на демонтаж на 40%',
    cleaning: 'снижение затрат на клининг на 32%',
    manipulator: 'до 80% снижение зависимости от ручного труда',
    amr: 'рост пропускной способности склада на 35%',
    wellness: 'автоматизация wellness-услуг'
  };

  // Текущий режим (A, B, C)
  let currentMode = localStorage.getItem('heroMode') || 'A';
  let spotlightIndex = 0;
  let spotlightTimeline = null;
  let conveyorTimeline = null;
  let microLifeTimelines = [];
  let parallaxQuickTo = null;

  // ========== MICRO LIFE (микрожизнь) ==========
  const createMicroLife = () => {
    microLifeTimelines.forEach(tl => tl.kill());
    microLifeTimelines = [];
    
    if (reduce || isMobile) return;

    const durations = [3.1, 3.7, 4.3, 4.9, 5.3, 5.9];
    const amplitudes = [6, 3, 3, 3, 2, 3]; // agro самый заметный, wellness самый тихий
    const rotations = [0.4, 0, 0, 0, 0, 0]; // только agro вращается

    robots.forEach((robot, i) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(robot, {
        y: amplitudes[i],
        rotation: rotations[i],
        duration: durations[i],
        ease: 'sine.inOut'
      });
      microLifeTimelines.push(tl);
    });
  };

  // ========== HOVER STATE ==========
  const setHoverState = (robot, isActive) => {
    const others = robots.filter(r => r !== robot);
    
    if (isActive) {
      gsap.to(robot, { y: -12, scale: 1.05, duration: 0.24, ease: EASE });
      gsap.to(robot.querySelector('.robot-glow'), { opacity: 0.8, scale: 1.3, duration: 0.24, ease: EASE });
      gsap.to(robot.querySelector('.robot-label'), { opacity: 1, duration: 0.24, ease: EASE });
      gsap.to(others, { opacity: 0.68, duration: 0.24, ease: EASE });
    } else {
      gsap.to(robot, { y: 0, scale: 1, duration: 0.24, ease: EASE });
      gsap.to(robot.querySelector('.robot-glow'), { opacity: 0.3, scale: 1, duration: 0.24, ease: EASE });
      gsap.to(robot.querySelector('.robot-label'), { opacity: 0.6, duration: 0.24, ease: EASE });
      gsap.to(others, { opacity: 1, duration: 0.24, ease: EASE });
    }
  };

  // ========== PARALLAX ==========
  const createParallax = () => {
    if (reduce || isMobile) return;

    const scene = document.querySelector('.scene');
    const depths = [0.008, 0.012, 0.016, 0.018, 0.020, 0.022]; // разные коэффициенты глубины

    parallaxQuickTo = gsap.quickTo(robots, 'y', { duration: 0.4, ease: EASE });

    scene.addEventListener('pointermove', (e) => {
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      robots.forEach((robot, i) => {
        gsap.set(robot, { x: x * 100 * depths[i] * 50 });
      });
    });
  };

  // ========== MODE A: SPOTLIGHT ==========
  const createSpotlightMode = () => {
    if (reduce || isMobile) return;

    const activateRobot = (index) => {
      const activeRobot = robots[index];
      const others = robots.filter((_, i) => i !== index);
      
      gsap.to(activeRobot, { y: -18, scale: 1.06, duration: 0.7, ease: EASE });
      gsap.to(activeRobot.querySelector('.robot-glow'), { opacity: 0.9, scale: 1.4, duration: 0.7, ease: EASE });
      gsap.to(activeRobot.querySelector('.robot-label'), { opacity: 1, duration: 0.7, ease: EASE });
      gsap.to(others, { opacity: 0.62, duration: 0.7, ease: EASE });

      // Обновление caption
      const robotType = activeRobot.dataset.robot;
      captionText.textContent = robotResults[robotType];
      sceneCaption.classList.add('active');
    };

    const cycleSpotlight = () => {
      spotlightIndex = (spotlightIndex + 1) % robots.length;
      activateRobot(spotlightIndex);
    };

    spotlightTimeline = gsap.timeline({ repeat: -1, repeatDelay: 4.2 });
    spotlightTimeline.call(cycleSpotlight);
    activateRobot(0); // первый робот активен сразу

    // Ховер останавливает автоцикл
    robots.forEach((robot, i) => {
      robot.addEventListener('pointerenter', () => {
        spotlightTimeline.pause();
        activateRobot(i);
      });
      robot.addEventListener('pointerleave', () => {
        spotlightTimeline.play();
      });
    });
  };

  // ========== MODE B: CONVEYOR ==========
  const createConveyorMode = () => {
    if (reduce || isMobile) return;

    const track = document.querySelector('.scene-track');
    const trackWidth = track.scrollWidth;
    
    // Дублируем трек
    track.innerHTML += track.innerHTML;
    const allRobots = [...document.querySelectorAll('.robot')];

    conveyorTimeline = gsap.to(track, {
      x: -trackWidth / 2,
      duration: 48,
      ease: 'none',
      repeat: -1
    });

    // Ховер тормозит ленту
    track.addEventListener('pointerenter', () => {
      gsap.to(conveyorTimeline, { timeScale: 0, duration: 0.4, ease: EASE });
    });
    track.addEventListener('pointerleave', () => {
      gsap.to(conveyorTimeline, { timeScale: 1, duration: 0.6, ease: EASE });
    });

    sceneCaption.classList.remove('active');
  };

  // ========== MODE C: HOVER ONLY ==========
  const createHoverOnlyMode = () => {
    sceneCaption.classList.remove('active');
    // Только микрожизнь и ховер, без автоцикла
  };

  // ========== SWITCH MODE ==========
  const switchMode = (mode) => {
    currentMode = mode;
    localStorage.setItem('heroMode', mode);

    // Очистка предыдущих таймлайнов
    if (spotlightTimeline) { spotlightTimeline.kill(); spotlightTimeline = null; }
    if (conveyorTimeline) { conveyorTimeline.kill(); conveyorTimeline = null; }
    
    // Сброс состояния роботов
    gsap.set(robots, { y: 0, scale: 1, opacity: 1, x: 0, rotation: 0 });
    gsap.set('.robot-glow', { opacity: 0.3, scale: 1 });
    gsap.set('.robot-label', { opacity: 0.6 });
    sceneCaption.classList.remove('active');

    // Пересоздание микрожизни
    createMicroLife();

    // Создание新模式
    switch (mode) {
      case 'A':
        createSpotlightMode();
        break;
      case 'B':
        createConveyorMode();
        break;
      case 'C':
        createHoverOnlyMode();
        break;
    }
  };

  // ========== INIT ==========
  const initHeroScene = () => {
    createMicroLife();
    createParallax();
    
    // Обработчики ховера для всех режимов
    robots.forEach(robot => {
      robot.addEventListener('pointerenter', () => setHoverState(robot, true));
      robot.addEventListener('pointerleave', () => setHoverState(robot, false));
      robot.addEventListener('focus', () => setHoverState(robot, true));
      robot.addEventListener('blur', () => setHoverState(robot, false));
    });

    // Переключатель режимов
    document.querySelectorAll('.mode-option input').forEach(input => {
      input.addEventListener('change', (e) => {
        switchMode(e.target.value);
      });
    });

    // Установка текущего режима
    document.querySelector(`.mode-option input[value="${currentMode}"]`).checked = true;
    switchMode(currentMode);
  };

  // ========== SCROLL SCRUB ==========
  const createScrollScrub = () => {
    if (reduce || isMobile) return;

    const scene = document.querySelector('.scene');
    const depths = [0.008, 0.012, 0.016, 0.018, 0.020, 0.022];

    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    })
    .to('.hero-top', { y: -120, opacity: 0, ease: 'none' }, 0)
    .to(robots, (i) => ({
      y: -60 * depths[i] * 100,
      scale: 1.18,
      opacity: 0,
      ease: 'none'
    }), 0);
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
    gsap.from('.scene', { y: 40, opacity: 0, duration: 1.2, ease: EASE, delay: .2 });
  }
  document.querySelectorAll('.metrics [data-count]').forEach(countUp);
  
  // Инициализация сцены героя
  initHeroScene();
  createScrollScrub();

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

    // Hero: наезд на подиум и уход текста. Картинка гаснет заранее (после 60% прогресса),
    // чтобы не обрезаться о границу секции при заезде под следующий блок.
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-top', { y: -120, opacity: 0, ease: 'none' }, 0)
      .to(podium, { scale: 1.18, y: 60, transformOrigin: '50% 60%', ease: 'none' }, 0)
      .to(podium, { opacity: 0, ease: 'none' }, 0.6);

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
