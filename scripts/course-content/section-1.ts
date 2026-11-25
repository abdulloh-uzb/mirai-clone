import {
  callout,
  dragToOrder,
  flipCard,
  image,
  lesson,
  q,
  richText,
  video,
  YES,
  NO,
  type SectionContent,
} from "./helpers";

// Section 1: Traffic Safety Fundamentals.
export const section1: SectionContent = {
  lessons: [
    lesson(
      [
        "Your responsibility behind the wheel",
        "運転者の責任",
        "Tu responsabilidad al volante",
        "Ваша ответственность за рулём",
      ],
      richText([
        "Driving is a privilege that comes with duties. You must obey traffic laws, stay alert and drive in a way that keeps everyone around you safe.\n\n- Know the rules before you start the car.\n- Adjust to the road, the weather and other people.\n- Your choices decide how a trip ends.",
        "運転は責任を伴う特権です。交通法規を守り、常に注意を払い、周囲の全員の安全を守る運転をしてください。\n\n- 出発前にルールを確認する。\n- 道路、天候、他の人に合わせて運転する。\n- あなたの判断が、移動の結果を決めます。",
        "Conducir es un privilegio con obligaciones. Debes cumplir las leyes de tránsito, estar atento y manejar de forma que todos a tu alrededor estén seguros.\n\n- Conoce las reglas antes de encender el auto.\n- Adáptate a la vía, al clima y a los demás.\n- Tus decisiones determinan cómo termina un viaje.",
        "Вождение — это привилегия, которая налагает обязанности. Соблюдайте правила, будьте внимательны и ведите машину так, чтобы все вокруг были в безопасности.\n\n- Знайте правила до начала поездки.\n- Приспосабливайтесь к дороге, погоде и другим людям.\n- Ваши решения определяют, чем закончится поездка.",
      ]),
      callout(
        "info",
        [
          "Tickets add up",
          "違反は積み重なります",
          "Las infracciones se acumulan",
          "Нарушения накапливаются",
        ],
        [
          "Traffic violations can raise your insurance cost and put points on your driving record.",
          "交通違反は保険料の上昇や運転記録への点数加算につながることがあります。",
          "Las infracciones pueden subir el costo del seguro y sumar puntos a tu historial.",
          "Нарушения могут повысить стоимость страховки и добавить штрафные баллы в вашу историю.",
        ],
      ),
      flipCard(
        [
          "Why do traffic laws exist?",
          "交通法規はなぜあるのですか?",
          "¿Por qué existen las leyes de tránsito?",
          "Зачем нужны правила дорожного движения?",
        ],
        [
          "To make road use predictable so that everyone can travel safely.",
          "道路の使い方を予測可能にし、全員が安全に移動できるようにするためです。",
          "Para que el uso de la vía sea predecible y todos viajen con seguridad.",
          "Чтобы поведение на дороге было предсказуемым и все ехали безопасно.",
        ],
      ),
    ),
    lesson(
      [
        "Check your vehicle first",
        "出発前の車両点検",
        "Revisa tu vehículo primero",
        "Сначала проверьте автомобиль",
      ],
      image(
        "tire-check",
        [
          "A driver checking a tire",
          "タイヤを点検する運転者",
          "Un conductor revisa un neumático",
          "Водитель проверяет шину",
        ],
        [
          "Check tires, lights and mirrors before every trip.",
          "毎回の運転前にタイヤ、ライト、ミラーを確認しましょう。",
          "Revisa neumáticos, luces y espejos antes de cada viaje.",
          "Перед каждой поездкой проверяйте шины, фары и зеркала.",
        ],
      ),
      richText([
        "A quick walk around the car takes one minute.\n\n- Tires: pressure and tread (at least 2/32 inch).\n- Lights: headlights, brake lights and signals.\n- Windows and mirrors are clean and set.",
        "車の周りを一周するのに1分もかかりません。\n\n- タイヤ: 空気圧と溝(2/32インチ以上)。\n- ライト: ヘッドライト、ブレーキランプ、ウインカー。\n- 窓とミラーはきれいで正しい位置に。",
        "Dar una vuelta al auto toma un minuto.\n\n- Neumáticos: presión y dibujo (al menos 2/32 de pulgada).\n- Luces: faros, luces de freno e intermitentes.\n- Ventanas y espejos limpios y ajustados.",
        "Осмотр автомобиля занимает минуту.\n\n- Шины: давление и протектор (не менее 2/32 дюйма).\n- Свет: фары, стоп-сигналы и поворотники.\n- Стёкла и зеркала чистые и настроены.",
      ]),
      dragToOrder(
        [
          "Put the pre-drive steps in a sensible order.",
          "出発前の手順を適切な順に並べてください。",
          "Ordena los pasos previos a conducir.",
          "Расставьте шаги перед поездкой в разумном порядке.",
        ],
        [
          [
            "Walk around and check tires and lights",
            "車の周りを回ってタイヤとライトを確認",
            "Rodear el auto y revisar neumáticos y luces",
            "Обойти машину и проверить шины и свет",
          ],
          [
            "Adjust seat and mirrors",
            "シートとミラーを調整",
            "Ajustar asiento y espejos",
            "Настроить сиденье и зеркала",
          ],
          [
            "Fasten your seat belt",
            "シートベルトを締める",
            "Abrocharse el cinturón",
            "Пристегнуть ремень",
          ],
          [
            "Start the engine and check the dashboard",
            "エンジンをかけて警告灯を確認",
            "Arrancar y revisar el tablero",
            "Завести двигатель и проверить приборы",
          ],
        ],
      ),
    ),
    lesson(
      [
        "Seat belts and child safety",
        "シートベルトと子どもの安全",
        "Cinturones y seguridad infantil",
        "Ремни безопасности и дети",
      ],
      video(
        "seat-belts",
        [
          "Why seat belts matter",
          "シートベルトが大切な理由",
          "Por qué importan los cinturones",
          "Почему важны ремни безопасности",
        ],
        [
          "In a crash, a seat belt keeps you inside the car and spreads the force across the strongest parts of your body. In California every passenger must be buckled up.",
          "衝突時、シートベルトは体を車内に留め、衝撃を体の最も強い部分に分散させます。カリフォルニア州では全員の着用が必要です。",
          "En un choque, el cinturón te mantiene dentro del auto y reparte la fuerza en las partes más fuertes del cuerpo. En California todos los pasajeros deben usarlo.",
          "При аварии ремень удерживает вас в салоне и распределяет нагрузку на самые прочные части тела. В Калифорнии должны быть пристёгнуты все пассажиры.",
        ],
      ),
      callout(
        "warning",
        ["Children", "子ども", "Niños", "Дети"],
        [
          "Children under 2 ride rear-facing, and children under 8 sit in the back seat in a car seat or booster. Never leave a child alone in a parked car.",
          "2歳未満は後ろ向き、8歳未満は後部座席でチャイルドシートまたはブースターを使います。駐車中の車に子どもを残してはいけません。",
          "Los menores de 2 años van de espaldas y los menores de 8 en el asiento trasero con silla o elevador. Nunca dejes a un niño solo en un auto estacionado.",
          "Дети до 2 лет едут спиной по ходу, дети до 8 лет сидят сзади в кресле или бустере. Никогда не оставляйте ребёнка одного в припаркованной машине.",
        ],
      ),
      flipCard(
        [
          "Who must wear a seat belt?",
          "誰がシートベルトを着用しますか?",
          "¿Quién debe usar cinturón?",
          "Кто должен пристёгиваться?",
        ],
        [
          "The driver and every passenger.",
          "運転者と全ての同乗者です。",
          "El conductor y todos los pasajeros.",
          "Водитель и все пассажиры.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s1-q1",
      [
        "Who is responsible for wearing a seat belt in a car?",
        "車でシートベルトを着用する責任があるのは誰ですか?",
        "¿Quién debe usar cinturón de seguridad en un auto?",
        "Кто обязан пристёгиваться в автомобиле?",
      ],
      [
        "The driver and all passengers",
        "運転者と全ての同乗者",
        "El conductor y todos los pasajeros",
        "Водитель и все пассажиры",
      ],
      [
        [
          "Only the driver",
          "運転者だけ",
          "Solo el conductor",
          "Только водитель",
        ],
        [
          "Only front-seat passengers",
          "前席の同乗者だけ",
          "Solo los pasajeros del frente",
          "Только пассажиры спереди",
        ],
        ["Only children", "子どもだけ", "Solo los niños", "Только дети"],
      ],
    ),
    q(
      "s1-q2",
      [
        "What is the minimum legal tire tread depth?",
        "タイヤの溝の法的な最低深さは?",
        "¿Cuál es la profundidad mínima legal del dibujo del neumático?",
        "Какая минимальная допустимая глубина протектора?",
      ],
      "2/32 in",
      ["1/32 in", "4/32 in", "6/32 in"],
    ),
    q(
      "s1-q3",
      [
        "Children under this age must ride in a car seat or booster in the back seat.",
        "この年齢未満の子どもは後部座席でチャイルドシートかブースターを使います。",
        "Los niños menores de esta edad deben ir en silla o elevador en el asiento trasero.",
        "Дети младше этого возраста должны ехать сзади в кресле или бустере.",
      ],
      "8",
      ["4", "10", "12"],
    ),
    q(
      "s1-q4",
      [
        "When should you check your tires, lights and mirrors?",
        "タイヤ、ライト、ミラーはいつ確認しますか?",
        "¿Cuándo debes revisar neumáticos, luces y espejos?",
        "Когда нужно проверять шины, свет и зеркала?",
      ],
      [
        "Before every trip",
        "毎回の運転前",
        "Antes de cada viaje",
        "Перед каждой поездкой",
      ],
      [
        [
          "Only once a year",
          "年に1回だけ",
          "Solo una vez al año",
          "Только раз в год",
        ],
        [
          "Only after a breakdown",
          "故障した後だけ",
          "Solo después de una avería",
          "Только после поломки",
        ],
        [
          "Never; the car does it",
          "しない。車が自動で行う",
          "Nunca; el auto lo hace",
          "Никогда; это делает машина",
        ],
      ],
    ),
    q(
      "s1-q5",
      [
        "Is it safe to leave a child alone in a parked car for a few minutes?",
        "駐車中の車に数分間子どもを残しても安全ですか?",
        "¿Es seguro dejar a un niño solo en un auto estacionado unos minutos?",
        "Безопасно ли оставить ребёнка одного в припаркованной машине на несколько минут?",
      ],
      NO,
      [
        YES,
        [
          "Yes, if the windows are open",
          "窓を開けていれば安全",
          "Sí, si las ventanas están abiertas",
          "Да, если окна открыты",
        ],
        [
          "Yes, in winter only",
          "冬だけは安全",
          "Sí, solo en invierno",
          "Да, только зимой",
        ],
      ],
    ),
    q(
      "s1-q6",
      [
        "Children under 2 should ride...",
        "2歳未満の子どもは...",
        "Los menores de 2 años deben ir...",
        "Дети до 2 лет должны ехать...",
      ],
      [
        "rear-facing in a car seat",
        "後ろ向きのチャイルドシートで",
        "de espaldas en una silla",
        "спиной по ходу в кресле",
      ],
      [
        [
          "on an adult's lap",
          "大人の膝の上で",
          "en el regazo de un adulto",
          "на коленях у взрослого",
        ],
        [
          "in the front seat",
          "前席で",
          "en el asiento delantero",
          "на переднем сиденье",
        ],
        [
          "with only a lap belt",
          "腰ベルトだけで",
          "solo con cinturón de regazo",
          "только с поясным ремнём",
        ],
      ],
    ),
    q(
      "s1-q7",
      [
        "What does a seat belt do in a crash?",
        "衝突時にシートベルトは何をしますか?",
        "¿Qué hace el cinturón en un choque?",
        "Что делает ремень при аварии?",
      ],
      [
        "Keeps you in the car and spreads the force",
        "体を車内に留め衝撃を分散する",
        "Te mantiene en el auto y reparte la fuerza",
        "Удерживает в салоне и распределяет нагрузку",
      ],
      [
        ["Nothing useful", "役に立たない", "Nada útil", "Ничего полезного"],
        [
          "Only protects the car seat",
          "シートを守るだけ",
          "Solo protege el asiento",
          "Защищает только сиденье",
        ],
        [
          "Makes you drive slower",
          "運転が遅くなる",
          "Te hace manejar más lento",
          "Заставляет ехать медленнее",
        ],
      ],
    ),
    q(
      "s1-q8",
      [
        "Which check belongs first before a trip?",
        "出発前に最初に行う点検はどれですか?",
        "¿Qué revisión va primero antes de un viaje?",
        "Какая проверка идёт первой перед поездкой?",
      ],
      [
        "Walk around the car",
        "車の周りを一周する",
        "Rodear el auto",
        "Обойти автомобиль",
      ],
      [
        [
          "Turn on the radio",
          "ラジオをつける",
          "Encender la radio",
          "Включить радио",
        ],
        [
          "Check your phone",
          "スマホを見る",
          "Mirar el teléfono",
          "Посмотреть телефон",
        ],
        [
          "Drive off and see",
          "走り出して確かめる",
          "Salir y ver qué pasa",
          "Поехать и посмотреть",
        ],
      ],
    ),
    q(
      "s1-q9",
      [
        "Traffic violations can lead to...",
        "交通違反は次のことにつながることがあります。",
        "Las infracciones pueden causar...",
        "Нарушения могут привести к...",
      ],
      [
        "higher insurance costs and points on your record",
        "保険料の上昇と記録への加点",
        "mayor costo del seguro y puntos en tu historial",
        "росту стоимости страховки и баллам в истории",
      ],
      [
        [
          "a free car wash",
          "無料の洗車",
          "un lavado de auto gratis",
          "бесплатной мойке",
        ],
        ["nothing at all", "何もない", "nada", "ничему"],
        ["lower taxes", "税金の減額", "menos impuestos", "снижению налогов"],
      ],
    ),
    q(
      "s1-q10",
      [
        "Driving in California is...",
        "カリフォルニアでの運転は...",
        "Conducir en California es...",
        "Вождение в Калифорнии — это...",
      ],
      [
        "a privilege with responsibilities",
        "責任を伴う特権",
        "un privilegio con responsabilidades",
        "привилегия с обязанностями",
      ],
      [
        [
          "a right with no rules",
          "ルールのない権利",
          "un derecho sin reglas",
          "право без правил",
        ],
        [
          "only for adults over 40",
          "40歳以上だけのもの",
          "solo para mayores de 40",
          "только для старше 40",
        ],
        [
          "optional to follow signs",
          "標識に従うかは任意",
          "seguir señales es opcional",
          "знаки можно не соблюдать",
        ],
      ],
    ),
  ],
};
