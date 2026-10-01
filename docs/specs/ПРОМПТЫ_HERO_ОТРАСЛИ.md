# Промпты для фото Hero отраслевых лендингов

Задача: пять фотографий, которые выглядят как настоящая съёмка на объекте, а не как картинка из генератора. Одно и то же фото используется в Hero лендинга (4:5) и в карточке хаба (16:9 или 4:3), поэтому генерируем с запасом по краям.

---

## Как добиться «не нейросетевого» вида

Признаки сгенерированной картинки и что им противопоставить:

| Выдаёт генерацию | Что делаем |
|---|---|
| Идеальная симметрия, робот строго по центру | Робот смещён к краю, кадр слегка завален, как с рук |
| Неоновая подсветка, синие блики, «футуризм» | Обычный свет объекта: люминесцентные лампы, окно, пасмурный день |
| Глянцевые поверхности, нет пыли и износа | Потёртый пол, следы, скотч на стене, провода, пыль |
| Люди позируют и смотрят в камеру | Люди заняты делом, частично в кадре, смазаны движением |
| Пластиковая кожа, лишние пальцы | Люди далеко, в профиль или со спины, рук крупно нет |
| Тексты-абракадабра на вывесках | В промпте запрещаем читаемые надписи и логотипы |
| Ровная резкость по всему кадру | Малая глубина резкости, шум, лёгкая хроматическая аберрация |

Общие правила:
- **Робот без бренда.** Не пишем Pudu, Keenon и т. д.: генератор нарисует искажённый логотип, и это юридический риск. Описываем форму техники словами.
- **Контекст СНГ, без Америки.** Типовые интерьеры, бетон, плитка, наши поля. Не американский пригород и не жёлтые школьные автобусы.
- **Композиция под вёрстку.** Нижняя четверть кадра спокойная (пол, земля, размытый передний план): на неё ложится стеклянная карточка с цифрами. Главный объект — в верхних двух третях, смещён вправо.
- **Пачкой.** Генерируем 8–16 вариантов, выбираем 1–2, проверяем руки, колёса, отражения, надписи.
- **После генерации:** апскейл до 2400px по длинной стороне, лёгкое зерно в тон зерну `--surface`, без фильтров «под плёнку». Экспорт в WebP.
- **Лучше настоящих фото — только настоящие фото.** У Pudu, Keenon, Gausium, DJI, XAG есть пресс-киты для партнёров. Если удастся их получить, ставим их, а генерацию оставляем как запасной вариант.

Промпты на английском: так все основные генераторы (Midjourney, Flux, Imagen, GPT Image) понимают их точнее. Для Midjourney в конце добавить `--ar 4:5 --style raw --v 7`, для остальных указать соотношение 4:5 в настройках.

### Общий хвост для каждого промпта

```
Documentary editorial photograph, shot on a full-frame camera with a 35mm lens at f/2.8, ISO 1600, natural available light, slight motion blur on people, subtle sensor noise, realistic imperfect surfaces with wear and dust, candid unposed moment, off-center composition, slightly tilted handheld framing, lower quarter of the frame is calm and uncluttered. No readable text, no logos, no brand names, no signage with letters.
```

### Общий негативный промпт (где поддерживается)

```
CGI, 3D render, illustration, glossy, futuristic, sci-fi, neon, blue glow, lens flare, perfect symmetry, centered subject, posing, looking at camera, smiling at camera, plastic skin, extra fingers, distorted hands, readable text, logos, watermark, oversaturated, HDR look, bokeh balls, stock photo look
```

---

## 1. Сервис и клининг

Поломоечный робот в лобби отеля, раннее утро.

```
An autonomous commercial floor-scrubbing robot, compact grey and white boxy body about knee height, with a wet trail behind it on a polished stone floor, cleaning the lobby of a mid-range business hotel in Eastern Europe at 6 a.m. Warm interior lamps mixed with cold blue daylight from tall windows. A receptionist in the background behind the desk, out of focus, looking at a monitor. A luggage trolley and a slightly crumpled rug near the entrance. The robot is in the right third of the frame, captured mid-turn. Floor reflections are soft and imperfect, with faint streaks.
```

Запасной кадр (для отдельного лендинга «Отели», если нишу разделят):

```
A waist-high autonomous delivery robot with a closed compartment, standing in a narrow carpeted hotel corridor next to a room door, a guest in a bathrobe partly visible in the doorway reaching for the compartment, shot from the corridor at a low angle. Warm wall sconces, slightly worn carpet pattern, a room-service tray on the floor by another door.
```

## 2. Строительство

Робот-демонтажник в бетонной коробке.

```
A remote-controlled tracked demolition robot with a hydraulic arm and breaker attachment, dusty orange-grey paint with scratches, breaking a concrete partition wall inside an unfinished multi-storey building. Exposed concrete columns, rebar, plastic sheeting flapping in an empty window opening, overcast daylight. A worker in a hard hat and high-visibility vest stands at a safe distance in the left background holding a remote control box, slightly out of focus. Concrete dust hanging in the air catches the light. Rubble on the floor in the calm lower foreground.
```

## 3. Медицина и велнес

Робот-тележка в коридоре больницы.

```
An autonomous hospital delivery robot shaped like a tall enclosed cart with lockable drawers, white with a light grey base, moving along a long corridor of a regional public hospital in Eastern Europe. Fluorescent ceiling lights, linoleum floor with faint scuff marks, a wall-mounted hand sanitizer, a wheelchair parked against the wall. A nurse in light blue scrubs walks past in the opposite direction, motion-blurred, holding a folder. Evening shift atmosphere, slightly greenish fluorescent color cast.
```

## 4. Промышленность и производство

Кобот на мобильной базе у станка с ЧПУ.

```
A collaborative robot arm mounted on a low autonomous mobile base, loading a metal part into an open CNC milling machine in a working machining workshop. Oil stains on the concrete floor, yellow safety floor markings partly worn off, metal shavings, a parts bin with blanks. An operator in dark work overalls checks a tablet in the background, out of focus. Mixed light from high industrial windows and overhead lamps. The robot arm is caught mid-motion, the gripper close to the machine vice.
```

## 5. Сельское хозяйство

Трактор с комплектом автопилота (retrofit), а не новый «робот-трактор».

```
An older green farm tractor with a modern aftermarket autosteer kit retrofitted: a small GNSS antenna dome on the cab roof and a compact electric steering motor on the steering column, visible through the open cab door. The tractor works a large wheat field in the steppe in late summer, pulling a wide seeder, dust trailing behind it. Low golden evening sun from the side, a dirt road and a line of windbreak trees on the horizon. The cab is empty or the driver sits with hands off the wheel, looking at a small screen. Stubble and soil clods in the calm lower foreground.
```

Запасной кадр (если в Hero нужен дрон, а не трактор):

```
A large agricultural spraying drone with six rotors and a white tank, hovering low over rows of sunflowers at sunrise, a fine mist of spray visible below it. A pilot in a cap stands at the edge of the field with a remote controller, a pickup truck parked on the dirt track behind. Light haze, dew on leaves.
```

---

## Проверка перед публикацией

- Нет читаемых надписей и логотипов.
- Колёса, гусеницы, руки и пальцы без искажений.
- Робот правдоподобен: похож на существующий класс техники, не на концепт-арт.
- В нижней четверти кадра нет важных деталей.
- Кроп 16:9 для карточки хаба тоже читается.
- В `alt` описываем, что на фото, без слов «фото» и «изображение».
