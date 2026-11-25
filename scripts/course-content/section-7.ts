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

// Section 7: Distraction and Sharing the Road.
export const section7: SectionContent = {
  lessons: [
    lesson(
      [
        "Distracted driving",
        "ながら運転",
        "Conducción distraída",
        "Отвлечение за рулём",
      ],
      richText([
        "California's hands-free law: you may not hold a phone or other device while driving. Use a mount and voice commands, and touch the screen only once with a single tap or swipe. Texting takes your eyes off the road for about five seconds, the length of a football field at highway speed.",
        "カリフォルニア州のハンズフリー法: 運転中にスマートフォンなどを手に持ってはいけません。ホルダーと音声操作を使い、画面操作は1回のタップかスワイプだけにします。メールを打つと約5秒間目を離すことになり、高速では約100m進みます。",
        "La ley de manos libres de California: no puedes sostener un teléfono u otro dispositivo al manejar. Usa un soporte y comandos de voz, y toca la pantalla solo una vez. Escribir un mensaje te quita la vista del camino unos cinco segundos, la longitud de una cancha de fútbol a velocidad de autopista.",
        "Закон Калифорнии о hands-free: нельзя держать телефон или другое устройство в руках за рулём. Используйте держатель и голосовые команды, касайтесь экрана один раз. Сообщение отвлекает на пять секунд — это длина футбольного поля на скорости шоссе.",
      ]),
      callout(
        "warning",
        [
          "Not only phones",
          "スマホだけではない",
          "No solo teléfonos",
          "Не только телефоны",
        ],
        [
          "Eating, grooming and reaching for objects also take your attention. Finish before you drive.",
          "食事、身だしなみ、物を取ることも注意をそらします。運転前に済ませましょう。",
          "Comer, arreglarte o buscar objetos también distrae. Termina antes de manejar.",
          "Еда, макияж и поиск вещей тоже отвлекают. Закончите до начала поездки.",
        ],
      ),
      scenario(
        [
          "A message pops up on your phone while you drive. What do you do?",
          "運転中にスマホにメッセージが届きました。どうしますか?",
          "Te llega un mensaje mientras manejas. ¿Qué haces?",
          "Во время езды пришло сообщение. Что делаете?",
        ],
        [
          [
            [
              "Leave it until I park",
              "駐車するまで放置",
              "Lo dejo hasta estacionar",
              "Оставляю до остановки",
            ],
            [
              "Right: it can wait.",
              "正解: 後で大丈夫です。",
              "Bien: puede esperar.",
              "Верно: подождёт.",
            ],
          ],
          [
            [
              "Read it at a red light",
              "赤信号で読む",
              "Lo leo en un semáforo",
              "Читаю на красном",
            ],
            [
              "Still illegal while holding the phone.",
              "手に持てば違法です。",
              "Sigue siendo ilegal si sostienes el teléfono.",
              "Всё равно нельзя держать телефон.",
            ],
          ],
          [
            [
              "Reply quickly with one hand",
              "片手でさっと返信",
              "Respondo rápido con una mano",
              "Быстро отвечаю одной рукой",
            ],
            [
              "Illegal and dangerous.",
              "違法で危険です。",
              "Ilegal y peligroso.",
              "Незаконно и опасно.",
            ],
          ],
        ],
      ),
    ),
    lesson(
      [
        "Pedestrians and bicyclists",
        "歩行者と自転車",
        "Peatones y ciclistas",
        "Пешеходы и велосипедисты",
      ],
      richText([
        "Give bicyclists at least 3 feet when passing. Bicyclists may use the full lane when it is too narrow to share. Before turning right, check for cyclists in the bike lane and merge into it only as the law allows. Watch for people in wheelchairs and for blind pedestrians with a white cane.",
        "自転車を追い越すときは少なくとも3フィート(約90cm)空けます。車線が狭くて並走できない場合、自転車は車線全体を使えます。右折前に自転車レーンの自転車を確認します。車いすの人や白杖の視覚障害者にも注意します。",
        "Da al menos 3 pies a los ciclistas al rebasar. Pueden usar todo el carril si es muy angosto para compartirlo. Antes de girar a la derecha revisa ciclistas en el carril bici. Atento a personas en silla de ruedas y a peatones ciegos con bastón blanco.",
        "Обгоняя велосипедиста, оставляйте не менее 3 футов. Если полоса слишком узка, он может занять её целиком. Перед правым поворотом проверьте велосипедистов на велодорожке. Следите за людьми в инвалидных колясках и незрячими с белой тростью.",
      ]),
      flipCard(
        [
          "Passing a bicyclist",
          "自転車の追い越し",
          "Rebasar a un ciclista",
          "Обгон велосипедиста",
        ],
        [
          "Leave at least 3 feet.",
          "3フィート以上空ける。",
          "Deja al menos 3 pies.",
          "Оставьте не менее 3 футов.",
        ],
      ),
      dragToOrder(
        [
          "Order the steps to pass a bicyclist safely.",
          "自転車を安全に追い越す手順を並べてください。",
          "Ordena los pasos para rebasar a un ciclista con seguridad.",
          "Расставьте шаги безопасного обгона велосипедиста.",
        ],
        [
          [
            "Slow down and check traffic behind",
            "減速して後方を確認",
            "Reducir y revisar el tráfico atrás",
            "Снизить скорость, проверить сзади",
          ],
          [
            "Signal and check oncoming lane",
            "合図し対向車線を確認",
            "Señalar y revisar el carril contrario",
            "Включить сигнал, оценить встречную",
          ],
          [
            "Pass leaving 3 feet",
            "3フィート空けて追い越す",
            "Rebasar dejando 3 pies",
            "Обогнать, оставив 3 фута",
          ],
          [
            "Return to the lane when clear",
            "安全になったら車線に戻る",
            "Volver al carril cuando sea seguro",
            "Вернуться на полосу, когда безопасно",
          ],
        ],
      ),
    ),
    lesson(
      [
        "Motorcycles, trucks and railroad crossings",
        "バイク・トラック・踏切",
        "Motos, camiones y cruces de ferrocarril",
        "Мотоциклы, грузовики и ж/д переезды",
      ],
      richText([
        "Motorcycles are small and hard to see: check twice before turning or changing lanes and give them a full lane. Large trucks have big blind spots: if you cannot see the driver's mirror, the driver cannot see you. At a railroad crossing, stop if lights flash and never race a train.",
        "バイクは小さく見落としやすいので、右左折や車線変更の前に二度確認し、1車線分の余裕を与えます。大型トラックには大きな死角があり、運転者のミラーが見えなければ向こうからもあなたが見えません。踏切で警報が点滅していたら止まり、電車と競争してはいけません。",
        "Las motos son pequeñas y difíciles de ver: revisa dos veces antes de girar o cambiar de carril y dales un carril completo. Los camiones tienen grandes puntos ciegos: si no ves el espejo del conductor, él no te ve. En un cruce ferroviario, detente si las luces destellan y nunca compitas con un tren.",
        "Мотоциклы малы и плохо заметны: проверяйте дважды перед поворотом или перестроением и уступайте им целую полосу. У грузовиков большие слепые зоны: если вы не видите зеркало водителя, он не видит вас. На переезде остановитесь при мигающих огнях и не соревнуйтесь с поездом.",
      ]),
      callout(
        "tip",
        ["Trucks", "トラック", "Camiones", "Грузовики"],
        [
          "Do not cut in front of a truck: it needs much more distance to stop than a car.",
          "トラックの前に割り込まないでください。停止にはずっと長い距離が必要です。",
          "No te cierres frente a un camión: necesita mucha más distancia para frenar.",
          "Не подрезайте грузовик: ему нужна гораздо большая дистанция для остановки.",
        ],
      ),
      flipCard(
        [
          "Railroad crossing with flashing lights",
          "点滅する踏切",
          "Cruce con luces intermitentes",
          "Переезд с мигающими огнями",
        ],
        [
          "Stop and wait. Never try to beat the train.",
          "停止して待つ。電車より先に渡ろうとしない。",
          "Detente y espera. Nunca intentes ganarle al tren.",
          "Остановитесь и ждите. Не пытайтесь опередить поезд.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s7-q1",
      [
        "Under California law, you may not...",
        "カリフォルニア州法で禁止されているのは...",
        "Según la ley de California, no puedes...",
        "По закону Калифорнии нельзя...",
      ],
      [
        "hold a phone while driving",
        "運転中に電話を手に持つ",
        "sostener un teléfono al manejar",
        "держать телефон за рулём",
      ],
      [
        [
          "use a mounted phone map",
          "固定したスマホの地図を使う",
          "usar un mapa en soporte",
          "смотреть карту на держателе",
        ],
        ["drive at night", "夜に運転する", "manejar de noche", "ездить ночью"],
        [
          "use turn signals",
          "ウインカーを使う",
          "usar intermitentes",
          "включать поворотники",
        ],
      ],
    ),
    q(
      "s7-q2",
      [
        "Is reading a text at a red light allowed while holding the phone?",
        "赤信号で電話を手に持ってメールを読むのは許されますか?",
        "¿Se permite leer un mensaje en un semáforo sosteniendo el teléfono?",
        "Можно ли читать сообщение на красный, держа телефон?",
      ],
      NO,
      [
        YES,
        [
          "Yes, if short",
          "短ければ許される",
          "Sí, si es corto",
          "Да, если коротко",
        ],
        [
          "Yes, on freeways",
          "高速なら許される",
          "Sí, en autopista",
          "Да, на шоссе",
        ],
      ],
    ),
    q(
      "s7-q3",
      [
        "Texting takes your eyes off the road for about...",
        "メール入力で視線が道路から外れる時間は約...",
        "Escribir un mensaje te quita la vista del camino unos...",
        "Набор сообщения отвлекает примерно на...",
      ],
      "5 s",
      ["0.5 s", "30 s", "2 min"],
    ),
    q(
      "s7-q4",
      [
        "Minimum distance when passing a bicyclist",
        "自転車を追い越すときの最低距離",
        "Distancia mínima al rebasar a un ciclista",
        "Минимальная дистанция при обгоне велосипедиста",
      ],
      "3 ft",
      ["1 ft", "6 in", "10 ft"],
    ),
    q(
      "s7-q5",
      [
        "A pedestrian with a white cane is...",
        "白杖を持つ歩行者は...",
        "Un peatón con bastón blanco es...",
        "Пешеход с белой тростью —",
      ],
      [
        "likely blind; give right-of-way",
        "視覚障害者の可能性。道を譲る",
        "probablemente ciego; cede el paso",
        "вероятно незрячий; уступите дорогу",
      ],
      [
        [
          "a hazard to ignore",
          "無視してよい障害物",
          "un obstáculo que ignorar",
          "помеха, которую игнорируют",
        ],
        [
          "a traffic officer",
          "交通整理員",
          "un oficial de tránsito",
          "регулировщик",
        ],
        ["a runner", "ランナー", "un corredor", "бегун"],
      ],
    ),
    q(
      "s7-q6",
      [
        "Why double-check for motorcycles?",
        "なぜバイクを二度確認するのですか?",
        "¿Por qué revisar dos veces por motos?",
        "Почему дважды проверять наличие мотоциклов?",
      ],
      [
        "They are small and hard to see",
        "小さくて見落としやすい",
        "Son pequeñas y difíciles de ver",
        "Они малы и плохо заметны",
      ],
      [
        [
          "They are always slow",
          "常に遅い",
          "Siempre son lentas",
          "Они всегда медленные",
        ],
        [
          "They have no lights",
          "ライトがない",
          "No tienen luces",
          "У них нет света",
        ],
        ["They are illegal", "違法である", "Son ilegales", "Они запрещены"],
      ],
    ),
    q(
      "s7-q7",
      [
        "If you cannot see a truck driver's mirror...",
        "トラック運転者のミラーが見えないとき...",
        "Si no ves el espejo del conductor del camión...",
        "Если вы не видите зеркало водителя грузовика...",
      ],
      [
        "the driver cannot see you",
        "運転者からもあなたが見えない",
        "el conductor no te ve",
        "водитель не видит вас",
      ],
      [
        [
          "the driver sees you well",
          "運転者はよく見えている",
          "el conductor te ve bien",
          "водитель хорошо вас видит",
        ],
        [
          "you may cut in",
          "割り込んでよい",
          "puedes meterte",
          "можно подрезать",
        ],
        [
          "it is safe to tailgate",
          "密着してよい",
          "es seguro pegarte",
          "можно ехать вплотную",
        ],
      ],
    ),
    q(
      "s7-q8",
      [
        "Railroad crossing lights are flashing. You should...",
        "踏切の警報が点滅しています。あなたは...",
        "Las luces del cruce ferroviario destellan. Debes...",
        "На переезде мигают огни. Вы должны...",
      ],
      [
        "stop and wait",
        "停止して待つ",
        "detenerte y esperar",
        "остановиться и ждать",
      ],
      [
        [
          "race the train",
          "電車と競う",
          "competir con el tren",
          "обогнать поезд",
        ],
        [
          "drive around the gate",
          "遮断機を回り込む",
          "rodear la barrera",
          "объехать шлагбаум",
        ],
        [
          "honk and go",
          "クラクションで進む",
          "tocar y avanzar",
          "посигналить и ехать",
        ],
      ],
    ),
    q(
      "s7-q9",
      [
        "Bicyclists may use the full lane when...",
        "自転車が車線全体を使えるのは...",
        "Los ciclistas pueden usar todo el carril cuando...",
        "Велосипедисты могут занимать всю полосу, когда...",
      ],
      [
        "the lane is too narrow to share",
        "並走できないほど狭いとき",
        "el carril es muy angosto para compartir",
        "полоса слишком узкая для совместного проезда",
      ],
      [
        ["never", "決して使えない", "nunca", "никогда"],
        ["only at night", "夜だけ", "solo de noche", "только ночью"],
        [
          "only on freeways",
          "高速だけ",
          "solo en autopistas",
          "только на шоссе",
        ],
      ],
    ),
    q(
      "s7-q10",
      [
        "Eating or grooming while driving is...",
        "運転中の食事や身だしなみは...",
        "Comer o arreglarte al manejar es...",
        "Еда или макияж за рулём —",
      ],
      ["a distraction", "注意散漫の原因", "una distracción", "отвлечение"],
      [
        ["required", "必須", "obligatorio", "обязательно"],
        [
          "a safety feature",
          "安全機能",
          "una función de seguridad",
          "функция безопасности",
        ],
        ["harmless", "無害", "inofensivo", "безвредно"],
      ],
    ),
  ],
};
