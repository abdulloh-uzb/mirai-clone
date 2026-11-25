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

// Section 3: Safe Driving Maneuvers and Roadway Control.
export const section3: SectionContent = {
  lessons: [
    lesson(
      [
        "Turning and signaling",
        "右左折と合図",
        "Giros y señales",
        "Повороты и сигналы",
      ],
      richText([
        "Signal at least 100 feet before you turn or change lanes. Slow down before the turn, not in it, and turn into the nearest lane.",
        "右左折や車線変更の少なくとも100フィート(約30m)手前で合図を出します。減速はカーブの前に済ませ、最も近い車線に入ります。",
        "Señala al menos 100 pies antes de girar o cambiar de carril. Reduce antes del giro, no durante, y entra al carril más cercano.",
        "Включайте сигнал не менее чем за 100 футов до поворота или перестроения. Сбавляйте скорость до поворота, а не в нём, и входите в ближайшую полосу.",
      ]),
      callout(
        "tip",
        [
          "Signal early",
          "早めの合図",
          "Señala con tiempo",
          "Сигнализируйте заранее",
        ],
        [
          "Other drivers cannot read your mind. A clear signal gives them time to react.",
          "他の運転者はあなたの考えを読めません。明確な合図が反応の時間を与えます。",
          "Los demás no leen tu mente. Una señal clara les da tiempo para reaccionar.",
          "Другие водители не читают мысли. Чёткий сигнал даёт им время среагировать.",
        ],
      ),
      dragToOrder(
        [
          "Order the steps of a safe left turn.",
          "安全な左折の手順を並べてください。",
          "Ordena los pasos de un giro a la izquierda seguro.",
          "Расставьте шаги безопасного левого поворота.",
        ],
        [
          [
            "Signal 100 feet ahead",
            "100フィート手前で合図",
            "Señalar 100 pies antes",
            "Включить сигнал за 100 футов",
          ],
          [
            "Slow down and check for traffic",
            "減速して交通を確認",
            "Reducir y revisar el tráfico",
            "Снизить скорость и осмотреться",
          ],
          [
            "Yield to oncoming cars and pedestrians",
            "対向車と歩行者に譲る",
            "Ceder a autos y peatones",
            "Уступить встречным и пешеходам",
          ],
          [
            "Turn into the nearest lane",
            "最も近い車線へ曲がる",
            "Girar al carril más cercano",
            "Повернуть в ближайшую полосу",
          ],
        ],
      ),
    ),
    lesson(
      [
        "Changing lanes and merging",
        "車線変更と合流",
        "Cambio de carril e incorporación",
        "Перестроение и слияние",
      ],
      richText([
        "Before changing lanes: mirror, signal, then look over your shoulder to check the blind spot. When merging onto a freeway, match the speed of traffic and find a gap.",
        "車線変更の前に、ミラーを見て、合図を出し、肩越しに死角を確認します。高速道路に合流するときは流れの速度に合わせ、空きを見つけます。",
        "Antes de cambiar de carril: espejo, señal y mira por encima del hombro el punto ciego. Al incorporarte a una autopista, iguala la velocidad del tráfico y busca un hueco.",
        "Перед перестроением: зеркало, сигнал, затем взгляд через плечо на слепую зону. При въезде на шоссе уравняйте скорость с потоком и найдите просвет.",
      ]),
      scenario(
        [
          "You are on a freeway on-ramp and traffic flows at 65 mph. What should you do?",
          "高速道路の入口で、流れは時速65マイルです。どうしますか?",
          "Estás en una rampa de incorporación y el tráfico va a 65 mph. ¿Qué haces?",
          "Вы на въезде на шоссе, поток идёт 65 миль/ч. Что делать?",
        ],
        [
          [
            [
              "Accelerate to match traffic and merge into a gap",
              "流れに合わせて加速し空きに合流",
              "Acelero a la velocidad del tráfico y entro en un hueco",
              "Разгоняюсь до скорости потока и вливаюсь в просвет",
            ],
            [
              "Right: merge at the speed of traffic.",
              "正解: 流れの速度で合流します。",
              "Bien: incorpórate a la velocidad del tráfico.",
              "Верно: сливайтесь на скорости потока.",
            ],
          ],
          [
            [
              "Stop at the end of the ramp",
              "ランプの終わりで停止",
              "Me detengo al final de la rampa",
              "Останавливаюсь в конце съезда",
            ],
            [
              "Stopping on a ramp is dangerous.",
              "ランプでの停止は危険です。",
              "Detenerse en la rampa es peligroso.",
              "Остановка на съезде опасна.",
            ],
          ],
          [
            [
              "Merge slowly at 30 mph",
              "時速30マイルでゆっくり合流",
              "Me incorporo despacio a 30 mph",
              "Вливаюсь медленно на 30 миль/ч",
            ],
            [
              "Too slow: it forces others to brake.",
              "遅すぎて他の車が急ブレーキを踏みます。",
              "Muy lento: obliga a otros a frenar.",
              "Слишком медленно: другим придётся тормозить.",
            ],
          ],
        ],
      ),
      flipCard(
        ["Blind spot", "死角", "Punto ciego", "Слепая зона"],
        [
          "The area beside and behind your car that mirrors do not show. Look over your shoulder.",
          "ミラーに映らない車の横や斜め後ろの範囲。肩越しに確認します。",
          "La zona al lado y atrás que los espejos no muestran. Mira por encima del hombro.",
          "Область сбоку и сзади, которую не показывают зеркала. Смотрите через плечо.",
        ],
      ),
    ),
    lesson(
      [
        "Parking and backing up",
        "駐車とバック",
        "Estacionamiento y reversa",
        "Парковка и задний ход",
      ],
      richText([
        "Do not park within 15 feet of a fire hydrant. On a hill facing down, turn your wheels toward the curb; facing up with a curb, turn them away from it. Set the parking brake.",
        "消火栓から15フィート(約4.5m)以内には駐車しません。下り坂では前輪を縁石側に、縁石のある上り坂では縁石と反対に向けます。パーキングブレーキをかけます。",
        "No estaciones a menos de 15 pies de un hidrante. En bajada gira las ruedas hacia la acera; en subida con acera, aléjalas. Pon el freno de mano.",
        "Не паркуйтесь ближе 15 футов к гидранту. На спуске поверните колёса к бордюру; на подъёме при бордюре — от него. Включите ручной тормоз.",
      ]),
      callout(
        "warning",
        ["Look behind", "後方確認", "Mira atrás", "Смотрите назад"],
        [
          "Before backing up, check behind the car, not only the camera. Back slowly.",
          "バックの前にカメラだけでなく車の後ろを直接確認し、ゆっくり下がります。",
          "Antes de retroceder revisa detrás del auto, no solo la cámara. Ve despacio.",
          "Перед задним ходом осмотрите пространство позади, а не только камеру. Двигайтесь медленно.",
        ],
      ),
      flipCard(
        [
          "Distance from a fire hydrant",
          "消火栓からの距離",
          "Distancia a un hidrante",
          "Расстояние до гидранта",
        ],
        [
          "Keep at least 15 feet.",
          "15フィート以上離します。",
          "Mantén al menos 15 pies.",
          "Не менее 15 футов.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s3-q1",
      [
        "How early should you signal before a turn?",
        "右左折の何フィート前に合図しますか?",
        "¿Con cuánta anticipación señalas antes de girar?",
        "За сколько до поворота включать сигнал?",
      ],
      "100 ft",
      ["10 ft", "30 ft", "500 ft"],
    ),
    q(
      "s3-q2",
      [
        "Before changing lanes you should check your...",
        "車線変更の前に確認するのは...",
        "Antes de cambiar de carril debes revisar tu...",
        "Перед перестроением нужно проверить...",
      ],
      ["blind spot", "死角", "punto ciego", "слепую зону"],
      [
        ["radio", "ラジオ", "radio", "радио"],
        ["glove box", "グローブボックス", "guantera", "бардачок"],
        ["fuel gauge", "燃料計", "medidor de gasolina", "уровень топлива"],
      ],
    ),
    q(
      "s3-q3",
      [
        "When merging onto a freeway you should...",
        "高速道路に合流するときは...",
        "Al incorporarte a una autopista debes...",
        "При въезде на шоссе следует...",
      ],
      [
        "match the speed of traffic",
        "流れの速度に合わせる",
        "igualar la velocidad del tráfico",
        "уравнять скорость с потоком",
      ],
      [
        [
          "stop at the ramp end",
          "ランプ終端で止まる",
          "detenerte al final de la rampa",
          "остановиться в конце съезда",
        ],
        [
          "drive much slower",
          "かなり遅く走る",
          "ir mucho más lento",
          "ехать намного медленнее",
        ],
        ["back up", "バックする", "retroceder", "ехать задним ходом"],
      ],
    ),
    q(
      "s3-q4",
      [
        "How close may you park to a fire hydrant?",
        "消火栓にどこまで近づけて駐車できますか?",
        "¿Qué tan cerca de un hidrante puedes estacionar?",
        "Как близко можно парковаться к гидранту?",
      ],
      [
        "Not within 15 ft",
        "15フィート以内は不可",
        "No a menos de 15 pies",
        "Не ближе 15 футов",
      ],
      [
        ["Within 3 ft", "3フィート以内でも可", "A 3 pies", "В 3 футах"],
        ["Right next to it", "すぐ隣", "Justo al lado", "Вплотную"],
        [
          "Any distance",
          "どんな距離でも可",
          "Cualquier distancia",
          "Любое расстояние",
        ],
      ],
    ),
    q(
      "s3-q5",
      [
        "Parking facing downhill with a curb, turn your front wheels...",
        "縁石のある下り坂で駐車するとき、前輪は...",
        "Al estacionar en bajada con acera, gira las ruedas delanteras...",
        "На спуске при бордюре поверните передние колёса...",
      ],
      ["toward the curb", "縁石側へ", "hacia la acera", "к бордюру"],
      [
        [
          "away from the curb",
          "縁石と反対へ",
          "lejos de la acera",
          "от бордюра",
        ],
        ["straight", "まっすぐ", "rectas", "прямо"],
        ["it does not matter", "どちらでもよい", "no importa", "неважно"],
      ],
    ),
    q(
      "s3-q6",
      [
        "Is checking only the backup camera enough before reversing?",
        "バックカメラだけの確認で十分ですか?",
        "¿Basta con mirar solo la cámara de reversa?",
        "Достаточно ли смотреть только камеру заднего вида?",
      ],
      NO,
      [
        YES,
        ["Yes, at night", "夜なら十分", "Sí, de noche", "Да, ночью"],
        [
          "Yes, in a driveway",
          "私道なら十分",
          "Sí, en una entrada",
          "Да, во дворе",
        ],
      ],
    ),
    q(
      "s3-q7",
      [
        "Before turning, you should slow down...",
        "曲がる前の減速は...",
        "Antes de girar debes reducir la velocidad...",
        "Снижать скорость нужно...",
      ],
      ["before the turn", "曲がる前に", "antes del giro", "до поворота"],
      [
        [
          "in the middle of the turn",
          "曲がる最中に",
          "a mitad del giro",
          "в середине поворота",
        ],
        [
          "after the turn",
          "曲がった後に",
          "después del giro",
          "после поворота",
        ],
        ["never", "しない", "nunca", "никогда"],
      ],
    ),
    q(
      "s3-q8",
      [
        "The first step before a lane change is to...",
        "車線変更の最初の手順は...",
        "El primer paso antes de cambiar de carril es...",
        "Первый шаг перед перестроением —",
      ],
      [
        "check your mirrors",
        "ミラーを確認する",
        "revisar los espejos",
        "посмотреть в зеркала",
      ],
      [
        ["honk", "クラクション", "tocar la bocina", "посигналить"],
        ["brake hard", "急ブレーキ", "frenar fuerte", "резко затормозить"],
        ["speed up", "加速", "acelerar", "ускориться"],
      ],
    ),
    q(
      "s3-q9",
      [
        "After parking on a hill you should...",
        "坂道に駐車したら...",
        "Después de estacionar en una pendiente debes...",
        "Припарковавшись на склоне, нужно...",
      ],
      [
        "set the parking brake",
        "パーキングブレーキをかける",
        "poner el freno de mano",
        "включить ручной тормоз",
      ],
      [
        [
          "leave it in neutral",
          "ニュートラルにする",
          "dejarlo en neutro",
          "оставить на нейтрали",
        ],
        [
          "leave the engine running",
          "エンジンをかけたままにする",
          "dejar el motor encendido",
          "оставить двигатель включённым",
        ],
        ["do nothing", "何もしない", "nada", "ничего"],
      ],
    ),
    q(
      "s3-q10",
      [
        "On a freeway on-ramp, stopping is...",
        "高速の入口ランプで停止することは...",
        "Detenerse en una rampa de incorporación es...",
        "Остановка на въезде на шоссе —",
      ],
      [
        "dangerous and should be avoided",
        "危険なので避ける",
        "peligroso y debe evitarse",
        "опасна, её следует избегать",
      ],
      [
        ["required", "必須", "obligatorio", "обязательна"],
        ["the safest choice", "最も安全", "lo más seguro", "самое безопасное"],
        ["recommended", "推奨される", "recomendado", "рекомендуется"],
      ],
    ),
  ],
};
