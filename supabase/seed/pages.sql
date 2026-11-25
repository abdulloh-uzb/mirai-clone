-- Content pages for the public site (ticket 02): terms, privacy, refund-policy,
-- school-rules, about and accessibility, in en/ja/es/ru. Markdown bodies.
-- Legal pages start with a "Demo text, not legal advice" line. The refund
-- policy follows the 100/50/0 table in spec.md section 8; the school rules
-- follow section 7. The school is never named here (brand lives only in
-- src/config/site.ts); contact details are added by the /about page.
-- `school-rules` has no `ru` row on purpose: it exercises the English fallback.
-- Non-English rows: a native speaker must review them before launch.

insert into public.pages (locale, slug, title, body, published)
select v.locale, v.slug, v.title, v.body, true
from (values
  -- English ------------------------------------------------------------------
  ('en', 'terms', $p$Terms of use$p$, $p$**Demo text, not legal advice.**

These terms describe how the course works in this demo. They are an example only and do not create a contract.

## Your account

- You need an account to enroll. Keep your password private.
- The details you give (legal name, date of birth and driver's license number) must be true and your own. They appear on your certificate.
- These details lock when you start the final exam. After that only school staff can change them, with a recorded reason.

## The course

- You get 90 days of access from the day you enroll.
- The 8 sections open in order, and each lesson has a minimum time.
- The final exam has 25 questions, needs 70% to pass and allows 2 attempts.

## Your court

Only your court decides whether you may attend traffic school and by what date. Check your court's rules before you enroll.

## Payments and refunds

Prices are in US dollars and are paid through a secure checkout. Refunds follow the [refund policy](/refund-policy).

## Changes

We may update these terms. The date of the last change is shown on this page.$p$),

  ('en', 'privacy', $p$Privacy policy$p$, $p$**Demo text, not legal advice.**

This page explains what personal data the demo stores and why.

## What we collect

- **Account details:** name, email and preferred language.
- **Driver details:** legal name, date of birth, driver's license number, court and citation number. These are needed for your certificate and the completion report.
- **Course progress:** lessons, quiz results, exam attempts and identity-check answers.
- **Support requests:** what you send us through the contact, accessibility and "Got a problem?" forms, including an optional screenshot.

## Why we use it

- To run the course and issue your certificate.
- To report your completion to the state, three times a day.
- To answer your questions and fix problems.

We do not sell personal data.

## Who can see it

Only you and school staff can see your details. Payments are handled by the payment provider; we never see your full card number. Screenshots are kept in private storage.

## Your choices

You can ask to see, correct or delete your data through the [contact page](/contact). Some records must be kept for the state after you complete the course.$p$),

  ('en', 'refund-policy', $p$Refund policy$p$, $p$**Demo text, not legal advice.**

How much you get back depends on how long ago you paid and how far you have got in the course:

| When you ask | Refund |
| --- | --- |
| Within 7 days of purchase, and no lesson started | 100% |
| Within 7 days of purchase, lessons started, final exam not started | 50% |
| After 7 days, or once the final exam has started, or after a certificate was issued | 0% |

## How to ask for a refund

Sign in and send the request from your student portal. School staff review it, and an approved refund goes back to the card you paid with. When a refund is approved, your access to the course ends.

## Questions

If something is unclear, [contact us](/contact) before you start the final exam.$p$),

  ('en', 'school-rules', $p$School rules$p$, $p$**Demo text, not legal advice.**

These rules keep the course fair and help your certificate be accepted.

## Study in order

The course has 8 sections, and they open one after another:

1. Traffic Safety Fundamentals
2. Traffic Laws and Right-of-Way
3. Safe Driving Maneuvers and Roadway Control
4. Defensive Driving and Hazard Awareness
5. Collision Avoidance and Safety Techniques
6. Road Rage and Driving Distractions
7. Vehicle Requirements and Maintenance
8. Course Review and Final Steps

Each lesson has a minimum time. Time counts only while the page is open and you are active.

## Quizzes

Each section ends with a quiz. You need 70% to pass it, and you may retry as often as you like.

## Identity checks

During the course we ask a few questions about you, such as your date of birth. Two wrong answers in a row pause your enrollment until school staff review it.

## The final exam

- It opens after all 8 sections and the minimum time.
- It has 25 questions; you pass with 70% (18 correct).
- You have 2 attempts.
- Do it on your own: no other person, notes from others or outside help. The AI assistant is switched off during the exam.

## Access

You have 90 days from the day you enroll to finish.$p$),

  ('en', 'about', $p$About the school$p$, $p$We built a traffic school that people can take in the language they think in. The same California course is available in English, Japanese, Spanish and Russian, with lessons, quizzes and the final exam all in your language.

**This is a demo project, not a licensed school.** It shows how such a school could work. Do not use it to resolve a real traffic ticket.

## What we believe

- **Your language, your pace.** Read, pause and come back whenever you like within 90 days.
- **Plain explanations.** Each lesson explains the rule and why it keeps people safe.
- **Honest information.** Your court decides whether you may attend traffic school, and we say so.

## How it works

1. Find your court and check that you may attend traffic school.
2. Choose your course language and enroll.
3. Study the 8 sections and pass the final exam.
4. Download your certificate; we report your completion to the state.$p$),

  ('en', 'accessibility', $p$Accessibility$p$, $p$We want everyone to be able to take this course, whatever their abilities or devices.

## What we do

- Every page works with a keyboard alone, and focus is always visible.
- Text and controls meet colour-contrast guidelines in light and dark themes.
- Images carry text alternatives; decorative images are hidden from screen readers.
- The site works on phones, tablets and computers, and with browser zoom.
- Videos in the course will have captions.

## Known gaps

This is a demo. Some parts have not yet been tested with every screen reader. If you find a barrier, please tell us.

## Ask for an accommodation

If you need extra time, another format or other help to complete the course, use the form below. We reply by your preferred contact method.$p$),

  -- Japanese ------------------------------------------------------------------
  ('ja', 'terms', $p$利用規約$p$, $p$**デモ用の文章であり、法的助言ではありません。**

この規約は、このデモでのコースの仕組みを説明する例であり、契約を成立させるものではありません。

## アカウント

- 受講にはアカウントが必要です。パスワードは他人に知らせないでください。
- 入力する情報（法的氏名、生年月日、運転免許証番号）は正確で、ご本人のものである必要があります。これらは修了証明書に記載されます。
- これらの情報は最終試験の開始時にロックされます。その後はスクールのスタッフのみが、理由を記録したうえで変更できます。

## コース

- 申し込み日から90日間アクセスできます。
- 8つのセクションは順番に開放され、各レッスンには最低学習時間があります。
- 最終試験は25問で、70%以上で合格、受験は2回までです。

## 裁判所

トラフィックスクールを受講できるか、いつまでに修了すべきかを決めるのは裁判所だけです。申し込む前に裁判所の規則を確認してください。

## 支払いと返金

価格は米ドルで、安全な決済画面でお支払いいただきます。返金は[返金ポリシー](/refund-policy)に従います。

## 変更

この規約は更新されることがあります。最終更新日はこのページに表示されます。$p$),

  ('ja', 'privacy', $p$プライバシーポリシー$p$, $p$**デモ用の文章であり、法的助言ではありません。**

このページでは、デモが保存する個人データとその理由を説明します。

## 収集する情報

- **アカウント情報：** 氏名、メールアドレス、希望言語。
- **運転者情報：** 法的氏名、生年月日、運転免許証番号、裁判所、違反切符番号。修了証明書と修了報告に必要です。
- **学習の進捗：** レッスン、小テストの結果、試験の受験記録、本人確認の回答。
- **お問い合わせ：** お問い合わせ、アクセシビリティ、「問題がありましたか？」の各フォームで送られた内容（任意のスクリーンショットを含む）。

## 利用目的

- コースを提供し、修了証明書を発行するため。
- 1日3回、修了情報を州に報告するため。
- ご質問への回答や問題の解決のため。

個人データを販売することはありません。

## 閲覧できる人

あなたの情報を閲覧できるのは、あなたとスクールのスタッフだけです。支払いは決済事業者が処理し、カード番号の全桁を私たちが見ることはありません。スクリーンショットは非公開の保存領域に保管されます。

## あなたの選択

データの開示、訂正、削除は[お問い合わせページ](/contact)から依頼できます。一部の記録は、修了後も州のために保管する必要があります。$p$),

  ('ja', 'refund-policy', $p$返金ポリシー$p$, $p$**デモ用の文章であり、法的助言ではありません。**

返金額は、支払いからの日数とコースの進み具合によって決まります。

| 申請の時期 | 返金 |
| --- | --- |
| 購入から7日以内、レッスン未開始 | 100% |
| 購入から7日以内、レッスン開始済み、最終試験未開始 | 50% |
| 7日経過後、最終試験の開始後、または修了証明書の発行後 | 0% |

## 返金の申請方法

サインインして、受講者ポータルから申請してください。スクールのスタッフが確認し、承認された返金はお支払いに使ったカードに戻ります。返金が承認されると、コースへのアクセスは終了します。

## ご質問

不明な点があれば、最終試験を始める前に[お問い合わせ](/contact)ください。$p$),

  ('ja', 'about', $p$スクールについて$p$, $p$私たちは、自分が考える言語で受講できるトラフィックスクールを作りました。同じカリフォルニア州のコースを英語・日本語・スペイン語・ロシア語で提供し、レッスン、小テスト、最終試験のすべてをあなたの言語で受けられます。

**これはデモプロジェクトであり、認可されたスクールではありません。** このようなスクールがどう機能するかを示すものです。実際の違反切符の解決には使わないでください。

## 私たちの考え

- **あなたの言語で、あなたのペースで。** 90日間、いつでも読んで、中断して、再開できます。
- **わかりやすい説明。** 各レッスンでルールとそれが安全につながる理由を説明します。
- **正直な情報。** トラフィックスクールを受講できるかを決めるのは裁判所であることを、はっきりお伝えします。

## 受講の流れ

1. 裁判所を探し、トラフィックスクールを受講できるか確認します。
2. コースの言語を選んで申し込みます。
3. 8つのセクションを学び、最終試験に合格します。
4. 修了証明書をダウンロードします。修了情報は私たちが州に報告します。$p$),

  ('ja', 'school-rules', $p$スクールの規則$p$, $p$**デモ用の文章であり、法的助言ではありません。**

これらの規則は、コースを公平に保ち、修了証明書が受理されるためのものです。

## 順番に学ぶ

コースは8つのセクションで構成され、順番に開放されます。

1. 交通安全の基礎
2. 交通法規と優先通行権
3. 安全な運転操作と車両コントロール
4. 防衛運転と危険予測
5. 衝突回避と安全技術
6. あおり運転と運転中の注意散漫
7. 車両の要件と整備
8. コースの復習と最終ステップ

各レッスンには最低学習時間があります。時間はページを開いて操作している間だけ計測されます。

## 小テスト

各セクションの最後に小テストがあります。70%以上で合格で、何度でも再受験できます。

## 本人確認

コースの途中で、生年月日などご本人に関する質問をします。2回続けて誤答すると、スタッフが確認するまで受講が一時停止されます。

## 最終試験

- 8つのセクションと最低学習時間を終えると受験できます。
- 25問で、70%（18問正解）以上で合格です。
- 受験は2回までです。
- 必ず自分ひとりで受験してください。他人の助けや外部の支援は禁止です。試験中はAIアシスタントが使えません。

## アクセス期間

申し込み日から90日以内に修了してください。$p$),

  ('ja', 'accessibility', $p$アクセシビリティ$p$, $p$能力や使用する機器にかかわらず、誰もがこのコースを受講できることを目指しています。

## 取り組み

- すべてのページはキーボードだけで操作でき、フォーカスが常に見えます。
- ライトテーマとダークテーマの両方で、文字と操作部品が色のコントラスト基準を満たします。
- 画像には代替テキストがあり、装飾用の画像はスクリーンリーダーから隠されています。
- スマートフォン、タブレット、パソコン、ブラウザの拡大表示に対応しています。
- コースの動画には字幕を付ける予定です。

## 既知の課題

これはデモです。すべてのスクリーンリーダーでの確認はまだ済んでいません。利用しにくい点があればお知らせください。

## 配慮の申請

コースの修了に追加の時間や別の形式などの支援が必要な場合は、下のフォームをご利用ください。ご希望の連絡方法でお返事します。$p$),

  -- Spanish -------------------------------------------------------------------
  ('es', 'terms', $p$Términos de uso$p$, $p$**Texto de demostración, no es asesoría legal.**

Estos términos describen cómo funciona el curso en esta demo. Son solo un ejemplo y no crean un contrato.

## Tu cuenta

- Necesitas una cuenta para inscribirte. No compartas tu contraseña.
- Los datos que das (nombre legal, fecha de nacimiento y número de licencia de conducir) deben ser verdaderos y tuyos. Aparecen en tu certificado.
- Estos datos se bloquean al empezar el examen final. Después, solo el personal de la escuela puede cambiarlos, con un motivo registrado.

## El curso

- Tienes 90 días de acceso desde el día de inscripción.
- Las 8 secciones se abren en orden y cada lección tiene un tiempo mínimo.
- El examen final tiene 25 preguntas, se aprueba con 70% y permite 2 intentos.

## Tu tribunal

Solo tu tribunal decide si puedes asistir a la escuela de tránsito y hasta qué fecha. Revisa sus reglas antes de inscribirte.

## Pagos y reembolsos

Los precios están en dólares estadounidenses y se pagan en una página de pago segura. Los reembolsos siguen la [política de reembolsos](/refund-policy).

## Cambios

Podemos actualizar estos términos. La fecha del último cambio aparece en esta página.$p$),

  ('es', 'privacy', $p$Política de privacidad$p$, $p$**Texto de demostración, no es asesoría legal.**

Esta página explica qué datos personales guarda la demo y por qué.

## Qué recopilamos

- **Datos de la cuenta:** nombre, correo e idioma preferido.
- **Datos del conductor:** nombre legal, fecha de nacimiento, número de licencia, tribunal y número de multa. Son necesarios para tu certificado y el reporte de finalización.
- **Progreso del curso:** lecciones, resultados de cuestionarios, intentos de examen y respuestas de verificación de identidad.
- **Solicitudes de ayuda:** lo que nos envías con los formularios de contacto, accesibilidad y "¿Tienes un problema?", incluida una captura opcional.

## Para qué lo usamos

- Para ofrecer el curso y emitir tu certificado.
- Para reportar tu finalización al estado, tres veces al día.
- Para responder tus preguntas y resolver problemas.

No vendemos datos personales.

## Quién puede verlo

Solo tú y el personal de la escuela pueden ver tus datos. Los pagos los procesa el proveedor de pagos; nunca vemos el número completo de tu tarjeta. Las capturas se guardan en un almacenamiento privado.

## Tus opciones

Puedes pedir ver, corregir o borrar tus datos en la [página de contacto](/contact). Algunos registros deben conservarse para el estado después de terminar el curso.$p$),

  ('es', 'refund-policy', $p$Política de reembolsos$p$, $p$**Texto de demostración, no es asesoría legal.**

Lo que recibes depende de cuánto tiempo pasó desde el pago y de cuánto avanzaste en el curso:

| Cuándo lo pides | Reembolso |
| --- | --- |
| Dentro de 7 días de la compra y sin lecciones iniciadas | 100% |
| Dentro de 7 días de la compra, con lecciones iniciadas y sin empezar el examen final | 50% |
| Después de 7 días, o una vez iniciado el examen final, o tras emitirse un certificado | 0% |

## Cómo pedir un reembolso

Inicia sesión y envía la solicitud desde tu portal de estudiante. El personal de la escuela la revisa, y el reembolso aprobado vuelve a la tarjeta con la que pagaste. Cuando se aprueba un reembolso, termina tu acceso al curso.

## Preguntas

Si algo no está claro, [contáctanos](/contact) antes de empezar el examen final.$p$),

  ('es', 'school-rules', $p$Reglas de la escuela$p$, $p$**Texto de demostración, no es asesoría legal.**

Estas reglas mantienen el curso justo y ayudan a que tu certificado sea aceptado.

## Estudia en orden

El curso tiene 8 secciones que se abren una tras otra:

1. Fundamentos de seguridad vial
2. Leyes de tránsito y derecho de paso
3. Maniobras de conducción segura y control en la vía
4. Manejo defensivo y percepción de riesgos
5. Prevención de choques y técnicas de seguridad
6. Agresividad al volante y distracciones
7. Requisitos y mantenimiento del vehículo
8. Repaso del curso y pasos finales

Cada lección tiene un tiempo mínimo. El tiempo solo cuenta mientras la página está abierta y estás activo.

## Cuestionarios

Cada sección termina con un cuestionario. Necesitas 70% para aprobarlo y puedes repetirlo cuantas veces quieras.

## Verificación de identidad

Durante el curso te hacemos algunas preguntas sobre ti, como tu fecha de nacimiento. Dos respuestas incorrectas seguidas pausan tu inscripción hasta que el personal la revise.

## El examen final

- Se abre después de las 8 secciones y del tiempo mínimo.
- Tiene 25 preguntas; apruebas con 70% (18 correctas).
- Tienes 2 intentos.
- Hazlo por tu cuenta: sin otra persona ni ayuda externa. El asistente de IA está apagado durante el examen.

## Acceso

Tienes 90 días desde la inscripción para terminar.$p$),

  ('es', 'about', $p$Sobre la escuela$p$, $p$Creamos una escuela de tránsito que se puede tomar en el idioma en el que piensas. El mismo curso de California está disponible en inglés, japonés, español y ruso, con lecciones, cuestionarios y examen final en tu idioma.

**Este es un proyecto de demostración, no una escuela con licencia.** Muestra cómo podría funcionar una escuela así. No lo uses para resolver una multa real.

## En qué creemos

- **Tu idioma, tu ritmo.** Lee, pausa y vuelve cuando quieras durante 90 días.
- **Explicaciones claras.** Cada lección explica la regla y por qué protege a las personas.
- **Información honesta.** Tu tribunal decide si puedes asistir a la escuela de tránsito, y te lo decimos.

## Cómo funciona

1. Busca tu tribunal y confirma que puedes asistir a la escuela de tránsito.
2. Elige el idioma del curso e inscríbete.
3. Estudia las 8 secciones y aprueba el examen final.
4. Descarga tu certificado; nosotros reportamos tu finalización al estado.$p$),

  ('es', 'accessibility', $p$Accesibilidad$p$, $p$Queremos que todas las personas puedan tomar este curso, sin importar sus capacidades o dispositivos.

## Lo que hacemos

- Todas las páginas funcionan solo con teclado y el foco siempre es visible.
- Los textos y controles cumplen las pautas de contraste en los temas claro y oscuro.
- Las imágenes tienen texto alternativo; las decorativas se ocultan a los lectores de pantalla.
- El sitio funciona en teléfonos, tabletas y computadoras, y con el zoom del navegador.
- Los videos del curso tendrán subtítulos.

## Limitaciones conocidas

Esta es una demo. Algunas partes aún no se han probado con todos los lectores de pantalla. Si encuentras una barrera, avísanos.

## Pide una adaptación

Si necesitas más tiempo, otro formato u otra ayuda para completar el curso, usa el formulario de abajo. Te respondemos por el medio de contacto que prefieras.$p$),

  -- Russian (no school-rules row: it falls back to English) -------------------
  ('ru', 'terms', $p$Условия использования$p$, $p$**Демонстрационный текст, не юридическая консультация.**

Эти условия описывают, как работает курс в этом демо. Это лишь пример, и он не создаёт договора.

## Ваш аккаунт

- Для записи нужен аккаунт. Никому не сообщайте пароль.
- Указанные данные (юридическое имя, дата рождения и номер водительского удостоверения) должны быть верными и принадлежать вам. Они указываются в сертификате.
- Эти данные блокируются при начале итогового экзамена. После этого изменить их может только сотрудник школы с указанием причины.

## Курс

- Доступ — 90 дней со дня записи.
- 8 разделов открываются по порядку, у каждого урока есть минимальное время.
- Итоговый экзамен: 25 вопросов, проходной балл 70%, 2 попытки.

## Ваш суд

Только суд решает, можно ли вам пройти дорожную школу и к какому сроку. Проверьте правила суда до записи.

## Оплата и возвраты

Цены указаны в долларах США, оплата проходит на защищённой странице. Возвраты — по [политике возврата](/refund-policy).

## Изменения

Мы можем обновлять эти условия. Дата последнего изменения указана на этой странице.$p$),

  ('ru', 'privacy', $p$Политика конфиденциальности$p$, $p$**Демонстрационный текст, не юридическая консультация.**

На этой странице объясняется, какие персональные данные хранит демо и зачем.

## Что мы собираем

- **Данные аккаунта:** имя, email и предпочитаемый язык.
- **Данные водителя:** юридическое имя, дата рождения, номер удостоверения, суд и номер штрафа. Они нужны для сертификата и отчёта о прохождении.
- **Прогресс:** уроки, результаты тестов, попытки экзамена и ответы на проверки личности.
- **Обращения:** то, что вы отправляете через формы связи, доступности и «Есть проблема?», включая необязательный снимок экрана.

## Зачем мы их используем

- Чтобы проводить курс и выдать сертификат.
- Чтобы сообщать о прохождении в штат три раза в день.
- Чтобы отвечать на вопросы и решать проблемы.

Мы не продаём персональные данные.

## Кто их видит

Ваши данные видите только вы и сотрудники школы. Платежи обрабатывает платёжный провайдер; полный номер карты мы не видим. Снимки экрана хранятся в закрытом хранилище.

## Ваш выбор

Вы можете запросить просмотр, исправление или удаление данных через [страницу контактов](/contact). Некоторые записи нужно хранить для штата и после окончания курса.$p$),

  ('ru', 'refund-policy', $p$Политика возврата$p$, $p$**Демонстрационный текст, не юридическая консультация.**

Сумма возврата зависит от того, сколько времени прошло после оплаты и насколько вы продвинулись в курсе:

| Когда вы обращаетесь | Возврат |
| --- | --- |
| В течение 7 дней после покупки, ни один урок не начат | 100% |
| В течение 7 дней после покупки, уроки начаты, итоговый экзамен не начат | 50% |
| Через 7 дней и позже, или после начала итогового экзамена, или после выдачи сертификата | 0% |

## Как запросить возврат

Войдите и отправьте запрос из личного кабинета. Сотрудники школы рассмотрят его, и одобренный возврат вернётся на карту, которой вы платили. После одобрения возврата доступ к курсу прекращается.

## Вопросы

Если что-то непонятно, [напишите нам](/contact) до начала итогового экзамена.$p$),

  ('ru', 'about', $p$О школе$p$, $p$Мы сделали дорожную школу, которую можно пройти на языке, на котором вы думаете. Один и тот же калифорнийский курс доступен на английском, японском, испанском и русском — уроки, тесты и итоговый экзамен на вашем языке.

**Это демонстрационный проект, а не лицензированная школа.** Он показывает, как могла бы работать такая школа. Не используйте его для решения реального штрафа.

## Во что мы верим

- **Ваш язык, ваш темп.** Читайте, делайте паузы и возвращайтесь когда угодно в течение 90 дней.
- **Понятные объяснения.** Каждый урок объясняет правило и то, как оно защищает людей.
- **Честная информация.** Решение о дорожной школе принимает суд, и мы говорим об этом прямо.

## Как это работает

1. Найдите свой суд и убедитесь, что вам можно пройти дорожную школу.
2. Выберите язык курса и запишитесь.
3. Пройдите 8 разделов и сдайте итоговый экзамен.
4. Скачайте сертификат; о прохождении мы сообщим в штат.$p$),

  ('ru', 'accessibility', $p$Доступность$p$, $p$Мы хотим, чтобы каждый мог пройти этот курс, независимо от возможностей и устройства.

## Что мы делаем

- Каждой страницей можно пользоваться только с клавиатуры, фокус всегда виден.
- Текст и элементы управления соответствуют требованиям к контрасту в светлой и тёмной темах.
- У изображений есть текстовые описания; декоративные скрыты от экранных дикторов.
- Сайт работает на телефонах, планшетах и компьютерах, а также при увеличении масштаба.
- У видео в курсе будут субтитры.

## Известные ограничения

Это демо. Некоторые части ещё не проверены со всеми экранными дикторами. Если вы столкнулись с барьером, сообщите нам.

## Запросить адаптацию

Если вам нужно больше времени, другой формат или другая помощь, воспользуйтесь формой ниже. Мы ответим удобным для вас способом.$p$)
) as v (locale, slug, title, body);
