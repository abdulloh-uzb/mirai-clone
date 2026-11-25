import {
  callout,
  dragToOrder,
  flipCard,
  lesson,
  q,
  richText,
  scenario,
  video,
  YES,
  NO,
  type SectionContent,
} from "./helpers";

// Section 6: Alcohol, Drugs and Fatigue.
export const section6: SectionContent = {
  lessons: [
    lesson(
      [
        "Alcohol and driving",
        "飲酒運転",
        "Alcohol y conducción",
        "Алкоголь и вождение",
      ],
      richText([
        "In California it is illegal to drive with a blood alcohol concentration (BAC) of 0.08% or more. For drivers under 21 the limit is 0.01%. Even below the limit, alcohol slows reaction time and blurs judgment.",
        "カリフォルニア州では血中アルコール濃度(BAC)0.08%以上での運転は違法です。21歳未満は0.01%です。制限値以下でも、アルコールは反応を遅らせ判断を鈍らせます。",
        "En California es ilegal manejar con una concentración de alcohol en sangre (BAC) de 0.08% o más. Para menores de 21 años el límite es 0.01%. Incluso por debajo, el alcohol retrasa los reflejos y nubla el juicio.",
        "В Калифорнии запрещено ездить с концентрацией алкоголя в крови (BAC) 0,08% и выше. Для водителей до 21 года предел — 0,01%. Даже ниже предела алкоголь замедляет реакцию и ухудшает суждение.",
      ]),
      flipCard(
        [
          "Adult BAC limit",
          "成人のBAC上限",
          "Límite de BAC para adultos",
          "Предел BAC для взрослых",
        ],
        [
          "0.08% (0.01% under 21).",
          "0.08%(21歳未満は0.01%)。",
          "0.08% (0.01% bajo 21).",
          "0,08% (0,01% до 21 года).",
        ],
      ),
      callout(
        "warning",
        ["Myths", "よくある誤解", "Mitos", "Мифы"],
        [
          "Coffee, cold showers and fresh air do not sober you up. Only time does.",
          "コーヒー、冷たいシャワー、外の空気では酔いは醒めません。時間だけが解決します。",
          "El café, la ducha fría y el aire fresco no te quitan la borrachera. Solo el tiempo.",
          "Кофе, холодный душ и свежий воздух не отрезвляют. Помогает только время.",
        ],
      ),
    ),
    lesson(
      [
        "Drugs and medication",
        "薬物と医薬品",
        "Drogas y medicamentos",
        "Наркотики и лекарства",
      ],
      video(
        "medication",
        [
          "Medicine and driving",
          "薬と運転",
          "Medicinas y conducción",
          "Лекарства и вождение",
        ],
        [
          "Many prescription and over-the-counter medicines cause drowsiness. Read the label. It is illegal to drive impaired by any drug, including legal ones. Never drive after using cannabis. Keep any open container of alcohol or cannabis out of the passenger area.",
          "多くの処方薬や市販薬は眠気を引き起こします。ラベルを読みましょう。合法の薬を含め、薬物の影響下での運転は違法です。大麻使用後は運転しないでください。開封済みのアルコールや大麻は車内の乗員スペースに置かないでください。",
          "Muchos medicamentos con receta y de venta libre causan somnolencia. Lee la etiqueta. Es ilegal manejar bajo el efecto de cualquier droga, incluso legal. Nunca manejes tras consumir cannabis. Mantén fuera del habitáculo cualquier envase abierto de alcohol o cannabis.",
          "Многие рецептурные и безрецептурные лекарства вызывают сонливость. Читайте этикетку. Ездить под действием любых веществ, даже разрешённых, нельзя. Не садитесь за руль после каннабиса. Открытые ёмкости с алкоголем или каннабисом не держите в салоне.",
        ],
      ),
      scenario(
        [
          "Your allergy pill label says it may cause drowsiness. You must drive in an hour. What should you do?",
          "アレルギー薬のラベルに眠気の恐れがあると書かれています。1時間後に運転が必要です。どうしますか?",
          "La etiqueta de tu antialérgico dice que puede causar somnolencia. Debes manejar en una hora. ¿Qué haces?",
          "На этикетке антигистаминного указана сонливость. Через час вам ехать. Что делать?",
        ],
        [
          [
            [
              "Do not take it or find another ride",
              "服用しない、または別の移動手段を探す",
              "No lo tomo o busco otro transporte",
              "Не принимаю или нахожу другой транспорт",
            ],
            [
              "Right: safe choice.",
              "正解: 安全な選択です。",
              "Bien: opción segura.",
              "Верно: безопасный выбор.",
            ],
          ],
          [
            [
              "Take it and drive carefully",
              "服用して慎重に運転",
              "Lo tomo y manejo con cuidado",
              "Принимаю и еду осторожно",
            ],
            [
              "Careful driving does not cancel drowsiness.",
              "慎重に運転しても眠気は消えません。",
              "Manejar con cuidado no quita la somnolencia.",
              "Осторожность не уберёт сонливость.",
            ],
          ],
          [
            [
              "Drink coffee after",
              "その後コーヒーを飲む",
              "Tomo café después",
              "Пью кофе после",
            ],
            [
              "Coffee does not fully offset it.",
              "コーヒーでは完全に打ち消せません。",
              "El café no lo compensa del todo.",
              "Кофе не компенсирует полностью.",
            ],
          ],
        ],
      ),
      dragToOrder(
        [
          "Order the steps before driving after taking medication.",
          "服薬後に運転する前の手順を並べてください。",
          "Ordena los pasos antes de manejar tras tomar un medicamento.",
          "Расставьте шаги перед поездкой после приёма лекарства.",
        ],
        [
          [
            "Read the label",
            "ラベルを読む",
            "Leer la etiqueta",
            "Прочитать этикетку",
          ],
          [
            "Check for drowsiness warnings",
            "眠気の警告を確認",
            "Buscar advertencias de somnolencia",
            "Найти предупреждения о сонливости",
          ],
          [
            "Ask a pharmacist if unsure",
            "不明なら薬剤師に相談",
            "Preguntar al farmacéutico si hay dudas",
            "Спросить фармацевта при сомнении",
          ],
          [
            "Decide whether to drive",
            "運転するか判断",
            "Decidir si manejas",
            "Решить, садиться ли за руль",
          ],
        ],
      ),
    ),
    lesson(
      ["Drowsy driving", "居眠り運転", "Manejar con sueño", "Сонное вождение"],
      richText([
        "Fatigue slows reactions like alcohol does. Warning signs: yawning, heavy eyelids, drifting from your lane. The only cure is sleep. If you feel drowsy, pull over in a safe place and rest.",
        "疲労はアルコールと同様に反応を遅らせます。あくび、まぶたが重い、車線からふらつくなどが兆候です。解決策は睡眠だけです。眠気を感じたら安全な場所に停車して休みます。",
        "La fatiga retrasa los reflejos como el alcohol. Señales: bostezos, párpados pesados, salirte del carril. La única cura es dormir. Si tienes sueño, detente en un lugar seguro y descansa.",
        "Усталость замедляет реакцию, как алкоголь. Признаки: зевота, тяжёлые веки, снос с полосы. Лечится только сном. Если клонит в сон, остановитесь в безопасном месте и отдохните.",
      ]),
      flipCard(
        [
          "Best cure for drowsiness",
          "眠気の最良の対処",
          "Mejor cura para la somnolencia",
          "Лучшее средство от сонливости",
        ],
        [
          "Sleep. Pull over safely and rest.",
          "睡眠。安全に停車して休む。",
          "Dormir. Detente con seguridad y descansa.",
          "Сон. Безопасно остановитесь и отдохните.",
        ],
      ),
      callout(
        "tip",
        [
          "Plan long trips",
          "長距離は計画的に",
          "Planea los viajes largos",
          "Планируйте дальние поездки",
        ],
        [
          "Stop every two hours, sleep well before you leave and share driving when you can.",
          "2時間ごとに休憩し、出発前によく眠り、可能なら運転を交代します。",
          "Haz paradas cada dos horas, duerme bien antes y turna el manejo.",
          "Останавливайтесь каждые два часа, хорошо выспитесь и меняйтесь за рулём.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s6-q1",
      [
        "The legal BAC limit for adult drivers is...",
        "成人運転者の法的BAC上限は...",
        "El límite legal de BAC para adultos es...",
        "Допустимый BAC для взрослых водителей —",
      ],
      "0.08%",
      ["0.00%", "0.15%", "0.20%"],
    ),
    q(
      "s6-q2",
      [
        "The BAC limit for drivers under 21 is...",
        "21歳未満のBAC上限は...",
        "El límite de BAC para menores de 21 es...",
        "Предел BAC для водителей до 21 года —",
      ],
      "0.01%",
      ["0.08%", "0.10%", "0.05%"],
    ),
    q(
      "s6-q3",
      [
        "What sobers you up?",
        "酔いを醒ますものは?",
        "¿Qué te quita la borrachera?",
        "Что отрезвляет?",
      ],
      ["Time", "時間", "Tiempo", "Время"],
      [
        ["Coffee", "コーヒー", "Café", "Кофе"],
        ["A cold shower", "冷たいシャワー", "Ducha fría", "Холодный душ"],
        ["Fresh air", "外の空気", "Aire fresco", "Свежий воздух"],
      ],
    ),
    q(
      "s6-q4",
      [
        "Is it legal to drive impaired by a legal prescription drug?",
        "合法の処方薬の影響下で運転するのは合法ですか?",
        "¿Es legal manejar bajo el efecto de un medicamento legal?",
        "Законно ли ехать под действием легального лекарства?",
      ],
      NO,
      [
        YES,
        ["Yes, in the daytime", "昼なら合法", "Sí, de día", "Да, днём"],
        [
          "Yes, if under the limit",
          "基準以下なら合法",
          "Sí, bajo el límite",
          "Да, если ниже предела",
        ],
      ],
    ),
    q(
      "s6-q5",
      [
        "Before driving after taking medicine, you should...",
        "服薬後に運転する前に...",
        "Antes de manejar tras tomar medicina debes...",
        "Перед поездкой после лекарства нужно...",
      ],
      [
        "read the label for drowsiness warnings",
        "眠気の警告をラベルで確認する",
        "leer la etiqueta por advertencias de sueño",
        "прочитать этикетку на предмет сонливости",
      ],
      [
        [
          "ignore the label",
          "ラベルを無視する",
          "ignorar la etiqueta",
          "игнорировать этикетку",
        ],
        ["drink alcohol", "酒を飲む", "tomar alcohol", "выпить алкоголь"],
        ["drive faster", "速く走る", "manejar más rápido", "ехать быстрее"],
      ],
    ),
    q(
      "s6-q6",
      [
        "Which is a sign of drowsy driving?",
        "居眠り運転の兆候は?",
        "¿Cuál es una señal de sueño al volante?",
        "Что является признаком сонливости за рулём?",
      ],
      [
        "Drifting from your lane",
        "車線からふらつく",
        "Salirte del carril",
        "Снос с полосы",
      ],
      [
        ["Singing along", "一緒に歌う", "Cantar", "Подпевать"],
        [
          "Checking mirrors",
          "ミラー確認",
          "Revisar espejos",
          "Смотреть в зеркала",
        ],
        ["Using signals", "合図を出す", "Usar señales", "Включать сигналы"],
      ],
    ),
    q(
      "s6-q7",
      [
        "The only real cure for fatigue is...",
        "疲労への唯一の対処は...",
        "La única cura real para la fatiga es...",
        "Единственное средство от усталости —",
      ],
      ["sleep", "睡眠", "dormir", "сон"],
      [
        ["loud music", "大音量の音楽", "música fuerte", "громкая музыка"],
        [
          "energy drinks",
          "エナジードリンク",
          "bebidas energéticas",
          "энергетики",
        ],
        ["open windows", "窓を開ける", "abrir ventanas", "открытые окна"],
      ],
    ),
    q(
      "s6-q8",
      [
        "How often should you stop on a long trip?",
        "長距離ではどのくらいの間隔で休憩しますか?",
        "¿Cada cuánto debes parar en un viaje largo?",
        "Как часто останавливаться в дальней поездке?",
      ],
      "2 h",
      ["8 h", "12 h", ["Never", "なし", "Nunca", "Никогда"]],
    ),
    q(
      "s6-q9",
      [
        "Where must open alcohol containers be kept?",
        "開封済みのアルコール容器はどこに置くべきですか?",
        "¿Dónde deben ir los envases abiertos de alcohol?",
        "Где должны находиться открытые ёмкости с алкоголем?",
      ],
      [
        "Out of the passenger area",
        "乗員スペースの外",
        "Fuera del habitáculo",
        "Вне салона",
      ],
      [
        [
          "In the cup holder",
          "ドリンクホルダー",
          "En el portavasos",
          "В подстаканнике",
        ],
        ["Under the seat", "シートの下", "Bajo el asiento", "Под сиденьем"],
        ["Anywhere", "どこでも", "Cualquier lugar", "Где угодно"],
      ],
    ),
    q(
      "s6-q10",
      [
        "Alcohol below the limit...",
        "制限値以下のアルコールでも...",
        "El alcohol por debajo del límite...",
        "Алкоголь ниже предела...",
      ],
      [
        "still slows reactions",
        "反応を遅らせる",
        "aun así retrasa los reflejos",
        "всё равно замедляет реакцию",
      ],
      [
        ["has no effect", "影響はない", "no tiene efecto", "не влияет"],
        [
          "improves driving",
          "運転を上達させる",
          "mejora el manejo",
          "улучшает вождение",
        ],
        ["is required", "必須である", "es obligatorio", "обязателен"],
      ],
    ),
  ],
};
