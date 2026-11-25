import {
  callout,
  dragToOrder,
  flipCard,
  lesson,
  q,
  richText,
  scenario,
  YES,
  NO,
  type SectionContent,
} from "./helpers";

// Section 5: Speed and Driving Conditions.
export const section5: SectionContent = {
  lessons: [
    lesson(
      [
        "Speed limits",
        "速度制限",
        "Límites de velocidad",
        "Ограничения скорости",
      ],
      richText([
        "The basic speed law: never drive faster than is safe for the conditions, even below the posted limit. Near schools the limit is 25 mph when children are outside or crossing. Residential and business districts are 25 mph unless signs say otherwise.",
        "基本速度の原則: 制限速度以下でも、状況に対して安全な速度を超えてはいけません。学校付近では、子どもが外にいるか横断中なら時速25マイルです。住宅街や商業地域は標識がなければ時速25マイルです。",
        "La ley de velocidad básica: nunca manejes más rápido de lo seguro para las condiciones, aunque estés bajo el límite. Cerca de escuelas el límite es 25 mph cuando hay niños afuera o cruzando. Zonas residenciales y comerciales: 25 mph salvo que las señales digan otra cosa.",
        "Основное правило скорости: никогда не ехать быстрее, чем безопасно в данных условиях, даже ниже знака. У школ — 25 миль/ч, когда дети на улице или переходят дорогу. В жилых и деловых районах — 25 миль/ч, если нет других знаков.",
      ]),
      flipCard(
        [
          "School zone limit",
          "スクールゾーンの制限",
          "Límite en zona escolar",
          "Скорость у школы",
        ],
        [
          "25 mph when children are present.",
          "子どもがいるときは時速25マイル。",
          "25 mph cuando hay niños.",
          "25 миль/ч, когда рядом дети.",
        ],
      ),
      callout(
        "info",
        [
          "Speed and stopping",
          "速度と停止距離",
          "Velocidad y frenado",
          "Скорость и торможение",
        ],
        [
          "The faster you go, the longer it takes to stop. Doubling speed roughly quadruples braking distance.",
          "速度が上がるほど停止に時間がかかります。速度が2倍になると制動距離はおよそ4倍です。",
          "A mayor velocidad, más distancia para frenar. Al duplicar la velocidad, el frenado se cuadruplica aproximadamente.",
          "Чем выше скорость, тем длиннее остановка. Удвоение скорости увеличивает тормозной путь примерно вчетверо.",
        ],
      ),
    ),
    lesson(
      [
        "Rain, fog and slippery roads",
        "雨・霧・滑りやすい路面",
        "Lluvia, niebla y caminos resbalosos",
        "Дождь, туман и скользкая дорога",
      ],
      richText([
        "The first rain makes roads slick because oil rises. Slow down, increase your following distance and turn on headlights when wipers are on. In fog use low beams. If you start to hydroplane, ease off the gas and steer straight.",
        "雨の降り始めは油が浮き、路面が滑りやすくなります。減速し、車間距離を広げ、ワイパー使用時はヘッドライトを点けます。霧ではロービームを使います。ハイドロプレーニングが起きたらアクセルを緩め、まっすぐ保ちます。",
        "La primera lluvia deja el camino resbaloso porque sube el aceite. Reduce, aumenta la distancia y enciende los faros cuando uses limpiaparabrisas. Con niebla usa luces bajas. Si pierdes tracción por hidroplaneo, suelta el acelerador y mantén el volante recto.",
        "Первый дождь делает дорогу скользкой — выступает масло. Сбавьте скорость, увеличьте дистанцию и включите фары при работе дворников. В тумане используйте ближний свет. При аквапланировании отпустите газ и держите руль прямо.",
      ]),
      scenario(
        [
          "Your car starts to hydroplane on a wet highway. What do you do?",
          "濡れた幹線道路で車がハイドロプレーニングを起こしました。どうしますか?",
          "Tu auto empieza a hidroplanear en una carretera mojada. ¿Qué haces?",
          "Машина начала аквапланировать на мокрой трассе. Что делать?",
        ],
        [
          [
            [
              "Ease off the gas and steer straight",
              "アクセルを緩めまっすぐ保つ",
              "Suelto el acelerador y mantengo el volante recto",
              "Отпускаю газ и держу руль прямо",
            ],
            [
              "Right: let the tires regain grip.",
              "正解: タイヤがグリップを取り戻すのを待ちます。",
              "Bien: deja que los neumáticos recuperen agarre.",
              "Верно: дайте шинам восстановить сцепление.",
            ],
          ],
          [
            [
              "Brake hard",
              "急ブレーキをかける",
              "Freno fuerte",
              "Резко торможу",
            ],
            [
              "Hard braking can cause a skid.",
              "急ブレーキはスリップを招きます。",
              "Frenar fuerte puede causar derrape.",
              "Резкое торможение вызовет занос.",
            ],
          ],
          [
            [
              "Turn the wheel sharply",
              "ハンドルを急に切る",
              "Giro el volante bruscamente",
              "Резко кручу руль",
            ],
            [
              "Sharp steering can spin the car.",
              "急ハンドルは車を回転させます。",
              "Girar de golpe puede hacer girar el auto.",
              "Резкий поворот руля раскрутит машину.",
            ],
          ],
        ],
      ),
      dragToOrder(
        [
          "Order the steps when rain begins.",
          "雨が降り始めたときの手順を並べてください。",
          "Ordena los pasos cuando empieza a llover.",
          "Расставьте шаги, когда начинается дождь.",
        ],
        [
          [
            "Turn on wipers",
            "ワイパーを作動",
            "Encender el limpiaparabrisas",
            "Включить дворники",
          ],
          [
            "Turn on headlights",
            "ヘッドライトを点灯",
            "Encender los faros",
            "Включить фары",
          ],
          ["Slow down", "減速する", "Reducir la velocidad", "Сбавить скорость"],
          [
            "Increase following distance",
            "車間距離を広げる",
            "Aumentar la distancia",
            "Увеличить дистанцию",
          ],
        ],
      ),
    ),
    lesson(
      ["Driving at night", "夜間の運転", "Conducir de noche", "Вождение ночью"],
      richText([
        "Use headlights from 30 minutes after sunset to 30 minutes before sunrise. Dim your high beams for oncoming cars and when following another vehicle. Do not overdrive your headlights: you must be able to stop within the distance you can see.",
        "日没30分後から日の出30分前までヘッドライトを点けます。対向車や前の車に続くときはハイビームを切り替えます。ライトの届く範囲内で止まれる速度で走ります。",
        "Usa los faros desde 30 minutos después del atardecer hasta 30 minutos antes del amanecer. Baja las luces altas con autos de frente o al seguir a otro. Debes poder frenar dentro de la distancia que alcanzas a ver.",
        "Включайте фары через 30 минут после заката и до 30 минут до рассвета. Переключайтесь на ближний свет для встречных и при движении за другой машиной. Скорость должна позволять остановиться в пределах видимости.",
      ]),
      flipCard(
        [
          "When must headlights be on?",
          "ヘッドライトはいつ点けますか?",
          "¿Cuándo deben estar encendidos los faros?",
          "Когда включать фары?",
        ],
        [
          "From 30 min after sunset to 30 min before sunrise, and when wipers are on.",
          "日没30分後〜日の出30分前、およびワイパー使用時。",
          "De 30 min después del atardecer a 30 min antes del amanecer y con limpiaparabrisas.",
          "С 30 минут после заката до 30 минут до рассвета и при работе дворников.",
        ],
      ),
      callout(
        "tip",
        ["Glare", "まぶしさ", "Deslumbramiento", "Блики"],
        [
          "If an oncoming car's lights dazzle you, look toward the right edge of the road.",
          "対向車のライトがまぶしいときは、道路の右端を見ます。",
          "Si las luces de enfrente te deslumbran, mira hacia el borde derecho.",
          "Если встречные фары слепят, смотрите на правый край дороги.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s5-q1",
      [
        "School zone speed limit when children are present",
        "子どもがいるスクールゾーンの制限速度",
        "Límite de velocidad en zona escolar con niños",
        "Скорость в школьной зоне при детях",
      ],
      "25 mph",
      ["15 mph", "35 mph", "45 mph"],
    ),
    q(
      "s5-q2",
      [
        "The basic speed law says you must drive...",
        "基本速度の原則は...",
        "La ley de velocidad básica dice que debes manejar...",
        "Основное правило скорости требует ехать...",
      ],
      [
        "at a speed safe for conditions",
        "状況に対して安全な速度で",
        "a una velocidad segura para las condiciones",
        "со скоростью, безопасной в данных условиях",
      ],
      [
        [
          "at the limit always",
          "常に制限速度で",
          "siempre al límite",
          "всегда на пределе",
        ],
        [
          "as fast as traffic",
          "常に流れより速く",
          "más rápido que el tráfico",
          "быстрее потока",
        ],
        [
          "any speed at night",
          "夜は自由な速度で",
          "cualquier velocidad de noche",
          "любой скоростью ночью",
        ],
      ],
    ),
    q(
      "s5-q3",
      [
        "If you double your speed, braking distance becomes about...",
        "速度が2倍になると制動距離はおよそ...",
        "Si duplicas la velocidad, el frenado es aproximadamente...",
        "При удвоении скорости тормозной путь становится примерно...",
      ],
      "4x",
      ["1x", "2x", "0.5x"],
    ),
    q(
      "s5-q4",
      [
        "At the first rain after a dry spell, roads are...",
        "乾燥が続いた後の最初の雨で路面は...",
        "Con la primera lluvia tras un periodo seco, la vía está...",
        "При первом дожде после сухой погоды дорога...",
      ],
      [
        "extra slippery",
        "特に滑りやすい",
        "extra resbalosa",
        "особенно скользкая",
      ],
      [
        ["safer", "より安全", "más segura", "безопаснее"],
        ["unchanged", "変わらない", "igual", "не меняется"],
        ["frozen", "凍結している", "congelada", "замёрзшая"],
      ],
    ),
    q(
      "s5-q5",
      [
        "In fog you should use...",
        "霧の中では...",
        "Con niebla debes usar...",
        "В тумане следует использовать...",
      ],
      ["low beams", "ロービーム", "luces bajas", "ближний свет"],
      [
        ["high beams", "ハイビーム", "luces altas", "дальний свет"],
        ["no lights", "ライトなし", "sin luces", "без света"],
        [
          "hazard lights while driving",
          "走行中のハザード",
          "intermitentes mientras manejas",
          "аварийку в движении",
        ],
      ],
    ),
    q(
      "s5-q6",
      [
        "If your car hydroplanes you should...",
        "ハイドロプレーニングが起きたら...",
        "Si tu auto hidroplanea debes...",
        "При аквапланировании нужно...",
      ],
      [
        "ease off the gas and steer straight",
        "アクセルを緩めまっすぐ保つ",
        "soltar el acelerador y mantener recto",
        "отпустить газ и держать прямо",
      ],
      [
        ["brake hard", "急ブレーキ", "frenar fuerte", "резко тормозить"],
        ["accelerate", "加速", "acelerar", "ускориться"],
        ["turn sharply", "急ハンドル", "girar bruscamente", "резко повернуть"],
      ],
    ),
    q(
      "s5-q7",
      [
        "Must headlights be on when wipers are in use?",
        "ワイパー使用時にヘッドライトは必要ですか?",
        "¿Deben estar encendidos los faros al usar limpiaparabrisas?",
        "Нужно ли включать фары при работе дворников?",
      ],
      YES,
      [
        NO,
        [
          "Only on freeways",
          "高速道路だけ",
          "Solo en autopistas",
          "Только на шоссе",
        ],
        ["Only in winter", "冬だけ", "Solo en invierno", "Только зимой"],
      ],
    ),
    q(
      "s5-q8",
      [
        "Headlights are required starting how long after sunset?",
        "日没の何分後からヘッドライトが必要ですか?",
        "¿Desde cuánto después del atardecer se requieren faros?",
        "Через сколько после заката нужны фары?",
      ],
      "30 min",
      ["5 min", "2 h", ["At midnight", "真夜中", "A medianoche", "В полночь"]],
    ),
    q(
      "s5-q9",
      [
        "Oncoming car's lights dazzle you. Look...",
        "対向車のライトがまぶしいとき、見る先は...",
        "Los faros de enfrente te deslumbran. Mira...",
        "Встречные фары слепят. Смотрите...",
      ],
      [
        "toward the right edge of the road",
        "道路の右端",
        "hacia el borde derecho",
        "на правый край дороги",
      ],
      [
        [
          "straight into the lights",
          "ライトを直視",
          "directo a las luces",
          "прямо на фары",
        ],
        ["at your phone", "スマホ", "tu teléfono", "в телефон"],
        ["close your eyes", "目を閉じる", "cierra los ojos", "закрыть глаза"],
      ],
    ),
    q(
      "s5-q10",
      [
        "Overdriving your headlights means...",
        "ライトの届く範囲を超えた速度とは...",
        "Exceder el alcance de tus faros significa...",
        "Ехать быстрее, чем позволяет свет фар, значит...",
      ],
      [
        "not being able to stop within what you can see",
        "見える範囲で止まれない",
        "no poder frenar dentro de lo que ves",
        "не успеть остановиться в пределах видимости",
      ],
      [
        [
          "driving with bright lights",
          "明るいライトで走る",
          "manejar con luces brillantes",
          "ехать с яркими фарами",
        ],
        [
          "using fog lights",
          "フォグランプを使う",
          "usar faros antiniebla",
          "использовать противотуманки",
        ],
        [
          "parking at night",
          "夜に駐車する",
          "estacionar de noche",
          "парковаться ночью",
        ],
      ],
    ),
  ],
};
