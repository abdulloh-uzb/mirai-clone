import { q, YES, NO, type Question } from "./helpers";

// The final exam pool: 60 questions (an attempt draws 25, so a second attempt
// can use different ones). Different wording from the section quizzes.
export const examQuestions: Question[] = [
  q(
    "e01",
    [
      "Seat belts must be worn by...",
      "シートベルトを着用しなければならないのは...",
      "Los cinturones deben usarlos...",
      "Ремни безопасности должны носить...",
    ],
    ["everyone in the car", "車内の全員", "todos en el auto", "все в машине"],
    [
      ["the driver only", "運転者だけ", "solo el conductor", "только водитель"],
      ["adults only", "大人だけ", "solo adultos", "только взрослые"],
      [
        "front seat only",
        "前席だけ",
        "solo el asiento delantero",
        "только передние",
      ],
    ],
  ),
  q(
    "e02",
    [
      "A tire is worn out when tread is below...",
      "タイヤの溝がこれを下回ると摩耗限界です。",
      "Un neumático está gastado si el dibujo es menor a...",
      "Шина изношена, если протектор меньше...",
    ],
    "2/32 in",
    ["5/32 in", "8/32 in", "10/32 in"],
  ),
  q(
    "e03",
    [
      "Which walk-around check is part of a pre-trip routine?",
      "出発前点検に含まれるのは?",
      "¿Qué revisión forma parte de la rutina previa?",
      "Что входит в предрейсовую проверку?",
    ],
    ["Lights and tires", "ライトとタイヤ", "Luces y neumáticos", "Свет и шины"],
    [
      ["Radio stations", "ラジオ局", "Estaciones de radio", "Радиостанции"],
      ["Paint color", "塗装の色", "Color de pintura", "Цвет краски"],
      ["Seat covers", "シートカバー", "Fundas de asiento", "Чехлы"],
    ],
  ),
  q(
    "e04",
    [
      "Rear-facing car seats are for children under...",
      "後ろ向きチャイルドシートの対象は次の年齢未満...",
      "Las sillas de espaldas son para menores de...",
      "Кресла спиной по ходу — для детей до...",
    ],
    "2",
    ["1", "5", "8"],
  ),
  q(
    "e05",
    [
      "On a flashing yellow light you should...",
      "黄色の点滅では...",
      "En una luz amarilla intermitente debes...",
      "На мигающий жёлтый нужно...",
    ],
    [
      "slow down and proceed with care",
      "減速して注意して進む",
      "reducir y avanzar con precaución",
      "сбавить скорость и ехать осторожно",
    ],
    [
      [
        "stop for 10 seconds",
        "10秒停止",
        "detenerte 10 segundos",
        "стоять 10 секунд",
      ],
      ["speed up", "加速", "acelerar", "ускориться"],
      ["turn around", "引き返す", "dar vuelta", "развернуться"],
    ],
  ),
  q(
    "e06",
    [
      "A stop sign without a limit line: stop...",
      "停止線のない一時停止標識では...",
      "Alto sin línea de detención: detente...",
      "Знак «Стоп» без линии: остановитесь...",
    ],
    [
      "before the crosswalk",
      "横断歩道の手前",
      "antes del cruce peatonal",
      "перед пешеходным переходом",
    ],
    [
      ["in the crosswalk", "横断歩道上", "en el cruce", "на переходе"],
      [
        "past the intersection",
        "交差点の先",
        "pasando la intersección",
        "за перекрёстком",
      ],
      ["anywhere", "どこでも", "donde sea", "где угодно"],
    ],
  ),
  q(
    "e07",
    [
      "Who has the right-of-way when you turn left?",
      "左折するとき優先されるのは?",
      "¿Quién tiene el paso cuando giras a la izquierda?",
      "Кто имеет преимущество при левом повороте?",
    ],
    [
      "Oncoming traffic going straight",
      "直進する対向車",
      "El tráfico que viene de frente",
      "Встречный прямо",
    ],
    [
      ["You", "あなた", "Tú", "Вы"],
      ["Parked cars", "駐車車両", "Autos estacionados", "Припаркованные"],
      ["No one", "誰もいない", "Nadie", "Никто"],
    ],
  ),
  q(
    "e08",
    [
      "At a four-way stop, you arrive after another car. You...",
      "四方一時停止で他の車より後に着きました。あなたは...",
      "En un alto de cuatro vías llegas después de otro auto. Tú...",
      "На перекрёстке вы приехали позже другой машины. Вы...",
    ],
    [
      "wait for it to go",
      "先に行かせる",
      "esperas a que pase",
      "ждёте, пока она проедет",
    ],
    [
      ["go first", "先に行く", "pasas primero", "едете первым"],
      ["honk", "クラクションを鳴らす", "tocas la bocina", "сигналите"],
      ["reverse", "バックする", "retrocedes", "едете назад"],
    ],
  ),
  q(
    "e09",
    [
      "In a roundabout you should yield to...",
      "ラウンドアバウトで譲る相手は...",
      "En una glorieta debes ceder el paso a...",
      "На кольце нужно уступить...",
    ],
    [
      "traffic already in the circle",
      "すでに環道内にいる車",
      "el tráfico que ya está en la glorieta",
      "транспорту, уже едущему по кругу",
    ],
    [
      [
        "traffic entering behind you",
        "後から入る車",
        "el tráfico que entra detrás",
        "въезжающим сзади",
      ],
      ["no one", "誰にも譲らない", "nadie", "никому"],
      ["parked cars", "駐車車両", "autos estacionados", "припаркованным"],
    ],
  ),
  q(
    "e10",
    [
      "When must you yield to a pedestrian?",
      "歩行者に道を譲るのはいつですか?",
      "¿Cuándo debes ceder el paso a un peatón?",
      "Когда нужно уступить пешеходу?",
    ],
    [
      "In any crosswalk, marked or not",
      "標示の有無を問わず横断歩道で",
      "En cualquier cruce, marcado o no",
      "На любом переходе, размеченном или нет",
    ],
    [
      [
        "Only at traffic lights",
        "信号のある所だけ",
        "Solo en semáforos",
        "Только на светофорах",
      ],
      [
        "Only if they wave",
        "合図されたときだけ",
        "Solo si te hacen señas",
        "Только если махнут",
      ],
      ["Never", "決して譲らない", "Nunca", "Никогда"],
    ],
  ),
  q(
    "e11",
    [
      "Approaching a stopped tow truck with flashing lights, you should...",
      "点滅灯のレッカー車に近づいたら...",
      "Al acercarte a una grúa detenida con luces debes...",
      "Приближаясь к стоящему эвакуатору с мигалкой, следует...",
    ],
    [
      "change lanes or slow down",
      "車線変更または減速",
      "cambiar de carril o reducir",
      "сменить полосу или сбавить скорость",
    ],
    [
      ["speed up", "加速", "acelerar", "ускориться"],
      ["honk", "クラクション", "tocar la bocina", "сигналить"],
      ["ignore it", "無視", "ignorarla", "игнорировать"],
    ],
  ),
  q(
    "e12",
    [
      "When should you stop for an emergency vehicle?",
      "緊急車両に対していつ停止しますか?",
      "¿Cuándo debes detenerte por un vehículo de emergencia?",
      "Когда нужно остановиться для спецтранспорта?",
    ],
    [
      "When it has siren or lights on",
      "サイレンや赤色灯を点けているとき",
      "Cuando tiene sirena o luces",
      "Когда включены сирена или мигалка",
    ],
    [
      ["Never", "決して", "Nunca", "Никогда"],
      ["Only on freeways", "高速だけ", "Solo en autopistas", "Только на шоссе"],
      ["Only at night", "夜だけ", "Solo de noche", "Только ночью"],
    ],
  ),
  q(
    "e13",
    [
      "Where is it illegal to stop for an emergency vehicle?",
      "緊急車両のために止まってはいけない場所は?",
      "¿Dónde es ilegal detenerte por un vehículo de emergencia?",
      "Где нельзя останавливаться для спецтранспорта?",
    ],
    [
      "Inside an intersection",
      "交差点の中",
      "Dentro de una intersección",
      "На перекрёстке",
    ],
    [
      ["On the right edge", "右端", "En el borde derecho", "У правого края"],
      ["Near a curb", "縁石の近く", "Junto a la acera", "У бордюра"],
      ["In a parking lot", "駐車場", "En un estacionamiento", "На парковке"],
    ],
  ),
  q(
    "e14",
    [
      "Signal how far ahead of a lane change?",
      "車線変更の何フィート前から合図しますか?",
      "¿Con cuánta anticipación señalas un cambio de carril?",
      "За сколько до перестроения включать сигнал?",
    ],
    "100 ft",
    ["5 ft", "20 ft", "1000 ft"],
  ),
  q(
    "e15",
    [
      "The correct order for a lane change is...",
      "車線変更の正しい順序は...",
      "El orden correcto para cambiar de carril es...",
      "Правильный порядок перестроения —",
    ],
    [
      "mirror, signal, blind spot, go",
      "ミラー、合図、死角確認、移動",
      "espejo, señal, punto ciego, avanzar",
      "зеркало, сигнал, слепая зона, манёвр",
    ],
    [
      [
        "go, signal, mirror",
        "移動、合図、ミラー",
        "avanzar, señal, espejo",
        "манёвр, сигнал, зеркало",
      ],
      ["honk, go", "クラクション、移動", "bocina, avanzar", "гудок, манёвр"],
      [
        "signal after moving",
        "移動後に合図",
        "señal después de moverte",
        "сигнал после манёвра",
      ],
    ],
  ),
  q(
    "e16",
    [
      "On a freeway on-ramp you should...",
      "高速の入口ランプでは...",
      "En una rampa de incorporación debes...",
      "На въезде на шоссе нужно...",
    ],
    [
      "reach traffic speed before merging",
      "合流前に流れの速度に達する",
      "alcanzar la velocidad del tráfico antes de incorporarte",
      "набрать скорость потока до слияния",
    ],
    [
      [
        "stop and wait",
        "止まって待つ",
        "detenerte y esperar",
        "остановиться и ждать",
      ],
      [
        "merge at 20 mph",
        "時速20マイルで合流",
        "incorporarte a 20 mph",
        "влиться на 20 миль/ч",
      ],
      ["back up", "バックする", "retroceder", "ехать назад"],
    ],
  ),
  q(
    "e17",
    [
      "A hydrant needs a clear zone of at least...",
      "消火栓の周囲に必要な空きは少なくとも...",
      "Un hidrante necesita una zona libre de al menos...",
      "У гидранта нужна свободная зона не менее...",
    ],
    "15 ft",
    ["3 ft", "5 ft", "50 ft"],
  ),
  q(
    "e18",
    [
      "Parking uphill next to a curb, front wheels point...",
      "縁石のある上り坂で駐車するとき、前輪は...",
      "Al estacionar en subida junto a la acera, las ruedas delanteras apuntan...",
      "На подъёме у бордюра передние колёса направлены...",
    ],
    ["away from the curb", "縁石と反対向き", "lejos de la acera", "от бордюра"],
    [
      ["toward the curb", "縁石向き", "hacia la acera", "к бордюру"],
      ["straight ahead", "まっすぐ", "al frente", "прямо"],
      ["either way", "どちらでも", "como sea", "как угодно"],
    ],
  ),
  q(
    "e19",
    [
      "A blind spot is...",
      "死角とは...",
      "Un punto ciego es...",
      "Слепая зона —",
    ],
    [
      "an area mirrors do not show",
      "ミラーに映らない範囲",
      "una zona que los espejos no muestran",
      "область, не видимая в зеркалах",
    ],
    [
      ["a dark road", "暗い道", "una vía oscura", "тёмная дорога"],
      ["a broken light", "切れたライト", "una luz rota", "сломанная фара"],
      ["a speed trap", "速度取締り", "una trampa de velocidad", "радар"],
    ],
  ),
  q(
    "e20",
    [
      "How many seconds of following distance in good conditions?",
      "良好な条件での車間距離は何秒?",
      "¿Cuántos segundos de distancia en buenas condiciones?",
      "Сколько секунд дистанции в хороших условиях?",
    ],
    "3",
    ["0", "1", "10"],
  ),
  q(
    "e21",
    [
      "To measure following distance you...",
      "車間距離を測るには...",
      "Para medir la distancia de seguimiento...",
      "Чтобы измерить дистанцию, нужно...",
    ],
    [
      "count seconds past a fixed object",
      "固定物を通過してから秒数を数える",
      "cuentas segundos tras un objeto fijo",
      "считать секунды у неподвижного ориентира",
    ],
    [
      ["count cars", "車の台数を数える", "cuentas autos", "считать машины"],
      [
        "use the odometer",
        "走行距離計を使う",
        "usas el odómetro",
        "смотреть одометр",
      ],
      ["guess", "推測する", "adivinas", "угадывать"],
    ],
  ),
  q(
    "e22",
    [
      "Looking far ahead gives you...",
      "遠くを見ると得られるのは...",
      "Mirar lejos te da...",
      "Взгляд вдаль даёт...",
    ],
    [
      "more time to react",
      "反応する時間の余裕",
      "más tiempo para reaccionar",
      "больше времени на реакцию",
    ],
    [
      ["less time", "時間が減る", "menos tiempo", "меньше времени"],
      ["no change", "変化なし", "ningún cambio", "ничего"],
      ["more glare", "まぶしさ", "más deslumbramiento", "больше бликов"],
    ],
  ),
  q(
    "e23",
    [
      "A tailgater behind you. Best response?",
      "後ろに車間を詰める車。最善の対応は?",
      "Alguien te pisa los talones. ¿Mejor respuesta?",
      "Сзади сидят на хвосте. Лучший ответ?",
    ],
    [
      "Let them pass and keep calm",
      "先に行かせて落ち着く",
      "Dejarlo pasar y mantener la calma",
      "Пропустить и сохранять спокойствие",
    ],
    [
      ["Slam the brakes", "急ブレーキ", "Frenar de golpe", "Резко затормозить"],
      [
        "Speed up angrily",
        "怒って加速",
        "Acelerar con enojo",
        "Разогнаться со злости",
      ],
      [
        "Stop and argue",
        "停車して口論",
        "Parar y discutir",
        "Остановиться и спорить",
      ],
    ],
  ),
  q(
    "e24",
    [
      "Road rage can turn a mistake into...",
      "ロードレイジは小さなミスを...に変えます。",
      "La furia vial puede convertir un error en...",
      "Дорожная агрессия может превратить ошибку в...",
    ],
    ["a crime", "犯罪", "un delito", "преступление"],
    [
      ["a game", "ゲーム", "un juego", "игру"],
      ["a discount", "割引", "un descuento", "скидку"],
      ["a rule", "ルール", "una regla", "правило"],
    ],
  ),
  q(
    "e25",
    [
      "Basic speed law means...",
      "基本速度の原則とは...",
      "La ley de velocidad básica significa...",
      "Основное правило скорости означает...",
    ],
    [
      "do not drive faster than is safe",
      "安全な速度を超えて走らない",
      "no manejar más rápido de lo seguro",
      "не ехать быстрее, чем безопасно",
    ],
    [
      [
        "always drive the limit",
        "常に制限速度で走る",
        "siempre ir al límite",
        "всегда ехать на пределе",
      ],
      [
        "drive 10 over",
        "10マイル超過で走る",
        "ir 10 sobre el límite",
        "ехать на 10 быстрее",
      ],
      [
        "no limits at night",
        "夜は制限なし",
        "sin límites de noche",
        "ночью нет ограничений",
      ],
    ],
  ),
  q(
    "e26",
    [
      "Speed near a school when kids are crossing",
      "子どもが横断中の学校付近の速度",
      "Velocidad cerca de una escuela con niños cruzando",
      "Скорость у школы, когда дети переходят",
    ],
    "25 mph",
    ["10 mph", "40 mph", "55 mph"],
  ),
  q(
    "e27",
    [
      "Wet roads: you should...",
      "濡れた路面では...",
      "Con caminos mojados debes...",
      "На мокрой дороге нужно...",
    ],
    [
      "slow down and add distance",
      "減速し車間を広げる",
      "reducir y aumentar la distancia",
      "сбавить скорость и увеличить дистанцию",
    ],
    [
      ["drive faster", "速く走る", "ir más rápido", "ехать быстрее"],
      [
        "use cruise control",
        "クルーズコントロールを使う",
        "usar el control crucero",
        "включить круиз",
      ],
      ["tailgate", "密着する", "pegarte", "ехать вплотную"],
    ],
  ),
  q(
    "e28",
    [
      "Headlights are needed when...",
      "ヘッドライトが必要なのは...",
      "Los faros se necesitan cuando...",
      "Фары нужны, когда...",
    ],
    [
      "wipers are on continuously",
      "ワイパーを連続使用するとき",
      "usas limpiaparabrisas continuo",
      "дворники работают постоянно",
    ],
    [
      ["it is sunny", "晴れのとき", "hace sol", "солнечно"],
      ["you are parked", "駐車中", "estás estacionado", "вы припаркованы"],
      ["never", "不要", "nunca", "никогда"],
    ],
  ),
  q(
    "e29",
    [
      "High beams should be dimmed for...",
      "ハイビームを切り替えるのは...",
      "Las luces altas deben bajarse ante...",
      "Дальний свет нужно переключить при...",
    ],
    ["oncoming cars", "対向車", "autos de frente", "встречных машинах"],
    [
      ["empty roads", "空いた道", "caminos vacíos", "пустой дороге"],
      ["fog only", "霧のときだけ", "solo con niebla", "только в тумане"],
      [
        "parked cars only",
        "駐車車両だけ",
        "solo autos estacionados",
        "только у припаркованных",
      ],
    ],
  ),
  q(
    "e30",
    [
      "Fog: best lights are...",
      "霧での最適なライトは...",
      "Con niebla, las mejores luces son...",
      "В тумане лучше всего...",
    ],
    ["low beams", "ロービーム", "luces bajas", "ближний свет"],
    [
      ["high beams", "ハイビーム", "luces altas", "дальний свет"],
      ["none", "なし", "ninguna", "без света"],
      ["parking lights", "車幅灯", "luces de estacionamiento", "габариты"],
    ],
  ),
  q(
    "e31",
    [
      "Legal BAC limit for a driver 21 or older",
      "21歳以上の運転者の法的BAC上限",
      "Límite legal de BAC para conductores de 21 o más",
      "Предел BAC для водителей 21 года и старше",
    ],
    "0.08%",
    ["0.01%", "0.20%", "0.50%"],
  ),
  q(
    "e32",
    [
      "A driver under 21 may drive with a BAC of up to...",
      "21歳未満が運転できるBACの上限は...",
      "Un conductor menor de 21 puede manejar con un BAC de hasta...",
      "Водитель до 21 может ехать с BAC не выше...",
    ],
    "0.01%",
    ["0.08%", "0.05%", "0.10%"],
  ),
  q(
    "e33",
    [
      "Does eating food sober you up?",
      "食事で酔いは醒めますか?",
      "¿Comer te quita la borrachera?",
      "Отрезвляет ли еда?",
    ],
    NO,
    [
      YES,
      [
        "Yes, a big meal",
        "はい、たくさん食べれば",
        "Sí, una comida grande",
        "Да, плотный обед",
      ],
      ["Yes, with water", "はい、水と一緒なら", "Sí, con agua", "Да, с водой"],
    ],
  ),
  q(
    "e34",
    [
      "Alcohol affects driving by...",
      "アルコールが運転に与える影響は...",
      "El alcohol afecta el manejo...",
      "Алкоголь влияет на вождение тем, что...",
    ],
    [
      "slowing reaction and judgment",
      "反応と判断を鈍らせる",
      "retrasando reacción y juicio",
      "замедляет реакцию и суждение",
    ],
    [
      [
        "sharpening focus",
        "集中力を高める",
        "agudizando la atención",
        "обостряет внимание",
      ],
      [
        "improving vision",
        "視力を上げる",
        "mejorando la vista",
        "улучшает зрение",
      ],
      ["no effect", "影響なし", "sin efecto", "не влияет"],
    ],
  ),
  q(
    "e35",
    [
      "Cannabis and driving",
      "大麻と運転",
      "Cannabis y conducción",
      "Каннабис и вождение",
    ],
    [
      "driving impaired is illegal",
      "影響下の運転は違法",
      "manejar bajo su efecto es ilegal",
      "ездить под действием запрещено",
    ],
    [
      [
        "is fine in daytime",
        "昼なら問題ない",
        "está bien de día",
        "днём можно",
      ],
      [
        "is fine if slow",
        "ゆっくりなら問題ない",
        "está bien si vas lento",
        "можно, если медленно",
      ],
      ["is encouraged", "推奨される", "se recomienda", "поощряется"],
    ],
  ),
  q(
    "e36",
    [
      "Over-the-counter medicine labels may warn about...",
      "市販薬のラベルが警告することがあるのは...",
      "Las etiquetas de medicinas sin receta pueden advertir sobre...",
      "Этикетки безрецептурных лекарств могут предупреждать о...",
    ],
    ["drowsiness", "眠気", "somnolencia", "сонливости"],
    [
      ["color", "色", "color", "цвете"],
      ["price", "価格", "precio", "цене"],
      ["fuel use", "燃費", "consumo", "расходе топлива"],
    ],
  ),
  q(
    "e37",
    [
      "Yawning and heavy eyelids mean...",
      "あくびとまぶたの重さは...",
      "Bostezos y párpados pesados significan...",
      "Зевота и тяжёлые веки означают...",
    ],
    [
      "you may be too tired to drive",
      "疲れすぎて運転できないかも",
      "puedes estar muy cansado para manejar",
      "вы можете быть слишком усталым",
    ],
    [
      ["you are alert", "しっかり覚醒している", "estás alerta", "вы бодры"],
      [
        "you can drive faster",
        "速く走れる",
        "puedes ir más rápido",
        "можно ехать быстрее",
      ],
      ["nothing", "何でもない", "nada", "ничего"],
    ],
  ),
  q(
    "e38",
    [
      "If drowsy while driving, you should...",
      "運転中に眠くなったら...",
      "Si tienes sueño al manejar debes...",
      "Если клонит в сон за рулём, нужно...",
    ],
    [
      "pull over safely and rest",
      "安全に停車して休む",
      "detenerte con seguridad y descansar",
      "безопасно остановиться и отдохнуть",
    ],
    [
      [
        "turn up the radio",
        "ラジオの音量を上げる",
        "subir la radio",
        "сделать музыку громче",
      ],
      [
        "open a window and continue",
        "窓を開けて続ける",
        "abrir la ventana y seguir",
        "открыть окно и ехать",
      ],
      ["drive faster", "速く走る", "ir más rápido", "ехать быстрее"],
    ],
  ),
  q(
    "e39",
    [
      "The California hands-free law applies to...",
      "ハンズフリー法の対象は...",
      "La ley de manos libres de California aplica a...",
      "Закон hands-free применяется к...",
    ],
    [
      "phones and other devices",
      "スマホなどの機器",
      "teléfonos y otros dispositivos",
      "телефонам и другим устройствам",
    ],
    [
      ["only phone calls", "通話だけ", "solo llamadas", "только звонкам"],
      ["only texts", "メールだけ", "solo mensajes", "только сообщениям"],
      [
        "only truck drivers",
        "トラック運転者だけ",
        "solo camioneros",
        "только водителям грузовиков",
      ],
    ],
  ),
  q(
    "e40",
    [
      "With a phone mounted, you may...",
      "スマホを固定している場合...",
      "Con el teléfono montado puedes...",
      "С телефоном на держателе можно...",
    ],
    [
      "use one tap or swipe",
      "1回のタップかスワイプ",
      "usar un toque o deslizamiento",
      "один раз коснуться или свайпнуть",
    ],
    [
      [
        "type messages",
        "メッセージを入力する",
        "escribir mensajes",
        "печатать сообщения",
      ],
      [
        "scroll feeds",
        "フィードをスクロール",
        "navegar redes",
        "листать ленту",
      ],
      ["watch video", "動画を見る", "ver video", "смотреть видео"],
    ],
  ),
  q(
    "e41",
    [
      "Reaching for a dropped item while driving is...",
      "運転中に落とした物を拾うのは...",
      "Buscar un objeto caído al manejar es...",
      "Поиск упавшего предмета за рулём —",
    ],
    [
      "dangerous; stop safely first",
      "危険。まず安全に停車",
      "peligroso; detente primero con seguridad",
      "опасно; сначала безопасно остановитесь",
    ],
    [
      ["a good habit", "良い習慣", "un buen hábito", "хорошая привычка"],
      ["required", "必須", "obligatorio", "обязательно"],
      [
        "safe at speed",
        "走行中なら安全",
        "seguro a velocidad",
        "безопасно на скорости",
      ],
    ],
  ),
  q(
    "e42",
    [
      "A cyclist is in the bike lane as you turn right. You should...",
      "右折時に自転車レーンに自転車がいます。あなたは...",
      "Un ciclista va en el carril bici al girar a la derecha. Debes...",
      "Велосипедист на велодорожке при вашем правом повороте. Вы должны...",
    ],
    [
      "yield to the cyclist",
      "自転車に譲る",
      "ceder al ciclista",
      "уступить велосипедисту",
    ],
    [
      ["cut in front", "前に割り込む", "meterte delante", "подрезать"],
      ["honk", "クラクション", "tocar la bocina", "посигналить"],
      ["speed up", "加速", "acelerar", "ускориться"],
    ],
  ),
  q(
    "e43",
    [
      "Passing a bicycle, leave at least...",
      "自転車を追い越すとき、最低...",
      "Al rebasar una bicicleta deja al menos...",
      "Обгоняя велосипед, оставьте не менее...",
    ],
    "3 ft",
    ["6 in", "1 ft", "10 ft"],
  ),
  q(
    "e44",
    [
      "A large truck's blind spots are...",
      "大型トラックの死角は...",
      "Los puntos ciegos de un camión grande son...",
      "Слепые зоны большого грузовика...",
    ],
    [
      "large; stay out of them",
      "大きい。入らないこと",
      "grandes; evita estar ahí",
      "большие; не находитесь в них",
    ],
    [
      ["small", "小さい", "pequeños", "небольшие"],
      ["nonexistent", "存在しない", "inexistentes", "отсутствуют"],
      ["only at night", "夜だけ", "solo de noche", "только ночью"],
    ],
  ),
  q(
    "e45",
    [
      "Railroad lights flash. A train is not in sight. You...",
      "踏切の警報が点滅。電車は見えません。あなたは...",
      "Las luces ferroviarias destellan. No ves el tren. Tú...",
      "Мигают огни переезда. Поезда не видно. Вы...",
    ],
    [
      "still stop and wait",
      "それでも停止して待つ",
      "igual te detienes y esperas",
      "всё равно стоите и ждёте",
    ],
    [
      ["cross quickly", "素早く渡る", "cruzas rápido", "быстро проезжаете"],
      [
        "go around the gate",
        "遮断機を回り込む",
        "rodeas la barrera",
        "объезжаете шлагбаум",
      ],
      [
        "honk and cross",
        "クラクションを鳴らして渡る",
        "tocas y cruzas",
        "сигналите и едете",
      ],
    ],
  ),
  q(
    "e46",
    [
      "Motorcycles are hard to see, so you should...",
      "バイクは見落としやすいので...",
      "Las motos son difíciles de ver, así que debes...",
      "Мотоциклы плохо заметны, поэтому...",
    ],
    [
      "check twice before turning",
      "曲がる前に二度確認する",
      "revisar dos veces antes de girar",
      "проверять дважды перед поворотом",
    ],
    [
      ["ignore them", "無視する", "ignorarlas", "игнорировать"],
      [
        "share their lane",
        "同じ車線を共有する",
        "compartir su carril",
        "ехать в их полосе",
      ],
      ["tailgate them", "密着する", "pegarte", "ехать вплотную"],
    ],
  ),
  q(
    "e47",
    [
      "How many points in 24 months make a negligent operator?",
      "24か月で何点になると不注意運転者ですか?",
      "¿Cuántos puntos en 24 meses hacen a un conductor negligente?",
      "Сколько баллов за 24 месяца делают водителя небрежным?",
    ],
    "6",
    ["2", "3", "20"],
  ),
  q(
    "e48",
    [
      "How many points in 36 months make a negligent operator?",
      "36か月で何点になると不注意運転者ですか?",
      "¿Cuántos puntos en 36 meses hacen a un conductor negligente?",
      "Сколько баллов за 36 месяцев делают водителя небрежным?",
    ],
    "8",
    ["3", "5", "30"],
  ),
  q(
    "e49",
    [
      "Traffic school can help keep a point off your record...",
      "交通学校は点数が記録に残らないよう助けます。",
      "La escuela de tránsito puede evitar un punto en tu registro...",
      "Школа может помочь избежать балла в записи...",
    ],
    [
      "once every 18 months if eligible",
      "対象なら18か月に1回",
      "una vez cada 18 meses si calificas",
      "раз в 18 месяцев, если вы подходите",
    ],
    [
      ["every month", "毎月", "cada mes", "каждый месяц"],
      ["every week", "毎週", "cada semana", "каждую неделю"],
      ["in every case", "常に", "en todos los casos", "во всех случаях"],
    ],
  ),
  q(
    "e50",
    [
      "You are in a crash with an injury. Call...",
      "負傷者のいる事故では...に通報します。",
      "Tienes un choque con heridos. Llama al...",
      "Авария с пострадавшими. Звоните...",
    ],
    "911",
    ["411", "311", "511"],
  ),
  q(
    "e51",
    [
      "Exchange which details after a crash?",
      "事故後に交換する情報は?",
      "¿Qué datos se intercambian tras un choque?",
      "Какие данные обмениваются после аварии?",
    ],
    [
      "Name, address, license and insurance",
      "氏名、住所、免許、保険",
      "Nombre, dirección, licencia y seguro",
      "Имя, адрес, права и страховка",
    ],
    [
      [
        "Only a phone number",
        "電話番号だけ",
        "Solo un teléfono",
        "Только телефон",
      ],
      ["Social media accounts", "SNSアカウント", "Redes sociales", "Соцсети"],
      ["Nothing", "何も交換しない", "Nada", "Ничего"],
    ],
  ),
  q(
    "e52",
    [
      "A crash with injury must be reported to the DMV within...",
      "負傷事故をDMVに報告する期限は...",
      "Un choque con heridos se reporta al DMV en...",
      "Об аварии с травмами сообщают в DMV в течение...",
    ],
    ["10 days", "10日", "10 días", "10 дней"],
    [
      ["24 hours", "24時間", "24 horas", "24 часа"],
      ["60 days", "60日", "60 días", "60 дней"],
      ["6 months", "6か月", "6 meses", "6 месяцев"],
    ],
  ),
  q(
    "e53",
    [
      "Leaving the scene after hitting a parked car is...",
      "駐車車両に当てて立ち去ることは...",
      "Irte tras golpear un auto estacionado es...",
      "Уехать после наезда на припаркованную машину —",
    ],
    [
      "a hit-and-run",
      "ひき逃げ",
      "fuga del lugar del accidente",
      "оставление места ДТП",
    ],
    [
      ["allowed", "許される", "permitido", "разрешено"],
      ["polite", "礼儀正しい", "cortés", "вежливо"],
      ["required", "必須", "obligatorio", "обязательно"],
    ],
  ),
  q(
    "e54",
    [
      "A citation's signature is...",
      "違反切符の署名は...",
      "La firma de una citación es...",
      "Подпись на штрафе —",
    ],
    [
      "a promise to appear",
      "出頭の約束",
      "una promesa de comparecer",
      "обещание явиться",
    ],
    [
      [
        "an admission of guilt",
        "罪の自認",
        "una admisión de culpa",
        "признание вины",
      ],
      ["a payment", "支払い", "un pago", "оплата"],
      ["an appeal", "不服申立て", "una apelación", "апелляция"],
    ],
  ),
  q(
    "e55",
    [
      "Missing the court deadline can cause...",
      "裁判所の期限を逃すと...",
      "Perder el plazo del tribunal puede causar...",
      "Пропуск срока суда может привести к...",
    ],
    [
      "extra fines and a license hold",
      "罰金増加と免許の制限",
      "multas extra y bloqueo de licencia",
      "доп. штрафам и ограничению прав",
    ],
    [
      ["nothing", "何もない", "nada", "ничему"],
      ["a refund", "返金", "un reembolso", "возврату денег"],
      ["a free class", "無料講座", "una clase gratis", "бесплатному курсу"],
    ],
  ),
  q(
    "e56",
    [
      "Which is NOT a distraction?",
      "注意散漫の原因でないものは?",
      "¿Cuál NO es una distracción?",
      "Что НЕ является отвлечением?",
    ],
    [
      "Checking your mirrors",
      "ミラーの確認",
      "Revisar los espejos",
      "Проверка зеркал",
    ],
    [
      ["Texting", "メール入力", "Escribir mensajes", "Набор сообщений"],
      [
        "Eating a burger",
        "ハンバーガーを食べる",
        "Comer una hamburguesa",
        "Еда бургера",
      ],
      ["Putting on makeup", "化粧", "Maquillarte", "Макияж"],
    ],
  ),
  q(
    "e57",
    [
      "Aggressive drivers: do you make eye contact?",
      "攻撃的な運転者と目を合わせますか?",
      "Con conductores agresivos, ¿haces contacto visual?",
      "С агрессивными водителями — смотреть в глаза?",
    ],
    NO,
    [
      YES,
      [
        "Yes, and gesture",
        "はい、ジェスチャーも",
        "Sí, y haces gestos",
        "Да, и жестикулировать",
      ],
      [
        "Yes, then follow",
        "はい、その後追う",
        "Sí, y los sigues",
        "Да, и ехать следом",
      ],
    ],
  ),
  q(
    "e58",
    [
      "After parking on a slope, you set the...",
      "坂で駐車したら、かけるのは...",
      "Tras estacionar en pendiente, pones el...",
      "Припарковавшись на склоне, включают...",
    ],
    ["parking brake", "パーキングブレーキ", "freno de mano", "ручной тормоз"],
    [
      ["radio", "ラジオ", "radio", "радио"],
      ["high beams", "ハイビーム", "luces altas", "дальний свет"],
      ["wipers", "ワイパー", "limpiaparabrisas", "дворники"],
    ],
  ),
  q(
    "e59",
    [
      "Headlights are required from this long after sunset",
      "日没からこの時間後にヘッドライトが必要です。",
      "Los faros son obligatorios desde este tiempo tras el atardecer",
      "Фары обязательны через столько после заката",
    ],
    "30 min",
    ["1 min", "3 h", "6 h"],
  ),
  q(
    "e60",
    [
      "Which best describes driving in California?",
      "カリフォルニアでの運転を最もよく表すのは?",
      "¿Qué describe mejor conducir en California?",
      "Что лучше всего описывает вождение в Калифорнии?",
    ],
    [
      "a privilege with responsibilities",
      "責任を伴う特権",
      "un privilegio con responsabilidades",
      "привилегия с обязанностями",
    ],
    [
      [
        "a right with no limits",
        "制限のない権利",
        "un derecho sin límites",
        "право без ограничений",
      ],
      [
        "optional rules",
        "任意のルール",
        "reglas opcionales",
        "необязательные правила",
      ],
      [
        "only for experts",
        "専門家だけのもの",
        "solo para expertos",
        "только для экспертов",
      ],
    ],
  ),
];
