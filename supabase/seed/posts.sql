-- Blog posts (public-site ticket 05): 6 posts, 2 per category.
-- Original copy; no third-party brands; no legal advice (always "check with your court").
-- The non-English rows need a native-speaker review before launch.
-- 'driving-in-rain-and-fog' has only an English row on purpose: it exercises
-- the English fallback with the "not yet translated" notice.

insert into public.posts
  (locale, slug, category, title, excerpt, body, published, published_at)
values

-- 1. traffic-school: what-is-traffic-school (newest first in the list: Nov)
('en', 'what-is-traffic-school', 'traffic-school',
 'What traffic school is and how it works',
 'A plain-language look at what an online traffic school course is, who it is for and what to expect.',
 $md$
Traffic school is a short course for drivers who received a traffic ticket. If your court allows it, finishing the course can keep the violation from adding a point to your driving record. The course does not erase the ticket, and it does not remove the fine. It is a way to show the court that you took the time to refresh your knowledge of the road.

## Who can take it

Not every ticket qualifies, and not every driver is allowed to use traffic school each time. The court decides. Your citation, your driving history and your county's rules all play a part, so always **check with your court** before you sign up.

## How an online course works

An online course is self-paced. You read short lessons, look at examples and answer review questions. You can stop and come back later, and you do not have to finish in one sitting. Most courses also have a minimum amount of study time, so moving quickly through the pages will not shorten it.

At the end there is a final exam. You need a passing score to finish, and there is a limit on how many times you can try. The questions are about the material you just studied: traffic laws, safe driving habits and the risks of driving while tired, distracted or impaired.

## What you need before you start

- Your citation, with the citation number and the court due date.
- The name of the court that handles your ticket.
- A few hours spread over several days, and a device with a stable internet connection.

## Watch the deadline

The due date on your citation matters more than anything else. The court needs to receive proof that you finished the course before that date, so start early and leave time for the school to report your completion.

## What happens when you finish

When you pass the final exam, the school reports your completion and you can download a certificate. We explain that step in our post about what happens after you finish the course.

This article is general information, not legal advice. Rules differ between courts and change over time.
$md$, true, '2026-11-12 09:00:00+00'),
('ja', 'what-is-traffic-school', 'traffic-school',
 '交通講習(トラフィックスクール)とは? しくみをやさしく解説',
 'オンライン交通講習がどんなもので、誰が対象で、何を準備すればよいかを分かりやすく紹介します。',
 $md$
交通講習は、交通違反の切符を受け取った運転者のための短いコースです。裁判所が認めた場合、コースを修了すると違反による点数が運転記録に加算されずに済むことがあります。ただし、切符そのものや罰金がなくなるわけではありません。

## 受講できる人

すべての切符が対象になるわけではなく、毎回受講できるとも限りません。判断するのは裁判所です。申し込む前に、必ず**ご自身の裁判所に確認**してください。

## オンライン講習の流れ

自分のペースで進められます。短いレッスンを読み、例題を見て、確認問題に答えます。途中で中断しても、後から続きから再開できます。最低学習時間が決まっているため、急いでページを進めても時間は短縮されません。

最後に修了試験があります。合格点に達すると修了となり、受験できる回数には上限があります。

## 始める前に用意するもの

- 切符(違反番号と裁判所の期日が記載されたもの)
- 担当する裁判所の名前
- 数日間に分けて使える数時間と、安定したインターネット環境

## 期日に注意

最も大切なのは切符に書かれた期日です。期日までに修了の証明が裁判所に届く必要があるため、早めに始めてください。

この記事は一般的な情報であり、法的助言ではありません。
$md$, true, '2026-11-12 09:00:00+00'),
('es', 'what-is-traffic-school', 'traffic-school',
 'Qué es la escuela de tráfico y cómo funciona',
 'Una explicación sencilla de qué es un curso de tráfico en línea, para quién es y qué esperar.',
 $md$
La escuela de tráfico es un curso breve para conductores que recibieron una multa. Si su tribunal lo permite, terminar el curso puede evitar que la infracción sume un punto a su historial de manejo. El curso no borra la multa ni elimina el pago.

## Quién puede tomarlo

No todas las multas califican. Decide el tribunal. Su citación, su historial y las reglas de su condado influyen, así que **consulte con su tribunal** antes de inscribirse.

## Cómo funciona un curso en línea

Usted avanza a su propio ritmo: lee lecciones cortas, revisa ejemplos y responde preguntas de repaso. Puede parar y continuar otro día. Casi todos los cursos exigen un tiempo mínimo de estudio, así que pasar las páginas rápido no lo acorta.

Al final hay un examen. Necesita una nota aprobatoria y el número de intentos es limitado.

## Qué necesita antes de empezar

- Su citación, con el número y la fecha límite.
- El nombre del tribunal que lleva su caso.
- Unas horas repartidas en varios días y una conexión estable a internet.

## Cuidado con la fecha límite

La fecha de su citación es lo más importante. El tribunal debe recibir la prueba de que terminó el curso antes de esa fecha, así que empiece pronto.

Este artículo es información general, no asesoría legal.
$md$, true, '2026-11-12 09:00:00+00'),
('ru', 'what-is-traffic-school', 'traffic-school',
 'Что такое школа для нарушителей ПДД и как она работает',
 'Простое объяснение: что такое онлайн-курс по правилам дорожного движения, для кого он и чего ожидать.',
 $md$
Школа для нарушителей — это короткий курс для водителей, получивших штраф. Если суд разрешает, прохождение курса может помочь избежать начисления штрафного балла в вашей водительской истории. Курс не отменяет штраф и не освобождает от его оплаты.

## Кто может пройти курс

Подходит не каждое нарушение. Решает суд. Значение имеют ваше постановление, история вождения и правила округа, поэтому **уточните в своём суде** до записи на курс.

## Как проходит онлайн-курс

Вы учитесь в своём темпе: читаете короткие уроки, разбираете примеры и отвечаете на вопросы. Можно прерваться и вернуться позже. У большинства курсов есть минимальное время обучения, поэтому быстро листать страницы не получится.

В конце — итоговый экзамен. Нужен проходной балл, а число попыток ограничено.

## Что нужно до начала

- Постановление с номером и сроком явки в суд.
- Название суда, который ведёт ваше дело.
- Несколько часов в течение нескольких дней и стабильный интернет.

## Следите за сроком

Самое важное — срок в постановлении. Суд должен получить подтверждение до этой даты, поэтому начните заранее.

Статья носит общий характер и не является юридической консультацией.
$md$, true, '2026-11-12 09:00:00+00'),

