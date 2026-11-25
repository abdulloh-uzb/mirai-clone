-- Original FAQ content for the public site (ticket 03): 36 questions in 10 categories,
-- 4 of them featured (shown on the home page). Facts follow spec.md: 8 sections,
-- 25-question final exam, 70% to pass, 2 attempts, 90 days of access, refund tiers,
-- 3 DMV report batches a day. The school is never named here; copy says "we".

insert into public.faq_items (locale, slug, category, featured, position, title, body, published) select
  v.locale, v.slug, v.category, v.featured, v.position, v.title, v.body, true
from (values
  ('en', 'what-is-this-school', 'about', false, 1, $q$What is this school?$q$, $q$We are an online traffic violator school. If you received a traffic ticket in California, you can take our self-paced course so the court may hide the violation point from your record, if the court allows it.$q$),
  ('en', 'is-this-a-real-school', 'about', false, 2, $q$Is this a real, licensed school?$q$, $q$No. This is a demo project and not a licensed school. Names, prices and court details are examples only. Do not use it to resolve a real ticket.$q$),
  ('en', 'how-does-it-work', 'about', false, 3, $q$How does it work, step by step?$q$, $q$1. Choose your county and course language.
2. Pay at checkout.
3. Study the 8 sections at your own pace.
4. Pass the final exam.
5. Get your certificate; we report your completion to the state.$q$),
  ('en', 'where-do-i-start', 'about', false, 4, $q$Where do I start?$q$, $q$Find your county on the courts page to see how to ask the court for traffic school, then choose a course language and enroll. You can sign up before you pay.$q$),
  ('en', 'how-many-sections', 'course', false, 1, $q$How many sections does the course have?$q$, $q$The course has 8 sections. Each one ends with a short quiz, and you must finish them in order.$q$),
  ('en', 'can-i-go-at-my-own-pace', 'course', false, 2, $q$Can I study at my own pace?$q$, $q$Yes. Stop and continue whenever you like; we save your place. Some sections have a minimum time before you can move on, so you cannot skip ahead.$q$),
  ('en', 'how-long-do-i-have', 'course', true, 3, $q$How long do I have to finish?$q$, $q$You have 90 days of access from the day you enroll. Plan your time so you can pass the final exam before access ends.$q$),
  ('en', 'can-i-retake-section-quizzes', 'course', false, 4, $q$Can I retake section quizzes?$q$, $q$Yes. Section quizzes can be retried as many times as you need. Only the final exam has a limit on attempts.$q$),
  ('en', 'how-many-questions-final-exam', 'exam', true, 1, $q$How many questions are on the final exam?$q$, $q$The final exam has 25 questions. You see your result as soon as you submit.$q$),
  ('en', 'what-is-the-passing-score', 'exam', false, 2, $q$What score do I need to pass?$q$, $q$You need 70%, which means at least 18 of the 25 questions correct.$q$),
  ('en', 'how-many-exam-attempts', 'exam', false, 3, $q$How many times can I take the final exam?$q$, $q$You have 2 attempts at the final exam. Review the sections before you start it.$q$),
  ('en', 'is-the-ai-assistant-on-during-the-exam', 'exam', false, 4, $q$Can I use the AI assistant during the exam?$q$, $q$No. The AI assistant is switched off while a final exam is in progress. It also has no access to the exam questions.$q$),
  ('en', 'when-do-i-get-my-certificate', 'certificates', true, 1, $q$When do I get my certificate?$q$, $q$Right after you pass the final exam. You can download your certificate from your student portal.$q$),
  ('en', 'how-is-my-completion-reported', 'certificates', false, 2, $q$How is my completion reported to the state?$q$, $q$We send completions to the state in 3 batches a day, at 09:00, 13:00 and 17:00 Pacific time. Your court is notified through that report.$q$),
  ('en', 'how-do-i-download-my-certificate', 'certificates', false, 3, $q$How do I download my certificate?$q$, $q$Sign in, open your student portal and choose the certificate. It downloads as a PDF you can print or keep.$q$),
  ('en', 'what-if-my-name-on-the-certificate-is-wrong', 'certificates', false, 4, $q$What if my details on the certificate are wrong?$q$, $q$Your legal name, date of birth and license number are locked when you start the final exam. After that only school staff can change them, and a reason is required. Check them carefully before you begin.$q$),
  ('en', 'how-much-does-the-course-cost', 'payments', false, 1, $q$How much does the course cost?$q$, $q$The online course costs $24.99, down from a list price of $34.99. There are no hidden fees.$q$),
  ('en', 'what-is-the-refund-policy', 'payments', true, 2, $q$What is the refund policy?$q$, $q$Within 7 days of purchase:

- **100% refund** if you have not started any lesson.
- **50% refund** if you started lessons but not the final exam.

No refund after 7 days, once the final exam has started, or after a certificate was issued.$q$),
  ('en', 'how-do-i-pay', 'payments', false, 3, $q$How do I pay?$q$, $q$You pay by card on a secure hosted checkout page. We never see or store your card number.$q$),
  ('en', 'when-do-i-get-access-after-paying', 'payments', false, 4, $q$When do I get access after paying?$q$, $q$Usually within a few seconds. After checkout your portal checks for your new enrollment. If it is not there after a minute, contact us.$q$),
  ('en', 'am-i-eligible', 'eligibility', false, 1, $q$Am I eligible for traffic school?$q$, $q$That is up to the court that handles your ticket. Check your citation or ask the court clerk. We cannot promise that your court will accept the course.$q$),
  ('en', 'do-i-need-court-permission', 'eligibility', false, 2, $q$Do I need the court's permission first?$q$, $q$Usually yes. Ask your court to allow traffic school and note your due date. Finish the course and the reporting before that date.$q$),
  ('en', 'how-much-time-before-my-due-date', 'eligibility', false, 3, $q$How early should I start before my due date?$q$, $q$Start as soon as you can. Allow time for the final exam and for the next report batch to reach the state before your court due date.$q$),
  ('en', 'which-languages-are-available', 'language', false, 1, $q$Which languages can I study in?$q$, $q$The course is available in English, Japanese, Spanish and Russian. The site itself is also shown in these four languages.$q$),
  ('en', 'can-i-change-my-course-language', 'language', false, 2, $q$Can I change my course language later?$q$, $q$No. You choose the course language before you pay and it is fixed after that. Pick the language you read best.$q$),
  ('en', 'site-language-vs-course-language', 'language', false, 3, $q$Is the site language the same as the course language?$q$, $q$Not necessarily. You can switch the site language at any time. The course language is chosen once, before payment.$q$),
  ('en', 'what-can-the-ai-assistant-do', 'ai', false, 1, $q$What can the AI assistant do?$q$, $q$It is an educational helper. It can explain ideas from the course in simple words. It cannot give legal advice or promise what your court will do.$q$),
  ('en', 'can-the-ai-give-exam-answers', 'ai', false, 2, $q$Can the AI assistant tell me the exam answers?$q$, $q$No. It has no access to the question bank, and it is switched off during the final exam.$q$),
  ('en', 'is-the-ai-always-right', 'ai', false, 3, $q$Is the AI assistant always right?$q$, $q$No. It can make mistakes. For anything that matters, such as dates or court rules, check the course text or ask your court.$q$),
  ('en', 'is-a-classroom-course-available', 'classroom', false, 1, $q$Is there a classroom course?$q$, $q$Not yet. The classroom option ($124.99) is waitlist only. Join the waitlist with your email and county and we will tell you when it opens.$q$),
  ('en', 'how-do-i-join-the-classroom-waitlist', 'classroom', false, 2, $q$How do I join the classroom waitlist?$q$, $q$Use the waitlist card on the courses page. Enter your email and choose your county. We do not send other emails.$q$),
  ('en', 'why-choose-online-over-classroom', 'classroom', false, 3, $q$Why would I choose online over a classroom?$q$, $q$Online is cheaper, you can study at any hour from any device, and you can pick one of four languages.$q$),
  ('en', 'how-do-i-contact-the-school', 'contact', false, 1, $q$How do I contact the school?$q$, $q$Use the contact page to send us a message. We reply by email.$q$),
  ('en', 'how-do-i-reset-my-password', 'contact', false, 2, $q$How do I reset my password?$q$, $q$On the sign-in page choose "Forgot password" and enter your email. We send a link to set a new password. Check your spam folder if it does not arrive.$q$),
  ('en', 'i-have-a-problem-with-my-course', 'contact', false, 3, $q$I have a problem with my course. What do I do?$q$, $q$Use the "Got a problem?" form and tell us what happened, with screenshots if you can. We will look into it.$q$),
  ('en', 'how-do-i-ask-for-accessibility-help', 'contact', false, 4, $q$How do I ask for accessibility help?$q$, $q$Send an accommodation request from the accessibility page. Tell us what help you need and how to reach you.$q$)
) as v(locale, slug, category, featured, position, title, body);

-- TODO(review): a native ja speaker must review the ja rows before launch.
insert into public.faq_items (locale, slug, category, featured, position, title, body, published) select
  v.locale, v.slug, v.category, v.featured, v.position, v.title, v.body, true
from (values
  ('ja', 'what-is-this-school', 'about', false, 1, $q$この学校は何ですか?$q$, $q$私たちはオンラインの交通違反者講習校です。カリフォルニア州で交通違反の切符を受け取った方が、自分のペースで受講できるコースを提供しています。裁判所が認めれば、違反点数が記録上で非表示になる場合があります。$q$),
  ('ja', 'is-this-a-real-school', 'about', false, 2, $q$これは本物の認可校ですか?$q$, $q$いいえ。これはデモプロジェクトであり、認可を受けた学校ではありません。名称、料金、裁判所の情報はすべて例です。実際の違反の手続きには使用しないでください。$q$),
  ('ja', 'how-does-it-work', 'about', false, 3, $q$どのような流れで進みますか?$q$, $q$1. 郡とコースの言語を選びます。
2. 支払いをします。
3. 8つのセクションを自分のペースで学びます。
4. 最終試験に合格します。
5. 修了証を受け取り、完了は州に報告されます。$q$),
  ('ja', 'where-do-i-start', 'about', false, 4, $q$どこから始めればよいですか?$q$, $q$裁判所のページで郡を探し、交通講習の申請方法を確認してから、コースの言語を選んで登録します。支払い前にアカウントを作成できます。$q$),
  ('ja', 'how-many-sections', 'course', false, 1, $q$コースは何セクションありますか?$q$, $q$コースは8つのセクションで構成され、各セクションの最後に短いクイズがあります。順番に進める必要があります。$q$),
  ('ja', 'can-i-go-at-my-own-pace', 'course', false, 2, $q$自分のペースで学べますか?$q$, $q$はい。いつでも中断して再開でき、進捗は保存されます。一部のセクションには次に進むまでの最短時間があり、飛ばすことはできません。$q$),
  ('ja', 'how-long-do-i-have', 'course', true, 3, $q$修了までの期間はどれくらいですか?$q$, $q$登録日から90日間アクセスできます。アクセスが終了する前に最終試験に合格できるよう、計画を立ててください。$q$),
  ('ja', 'can-i-retake-section-quizzes', 'course', false, 4, $q$セクションのクイズは再受験できますか?$q$, $q$はい。セクションのクイズは何度でもやり直せます。回数に制限があるのは最終試験だけです。$q$),
  ('ja', 'how-many-questions-final-exam', 'exam', true, 1, $q$最終試験は何問ですか?$q$, $q$最終試験は25問です。提出するとすぐに結果が表示されます。$q$),
  ('ja', 'what-is-the-passing-score', 'exam', false, 2, $q$合格に必要な点数は?$q$, $q$70%以上、つまり25問中18問以上の正解が必要です。$q$),
  ('ja', 'how-many-exam-attempts', 'exam', false, 3, $q$最終試験は何回受けられますか?$q$, $q$最終試験は2回まで受験できます。開始する前にセクションを復習してください。$q$),
  ('ja', 'is-the-ai-assistant-on-during-the-exam', 'exam', false, 4, $q$試験中にAIアシスタントを使えますか?$q$, $q$いいえ。最終試験の進行中はAIアシスタントがオフになります。また、AIは試験問題にアクセスできません。$q$),
  ('ja', 'when-do-i-get-my-certificate', 'certificates', true, 1, $q$修了証はいつ受け取れますか?$q$, $q$最終試験に合格するとすぐに発行されます。学生ポータルからダウンロードできます。$q$),
  ('ja', 'how-is-my-completion-reported', 'certificates', false, 2, $q$修了はどのように州に報告されますか?$q$, $q$修了情報は1日3回、太平洋時間の9:00、13:00、17:00にまとめて州に送信されます。裁判所への通知はこの報告で行われます。$q$),
  ('ja', 'how-do-i-download-my-certificate', 'certificates', false, 3, $q$修了証をダウンロードするには?$q$, $q$サインインして学生ポータルを開き、修了証を選択します。印刷や保管ができるPDFとしてダウンロードされます。$q$),
  ('ja', 'what-if-my-name-on-the-certificate-is-wrong', 'certificates', false, 4, $q$修了証の情報が間違っていたら?$q$, $q$法的な氏名、生年月日、運転免許番号は最終試験を開始すると固定されます。その後はスタッフのみが理由を付けて変更できます。開始前によく確認してください。$q$),
  ('ja', 'how-much-does-the-course-cost', 'payments', false, 1, $q$コースの料金は?$q$, $q$オンラインコースは定価$34.99のところ$24.99です。隠れた手数料はありません。$q$),
  ('ja', 'what-is-the-refund-policy', 'payments', true, 2, $q$返金ポリシーは?$q$, $q$購入から7日以内:

- **全額返金**: レッスンをまだ始めていない場合。
- **50%返金**: レッスンを始めたが最終試験は開始していない場合。

7日を過ぎた場合、最終試験を開始した場合、または修了証が発行された後は返金できません。$q$),
  ('ja', 'how-do-i-pay', 'payments', false, 3, $q$支払い方法は?$q$, $q$安全なホスト型のチェックアウトページでカード決済します。カード番号が当校に表示・保存されることはありません。$q$),
  ('ja', 'when-do-i-get-access-after-paying', 'payments', false, 4, $q$支払い後、いつアクセスできますか?$q$, $q$通常は数秒以内です。決済後、ポータルが新しい登録を確認します。1分経っても表示されない場合はご連絡ください。$q$),
  ('ja', 'am-i-eligible', 'eligibility', false, 1, $q$自分は受講資格がありますか?$q$, $q$違反を扱う裁判所が決定します。違反切符を確認するか、裁判所の窓口に問い合わせてください。裁判所がコースを受け入れることを当校が保証することはできません。$q$),
  ('ja', 'do-i-need-court-permission', 'eligibility', false, 2, $q$先に裁判所の許可が必要ですか?$q$, $q$通常は必要です。裁判所に交通講習の許可を依頼し、期限日を控えておいてください。その日までにコースの修了と報告を済ませましょう。$q$),
  ('ja', 'how-much-time-before-my-due-date', 'eligibility', false, 3, $q$期限日のどれくらい前に始めるべきですか?$q$, $q$できるだけ早く始めてください。最終試験の時間と、次の報告が州に届くまでの時間を、裁判所の期限日までに見込んでおきましょう。$q$),
  ('ja', 'which-languages-are-available', 'language', false, 1, $q$どの言語で学べますか?$q$, $q$コースは英語、日本語、スペイン語、ロシア語で受講できます。サイト自体もこの4言語で表示されます。$q$),
  ('ja', 'can-i-change-my-course-language', 'language', false, 2, $q$コースの言語は後で変更できますか?$q$, $q$いいえ。コースの言語は支払い前に選び、その後は変更できません。最も読みやすい言語を選んでください。$q$),
  ('ja', 'site-language-vs-course-language', 'language', false, 3, $q$サイトの言語とコースの言語は同じですか?$q$, $q$必ずしも同じではありません。サイトの言語はいつでも切り替えられますが、コースの言語は支払い前に一度だけ選びます。$q$),
  ('ja', 'what-can-the-ai-assistant-do', 'ai', false, 1, $q$AIアシスタントは何ができますか?$q$, $q$学習を助けるアシスタントです。コースの内容をやさしい言葉で説明できます。法的助言や、裁判所の判断の約束はできません。$q$),
  ('ja', 'can-the-ai-give-exam-answers', 'ai', false, 2, $q$AIは試験の答えを教えてくれますか?$q$, $q$いいえ。AIは問題バンクにアクセスできず、最終試験中はオフになります。$q$),
  ('ja', 'is-the-ai-always-right', 'ai', false, 3, $q$AIアシスタントの回答は常に正しいですか?$q$, $q$いいえ。間違えることがあります。日付や裁判所の規則など重要なことは、コースの本文で確認するか、裁判所に問い合わせてください。$q$),
  ('ja', 'is-a-classroom-course-available', 'classroom', false, 1, $q$教室での講習はありますか?$q$, $q$まだありません。教室コース($124.99)はキャンセル待ちのみです。メールアドレスと郡を登録すると、開講時にお知らせします。$q$),
  ('ja', 'how-do-i-join-the-classroom-waitlist', 'classroom', false, 2, $q$教室コースのキャンセル待ちに登録するには?$q$, $q$コースのページにあるキャンセル待ちカードを使い、メールアドレスを入力して郡を選びます。それ以外のメールは送りません。$q$),
  ('ja', 'why-choose-online-over-classroom', 'classroom', false, 3, $q$教室よりオンラインを選ぶ理由は?$q$, $q$オンラインのほうが安く、どの端末からでも好きな時間に学べ、4つの言語から選べます。$q$),
  ('ja', 'how-do-i-contact-the-school', 'contact', false, 1, $q$学校への連絡方法は?$q$, $q$お問い合わせページからメッセージを送ってください。返信はメールで行います。$q$),
  ('ja', 'how-do-i-reset-my-password', 'contact', false, 2, $q$パスワードをリセットするには?$q$, $q$サインインページで「パスワードをお忘れですか」を選び、メールアドレスを入力します。新しいパスワードを設定するリンクが届きます。届かない場合は迷惑メールフォルダを確認してください。$q$),
  ('ja', 'i-have-a-problem-with-my-course', 'contact', false, 3, $q$コースに問題があります。どうすればよいですか?$q$, $q$「問題が発生しましたか?」フォームで状況をお知らせください。可能であればスクリーンショットも添付してください。調査いたします。$q$),
  ('ja', 'how-do-i-ask-for-accessibility-help', 'contact', false, 4, $q$アクセシビリティの支援を依頼するには?$q$, $q$アクセシビリティのページから配慮の依頼を送ってください。必要な支援と連絡方法をお知らせください。$q$)
) as v(locale, slug, category, featured, position, title, body);

-- TODO(review): a native es speaker must review the es rows before launch.
insert into public.faq_items (locale, slug, category, featured, position, title, body, published) select
  v.locale, v.slug, v.category, v.featured, v.position, v.title, v.body, true
from (values
  ('es', 'what-is-this-school', 'about', false, 1, $q$¿Qué es esta escuela?$q$, $q$Somos una escuela de tráfico en línea. Si recibió una multa de tránsito en California, puede tomar nuestro curso a su propio ritmo para que el tribunal pueda ocultar el punto de la infracción, si el tribunal lo permite.$q$),
  ('es', 'is-this-a-real-school', 'about', false, 2, $q$¿Es una escuela real y autorizada?$q$, $q$No. Este es un proyecto de demostración y no una escuela autorizada. Los nombres, precios y datos de los tribunales son solo ejemplos. No lo use para resolver una multa real.$q$),
  ('es', 'how-does-it-work', 'about', false, 3, $q$¿Cómo funciona, paso a paso?$q$, $q$1. Elija su condado y el idioma del curso.
2. Pague en el proceso de compra.
3. Estudie las 8 secciones a su ritmo.
4. Apruebe el examen final.
5. Reciba su certificado; informamos su finalización al estado.$q$),
  ('es', 'where-do-i-start', 'about', false, 4, $q$¿Por dónde empiezo?$q$, $q$Busque su condado en la página de tribunales para ver cómo pedir la escuela de tráfico al tribunal; luego elija el idioma del curso e inscríbase. Puede registrarse antes de pagar.$q$),
  ('es', 'how-many-sections', 'course', false, 1, $q$¿Cuántas secciones tiene el curso?$q$, $q$El curso tiene 8 secciones. Cada una termina con un cuestionario corto y debe completarlas en orden.$q$),
  ('es', 'can-i-go-at-my-own-pace', 'course', false, 2, $q$¿Puedo estudiar a mi propio ritmo?$q$, $q$Sí. Puede parar y continuar cuando quiera; guardamos su avance. Algunas secciones tienen un tiempo mínimo antes de avanzar, por lo que no se pueden saltar.$q$),
  ('es', 'how-long-do-i-have', 'course', true, 3, $q$¿Cuánto tiempo tengo para terminar?$q$, $q$Tiene 90 días de acceso desde el día de su inscripción. Organice su tiempo para aprobar el examen final antes de que termine el acceso.$q$),
  ('es', 'can-i-retake-section-quizzes', 'course', false, 4, $q$¿Puedo repetir los cuestionarios de sección?$q$, $q$Sí. Puede repetir los cuestionarios de sección tantas veces como necesite. Solo el examen final tiene un límite de intentos.$q$),
  ('es', 'how-many-questions-final-exam', 'exam', true, 1, $q$¿Cuántas preguntas tiene el examen final?$q$, $q$El examen final tiene 25 preguntas. Verá su resultado en cuanto lo envíe.$q$),
  ('es', 'what-is-the-passing-score', 'exam', false, 2, $q$¿Qué puntaje necesito para aprobar?$q$, $q$Necesita el 70 %, es decir, al menos 18 de las 25 preguntas correctas.$q$),
  ('es', 'how-many-exam-attempts', 'exam', false, 3, $q$¿Cuántas veces puedo hacer el examen final?$q$, $q$Tiene 2 intentos para el examen final. Repase las secciones antes de empezar.$q$),
  ('es', 'is-the-ai-assistant-on-during-the-exam', 'exam', false, 4, $q$¿Puedo usar el asistente de IA durante el examen?$q$, $q$No. El asistente de IA se desactiva mientras hay un examen final en curso. Además, no tiene acceso a las preguntas del examen.$q$),
  ('es', 'when-do-i-get-my-certificate', 'certificates', true, 1, $q$¿Cuándo recibo mi certificado?$q$, $q$Justo después de aprobar el examen final. Puede descargar su certificado desde su portal de estudiante.$q$),
  ('es', 'how-is-my-completion-reported', 'certificates', false, 2, $q$¿Cómo se informa mi finalización al estado?$q$, $q$Enviamos las finalizaciones al estado en 3 lotes al día, a las 09:00, 13:00 y 17:00 hora del Pacífico. Su tribunal recibe la notificación mediante ese informe.$q$),
  ('es', 'how-do-i-download-my-certificate', 'certificates', false, 3, $q$¿Cómo descargo mi certificado?$q$, $q$Inicie sesión, abra su portal de estudiante y elija el certificado. Se descarga como PDF para imprimir o guardar.$q$),
  ('es', 'what-if-my-name-on-the-certificate-is-wrong', 'certificates', false, 4, $q$¿Qué pasa si mis datos en el certificado son incorrectos?$q$, $q$Su nombre legal, fecha de nacimiento y número de licencia se bloquean al iniciar el examen final. Después, solo el personal puede cambiarlos y se exige un motivo. Revíselos bien antes de empezar.$q$),
  ('es', 'how-much-does-the-course-cost', 'payments', false, 1, $q$¿Cuánto cuesta el curso?$q$, $q$El curso en línea cuesta $24.99, en lugar del precio de lista de $34.99. No hay cargos ocultos.$q$),
  ('es', 'what-is-the-refund-policy', 'payments', true, 2, $q$¿Cuál es la política de reembolso?$q$, $q$Dentro de los 7 días posteriores a la compra:

- **Reembolso del 100 %** si no ha iniciado ninguna lección.
- **Reembolso del 50 %** si inició lecciones pero no el examen final.

No hay reembolso después de 7 días, una vez iniciado el examen final o tras emitirse un certificado.$q$),
  ('es', 'how-do-i-pay', 'payments', false, 3, $q$¿Cómo pago?$q$, $q$Paga con tarjeta en una página de pago segura y alojada por un tercero. Nunca vemos ni guardamos el número de su tarjeta.$q$),
  ('es', 'when-do-i-get-access-after-paying', 'payments', false, 4, $q$¿Cuándo tengo acceso después de pagar?$q$, $q$Normalmente en unos segundos. Tras el pago, su portal busca su nueva inscripción. Si no aparece después de un minuto, contáctenos.$q$),
  ('es', 'am-i-eligible', 'eligibility', false, 1, $q$¿Soy elegible para la escuela de tráfico?$q$, $q$Lo decide el tribunal que maneja su multa. Revise su citación o pregunte al secretario del tribunal. No podemos garantizar que su tribunal acepte el curso.$q$),
  ('es', 'do-i-need-court-permission', 'eligibility', false, 2, $q$¿Necesito el permiso del tribunal primero?$q$, $q$Normalmente sí. Pida al tribunal que permita la escuela de tráfico y anote su fecha límite. Termine el curso y el informe antes de esa fecha.$q$),
  ('es', 'how-much-time-before-my-due-date', 'eligibility', false, 3, $q$¿Con cuánta anticipación debo empezar antes de mi fecha límite?$q$, $q$Empiece cuanto antes. Deje tiempo para el examen final y para que el siguiente lote de informes llegue al estado antes de la fecha límite de su tribunal.$q$),
  ('es', 'which-languages-are-available', 'language', false, 1, $q$¿En qué idiomas puedo estudiar?$q$, $q$El curso está disponible en inglés, japonés, español y ruso. El sitio también se muestra en estos cuatro idiomas.$q$),
  ('es', 'can-i-change-my-course-language', 'language', false, 2, $q$¿Puedo cambiar el idioma del curso más tarde?$q$, $q$No. Elige el idioma del curso antes de pagar y queda fijo después. Escoja el idioma que lea mejor.$q$),
  ('es', 'site-language-vs-course-language', 'language', false, 3, $q$¿El idioma del sitio es el mismo que el del curso?$q$, $q$No necesariamente. Puede cambiar el idioma del sitio en cualquier momento. El idioma del curso se elige una vez, antes de pagar.$q$),
  ('es', 'what-can-the-ai-assistant-do', 'ai', false, 1, $q$¿Qué puede hacer el asistente de IA?$q$, $q$Es un ayudante educativo. Puede explicar ideas del curso con palabras sencillas. No puede dar asesoría legal ni prometer lo que hará su tribunal.$q$),
  ('es', 'can-the-ai-give-exam-answers', 'ai', false, 2, $q$¿Puede el asistente de IA darme las respuestas del examen?$q$, $q$No. No tiene acceso al banco de preguntas y se desactiva durante el examen final.$q$),
  ('es', 'is-the-ai-always-right', 'ai', false, 3, $q$¿El asistente de IA siempre tiene razón?$q$, $q$No. Puede cometer errores. Para lo importante, como fechas o reglas del tribunal, consulte el texto del curso o pregunte a su tribunal.$q$),
  ('es', 'is-a-classroom-course-available', 'classroom', false, 1, $q$¿Hay un curso presencial?$q$, $q$Todavía no. La opción presencial ($124.99) es solo lista de espera. Únase con su correo y su condado y le avisaremos cuando abra.$q$),
  ('es', 'how-do-i-join-the-classroom-waitlist', 'classroom', false, 2, $q$¿Cómo me uno a la lista de espera presencial?$q$, $q$Use la tarjeta de lista de espera en la página de cursos. Escriba su correo y elija su condado. No enviamos otros correos.$q$),
  ('es', 'why-choose-online-over-classroom', 'classroom', false, 3, $q$¿Por qué elegir en línea en vez de presencial?$q$, $q$En línea es más barato, puede estudiar a cualquier hora desde cualquier dispositivo y puede elegir entre cuatro idiomas.$q$),
  ('es', 'how-do-i-contact-the-school', 'contact', false, 1, $q$¿Cómo contacto con la escuela?$q$, $q$Use la página de contacto para enviarnos un mensaje. Respondemos por correo electrónico.$q$),
  ('es', 'how-do-i-reset-my-password', 'contact', false, 2, $q$¿Cómo restablezco mi contraseña?$q$, $q$En la página de inicio de sesión elija «Olvidé mi contraseña» y escriba su correo. Le enviamos un enlace para crear una nueva contraseña. Revise la carpeta de spam si no llega.$q$),
  ('es', 'i-have-a-problem-with-my-course', 'contact', false, 3, $q$Tengo un problema con mi curso. ¿Qué hago?$q$, $q$Use el formulario «¿Tiene un problema?» y cuéntenos qué ocurrió, con capturas de pantalla si puede. Lo revisaremos.$q$),
  ('es', 'how-do-i-ask-for-accessibility-help', 'contact', false, 4, $q$¿Cómo pido ayuda de accesibilidad?$q$, $q$Envíe una solicitud de adaptación desde la página de accesibilidad. Indique qué ayuda necesita y cómo contactarle.$q$)
) as v(locale, slug, category, featured, position, title, body);

-- TODO(review): a native ru speaker must review the ru rows before launch.
insert into public.faq_items (locale, slug, category, featured, position, title, body, published) select
  v.locale, v.slug, v.category, v.featured, v.position, v.title, v.body, true
from (values
  ('ru', 'what-is-this-school', 'about', false, 1, $q$Что это за школа?$q$, $q$Мы онлайн-школа для нарушителей ПДД. Если вы получили штраф в Калифорнии, вы можете пройти наш курс в своём темпе, чтобы суд мог скрыть штрафной балл, если суд это разрешает.$q$),
  ('ru', 'is-this-a-real-school', 'about', false, 2, $q$Это настоящая лицензированная школа?$q$, $q$Нет. Это демонстрационный проект, а не лицензированная школа. Названия, цены и данные судов приведены только как пример. Не используйте его для решения реального штрафа.$q$),
  ('ru', 'how-does-it-work', 'about', false, 3, $q$Как это работает по шагам?$q$, $q$1. Выберите округ и язык курса.
2. Оплатите заказ.
3. Изучите 8 разделов в своём темпе.
4. Сдайте итоговый экзамен.
5. Получите сертификат; мы сообщим о завершении курса штату.$q$),
  ('ru', 'where-do-i-start', 'about', false, 4, $q$С чего начать?$q$, $q$Найдите свой округ на странице судов, чтобы узнать, как попросить суд о traffic school, затем выберите язык курса и запишитесь. Зарегистрироваться можно до оплаты.$q$),
  ('ru', 'how-many-sections', 'course', false, 1, $q$Сколько разделов в курсе?$q$, $q$В курсе 8 разделов. Каждый заканчивается коротким тестом, и проходить их нужно по порядку.$q$),
  ('ru', 'can-i-go-at-my-own-pace', 'course', false, 2, $q$Можно ли учиться в своём темпе?$q$, $q$Да. Останавливайтесь и продолжайте, когда удобно: мы сохраняем ваш прогресс. В некоторых разделах есть минимальное время, поэтому пропустить их нельзя.$q$),
  ('ru', 'how-long-do-i-have', 'course', true, 3, $q$Сколько времени есть на прохождение?$q$, $q$У вас есть 90 дней доступа со дня записи. Спланируйте время так, чтобы сдать итоговый экзамен до окончания доступа.$q$),
  ('ru', 'can-i-retake-section-quizzes', 'course', false, 4, $q$Можно ли пересдавать тесты разделов?$q$, $q$Да. Тесты разделов можно проходить заново сколько угодно раз. Ограничение по попыткам есть только у итогового экзамена.$q$),
  ('ru', 'how-many-questions-final-exam', 'exam', true, 1, $q$Сколько вопросов в итоговом экзамене?$q$, $q$В итоговом экзамене 25 вопросов. Результат вы увидите сразу после отправки.$q$),
  ('ru', 'what-is-the-passing-score', 'exam', false, 2, $q$Какой балл нужен для сдачи?$q$, $q$Нужно набрать 70 %, то есть правильно ответить минимум на 18 из 25 вопросов.$q$),
  ('ru', 'how-many-exam-attempts', 'exam', false, 3, $q$Сколько раз можно сдавать итоговый экзамен?$q$, $q$На итоговый экзамен даётся 2 попытки. Повторите разделы, прежде чем начинать.$q$),
  ('ru', 'is-the-ai-assistant-on-during-the-exam', 'exam', false, 4, $q$Можно ли пользоваться ИИ-помощником во время экзамена?$q$, $q$Нет. Пока идёт итоговый экзамен, ИИ-помощник отключён. У него также нет доступа к вопросам экзамена.$q$),
  ('ru', 'when-do-i-get-my-certificate', 'certificates', true, 1, $q$Когда я получу сертификат?$q$, $q$Сразу после сдачи итогового экзамена. Сертификат можно скачать в личном кабинете студента.$q$),
  ('ru', 'how-is-my-completion-reported', 'certificates', false, 2, $q$Как о моём завершении сообщают штату?$q$, $q$Мы отправляем данные о завершении штату тремя пакетами в день: в 09:00, 13:00 и 17:00 по тихоокеанскому времени. Суд получает уведомление через этот отчёт.$q$),
  ('ru', 'how-do-i-download-my-certificate', 'certificates', false, 3, $q$Как скачать сертификат?$q$, $q$Войдите, откройте личный кабинет студента и выберите сертификат. Он скачивается в формате PDF, его можно распечатать или сохранить.$q$),
  ('ru', 'what-if-my-name-on-the-certificate-is-wrong', 'certificates', false, 4, $q$Что делать, если данные в сертификате неверны?$q$, $q$Юридическое имя, дата рождения и номер водительского удостоверения блокируются, когда вы начинаете итоговый экзамен. После этого их может изменить только персонал, причём с указанием причины. Тщательно проверьте данные заранее.$q$),
  ('ru', 'how-much-does-the-course-cost', 'payments', false, 1, $q$Сколько стоит курс?$q$, $q$Онлайн-курс стоит $24.99 вместо обычной цены $34.99. Скрытых платежей нет.$q$),
  ('ru', 'what-is-the-refund-policy', 'payments', true, 2, $q$Какова политика возврата?$q$, $q$В течение 7 дней после покупки:

- **Возврат 100 %**, если вы не начали ни одного урока.
- **Возврат 50 %**, если вы начали уроки, но не итоговый экзамен.

Возврата нет по истечении 7 дней, после начала итогового экзамена или после выдачи сертификата.$q$),
  ('ru', 'how-do-i-pay', 'payments', false, 3, $q$Как оплатить?$q$, $q$Оплата картой на защищённой странице оформления заказа. Мы никогда не видим и не храним номер вашей карты.$q$),
  ('ru', 'when-do-i-get-access-after-paying', 'payments', false, 4, $q$Когда появится доступ после оплаты?$q$, $q$Обычно через несколько секунд. После оплаты ваш кабинет проверяет новую запись на курс. Если через минуту её нет, свяжитесь с нами.$q$),
  ('ru', 'am-i-eligible', 'eligibility', false, 1, $q$Имею ли я право на traffic school?$q$, $q$Это решает суд, который рассматривает ваш штраф. Проверьте квитанцию или спросите в канцелярии суда. Мы не можем гарантировать, что суд примет курс.$q$),
  ('ru', 'do-i-need-court-permission', 'eligibility', false, 2, $q$Нужно ли сначала разрешение суда?$q$, $q$Обычно да. Попросите суд разрешить traffic school и запишите крайний срок. Завершите курс и отчёт до этой даты.$q$),
  ('ru', 'how-much-time-before-my-due-date', 'eligibility', false, 3, $q$Насколько заранее начинать до крайнего срока?$q$, $q$Начинайте как можно раньше. Оставьте время на итоговый экзамен и на отправку следующего пакета отчётов штату до срока, назначенного судом.$q$),
  ('ru', 'which-languages-are-available', 'language', false, 1, $q$На каких языках можно учиться?$q$, $q$Курс доступен на английском, японском, испанском и русском языках. Сам сайт также отображается на этих четырёх языках.$q$),
  ('ru', 'can-i-change-my-course-language', 'language', false, 2, $q$Можно ли позже сменить язык курса?$q$, $q$Нет. Язык курса выбирается до оплаты и после этого не меняется. Выберите язык, на котором вам читать удобнее.$q$),
  ('ru', 'site-language-vs-course-language', 'language', false, 3, $q$Язык сайта и язык курса — это одно и то же?$q$, $q$Не обязательно. Язык сайта можно менять в любой момент, а язык курса выбирается один раз, до оплаты.$q$),
  ('ru', 'what-can-the-ai-assistant-do', 'ai', false, 1, $q$Что умеет ИИ-помощник?$q$, $q$Это учебный помощник. Он может простыми словами объяснить идеи из курса. Он не даёт юридических советов и не может обещать решение суда.$q$),
  ('ru', 'can-the-ai-give-exam-answers', 'ai', false, 2, $q$Может ли ИИ-помощник подсказать ответы на экзамен?$q$, $q$Нет. У него нет доступа к банку вопросов, и во время итогового экзамена он отключён.$q$),
  ('ru', 'is-the-ai-always-right', 'ai', false, 3, $q$ИИ-помощник всегда прав?$q$, $q$Нет. Он может ошибаться. Всё важное, например даты и правила суда, проверяйте по тексту курса или спрашивайте суд.$q$),
  ('ru', 'is-a-classroom-course-available', 'classroom', false, 1, $q$Есть ли очный курс?$q$, $q$Пока нет. Очный вариант ($124.99) доступен только по листу ожидания. Оставьте email и округ, и мы сообщим, когда он откроется.$q$),
  ('ru', 'how-do-i-join-the-classroom-waitlist', 'classroom', false, 2, $q$Как попасть в лист ожидания очного курса?$q$, $q$Воспользуйтесь карточкой листа ожидания на странице курсов. Укажите email и выберите округ. Других писем мы не отправляем.$q$),
  ('ru', 'why-choose-online-over-classroom', 'classroom', false, 3, $q$Почему стоит выбрать онлайн, а не очный курс?$q$, $q$Онлайн дешевле, учиться можно в любое время с любого устройства, а язык можно выбрать из четырёх.$q$),
  ('ru', 'how-do-i-contact-the-school', 'contact', false, 1, $q$Как связаться со школой?$q$, $q$Отправьте сообщение через страницу контактов. Мы отвечаем по электронной почте.$q$),
  ('ru', 'how-do-i-reset-my-password', 'contact', false, 2, $q$Как сбросить пароль?$q$, $q$На странице входа выберите «Забыли пароль» и введите email. Мы отправим ссылку для создания нового пароля. Если письмо не приходит, проверьте папку «Спам».$q$),
  ('ru', 'i-have-a-problem-with-my-course', 'contact', false, 3, $q$У меня проблема с курсом. Что делать?$q$, $q$Заполните форму «Возникла проблема?» и расскажите, что произошло, по возможности приложив скриншоты. Мы разберёмся.$q$),
  ('ru', 'how-do-i-ask-for-accessibility-help', 'contact', false, 4, $q$Как запросить помощь по доступности?$q$, $q$Отправьте запрос на адаптацию на странице доступности. Укажите, какая помощь нужна и как с вами связаться.$q$)
) as v(locale, slug, category, featured, position, title, body);
