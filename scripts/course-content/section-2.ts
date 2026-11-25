import {
  callout,
  dragToOrder,
  flipCard,
  image,
  lesson,
  q,
  richText,
  scenario,
  YES,
  NO,
  type SectionContent,
} from "./helpers";

// Section 2: Traffic Laws and Right-of-Way.
export const section2: SectionContent = {
  lessons: [
    lesson(
      [
        "Signs, signals and markings",
        "標識・信号・路面標示",
        "Señales, semáforos y marcas",
        "Знаки, светофоры и разметка",
      ],
      richText([
        "Signs, signals and pavement markings tell you what to do.\n\n- A red light or stop sign means a full stop.\n- A flashing red light works like a stop sign.\n- A flashing yellow light means slow down and be careful.\n- A solid yellow line on your side means no passing.",
        "標識、信号、路面標示は取るべき行動を教えてくれます。\n\n- 赤信号や一時停止標識では完全に停止します。\n- 赤の点滅は一時停止と同じです。\n- 黄色の点滅は減速して注意します。\n- 自分側に黄色の実線がある場合は追い越し禁止です。",
        "Las señales, semáforos y marcas te indican qué hacer.\n\n- Luz roja o señal de alto: detención total.\n- Luz roja intermitente: funciona como un alto.\n- Luz amarilla intermitente: reduce y ten precaución.\n- Línea amarilla continua de tu lado: no adelantar.",
        "Знаки, светофоры и разметка подсказывают, что делать.\n\n- Красный сигнал или знак «Стоп» — полная остановка.\n- Мигающий красный работает как знак «Стоп».\n- Мигающий жёлтый — снизьте скорость и будьте осторожны.\n- Сплошная жёлтая линия с вашей стороны — обгон запрещён.",
      ]),
      flipCard(
        [
          "Flashing red light",
          "赤の点滅",
          "Luz roja intermitente",
          "Мигающий красный",
        ],
        [
          "Stop completely, then go when it is safe, as at a stop sign.",
          "完全に停止し、安全を確認してから進みます。",
          "Detente por completo y avanza cuando sea seguro, como en un alto.",
          "Полностью остановитесь и поезжайте, когда безопасно, как у знака «Стоп».",
        ],
      ),
      callout(
        "tip",
        ["Where to stop", "停止位置", "Dónde detenerte", "Где останавливаться"],
        [
          "Stop behind the limit line. If there is none, stop before the crosswalk.",
          "停止線の手前で止まります。停止線がなければ横断歩道の手前で止まります。",
          "Detente detrás de la línea de alto. Si no hay, antes del cruce peatonal.",
          "Остановитесь перед стоп-линией. Если её нет — перед пешеходным переходом.",
        ],
      ),
    ),
    lesson(
      [
        "Right-of-way at intersections",
        "交差点での優先通行",
        "Derecho de paso en intersecciones",
        "Преимущество на перекрёстках",
      ],
      image(
        "intersection",
        [
          "Four cars at an intersection",
          "交差点にいる4台の車",
          "Cuatro autos en una intersección",
          "Четыре машины на перекрёстке",
        ],
        [
          "Who goes first? The car that arrived first.",
          "誰が先に行く? 先に到着した車です。",
          "¿Quién pasa primero? El que llegó primero.",
          "Кто едет первым? Тот, кто приехал первым.",
        ],
      ),
      richText([
        "Right-of-way tells you who goes first; nobody ever owns it.\n\n- At a four-way stop, the first car to arrive goes first.\n- If two cars arrive together, the car on the right goes first.\n- Turning left, yield to oncoming traffic.\n- At an uncontrolled intersection, yield to the car on your right.",
        "優先通行権は誰が先に行くかを示すもので、誰かが「所有」するものではありません。\n\n- 四方一時停止では先に着いた車が先に進みます。\n- 同時に着いたら右側の車が先です。\n- 左折時は対向車に道を譲ります。\n- 信号のない交差点では右側の車に譲ります。",
        'El derecho de paso indica quién pasa primero; nadie lo "posee".\n\n- En un alto de cuatro vías pasa primero quien llegó antes.\n- Si llegan juntos, pasa el de la derecha.\n- Al girar a la izquierda, cede el paso al tráfico que viene de frente.\n- En una intersección sin control, cede al auto de tu derecha.',
        "Преимущество показывает, кто едет первым; оно никому не принадлежит.\n\n- На перекрёстке с четырьмя «Стоп» первым едет тот, кто приехал раньше.\n- Если приехали одновременно, едет тот, кто справа.\n- При левом повороте уступите встречным.\n- На нерегулируемом перекрёстке уступите машине справа.",
      ]),
      scenario(
        [
          "You and another car reach a four-way stop at the same time. The other car is on your right. What do you do?",
          "別の車と同時に四方一時停止に着きました。相手は右側にいます。どうしますか?",
          "Tú y otro auto llegan a la vez a un alto de cuatro vías. El otro está a tu derecha. ¿Qué haces?",
          "Вы и другая машина одновременно подъехали к перекрёстку с четырьмя «Стоп». Она справа. Что делаете?",
        ],
        [
          [
            [
              "Let the car on the right go first",
              "右の車を先に行かせる",
              "Dejo pasar al auto de la derecha",
              "Пропускаю машину справа",
            ],
            [
              "Correct: the car on the right goes first.",
              "正解: 右側の車が先です。",
              "Correcto: pasa primero el de la derecha.",
              "Верно: первым едет машина справа.",
            ],
          ],
          [
            [
              "Go first because you were quick",
              "素早かったので先に行く",
              "Paso primero porque fui rápido",
              "Еду первым, потому что быстрее",
            ],
            [
              "Speed does not give you the right-of-way.",
              "速さは優先権になりません。",
              "La rapidez no da derecho de paso.",
              "Скорость не даёт преимущества.",
            ],
          ],
          [
            [
              "Honk and wait",
              "クラクションを鳴らして待つ",
              "Toco la bocina y espero",
              "Сигналю и жду",
            ],
            [
              "Honking does not settle who goes first.",
              "クラクションでは順番は決まりません。",
              "La bocina no decide quién pasa.",
              "Гудок не решает, кто едет.",
            ],
          ],
        ],
      ),
    ),
    lesson(
      [
        "Pedestrians and emergency vehicles",
        "歩行者と緊急車両",
        "Peatones y vehículos de emergencia",
        "Пешеходы и спецтранспорт",
      ],
      richText([
        "Always yield to pedestrians in a crosswalk, marked or not.\n\nWhen an emergency vehicle with siren or lights approaches, pull to the right edge of the road and stop. Never stop in an intersection.",
        "横断歩道(標示の有無を問わず)にいる歩行者には必ず道を譲ります。\n\nサイレンや赤色灯を点けた緊急車両が近づいたら、道路の右端に寄って停止します。交差点内では止まらないでください。",
        "Cede siempre el paso a los peatones en un cruce, marcado o no.\n\nSi se acerca un vehículo de emergencia con sirena o luces, oríllate a la derecha y detente. Nunca te detengas dentro de una intersección.",
        "Всегда уступайте пешеходам на переходе, размечен он или нет.\n\nЕсли приближается спецтранспорт с сиреной или мигалкой, прижмитесь к правому краю и остановитесь. Не останавливайтесь на перекрёстке.",
      ]),
      dragToOrder(
        [
          "Order what to do when an ambulance approaches from behind.",
          "後ろから救急車が近づいたときの手順を並べてください。",
          "Ordena qué hacer si se acerca una ambulancia por detrás.",
          "Расставьте действия, когда сзади приближается скорая.",
        ],
        [
          [
            "Notice the siren and lights",
            "サイレンと赤色灯に気づく",
            "Notar la sirena y las luces",
            "Заметить сирену и мигалку",
          ],
          [
            "Signal and move to the right edge",
            "合図して右端に寄る",
            "Señalar y moverte a la derecha",
            "Включить сигнал и прижаться вправо",
          ],
          [
            "Stop and wait",
            "停止して待つ",
            "Detenerte y esperar",
            "Остановиться и ждать",
          ],
          [
            "Resume when it has passed",
            "通過後に発進する",
            "Continuar cuando haya pasado",
            "Продолжить после проезда",
          ],
        ],
      ),
      callout(
        "warning",
        ["Move over", "道を空ける", "Muévete", "Уступите дорогу"],
        [
          "Approaching a stopped emergency or tow vehicle with flashing lights? Change lanes or slow down.",
          "点滅灯を点けて停車中の緊急車両やレッカー車に近づいたら、車線を変えるか減速します。",
          "Si te acercas a un vehículo de emergencia o grúa detenido con luces, cambia de carril o reduce la velocidad.",
          "Приближаетесь к стоящей спецмашине или эвакуатору с мигалкой? Смените полосу или сбавьте скорость.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s2-q1",
      [
        "A red light means...",
        "赤信号は...",
        "La luz roja significa...",
        "Красный сигнал означает...",
      ],
      [
        "come to a full stop",
        "完全に停止",
        "detención total",
        "полную остановку",
      ],
      [
        ["slow down", "減速", "reducir la velocidad", "сбавить скорость"],
        ["speed up", "加速", "acelerar", "ускориться"],
        ["honk", "クラクション", "tocar la bocina", "посигналить"],
      ],
    ),
    q(
      "s2-q2",
      [
        "A flashing red light is treated like...",
        "赤の点滅は何と同じ扱いですか?",
        "Una luz roja intermitente se trata como...",
        "Мигающий красный приравнивается к...",
      ],
      ["a stop sign", "一時停止標識", "una señal de alto", "знаку «Стоп»"],
      [
        [
          "a yield sign",
          "徐行標識",
          "una señal de ceda el paso",
          "знаку «Уступи дорогу»",
        ],
        ["a green light", "青信号", "una luz verde", "зелёному сигналу"],
        [
          "a speed limit sign",
          "速度制限標識",
          "un límite de velocidad",
          "ограничению скорости",
        ],
      ],
    ),
    q(
      "s2-q3",
      [
        "At a four-way stop, who goes first?",
        "四方一時停止で先に進むのは?",
        "En un alto de cuatro vías, ¿quién pasa primero?",
        "На перекрёстке с четырьмя «Стоп» первым едет...",
      ],
      [
        "The first car to arrive",
        "先に到着した車",
        "El primero en llegar",
        "тот, кто приехал первым",
      ],
      [
        [
          "The biggest car",
          "一番大きい車",
          "El auto más grande",
          "самая большая машина",
        ],
        [
          "The fastest car",
          "一番速い車",
          "El auto más rápido",
          "самая быстрая машина",
        ],
        [
          "The newest car",
          "一番新しい車",
          "El auto más nuevo",
          "самая новая машина",
        ],
      ],
    ),
    q(
      "s2-q4",
      [
        "Two cars arrive at the same time at a four-way stop. Who goes first?",
        "二台が同時に四方一時停止に着きました。先に進むのは?",
        "Dos autos llegan a la vez a un alto de cuatro vías. ¿Quién pasa?",
        "Две машины приехали одновременно. Кто едет первым?",
      ],
      [
        "The car on the right",
        "右側の車",
        "El auto de la derecha",
        "машина справа",
      ],
      [
        [
          "The car on the left",
          "左側の車",
          "El auto de la izquierda",
          "машина слева",
        ],
        [
          "The one that honks",
          "クラクションを鳴らした方",
          "El que toca la bocina",
          "та, что посигналила",
        ],
        [
          "The one going straight, always",
          "常に直進車",
          "Siempre el que va recto",
          "всегда та, что прямо",
        ],
      ],
    ),
    q(
      "s2-q5",
      [
        "When turning left you must yield to...",
        "左折するときに道を譲る相手は...",
        "Al girar a la izquierda debes ceder el paso al...",
        "При левом повороте нужно уступить...",
      ],
      [
        "oncoming traffic",
        "対向車",
        "tráfico que viene de frente",
        "встречному транспорту",
      ],
      [
        [
          "traffic behind you",
          "後続車",
          "tráfico de atrás",
          "транспорту сзади",
        ],
        [
          "parked cars",
          "駐車中の車",
          "autos estacionados",
          "припаркованным машинам",
        ],
        ["nobody", "誰にも譲らない", "nadie", "никому"],
      ],
    ),
    q(
      "s2-q6",
      [
        "Must you yield to a pedestrian in an unmarked crosswalk?",
        "標示のない横断歩道の歩行者に道を譲る必要がありますか?",
        "¿Debes ceder el paso a un peatón en un cruce sin marcar?",
        "Нужно ли уступать пешеходу на неразмеченном переходе?",
      ],
      YES,
      [
        NO,
        ["Only at night", "夜間だけ", "Solo de noche", "Только ночью"],
        ["Only in the rain", "雨の日だけ", "Solo si llueve", "Только в дождь"],
      ],
    ),
    q(
      "s2-q7",
      [
        "An ambulance with siren approaches from behind. You should...",
        "後ろからサイレンの救急車が来ました。あなたは...",
        "Una ambulancia con sirena se acerca por detrás. Debes...",
        "Сзади приближается скорая с сиреной. Вы должны...",
      ],
      [
        "pull to the right and stop",
        "右に寄って停止する",
        "orillarte a la derecha y detenerte",
        "прижаться вправо и остановиться",
      ],
      [
        ["speed up", "加速する", "acelerar", "ускориться"],
        [
          "stop in the intersection",
          "交差点内で停止する",
          "detenerte en la intersección",
          "остановиться на перекрёстке",
        ],
        ["ignore it", "無視する", "ignorarla", "игнорировать"],
      ],
    ),
    q(
      "s2-q8",
      [
        "A solid yellow line on your side of the road means...",
        "自分側の黄色の実線は...",
        "Una línea amarilla continua de tu lado significa...",
        "Сплошная жёлтая линия с вашей стороны означает...",
      ],
      ["do not pass", "追い越し禁止", "no adelantar", "обгон запрещён"],
      [
        [
          "passing is allowed",
          "追い越し可",
          "se puede adelantar",
          "обгон разрешён",
        ],
        [
          "parking is allowed",
          "駐車可",
          "se puede estacionar",
          "парковка разрешена",
        ],
        ["road ends", "道路の終点", "fin del camino", "конец дороги"],
      ],
    ),
    q(
      "s2-q9",
      [
        "At an uncontrolled intersection, yield to the vehicle...",
        "信号のない交差点で譲る相手は...",
        "En una intersección sin control, cede al vehículo...",
        "На нерегулируемом перекрёстке уступите транспорту...",
      ],
      ["on your right", "右側の車", "de tu derecha", "справа"],
      [
        ["on your left", "左側の車", "de tu izquierda", "слева"],
        ["behind you", "後ろの車", "de atrás", "сзади"],
        ["none", "譲らない", "ninguno", "никому"],
      ],
    ),
    q(
      "s2-q10",
      [
        "Where should you stop at a red light?",
        "赤信号ではどこで止まりますか?",
        "¿Dónde debes detenerte en una luz roja?",
        "Где останавливаться на красный?",
      ],
      [
        "Behind the limit line",
        "停止線の手前",
        "Detrás de la línea de alto",
        "Перед стоп-линией",
      ],
      [
        [
          "In the crosswalk",
          "横断歩道の上",
          "En el cruce peatonal",
          "На пешеходном переходе",
        ],
        [
          "In the middle of the intersection",
          "交差点の中央",
          "En medio de la intersección",
          "Посреди перекрёстка",
        ],
        ["Anywhere", "どこでも", "En cualquier lugar", "Где угодно"],
      ],
    ),
  ],
};