-- 2. traffic-school: how-to-ask-your-court-for-traffic-school (Oct)
('en', 'how-to-ask-your-court-for-traffic-school', 'traffic-school',
 'How to ask your court for traffic school',
 'The usual steps for asking a California court whether you can take traffic school, and what to have ready.',
 $md$
Before you pay for any course, you need to know whether your court will let you use traffic school for your ticket. Courts handle this in slightly different ways, so treat this post as a general guide and follow your own court's instructions.

## Step 1: Read your citation

Your citation lists the violation, a citation number and the date you must respond by. Find these three details first. If you cannot find the due date, contact the court before doing anything else.

## Step 2: Find your court

Each California county has a superior court, and some counties have several courthouses. Use the courts section of our site to find your county and see the courthouses listed for it. The data on our site is a demo, so confirm every detail with the court itself.

## Step 3: Ask about eligibility

Contact the court, or use its website, and ask whether your violation is eligible for traffic school. Some courts take the request online, some by phone and some in person. Ask which of these they prefer.

Questions worth asking:

- Is my violation eligible?
- Is there a fee to request traffic school, and when is it due?
- What is my new deadline to finish the course?
- Which schools or courses does the court accept?

## Step 4: Pay what the court asks

Courts usually ask you to pay the fine, or a related fee, to be allowed to attend. This is separate from the cost of the course. Keep your receipt.

## Step 5: Take the course and keep your proof

Finish the course before your deadline, and keep your certificate and any confirmation. If the court does not receive proof in time, the violation can go on your record as usual.

## If you are unsure

Call the court. Staff can tell you what applies to your case, which a general article cannot. Nothing here is legal advice.
$md$, true, '2026-10-15 09:00:00+00'),
('ja', 'how-to-ask-your-court-for-traffic-school', 'traffic-school',
 '裁判所に交通講習の受講を申請する方法',
 'カリフォルニアの裁判所に交通講習の受講可否を確認するときの一般的な手順と、準備しておくものです。',
 $md$
講習の料金を支払う前に、ご自身の切符で裁判所が交通講習を認めるかどうかを確認する必要があります。対応は裁判所ごとに少しずつ異なるため、この記事は一般的な目安として、最終的には裁判所の指示に従ってください。

## 手順1: 切符を確認する

切符には違反内容、違反番号、対応期日が書かれています。期日が分からない場合は、まず裁判所に連絡してください。

## 手順2: 裁判所を探す

カリフォルニアの各郡には上級裁判所があり、複数の庁舎を持つ郡もあります。当サイトの裁判所のページで郡と庁舎を確認できます。サイトの情報はデモなので、必ず裁判所で確認してください。

## 手順3: 受講資格を確認する

裁判所のウェブサイトまたは電話で、違反が交通講習の対象かどうかを尋ねます。確認したい点は次のとおりです。

- 自分の違反は対象か
- 申請に手数料はあるか、いつまでか
- 講習を修了する新しい期限はいつか
- どの講習が認められているか

## 手順4: 求められた金額を支払う

裁判所から罰金または関連費用の支払いを求められることがあります。これは講習料金とは別です。領収書は保管してください。

## 手順5: 講習を受け、証明を保管する

期限までに修了し、修了証を保管してください。

迷ったときは裁判所に電話を。この記事は法的助言ではありません。
$md$, true, '2026-10-15 09:00:00+00'),
('es', 'how-to-ask-your-court-for-traffic-school', 'traffic-school',
 'Cómo pedir a su tribunal la escuela de tráfico',
 'Los pasos habituales para preguntar a un tribunal de California si puede tomar la escuela de tráfico.',
 $md$
Antes de pagar un curso, debe saber si su tribunal le permite usar la escuela de tráfico en su caso. Cada tribunal lo maneja de forma algo distinta, así que use esta guía como orientación y siga las instrucciones de su tribunal.

## Paso 1: Lea su citación

La citación indica la infracción, el número de citación y la fecha límite para responder. Si no encuentra la fecha, llame al tribunal antes de hacer nada más.

## Paso 2: Encuentre su tribunal

Cada condado de California tiene un tribunal superior, y algunos tienen varios juzgados. En la sección de tribunales de nuestro sitio puede ver su condado. Los datos son de demostración: confírmelos con el tribunal.

## Paso 3: Pregunte si califica

Contacte al tribunal y pregunte si su infracción es elegible. Preguntas útiles:

- ¿Mi infracción es elegible?
- ¿Hay una cuota y cuándo vence?
- ¿Cuál es mi nueva fecha límite para terminar el curso?
- ¿Qué cursos acepta el tribunal?

## Paso 4: Pague lo que el tribunal pida

A menudo se pide pagar la multa o una cuota relacionada. Es aparte del costo del curso. Guarde el recibo.

## Paso 5: Tome el curso y guarde la prueba

Termine antes de la fecha límite y guarde su certificado.

Si tiene dudas, llame al tribunal. Esto no es asesoría legal.
$md$, true, '2026-10-15 09:00:00+00'),
('ru', 'how-to-ask-your-court-for-traffic-school', 'traffic-school',
 'Как попросить суд разрешить школу для нарушителей',
 'Обычные шаги, чтобы узнать у калифорнийского суда, можно ли вам пройти курс, и что подготовить.',
 $md$
Прежде чем платить за курс, выясните, разрешит ли ваш суд школу для нарушителей по вашему делу. Суды действуют по-разному, поэтому считайте эту статью общим ориентиром и следуйте указаниям своего суда.

## Шаг 1: прочитайте постановление

В нём указаны нарушение, номер и срок, до которого нужно ответить. Если срока нет, сначала позвоните в суд.

## Шаг 2: найдите свой суд

В каждом округе Калифорнии есть окружной суд, иногда с несколькими зданиями. В разделе о судах на нашем сайте можно найти округ. Данные демонстрационные — подтвердите всё в суде.

## Шаг 3: спросите о возможности

Свяжитесь с судом и спросите, подходит ли ваше нарушение. Полезные вопросы:

- Подходит ли моё нарушение?
- Есть ли сбор и когда его платить?
- Какой у меня новый срок прохождения курса?
- Какие курсы принимает суд?

## Шаг 4: оплатите то, что просит суд

Часто требуют оплатить штраф или связанный сбор. Это отдельно от стоимости курса. Сохраните квитанцию.

## Шаг 5: пройдите курс и сохраните подтверждение

Завершите курс в срок и сохраните сертификат.

Если сомневаетесь, позвоните в суд. Это не юридическая консультация.
$md$, true, '2026-10-15 09:00:00+00'),

