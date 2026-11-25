-- Seed data runs after migrations on `pnpm db:reset`.
-- Reference data is added by the tickets that create its tables.

-- One published announcement per UI language (ticket 02).
insert into public.announcements (locale, message, published) values
  ('en', 'Welcome to the demo. Courses open soon in four languages.', true),
  ('ja', 'デモへようこそ。4 か国語の講習はまもなく開講します。', true),
  ('es', 'Bienvenido a la demo. Los cursos abren pronto en cuatro idiomas.', true),
  ('ru', 'Добро пожаловать в демо. Курсы скоро откроются на четырёх языках.', true);

-- States (ticket 05). California is the only active state.
-- TODO(spec): min_course_minutes is not given in the spec; 400 is a placeholder
-- until the course content (phase 3) sets the real total.
insert into public.states
  (code, name, min_course_minutes, exam_questions, pass_pct, max_attempts,
   access_days, report_times, adapter, active)
values
  ('CA', 'California', 400, 25, 70, 2, 90, array['09:00', '13:00', '17:00'],
   'mock-california', true),
  ('AZ', 'Arizona', 0, 25, 70, 2, 90, '{}', null, false),
  ('FL', 'Florida', 0, 25, 70, 2, 90, '{}', null, false),
  ('NV', 'Nevada', 0, 25, 70, 2, 90, '{}', null, false),
  ('NY', 'New York', 0, 25, 70, 2, 90, '{}', null, false),
  ('OR', 'Oregon', 0, 25, 70, 2, 90, '{}', null, false),
  ('TX', 'Texas', 0, 25, 70, 2, 90, '{}', null, false),
  ('WA', 'Washington', 0, 25, 70, 2, 90, '{}', null, false);

-- The one course and its eight section titles in every UI language (ticket 05).
-- Lessons, blocks and questions are seeded by phase 3.
-- TODO(spec): the price (2499 = $24.99) and struck list price (3499 = $34.99)
-- are placeholders copied from the hero mock-up in spec section 5; confirm the
-- real prices before launch.
with course as (
  insert into public.courses (state_code, slug, price_cents, list_price_cents, active)
  values ('CA', 'california-traffic-violator-course', 2499, 3499, true)
  returning id
)
insert into public.sections (course_id, position, title)
select course.id, section.position, section.title
from course
cross join (values
  (1, jsonb_build_object(
    'en', 'Traffic Safety Fundamentals',
    'ja', '交通安全の基礎',
    'es', 'Fundamentos de seguridad vial',
    'ru', 'Основы безопасности дорожного движения')),
  (2, jsonb_build_object(
    'en', 'Traffic Laws and Right-of-Way',
    'ja', '交通法規と優先通行権',
    'es', 'Leyes de tránsito y derecho de paso',
    'ru', 'Правила дорожного движения и право преимущественного проезда')),
  (3, jsonb_build_object(
    'en', 'Safe Driving Maneuvers and Roadway Control',
    'ja', '安全な運転操作と車両コントロール',
    'es', 'Maniobras de conducción segura y control en la vía',
    'ru', 'Безопасное маневрирование и управление на дороге')),
  (4, jsonb_build_object(
    'en', 'Defensive Driving and Hazard Awareness',
    'ja', '防衛運転と危険予測',
    'es', 'Manejo defensivo y percepción de riesgos',
    'ru', 'Защитное вождение и распознавание опасностей')),
  (5, jsonb_build_object(
    'en', 'Collision Avoidance and Safety Techniques',
    'ja', '衝突回避と安全技術',
    'es', 'Prevención de choques y técnicas de seguridad',
    'ru', 'Предотвращение столкновений и приёмы безопасности')),
  (6, jsonb_build_object(
    'en', 'Road Rage and Driving Distractions',
    'ja', 'あおり運転と運転中の注意散漫',
    'es', 'Agresividad al volante y distracciones',
    'ru', 'Агрессия на дороге и отвлечение за рулём')),
  (7, jsonb_build_object(
    'en', 'Vehicle Requirements and Maintenance',
    'ja', '車両の要件と整備',
    'es', 'Requisitos y mantenimiento del vehículo',
    'ru', 'Требования к автомобилю и его обслуживание')),
  (8, jsonb_build_object(
    'en', 'Course Review and Final Steps',
    'ja', 'コースの復習と最終ステップ',
    'es', 'Repaso del curso y pasos finales',
    'ru', 'Повторение курса и заключительные шаги'))
) as section (position, title);
