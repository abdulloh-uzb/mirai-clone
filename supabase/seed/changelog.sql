-- "What's new" entries for the public site (ticket 02): 4 entries in
-- en/ja/es/ru, plain past-tense notes about the demo's phases.
-- Non-English rows: a native speaker must review them before launch.

insert into public.changelog (locale, slug, title, body, published, published_at)
select v.locale, v.slug, v.title, v.body, true, v.published_at::timestamptz
from (values
  ('en', 'accounts-and-portal', $c$Accounts and the student portal$c$, $c$You can now create an account, sign in with a password or an email link, and open your student portal. The site works in English, Japanese, Spanish and Russian.$c$, '2026-11-20 17:00:00+00'),
  ('en', 'courts-by-county', $c$Courts by county$c$, $c$We added a page for each of California's 58 counties, with its courthouses and how to ask for traffic school. The court details are demo data, so always check with your court.$c$, '2026-11-24 17:00:00+00'),
  ('en', 'faq-and-support', $c$Answers and support forms$c$, $c$We published about 36 answers to common questions, with search. You can also contact us, ask for an accessibility accommodation, or report a problem from any page.$c$, '2026-11-25 17:00:00+00'),
  ('en', 'public-site-opens', $c$The public site opens$c$, $c$The course page, the eligibility check, the blog and the DMV services guide are now live. Payments arrive in a later update.$c$, '2026-11-26 17:00:00+00'),

  ('ja', 'accounts-and-portal', $c$アカウントと受講者ポータル$c$, $c$アカウントの作成、パスワードまたはメールのリンクでのサインイン、受講者ポータルの利用ができるようになりました。サイトは英語・日本語・スペイン語・ロシア語に対応しています。$c$, '2026-11-20 17:00:00+00'),
  ('ja', 'courts-by-county', $c$郡ごとの裁判所$c$, $c$カリフォルニア州の58郡それぞれのページを追加し、裁判所とトラフィックスクールの申請方法を掲載しました。裁判所の情報はデモデータのため、必ず裁判所に確認してください。$c$, '2026-11-24 17:00:00+00'),
  ('ja', 'faq-and-support', $c$よくある質問とお問い合わせフォーム$c$, $c$よくある質問への回答を約36件、検索付きで公開しました。どのページからでも、お問い合わせ、アクセシビリティの配慮の申請、問題の報告ができます。$c$, '2026-11-25 17:00:00+00'),
  ('ja', 'public-site-opens', $c$公開サイトがオープン$c$, $c$コースのページ、受講資格チェック、ブログ、DMVサービスガイドを公開しました。お支払い機能は今後のアップデートで追加します。$c$, '2026-11-26 17:00:00+00'),

  ('es', 'accounts-and-portal', $c$Cuentas y portal del estudiante$c$, $c$Ya puedes crear una cuenta, iniciar sesión con contraseña o con un enlace por correo y abrir tu portal de estudiante. El sitio funciona en inglés, japonés, español y ruso.$c$, '2026-11-20 17:00:00+00'),
  ('es', 'courts-by-county', $c$Tribunales por condado$c$, $c$Agregamos una página para cada uno de los 58 condados de California, con sus tribunales y cómo pedir la escuela de tránsito. Los datos de los tribunales son de demostración, así que confírmalos siempre con tu tribunal.$c$, '2026-11-24 17:00:00+00'),
  ('es', 'faq-and-support', $c$Respuestas y formularios de ayuda$c$, $c$Publicamos unas 36 respuestas a preguntas frecuentes, con búsqueda. También puedes contactarnos, pedir una adaptación de accesibilidad o reportar un problema desde cualquier página.$c$, '2026-11-25 17:00:00+00'),
  ('es', 'public-site-opens', $c$Abre el sitio público$c$, $c$Ya están disponibles la página del curso, la verificación de elegibilidad, el blog y la guía de servicios del DMV. Los pagos llegarán en una actualización posterior.$c$, '2026-11-26 17:00:00+00'),

  ('ru', 'accounts-and-portal', $c$Аккаунты и личный кабинет$c$, $c$Теперь можно создать аккаунт, войти по паролю или по ссылке из письма и открыть личный кабинет. Сайт работает на английском, японском, испанском и русском.$c$, '2026-11-20 17:00:00+00'),
  ('ru', 'courts-by-county', $c$Суды по округам$c$, $c$Мы добавили страницу для каждого из 58 округов Калифорнии — с судами и порядком запроса дорожной школы. Данные о судах демонстрационные, всегда уточняйте их в суде.$c$, '2026-11-24 17:00:00+00'),
  ('ru', 'faq-and-support', $c$Ответы и формы обращений$c$, $c$Мы опубликовали около 36 ответов на частые вопросы с поиском. С любой страницы можно написать нам, запросить адаптацию или сообщить о проблеме.$c$, '2026-11-25 17:00:00+00'),
  ('ru', 'public-site-opens', $c$Открылся публичный сайт$c$, $c$Теперь доступны страница курса, проверка возможности пройти школу, блог и путеводитель по услугам DMV. Оплата появится в одном из следующих обновлений.$c$, '2026-11-26 17:00:00+00')
) as v (locale, slug, title, body, published_at);