-- 3. california-driving: right-of-way-basics (Sep)
('en', 'california-right-of-way-basics', 'california-driving',
 'California right-of-way basics',
 'Who goes first at four-way stops, crosswalks and turns: the common right-of-way rules in plain language.',
 $md$
Right-of-way rules decide who goes first when two road users could meet. They are about courtesy and safety, not about winning. Even when the law says you have the right-of-way, you must still do what you can to avoid a crash.

## Four-way stops

Everyone stops. The driver who arrived first goes first. If two drivers arrive at the same moment, the driver on the right goes first. If you are going straight and another driver is turning left, the driver going straight usually goes first.

## Uncontrolled intersections

At an intersection with no signs or signals, slow down and be ready to stop. Give way to a driver already in the intersection, and to the driver on your right if you arrive together.

## Left turns

When you turn left, you give way to oncoming traffic that is close enough to be a hazard. Wait for a safe gap. Do not rely on another driver waving you through without checking yourself.

## Pedestrians and crosswalks

Drivers must yield to people crossing in a marked crosswalk, and in many unmarked crosswalks at intersections. Never pass another vehicle that has stopped for a pedestrian. Slow down near schools and in busy areas.

## Bicycles

People riding bicycles have the same rights and duties as drivers in many situations. Give them room when you pass. Check for a bike before you open your door or turn across a bike lane.

## Emergency vehicles

When a siren or flashing light approaches, pull over to the right edge of the road and stop until it has passed. At an intersection, stay clear of it and do not block the path.

## Merging

On a highway on-ramp, the driver merging adjusts speed to find a gap, and the drivers already on the road help by making space when it is safe.

This is a general summary. The California Driver Handbook and your local rules have the full details.
$md$, true, '2026-09-10 09:00:00+00'),
('ja', 'california-right-of-way-basics', 'california-driving',
 'カリフォルニアの優先通行ルールの基本',
 '一時停止の交差点、横断歩道、右左折での優先順位を、分かりやすくまとめました。',
 $md$
優先通行のルールは、道路利用者どうしが出会うときに誰が先に進むかを決めるものです。優先権があっても、事故を避けるためにできることは常にしなければなりません。

## 4方向一時停止

全員が停止します。先に到着した車が先に進みます。同時に着いた場合は右側の車が先です。直進車と右左折車では、通常は直進車が先です。

## 標識や信号のない交差点

速度を落とし、停止できる準備をします。すでに交差点内にいる車と、同時に着いた場合は右側の車に道を譲ります。

## 左折

対向車が危険になるほど近いときは譲ります。安全な間隔を待ちましょう。

## 歩行者と横断歩道

標識のある横断歩道では、渡っている人に譲らなければなりません。歩行者のために止まっている車を追い越してはいけません。

## 自転車

自転車も多くの場面で車と同じ権利と義務があります。追い越すときは余裕を持ち、ドアを開ける前や左折前に確認しましょう。

## 緊急車両

サイレンや点滅灯が近づいたら、道路の右端に寄って通過するまで停止します。

これは一般的な概要です。詳細は運転者ハンドブックや地域のルールで確認してください。
$md$, true, '2026-09-10 09:00:00+00'),
('es', 'california-right-of-way-basics', 'california-driving',
 'Lo básico sobre el derecho de paso en California',
 'Quién pasa primero en altos de cuatro vías, cruces peatonales y vueltas, en lenguaje sencillo.',
 $md$
Las reglas de derecho de paso deciden quién avanza primero cuando dos usuarios de la vía podrían encontrarse. Aun si tiene el derecho de paso, debe hacer lo posible por evitar un choque.

## Altos en cuatro direcciones

Todos se detienen. Pasa primero quien llegó primero. Si llegan a la vez, pasa el de la derecha. Si usted va derecho y otro gira a la izquierda, normalmente pasa quien va derecho.

## Cruces sin señales

Reduzca la velocidad y esté listo para detenerse. Ceda el paso a quien ya está en el cruce y al conductor de su derecha si llegan juntos.

## Vueltas a la izquierda

Ceda el paso al tráfico que viene de frente si está tan cerca que es un peligro. Espere un hueco seguro.

## Peatones

Debe ceder el paso a quien cruza en un cruce peatonal marcado. Nunca rebase un vehículo detenido por un peatón.

## Bicicletas

Los ciclistas tienen derechos y deberes similares a los de los conductores. Déjeles espacio y revise antes de abrir la puerta.

## Vehículos de emergencia

Oriéntese hacia el borde derecho y deténgase hasta que pasen.

Este es un resumen general. Consulte el manual del conductor y las reglas locales.
$md$, true, '2026-09-10 09:00:00+00'),
('ru', 'california-right-of-way-basics', 'california-driving',
 'Основы права проезда в Калифорнии',
 'Кто едет первым на перекрёстках, пешеходных переходах и при поворотах — простыми словами.',
 $md$
Правила проезда определяют, кто едет первым, когда участники движения могут столкнуться. Даже при наличии преимущества нужно делать всё, чтобы избежать аварии.

## Перекрёсток с остановкой со всех сторон

Останавливаются все. Первым едет тот, кто приехал раньше. При одновременном прибытии — тот, кто справа. Если вы едете прямо, а встречный поворачивает налево, обычно первым едет движущийся прямо.

## Перекрёстки без знаков

Снизьте скорость и будьте готовы остановиться. Уступите тем, кто уже на перекрёстке, и водителю справа при одновременном подъезде.

## Поворот налево

Уступите встречному транспорту, если он достаточно близко. Дождитесь безопасного промежутка.

## Пешеходы

Уступайте тем, кто переходит по размеченному переходу. Не обгоняйте машину, остановившуюся перед пешеходом.

## Велосипеды

У велосипедистов во многих ситуациях те же права и обязанности. Оставляйте им место и проверяйте обстановку перед открытием двери.

## Спецтранспорт

При сирене или проблесковых огнях прижмитесь к правому краю и остановитесь.

Это общий обзор. Подробности — в руководстве водителя и местных правилах.
$md$, true, '2026-09-10 09:00:00+00'),

