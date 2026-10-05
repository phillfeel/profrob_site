# Промпты для фото Hero отраслевых лендингов

Задача: фотографии для каждой отрасли (промпты 1–5 — первые пять лендингов, 6–11 — добавлены 2026-10-06 для новых), которые выглядят как настоящая съёмка на объекте, а не как картинка из генератора. Одно и то же фото используется в Hero лендинга (4:5) и в карточке хаба (16:9 или 4:3), поэтому генерируем с запасом по краям.

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

Промпты 6–11 — для лендингов из `docs/research/2026-10-06-empty-industries-research.md`. Сюжеты взяты из реальных внедрений, найденных в исследовании: робот моет холл БЦ днём, при арендаторах; убирает ТЦ и паркинг; моет вокзал; подметает парк; моет рекреацию школы во время урока. Для фитнеса кейса нет, поэтому сюжет — типовой.

## 6. Бизнес-центры и офисы

Робот моет лифтовый холл БЦ в рабочее время, при людях. Это главный аргумент страницы: уборка днём и тихо.

```
A compact autonomous floor-scrubbing robot, low boxy grey body about knee height with a soft bumper and a small lidar dome on top, cleaning the elevator lobby of a mid-range office building in Moscow on a weekday afternoon. Large-format porcelain floor tiles with a slightly wet sheen behind the robot, brushed steel elevator doors, a ficus in a planter, a security turnstile area at the edge of the frame. Two office workers with laptops and coffee walk past without paying attention, motion-blurred, one holding a lanyard badge. Mixed cool daylight from a glass facade and warm ceiling downlights. The robot is in the right third of the frame, slightly turned as it navigates around a person's feet.
```

Запасной кадр (паркинг БЦ, если в Hero нужна техника крупнее):

```
A ride-size autonomous scrubber-sweeper without a driver's seat, moving between parked cars in an underground parking garage of an office building, painted concrete floor with faded yellow bay lines and tyre marks, fluorescent tube lighting with one tube flickering darker, concrete columns with numbered stripes (numbers unreadable), a wet clean stripe behind the machine.
```

## 7. Торговые центры и ритейл

Робот моет галерею ТЦ ранним утром, до открытия магазинов: роллеты опущены, светятся только витрины.

```
An autonomous commercial floor-scrubbing robot, grey and white with a squeegee at the back leaving a glossy wet trail, cleaning the wide central gallery of a Russian shopping mall early in the morning before opening. Shop shutters are half down, display windows dimly lit, an escalator in the background with its handrail moving, a single security guard walking far away. Polished light stone floor with faint scuffs and a temporary yellow wet-floor stand nearby. Cold overhead lighting mixed with pale dawn light from a glass roof. The robot is in the right third, mid-turn around a planter bench.
```

Запасной кадр (продуктовый магазин):

```
A compact autonomous cleaning robot washing the floor of a supermarket fresh produce aisle in the evening, wooden crates of apples and cabbages on low shelves, a stray onion skin and a wet leaf on the floor ahead of the robot, a store employee in a plain uniform restocking bananas in the background, out of focus. Warm produce lighting, worn grey floor tiles.
```

## 8. Общественные пространства

Робот моет зал ожидания вокзала, поток людей идёт мимо. Привязка к кейсу РЖД, но без узнаваемого вокзала и без символики.

```
A large autonomous floor-scrubbing robot, grey and white, cleaning the marble floor of a busy main hall of a historic railway station in Russia, high arched ceiling with chandeliers far above, rows of waiting-room benches, travellers with wheeled suitcases crossing the frame and motion-blurred, a person sitting on a bench looking at a phone. Natural daylight from tall arched windows mixed with warm chandelier light. The departure board in the far background is out of focus and unreadable. The robot is in the right third of the frame with a fresh wet stripe behind it.
```

Запасной кадр (терминал аэропорта):

