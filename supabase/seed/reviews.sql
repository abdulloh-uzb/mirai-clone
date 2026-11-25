-- Sample reviews for the home page carousel (ticket 09): 6 per language.
-- Every row is a Sample review (is_sample = true): the people are invented and
-- the carousel says so. They never feed AggregateRating structured data.
-- Non-English rows: a native speaker must review them before launch.

insert into public.reviews (locale, slug, title, body, author_name, rating, published, is_sample)
select v.locale, v.slug, v.title, v.body, v.author_name, v.rating, true, true
from (values
  ('en', 'sample-1', $r$Clear and easy to follow$r$, $r$I took the course over three evenings. The lessons were short and the quizzes helped me remember the rules.$r$, 'Jordan P.', 5),
  ('en', 'sample-2', $r$Finally in my language$r$, $r$Reading the rules in my own language made the difference. I understood every question on the final exam.$r$, 'Mariana L.', 5),
  ('en', 'sample-3', $r$Good on my phone$r$, $r$I studied on the bus during my commute. My place was always saved when I came back.$r$, 'Chris T.', 4),
  ('en', 'sample-4', $r$Helpful court page$r$, $r$The county page told me what to ask my court before I enrolled. That saved me a phone call.$r$, 'Dana W.', 5),
  ('en', 'sample-5', $r$Fair final exam$r$, $r$The final exam covered what the lessons taught. No trick questions.$r$, 'Sam R.', 4),
  ('en', 'sample-6', $r$Quick answers$r$, $r$I had a question about my details and got a reply the same day.$r$, 'Alex K.', 5),

  ('ja', 'sample-1', $r$わかりやすい内容$r$, $r$3日間の夜で受講しました。レッスンは短く、小テストでルールを覚えられました。$r$, 'サトウ H.', 5),
  ('ja', 'sample-2', $r$日本語で受けられて安心$r$, $r$母語でルールを読めたのが大きかったです。最終試験の問題もすべて理解できました。$r$, 'タナカ Y.', 5),
  ('ja', 'sample-3', $r$スマホでも快適$r$, $r$通勤中にスマホで学習しました。続きからすぐに再開できます。$r$, 'スズキ K.', 4),
  ('ja', 'sample-4', $r$裁判所のページが便利$r$, $r$申し込む前に、郡のページで裁判所に何を聞けばいいかわかりました。$r$, 'イトウ M.', 5),
  ('ja', 'sample-5', $r$公平な最終試験$r$, $r$最終試験はレッスンの内容どおりで、ひっかけ問題はありませんでした。$r$, 'ワタナベ R.', 4),
  ('ja', 'sample-6', $r$返信が早い$r$, $r$登録情報について質問したら、その日のうちに返事が来ました。$r$, 'ナカムラ A.', 5),

  ('es', 'sample-1', $r$Claro y fácil de seguir$r$, $r$Hice el curso en tres noches. Las lecciones eran cortas y los cuestionarios me ayudaron a recordar las reglas.$r$, 'Lucía G.', 5),
  ('es', 'sample-2', $r$Por fin en mi idioma$r$, $r$Leer las reglas en español marcó la diferencia. Entendí todas las preguntas del examen final.$r$, 'Carlos M.', 5),
  ('es', 'sample-3', $r$Funciona bien en el teléfono$r$, $r$Estudié en el autobús camino al trabajo. Siempre retomé donde lo había dejado.$r$, 'Ana R.', 4),
  ('es', 'sample-4', $r$Útil la página del tribunal$r$, $r$La página del condado me dijo qué preguntar al tribunal antes de inscribirme.$r$, 'Jorge P.', 5),
  ('es', 'sample-5', $r$Examen final justo$r$, $r$El examen final cubrió lo que enseñaban las lecciones. Sin preguntas trampa.$r$, 'Sofía D.', 4),
  ('es', 'sample-6', $r$Respuestas rápidas$r$, $r$Tenía una duda sobre mis datos y me respondieron el mismo día.$r$, 'Miguel A.', 5),

  ('ru', 'sample-1', $r$Понятно и просто$r$, $r$Прошёл курс за три вечера. Уроки короткие, а тесты помогли запомнить правила.$r$, 'Иван С.', 5),
  ('ru', 'sample-2', $r$Наконец-то на русском$r$, $r$Читать правила на родном языке — совсем другое дело. На экзамене я понял каждый вопрос.$r$, 'Ольга К.', 5),
  ('ru', 'sample-3', $r$Удобно с телефона$r$, $r$Занималась в автобусе по дороге на работу. Курс всегда открывался с того же места.$r$, 'Мария П.', 4),
  ('ru', 'sample-4', $r$Полезная страница суда$r$, $r$На странице округа было написано, что спросить в суде до записи.$r$, 'Дмитрий Л.', 5),
  ('ru', 'sample-5', $r$Честный экзамен$r$, $r$Итоговый экзамен был по материалу уроков, без подвохов.$r$, 'Анна В.', 4),
  ('ru', 'sample-6', $r$Быстрые ответы$r$, $r$Задал вопрос о своих данных и получил ответ в тот же день.$r$, 'Сергей Н.', 5)
) as v (locale, slug, title, body, author_name, rating);