-- 4. california-driving: driving-in-rain-and-fog (Aug) — ENGLISH ONLY (fallback case)
('en', 'driving-in-rain-and-fog', 'california-driving',
 'Driving safely in rain and fog',
 'Practical habits for wet roads and low visibility: speed, following distance, lights and when to pull over.',
 $md$
Rain in California often arrives after a long dry spell. Oil and dust on the road mix with the first drops and make the surface slick. Fog can reduce what you see to a few car lengths. Both call for the same core idea: slow down and leave more room.

## Slow down early

Reduce your speed before you reach a curve, an off-ramp or a spot where water collects. Braking hard on a wet surface is how many drivers lose control. Press the brake pedal gently and early.

## Leave extra following distance

On dry pavement, a gap of about three seconds to the vehicle ahead is a good habit. In rain, make it at least double. In fog, make it larger still. You need time to see a problem and time to stop.

## Use your lights correctly

Turn on your low-beam headlights when it rains or when fog limits your view. Low beams help others see you. High beams scatter light back off fog and rain and make it harder to see, so keep them off.

## Handle hydroplaning calmly

If the car starts to skim over water and the steering feels light:

- Ease your foot off the accelerator.
- Hold the steering wheel steady and look where you want to go.
- Do not slam the brakes.

Once you feel the tires grip again, you can brake gently.

## Keep your windshield and tires in good shape

Worn wipers smear water, and worn tires push less water away. Check both before the rainy season. Make sure the defroster works so the glass does not fog up inside.

## When to stop

If you cannot see well enough to drive safely, pull completely off the road at the next safe spot, turn on your hazard lights and wait. Do not stop in a travel lane.

Allow more time for your trip, and arrive late rather than not at all.
$md$, true, '2026-08-13 09:00:00+00'),