```
An autonomous cleaning robot moving along a long airport terminal concourse at night, polished terrazzo floor reflecting ceiling lights, a closed coffee kiosk with shutters down, a few passengers asleep on seats with backpacks, a cleaner with a manual trolley in the distance. Large dark windows with blurred runway lights outside.
```

## 9. Муниципальные службы

Небольшой электрический робот-подметальщик на аллее городского парка осенью. Ориентир — класс машин вроде «Пикселя», но без его узнаваемого дизайна и без надписей.

```
A small four-wheeled electric autonomous street-sweeping robot, the size of a compact garden tractor, no driver seat, rounded white-grey body with a dark camera mast and two rotating side brushes, slowly sweeping fallen yellow leaves from an asphalt alley in a Moscow city park on an overcast October morning. Birch and maple trees, a cast-iron park bench, a black street lamp, a woman walking a dog in the background, out of focus. Wet asphalt with leaf litter ahead of the machine and a clean strip behind it. The robot is in the right third, slightly angled away from the camera.
```

Запасной кадр (зима):

```
The same class of small electric autonomous utility robot with a narrow snow-plow blade, clearing fresh snow from a pedestrian path along a city embankment at dusk, snowflakes in the air, street lamps with warm light, granite parapet and frozen river beside, a pedestrian in a winter coat walking away. Tyre and blade marks in the snow, slushy edges.
```

## 10. Образовательные учреждения

Робот моет рекреацию школы во время урока: коридор пустой, двери классов закрыты. Привязка к кейсу московских школ.

```
A compact autonomous floor-washing robot, about knee height, grey and white, cleaning an empty school corridor during a lesson in a typical Russian public school. Linoleum floor with a subtle pattern and scuff marks, painted walls with the lower half in a pale green, closed classroom doors with small windows, a row of windows with radiators beneath and a potted geranium on the sill, a bulletin board with blurred papers (no readable text). Soft daylight from the windows. A teacher's silhouette visible through one door window, out of focus. The robot is in the right third, heading away down the corridor.
```

Запасной кадр (университетская лаборатория, сценарий «учебная робототехника»):

```
Two university students in casual clothes working on a bipedal humanoid research robot suspended from a safety gantry in a university robotics lab, one typing on a laptop on a cluttered workbench with cables, tools and a multimeter, the other adjusting the robot's leg. Fluorescent lights, a whiteboard with blurred formulas, cardboard boxes on shelves. Faces turned away or in profile.
```

## 11. Фитнес-клубы и спорткомплексы

Робот моет зону свободных весов в фитнес-клубе рано утром, пока в зале один-два человека.

```
A compact autonomous floor-scrubbing robot, grey and dark, cleaning the rubber flooring in the free-weights area of a mid-range fitness club early in the morning. Dumbbell racks, a squat rack, chalk marks and a few rubber plates on the floor, mirrors along the wall reflecting the room (no readable text, no logos). One person in workout clothes stretching on a mat in the background, motion-blurred, not looking at the camera. Cool LED ceiling strips mixed with grey morning daylight from high windows. The robot is in the right third, navigating around a bench.
```

Запасной кадр (бассейн спорткомплекса):

```
An underwater robotic pool cleaner with a cable trailing to the surface, crawling along the tiled floor of an empty 25-metre public swimming pool in a sports complex, seen from the poolside at a low angle through slightly rippled water. Lane ropes on the surface, a starting block at the edge, chlorine-blue water, overhead halogen lights reflected on the surface, a lifeguard chair empty in the background.
```

---

## Проверка перед публикацией

- Нет читаемых надписей и логотипов.
- Колёса, гусеницы, руки и пальцы без искажений.
- Робот правдоподобен: похож на существующий класс техники, не на концепт-арт.
- В нижней четверти кадра нет важных деталей.
- Кроп 16:9 для карточки хаба тоже читается.
- В `alt` описываем, что на фото, без слов «фото» и «изображение».
