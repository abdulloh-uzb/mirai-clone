import {
  callout,
  dragToOrder,
  flipCard,
  image,
  lesson,
  q,
  richText,
  scenario,
  video,
  YES,
  NO,
  type SectionContent,
} from "./helpers";

// Section 4: Defensive Driving and Hazard Awareness.
export const section4: SectionContent = {
  lessons: [
    lesson(
      [
        "The three-second rule",
        "3秒ルール",
        "La regla de los tres segundos",
        "Правило трёх секунд",
      ],
      image(
        "following-distance",
        [
          "Two cars with a gap between them",
          "間隔を空けた2台の車",
          "Dos autos con distancia entre ellos",
          "Две машины с дистанцией между ними",
        ],
        [
          "Leave at least three seconds behind the car ahead.",
          "前の車との間に3秒以上空けましょう。",
          "Deja al menos tres segundos detrás del auto de adelante.",
          "Держите не менее трёх секунд до машины впереди.",
        ],
      ),
      richText([
        'Pick a fixed object ahead. When the car in front passes it, count "one-thousand-one, one-thousand-two, one-thousand-three". If you pass it before you finish, you are too close. Add more time in rain, fog or at night.',
        "前方の固定物を選び、前の車がそこを通過したら「いち、に、さん」と数えます。数え終える前に自分が通過したら近すぎます。雨、霧、夜間は時間を増やします。",
        'Elige un objeto fijo adelante. Cuando el auto de enfrente lo pase, cuenta "mil uno, mil dos, mil tres". Si lo pasas antes de terminar, estás muy cerca. Aumenta el tiempo con lluvia, niebla o de noche.',
        "Выберите неподвижный предмет впереди. Когда машина впереди проедет его, считайте «раз-тысяча, два-тысяча, три-тысяча». Если вы доехали раньше, дистанция мала. В дождь, туман и ночью увеличьте время.",
      ]),
      flipCard(
        [
          "Safe following distance",
          "安全な車間距離",
          "Distancia segura",
          "Безопасная дистанция",
        ],
        [
          "At least 3 seconds, more in bad conditions.",
          "最低3秒。悪条件ではさらに長く。",
          "Al menos 3 segundos, más en malas condiciones.",
          "Не менее 3 секунд, в плохих условиях — больше.",
        ],
      ),
    ),
    lesson(
      [
        "Scan and predict",
        "見渡して予測する",
        "Observa y anticipa",
        "Осматривайтесь и прогнозируйте",
      ],
      video(
        "scanning",
        [
          "Looking 12 seconds ahead",
          "12秒先を見る",
          "Mirar 12 segundos adelante",
          "Взгляд на 12 секунд вперёд",
        ],
        [
          "Look far down the road, about 12 seconds ahead. Check your mirrors every 5 to 8 seconds. Watch for brake lights, children near the road and cars waiting to pull out.",
          "道路の遠く、約12秒先を見ます。5〜8秒ごとにミラーを確認します。ブレーキランプ、道路脇の子ども、発進を待つ車に注意します。",
          "Mira lejos, unos 12 segundos adelante. Revisa los espejos cada 5 a 8 segundos. Atento a luces de freno, niños junto a la vía y autos por salir.",
          "Смотрите далеко, примерно на 12 секунд вперёд. Проверяйте зеркала каждые 5–8 секунд. Следите за стоп-сигналами, детьми у дороги и машинами, готовыми выехать.",
        ],
      ),
      scenario(
        [
          "A ball rolls into the street from between parked cars. What do you do?",
          "駐車車両の間からボールが道路に転がってきました。どうしますか?",
          "Una pelota rueda a la calle entre autos estacionados. ¿Qué haces?",
          "Мяч выкатился на дорогу между припаркованными машинами. Что делаете?",
        ],
        [
          [
            [
              "Slow down and be ready to stop for a child",
              "減速し、子どもに備えて停止できる状態に",
              "Reduzco y me preparo para frenar por un niño",
              "Сбавляю скорость и готов остановиться из-за ребёнка",
            ],
            [
              "Right: a child often follows the ball.",
              "正解: ボールの後に子どもが来ることがよくあります。",
              "Bien: a menudo un niño sigue la pelota.",
              "Верно: за мячом часто выбегает ребёнок.",
            ],
          ],
          [
            [
              "Keep your speed",
              "速度を保つ",
              "Mantengo la velocidad",
              "Сохраняю скорость",
            ],
            [
              "Risky: you may not stop in time.",
              "危険です。止まれないかもしれません。",
              "Riesgoso: quizá no alcances a frenar.",
              "Опасно: можете не успеть затормозить.",
            ],
          ],
          [
            [
              "Honk and speed up",
              "クラクションを鳴らして加速",
              "Toco la bocina y acelero",
              "Сигналю и ускоряюсь",
            ],
            [
              "Never speed up toward a hazard.",
              "危険に向かって加速してはいけません。",
              "Nunca aceleres hacia un peligro.",
              "Никогда не ускоряйтесь навстречу опасности.",
            ],
          ],
        ],
      ),
      callout(
        "tip",
        [
          "Leave yourself an out",
          "逃げ道を残す",
          "Deja una salida",
          "Оставляйте запасной путь",
        ],
        [
          "Keep space around your car so you have somewhere to go if something goes wrong.",
          "何かあったときに逃げられるよう、車の周りに余裕を保ちます。",
          "Mantén espacio alrededor para tener adónde ir si algo sale mal.",
          "Сохраняйте свободное место вокруг, чтобы было куда деться.",
        ],
      ),
    ),
    lesson(
      [
        "Handling aggressive drivers",
        "あおり運転への対処",
        "Cómo tratar a conductores agresivos",
        "Агрессивные водители",
      ],
      richText([
        "If another driver is aggressive, do not respond. Stay calm, give them room, avoid eye contact and never brake-check. If you feel unsafe, drive to a public place and call 911.",
        "他の運転者が攻撃的でも反応しないでください。落ち着いて道を譲り、目を合わせず、わざと急ブレーキをかけないこと。身の危険を感じたら人の多い場所へ行き、911に通報します。",
        "Si otro conductor es agresivo, no respondas. Mantén la calma, dale espacio, evita el contacto visual y nunca frenes para molestarlo. Si te sientes en peligro, ve a un lugar público y llama al 911.",
        "Если другой водитель агрессивен, не отвечайте. Сохраняйте спокойствие, уступите дорогу, избегайте зрительного контакта и не тормозите демонстративно. Если вам опасно, поезжайте в людное место и звоните 911.",
      ]),
      dragToOrder(
        [
          "Order your response to an aggressive driver.",
          "攻撃的な運転者への対応を並べてください。",
          "Ordena tu respuesta a un conductor agresivo.",
          "Расставьте ваши действия при агрессивном водителе.",
        ],
        [
          [
            "Stay calm and give space",
            "落ち着いて間隔を空ける",
            "Mantener la calma y dar espacio",
            "Сохранить спокойствие и дать место",
          ],
          [
            "Do not make gestures or eye contact",
            "ジェスチャーや視線を避ける",
            "Evitar gestos y contacto visual",
            "Не жестикулировать, не смотреть",
          ],
          [
            "Drive to a public place",
            "人の多い場所へ向かう",
            "Ir a un lugar público",
            "Поехать в людное место",
          ],
          [
            "Call 911 if you feel unsafe",
            "危険なら911に通報",
            "Llamar al 911 si te sientes en peligro",
            "Позвонить 911, если опасно",
          ],
        ],
      ),
      callout(
        "warning",
        [
          "Do not retaliate",
          "仕返しはしない",
          "No tomes represalias",
          "Не мстите",
        ],
        [
          "Road rage can turn a small mistake into a crime.",
          "ロードレイジは小さなミスを犯罪に変えかねません。",
          "La furia vial puede convertir un error pequeño en un delito.",
          "Дорожная агрессия может превратить мелкую ошибку в преступление.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s4-q1",
      [
        "What is a safe minimum following distance in good conditions?",
        "良好な条件での安全な最低車間距離は?",
        "¿Cuál es la distancia mínima segura en buenas condiciones?",
        "Какая минимальная безопасная дистанция в хороших условиях?",
      ],
      ["3 seconds", "3秒", "3 segundos", "3 секунды"],
      [
        ["1 second", "1秒", "1 segundo", "1 секунда"],
        ["half a second", "0.5秒", "medio segundo", "полсекунды"],
        ["no gap", "間隔なし", "sin distancia", "без дистанции"],
      ],
    ),
    q(
      "s4-q2",
      [
        "In rain, fog or at night you should follow...",
        "雨、霧、夜間は車間距離を...",
        "Con lluvia, niebla o de noche debes seguir a...",
        "В дождь, туман и ночью дистанцию нужно...",
      ],
      [
        "farther back than usual",
        "いつもより長くとる",
        "más lejos de lo normal",
        "увеличить",
      ],
      [
        ["closer", "短くする", "más cerca", "сократить"],
        ["the same", "変えない", "igual", "оставить прежней"],
        ["bumper to bumper", "密着する", "pegado", "вплотную"],
      ],
    ),
    q(
      "s4-q3",
      [
        "How often should you check your mirrors?",
        "ミラーはどのくらいの頻度で確認しますか?",
        "¿Cada cuánto debes revisar los espejos?",
        "Как часто проверять зеркала?",
      ],
      "5-8 s",
      ["1 min", "10 min", "30 min"],
    ),
    q(
      "s4-q4",
      [
        "How far ahead should you look while driving?",
        "運転中どのくらい先を見ますか?",
        "¿Qué tan lejos debes mirar al conducir?",
        "Как далеко вперёд нужно смотреть?",
      ],
      [
        "About 12 seconds ahead",
        "約12秒先",
        "Unos 12 segundos adelante",
        "Примерно на 12 секунд вперёд",
      ],
      [
        ["Only the hood", "ボンネットだけ", "Solo el cofre", "Только капот"],
        ["Only your phone", "スマホだけ", "Solo el teléfono", "Только телефон"],
        ["1 second ahead", "1秒先", "1 segundo adelante", "На 1 секунду"],
      ],
    ),
    q(
      "s4-q5",
      [
        "A ball rolls into the road. What may follow it?",
        "ボールが道路に転がりました。次に来るかもしれないのは?",
        "Una pelota rueda a la calle. ¿Qué puede seguirla?",
        "Мяч выкатился на дорогу. Кто может выбежать следом?",
      ],
      ["A child", "子ども", "Un niño", "Ребёнок"],
      [
        ["Nothing", "何もない", "Nada", "Никто"],
        ["A parade", "パレード", "Un desfile", "Парад"],
        ["A plane", "飛行機", "Un avión", "Самолёт"],
      ],
    ),
    q(
      "s4-q6",
      [
        "An aggressive driver tailgates you. You should...",
        "攻撃的な運転者が車間を詰めてきます。あなたは...",
        "Un conductor agresivo te pisa los talones. Debes...",
        "Агрессивный водитель сидит у вас на хвосте. Вы должны...",
      ],
      [
        "stay calm and give them room",
        "落ち着いて道を譲る",
        "mantener la calma y darle espacio",
        "сохранять спокойствие и уступить",
      ],
      [
        [
          "brake suddenly",
          "急ブレーキをかける",
          "frenar de golpe",
          "резко затормозить",
        ],
        ["race them", "競争する", "competir con él", "соревноваться"],
        [
          "make gestures",
          "ジェスチャーをする",
          "hacer gestos",
          "жестикулировать",
        ],
      ],
    ),
    q(
      "s4-q7",
      [
        "If you feel unsafe because of another driver, you may...",
        "他の運転者のせいで危険を感じたら...",
        "Si te sientes en peligro por otro conductor, puedes...",
        "Если вам опасно из-за другого водителя, можно...",
      ],
      [
        "drive to a public place and call 911",
        "人の多い場所へ行き911に通報",
        "ir a un lugar público y llamar al 911",
        "поехать в людное место и позвонить 911",
      ],
      [
        [
          "drive home alone",
          "そのまま一人で帰宅",
          "ir a casa solo",
          "ехать домой",
        ],
        [
          "stop on the freeway",
          "高速道路で停車",
          "detenerte en la autopista",
          "остановиться на шоссе",
        ],
        ["follow them", "追いかける", "seguirlo", "ехать за ним"],
      ],
    ),
    q(
      "s4-q8",
      [
        "Is it safe to speed up toward a hazard?",
        "危険に向かって加速しても安全ですか?",
        "¿Es seguro acelerar hacia un peligro?",
        "Безопасно ли ускоряться навстречу опасности?",
      ],
      NO,
      [
        YES,
        [
          "Yes, with a horn",
          "クラクションを鳴らせば安全",
          "Sí, con bocina",
          "Да, с гудком",
        ],
        ["Yes, in daytime", "昼なら安全", "Sí, de día", "Да, днём"],
      ],
    ),
    q(
      "s4-q9",
      [
        "Why keep space around your car?",
        "なぜ車の周りに余裕を保つのですか?",
        "¿Por qué mantener espacio alrededor del auto?",
        "Зачем держать свободное место вокруг машины?",
      ],
      [
        "So you have somewhere to go in an emergency",
        "緊急時に逃げ場を確保するため",
        "Para tener adónde ir en una emergencia",
        "Чтобы было куда деться в экстренной ситуации",
      ],
      [
        [
          "To look cool",
          "格好よく見せるため",
          "Para verte bien",
          "Для красоты",
        ],
        [
          "To block others",
          "他の車を妨げるため",
          "Para bloquear a otros",
          "Чтобы мешать другим",
        ],
        ["No reason", "理由はない", "Sin razón", "Нет причин"],
      ],
    ),
    q(
      "s4-q10",
      [
        "What does defensive driving mean?",
        "防衛運転とは?",
        "¿Qué significa manejar a la defensiva?",
        "Что такое защитное вождение?",
      ],
      [
        "Anticipating hazards and mistakes of others",
        "危険や他者のミスを予測して運転すること",
        "Anticipar peligros y errores de otros",
        "Предвидеть опасности и ошибки других",
      ],
      [
        [
          "Driving as fast as possible",
          "できるだけ速く走ること",
          "Manejar lo más rápido posible",
          "Ехать как можно быстрее",
        ],
        [
          "Ignoring signs",
          "標識を無視すること",
          "Ignorar señales",
          "Игнорировать знаки",
        ],
        [
          "Driving only at night",
          "夜だけ運転すること",
          "Manejar solo de noche",
          "Ездить только ночью",
        ],
      ],
    ),
  ],
};