-- 5. after-your-ticket: what-happens-after-you-finish-the-course (Jul)
('en', 'what-happens-after-you-finish-the-course', 'after-your-ticket',
 'What happens after you finish the course',
 'From the final exam to your certificate and the report to the state: the steps after your last lesson.',
 $md$
Finishing the last lesson feels like the end, but a few steps remain before your court has what it needs. Here is the usual order of events.

## 1. You pass the final exam

When your score reaches the passing mark, the course is complete. If you do not pass, you may be able to try again, up to the limit for the course. Review the lessons you found hardest before you retry.

## 2. Your certificate is created

After you pass, you can download your certificate of completion. It shows your name, the course and the date you finished. Save a copy on your device and, if you like, print one.

## 3. The school reports your completion

Schools send completions to the state on a regular schedule rather than the second you finish. Your completion goes out in the next batch. You do not need to do anything for this step, though you should check that the name and details on your account are correct, because a mismatch can slow things down.

## 4. The court updates your case

Once the court receives the report, it can mark your case as done and keep the violation from adding a point. How long this takes depends on the court. Some update within days, others take weeks.

## What you should do

- Keep your certificate until your case is fully closed.
- Check your case status on the court's website after a couple of weeks.
- Contact the court, not the school, if the status does not change, and tell us if the report did not go out.

## Do not wait for the last day

Because reporting and court processing take time, finish well before your due date. If you cut it close, ask your court what proof it will accept.

This is general information, not legal advice.
$md$, true, '2026-07-16 09:00:00+00'),
('ja', 'what-happens-after-you-finish-the-course', 'after-your-ticket',
 'コース修了後に起こること',
 '修了試験から修了証、州への報告まで、最後のレッスンの後の流れを説明します。',
 $md$
最後のレッスンを終えても、裁判所に必要な情報が届くまでにいくつかの手順があります。通常の流れは次のとおりです。

## 1. 修了試験に合格する

合格点に達するとコース修了です。合格できなかった場合は、上限の範囲内で再受験できます。

## 2. 修了証が作成される

合格後、修了証をダウンロードできます。氏名、コース名、修了日が記載されています。控えを保存しておきましょう。

## 3. スクールが修了を報告する

修了の報告は、修了の瞬間ではなく、定期的なスケジュールで州に送られます。操作は不要ですが、アカウントの氏名などが正しいか確認してください。

## 4. 裁判所が記録を更新する

報告を受けた裁判所が案件を完了とし、違反による点数の加算を防ぎます。所要時間は裁判所によって数日から数週間です。

## すべきこと

- 案件が完全に終了するまで修了証を保管する
- 2週間ほどしたら裁判所のサイトで状況を確認する
- 状況が変わらない場合は裁判所に連絡する

期日ぎりぎりではなく、余裕をもって修了してください。これは一般的な情報で、法的助言ではありません。
$md$, true, '2026-07-16 09:00:00+00'),
('es', 'what-happens-after-you-finish-the-course', 'after-your-ticket',
 'Qué pasa después de terminar el curso',
 'Del examen final al certificado y al reporte al estado: los pasos tras su última lección.',
 $md$
Terminar la última lección parece el final, pero aún quedan pasos para que su tribunal tenga lo que necesita.

## 1. Aprueba el examen final

Cuando su nota alcanza el mínimo, el curso está completo. Si no aprueba, puede intentarlo de nuevo hasta el límite permitido.

## 2. Se crea su certificado

Después de aprobar, puede descargar su certificado de finalización, con su nombre, el curso y la fecha. Guarde una copia.

## 3. La escuela reporta su finalización

Las escuelas envían las finalizaciones al estado en horarios regulares, no al instante. No tiene que hacer nada, pero verifique que su nombre y datos sean correctos.

## 4. El tribunal actualiza su caso

Cuando el tribunal recibe el reporte, puede marcar su caso como terminado y evitar el punto. El tiempo depende del tribunal: días o semanas.

## Qué debe hacer

- Guarde el certificado hasta que su caso cierre.
- Revise el estado en el sitio del tribunal tras un par de semanas.
- Contacte al tribunal si no hay cambios.

No espere al último día. Esto es información general, no asesoría legal.
$md$, true, '2026-07-16 09:00:00+00'),
('ru', 'what-happens-after-you-finish-the-course', 'after-your-ticket',
 'Что происходит после окончания курса',
 'От итогового экзамена до сертификата и отчёта в штат: шаги после последнего урока.',
 $md$
Последний урок — ещё не конец: нужно, чтобы суд получил всё необходимое.

## 1. Вы сдаёте итоговый экзамен

Когда результат достигает проходного балла, курс завершён. Если не сдали, можно попробовать снова в пределах лимита.

## 2. Создаётся сертификат

После экзамена можно скачать сертификат с вашим именем, названием курса и датой. Сохраните копию.

## 3. Школа сообщает о завершении

Школы отправляют сведения в штат по расписанию, а не мгновенно. От вас ничего не требуется, но проверьте, что имя и данные в аккаунте верны.

## 4. Суд обновляет дело

Получив отчёт, суд может закрыть дело и не добавлять штрафной балл. Срок зависит от суда: от нескольких дней до недель.

## Что делать

- Храните сертификат, пока дело не закрыто.
- Через пару недель проверьте статус на сайте суда.
- Если статус не меняется, свяжитесь с судом.

Не откладывайте на последний день. Это общая информация, не юридическая консультация.
$md$, true, '2026-07-16 09:00:00+00'),

