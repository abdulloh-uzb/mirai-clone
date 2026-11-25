import {
  callout,
  dragToOrder,
  flipCard,
  lesson,
  q,
  richText,
  scenario,
  type SectionContent,
} from "./helpers";

// Section 8: Violations, Crashes and Emergencies.
export const section8: SectionContent = {
  lessons: [
    lesson(
      [
        "Points on your record",
        "運転記録の違反点数",
        "Puntos en tu historial",
        "Штрафные баллы",
      ],
      richText([
        "Most moving violations add one point to your driving record. A driver may be labeled a negligent operator with 4 points in 12 months, 6 in 24 months or 8 in 36 months, which can lead to suspension. Finishing a state-approved traffic school can keep a point off your public record, once every 18 months, if you are eligible.",
        "ほとんどの移動違反は運転記録に1点加算されます。12か月で4点、24か月で6点、36か月で8点になると不注意運転者とされ、免許停止の可能性があります。対象であれば、州認定の交通学校を修了することで、18か月に1回、公開記録への加点を避けられます。",
        "La mayoría de las infracciones de tránsito suman un punto a tu historial. Con 4 puntos en 12 meses, 6 en 24 o 8 en 36 se te considera conductor negligente y puedes ser suspendido. Terminar una escuela de tránsito aprobada puede evitar un punto en tu registro público, una vez cada 18 meses, si cumples los requisitos.",
        "Большинство нарушений добавляет один балл. При 4 баллах за 12 месяцев, 6 за 24 или 8 за 36 водителя считают небрежным, возможно лишение прав. Окончание одобренной штатом школы может избавить от балла в публичной записи раз в 18 месяцев, если вы подходите.",
      ]),
      flipCard(
        [
          "Negligent operator",
          "不注意運転者",
          "Conductor negligente",
          "Небрежный водитель",
        ],
        [
          "4 points in 12 months, 6 in 24 or 8 in 36.",
          "12か月で4点、24か月で6点、36か月で8点。",
          "4 puntos en 12 meses, 6 en 24 u 8 en 36.",
          "4 балла за 12 мес., 6 за 24 или 8 за 36.",
        ],
      ),
      callout(
        "info",
        [
          "Check your eligibility",
          "対象かどうか確認",
          "Revisa tu elegibilidad",
          "Проверьте право",
        ],
        [
          "Your court decides whether you may attend traffic school for your ticket. Confirm before you enroll.",
          "交通学校を利用できるかは裁判所が判断します。登録前に確認してください。",
          "El tribunal decide si puedes asistir a la escuela de tránsito. Confírmalo antes de inscribirte.",
          "Суд решает, можно ли вам пройти школу. Уточните до записи.",
        ],
      ),
    ),
    lesson(
      [
        "If you are in a crash",
        "事故に遭ったら",
        "Si tienes un choque",
        "Если вы попали в аварию",
      ],
      richText([
        "Stop. Move to safety if you can, turn on hazard lights and check for injuries. Call 911 if anyone is hurt. Exchange name, address, license and insurance details. California requires you to report a crash to the DMV within 10 days if there was an injury or death, or more than $1,000 in damage.",
        "停止します。可能なら安全な場所へ移動し、ハザードを点けて負傷者を確認します。負傷者がいれば911に通報します。氏名、住所、免許、保険情報を交換します。負傷・死亡、または1,000ドル超の損害があった場合、10日以内にDMVへ報告が必要です。",
        "Detente. Muévete a un lugar seguro si puedes, enciende las intermitentes y revisa si hay heridos. Llama al 911 si alguien está herido. Intercambia nombre, dirección, licencia y seguro. California exige reportar al DMV en 10 días si hubo lesiones o muerte, o más de $1,000 en daños.",
        "Остановитесь. Если возможно, отъедите в безопасное место, включите аварийку и проверьте, нет ли пострадавших. При травмах звоните 911. Обменяйтесь именем, адресом, правами и данными страховки. Нужно сообщить в DMV в течение 10 дней, если были травмы или смерть либо ущерб свыше $1000.",
      ]),
      dragToOrder(
        [
          "Order the steps after a crash.",
          "事故後の手順を並べてください。",
          "Ordena los pasos tras un choque.",
          "Расставьте шаги после аварии.",
        ],
        [
          [
            "Stop and turn on hazard lights",
            "停止しハザードを点灯",
            "Detenerte y encender intermitentes",
            "Остановиться, включить аварийку",
          ],
          [
            "Check for injuries and call 911 if needed",
            "負傷者を確認し必要なら911",
            "Revisar heridos y llamar al 911 si hace falta",
            "Проверить пострадавших, при нужде 911",
          ],
          [
            "Exchange information",
            "情報を交換",
            "Intercambiar información",
            "Обменяться данными",
          ],
          [
            "Report to the DMV within 10 days if required",
            "必要なら10日以内にDMVへ報告",
            "Reportar al DMV en 10 días si se requiere",
            "При необходимости сообщить в DMV в течение 10 дней",
          ],
        ],
      ),
      scenario(
        [
          "You bump a parked car and the owner is not there. What do you do?",
          "駐車中の車に接触しましたが持ち主がいません。どうしますか?",
          "Rozas un auto estacionado y el dueño no está. ¿Qué haces?",
          "Вы задели припаркованную машину, владельца нет. Что делаете?",
        ],
        [
          [
            [
              "Leave a note with my contact info and report it",
              "連絡先を書いたメモを残して届け出る",
              "Dejo una nota con mis datos y lo reporto",
              "Оставляю записку с контактами и сообщаю",
            ],
            [
              "Right: you must try to notify the owner.",
              "正解: 持ち主に知らせる努力が必要です。",
              "Bien: debes intentar avisar al dueño.",
              "Верно: нужно постараться уведомить владельца.",
            ],
          ],
          [
            ["Drive away", "立ち去る", "Me voy", "Уезжаю"],
            [
              "That is a hit-and-run.",
              "ひき逃げになります。",
              "Eso es fuga del lugar.",
              "Это оставление места ДТП.",
            ],
          ],
          [
            [
              "Wait one minute, then leave",
              "1分待って立ち去る",
              "Espero un minuto y me voy",
              "Жду минуту и уезжаю",
            ],
            [
              "Still not enough.",
              "それでも不十分です。",
              "Aún no es suficiente.",
              "Этого недостаточно.",
            ],
          ],
        ],
      ),
    ),
    lesson(
      [
        "Citations and your court date",
        "違反切符と裁判所",
        "Citaciones y tu fecha en el tribunal",
        "Штрафы и дата суда",
      ],
      richText([
        "A citation lists your violation and a due date. Sign it (this is a promise to appear, not an admission), keep your copy and do not miss the deadline: missing it can add fines and a hold on your license. Contact the court to ask whether traffic school is possible.",
        "違反切符には違反内容と期限が記載されています。署名しますが、これは出頭の約束であり罪を認めるものではありません。控えを保管し、期限を守ってください。逃すと罰金が増え免許に制限がかかることがあります。交通学校が可能か裁判所に問い合わせます。",
        "Una citación indica tu infracción y una fecha límite. Fírmala (es una promesa de comparecer, no una admisión), guarda tu copia y no pierdas el plazo: puede sumar multas y un bloqueo en tu licencia. Pregunta al tribunal si puedes ir a escuela de tránsito.",
        "В штрафе указаны нарушение и срок. Подпишите (это обещание явиться, а не признание вины), сохраните копию и не пропускайте срок: иначе штрафы и ограничение прав. Спросите в суде, возможна ли школа.",
      ]),
      callout(
        "warning",
        ["Deadlines", "期限", "Plazos", "Сроки"],
        [
          "Finish the course before your court deadline so the court receives your completion in time.",
          "裁判所の期限までに修了し、修了報告が間に合うようにしてください。",
          "Termina el curso antes del plazo para que el tribunal reciba tu finalización a tiempo.",
          "Завершите курс до срока суда, чтобы информация о завершении успела дойти.",
        ],
      ),
      flipCard(
        [
          "What does signing a citation mean?",
          "違反切符への署名の意味は?",
          "¿Qué significa firmar una citación?",
          "Что значит подпись на штрафе?",
        ],
        [
          "A promise to appear, not an admission of guilt.",
          "出頭の約束であり、罪を認めることではない。",
          "Una promesa de comparecer, no admitir culpa.",
          "Обещание явиться, а не признание вины.",
        ],
      ),
    ),
  ],
  quiz: [
    q(
      "s8-q1",
      [
        "Most moving violations add how many points?",
        "多くの移動違反で加算される点数は?",
        "¿Cuántos puntos suma la mayoría de las infracciones?",
        "Сколько баллов добавляет большинство нарушений?",
      ],
      "1",
      ["0", "3", "10"],
    ),
    q(
      "s8-q2",
      [
        "Negligent operator: how many points in 12 months?",
        "不注意運転者: 12か月で何点?",
        "Conductor negligente: ¿cuántos puntos en 12 meses?",
        "Небрежный водитель: сколько баллов за 12 месяцев?",
      ],
      "4",
      ["1", "2", "12"],
    ),
    q(
      "s8-q3",
      [
        "How often can traffic school mask a point?",
        "交通学校で点数を隠せる頻度は?",
        "¿Cada cuánto puede la escuela ocultar un punto?",
        "Как часто школа может скрыть балл?",
      ],
      [
        "Once every 18 months",
        "18か月に1回",
        "Una vez cada 18 meses",
        "Раз в 18 месяцев",
      ],
      [
        ["Every week", "毎週", "Cada semana", "Каждую неделю"],
        ["Every day", "毎日", "Cada día", "Каждый день"],
        ["Never", "不可", "Nunca", "Никогда"],
      ],
    ),
    q(
      "s8-q4",
      [
        "After a crash, what is the first step?",
        "事故後の最初の手順は?",
        "Tras un choque, ¿cuál es el primer paso?",
        "Что делать первым после аварии?",
      ],
      [
        "Stop and check for injuries",
        "停止して負傷者を確認",
        "Detenerte y revisar heridos",
        "Остановиться и проверить пострадавших",
      ],
      [
        ["Leave quickly", "すぐに立ち去る", "Irte rápido", "Быстро уехать"],
        [
          "Argue about fault",
          "過失を言い争う",
          "Discutir la culpa",
          "Спорить о вине",
        ],
        ["Post online", "ネットに投稿", "Publicar en línea", "Выложить в сеть"],
      ],
    ),
    q(
      "s8-q5",
      [
        "You must report a crash to the DMV within...",
        "事故をDMVに報告する期限は...",
        "Debes reportar un choque al DMV en...",
        "Сообщить об аварии в DMV нужно в течение...",
      ],
      ["10 days", "10日", "10 días", "10 дней"],
      [
        ["1 day", "1日", "1 día", "1 день"],
        ["30 days", "30日", "30 días", "30 дней"],
        ["365 days", "365日", "365 días", "365 дней"],
      ],
    ),
    q(
      "s8-q6",
      [
        "What property damage requires a DMV report?",
        "どの物損でDMV報告が必要ですか?",
        "¿Qué daño material requiere reporte al DMV?",
        "Какой ущерб требует сообщения в DMV?",
      ],
      "$1,000+",
      ["$50", "$100", "$250"],
    ),
    q(
      "s8-q7",
      [
        "You hit a parked car and the owner is gone. You must...",
        "駐車車両に当てて持ち主が不在。あなたは...",
        "Golpeas un auto estacionado y el dueño no está. Debes...",
        "Вы задели припаркованную машину, владельца нет. Вы должны...",
      ],
      [
        "leave a note and report it",
        "メモを残して届け出る",
        "dejar una nota y reportarlo",
        "оставить записку и сообщить",
      ],
      [
        ["drive away", "立ち去る", "irte", "уехать"],
        ["do nothing", "何もしない", "no hacer nada", "ничего не делать"],
        [
          "blame someone",
          "誰かのせいにする",
          "culpar a alguien",
          "обвинить кого-то",
        ],
      ],
    ),
    q(
      "s8-q8",
      [
        "Signing a citation means...",
        "違反切符への署名は...",
        "Firmar una citación significa...",
        "Подпись на штрафе означает...",
      ],
      [
        "a promise to appear",
        "出頭の約束",
        "una promesa de comparecer",
        "обещание явиться",
      ],
      [
        ["you admit guilt", "罪を認める", "admites culpa", "вы признаёте вину"],
        [
          "you pay nothing",
          "支払いなし",
          "no pagas nada",
          "вы ничего не платите",
        ],
        ["the case is closed", "事件終了", "el caso se cierra", "дело закрыто"],
      ],
    ),
    q(
      "s8-q9",
      [
        "Who decides if you may attend traffic school?",
        "交通学校に参加できるかを決めるのは?",
        "¿Quién decide si puedes asistir a la escuela de tránsito?",
        "Кто решает, можно ли вам пройти школу?",
      ],
      ["The court", "裁判所", "El tribunal", "Суд"],
      [
        ["Your neighbor", "隣人", "Tu vecino", "Сосед"],
        ["The school alone", "学校だけ", "Solo la escuela", "Только школа"],
        ["No one", "誰も決めない", "Nadie", "Никто"],
      ],
    ),
    q(
      "s8-q10",
      [
        "Missing a court deadline can lead to...",
        "裁判所の期限を逃すと...",
        "Perder el plazo del tribunal puede causar...",
        "Пропуск срока суда может привести к...",
      ],
      [
        "more fines and a license hold",
        "罰金の増加と免許の制限",
        "más multas y bloqueo de licencia",
        "новым штрафам и ограничению прав",
      ],
      [
        ["a reward", "報奨", "un premio", "награде"],
        ["nothing", "何もない", "nada", "ничему"],
        ["a free pass", "免除", "un pase libre", "освобождению"],
      ],
    ),
  ],
};