-- 6. after-your-ticket: keeping-your-record-clean (Jun, oldest)
('en', 'keeping-your-driving-record-clean', 'after-your-ticket',
 'Keeping your driving record clean',
 'Everyday habits that help you avoid the next ticket, and why a clean record matters for years.',
 $md$
A traffic ticket can feel like a one-time bother, but a driving record is long-lived. Points and violations can affect your insurance, and some employers look at driving records. Here are habits that help you stay out of trouble.

## Know the limits and the signs

Speed limits change often, especially near schools, work zones and neighborhoods. Make a habit of reading signs as you drive instead of assuming the limit is the same as the last road.

## Put the phone away

Using a handheld phone while driving is a common reason for tickets and a common cause of crashes. Set up your route and music before you leave. If you need to use the phone, pull over safely. Hands-free rules still ask you to keep your attention on the road.

## Stop completely

A rolling stop is still a violation. Come to a full stop behind the white line, look both ways, and then go. The same applies to right turns on red where they are allowed.

## Keep your paperwork current

Registration, insurance and your license should all be current and easy to reach. Set a calendar reminder a month before each renewal. Many tickets come from paperwork that simply lapsed.

## Do not drive tired

Drowsy driving looks a lot like impaired driving. If you notice yellow lines drifting or you catch yourself yawning, stop and rest.

## Handle a new ticket on time

If you do get a ticket, read it carefully, mark the due date and act early. Missing a deadline can add penalties on top of the original fine. Ask your court about your options, including traffic school.

## Check your record

You can request a copy of your driving record from the state. Look at it once in a while so you can spot mistakes early.

This is general information, not legal advice.
$md$, true, '2026-06-18 09:00:00+00'),
('ja', 'keeping-your-driving-record-clean', 'after-your-ticket',
 '運転記録をきれいに保つために',
 '次の違反を避けるための日々の習慣と、きれいな記録が長く役立つ理由を紹介します。',
 $md$
交通違反は一度きりの出来事に思えても、運転記録は長く残ります。点数や違反は保険料に影響することがあり、運転記録を確認する職場もあります。

## 制限速度と標識を意識する

制限速度は学校の近くや工事区間、住宅地で頻繁に変わります。前の道路と同じだと思い込まず、標識を確認しましょう。

## スマートフォンは置く

運転中の手持ち通話は違反や事故の原因です。出発前にルートと音楽を設定し、必要なら安全な場所で停車してください。

## 完全に止まる

徐行して通過するだけでは違反です。白線の手前で完全に停止し、左右を確認してから進みます。

## 書類を最新にする

登録、保険、免許は常に有効で、すぐ出せるようにしましょう。更新の1か月前にリマインダーを設定すると安心です。

## 眠いときは運転しない

居眠り運転は飲酒運転に似た危険があります。眠気を感じたら休憩してください。

## 新しい切符には期限内に対応する

切符を受け取ったら内容を確認し、期日を控えて早めに対応します。交通講習を含む選択肢は裁判所に尋ねましょう。

この記事は一般的な情報であり、法的助言ではありません。
$md$, true, '2026-06-18 09:00:00+00'),
('es', 'keeping-your-driving-record-clean', 'after-your-ticket',
 'Cómo mantener limpio su historial de manejo',
 'Hábitos diarios para evitar la próxima multa y por qué un buen historial importa por años.',
 $md$
Una multa puede parecer un contratiempo pasajero, pero el historial de manejo dura mucho. Los puntos pueden afectar su seguro, y algunos empleadores lo revisan.

## Conozca los límites y las señales

Los límites cambian cerca de escuelas, zonas de obras y barrios. Lea las señales en lugar de suponer que el límite es el mismo.

## Guarde el teléfono

Usar el teléfono en la mano al conducir es causa frecuente de multas y choques. Configure la ruta y la música antes de salir.

## Deténgase por completo

Un alto "rodando" sigue siendo infracción. Deténgase detrás de la línea blanca, mire a ambos lados y luego avance.

## Mantenga sus documentos al día

Registro, seguro y licencia deben estar vigentes. Ponga un recordatorio un mes antes de cada renovación.

## No maneje con sueño

Manejar con sueño se parece a manejar bajo los efectos del alcohol. Si nota cansancio, deténgase a descansar.

## Atienda una multa nueva a tiempo

Léala con cuidado, anote la fecha límite y actúe pronto. Pregunte a su tribunal sobre sus opciones, incluida la escuela de tráfico.

Esto es información general, no asesoría legal.
$md$, true, '2026-06-18 09:00:00+00'),
('ru', 'keeping-your-driving-record-clean', 'after-your-ticket',
 'Как сохранить чистую водительскую историю',
 'Повседневные привычки, которые помогают избежать следующего штрафа, и почему чистая история важна годами.',
 $md$
Штраф кажется разовой неприятностью, но водительская история хранится долго. Баллы могут повлиять на страховку, а некоторые работодатели смотрят на неё.

## Знайте ограничения и знаки

Ограничения скорости часто меняются рядом со школами, на ремонтах и в жилых кварталах. Читайте знаки, не считайте, что лимит прежний.

## Уберите телефон

Разговор по телефону в руке за рулём — частая причина штрафов и аварий. Настройте маршрут и музыку до выезда.

## Останавливайтесь полностью

Проезд «накатом» — тоже нарушение. Полностью остановитесь у белой линии, посмотрите по сторонам и поезжайте.

## Держите документы в порядке

Регистрация, страховка и права должны быть действующими. Поставьте напоминание за месяц до продления.

## Не ездите уставшим

Сонное вождение похоже на езду в нетрезвом виде. Почувствовали усталость — остановитесь и отдохните.

## Реагируйте на новый штраф вовремя

Внимательно прочитайте, отметьте срок и действуйте заранее. Спросите суд о ваших вариантах, включая школу для нарушителей.

Это общая информация, не юридическая консультация.
$md$, true, '2026-06-18 09:00:00+00');
