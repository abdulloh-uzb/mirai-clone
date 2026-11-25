-- Seed data runs after migrations on `pnpm db:reset`.
-- Reference data is added by the tickets that create its tables.

-- One published announcement per UI language (ticket 02).
insert into public.announcements (locale, message, published) values
  ('en', 'Welcome to the RoadReady demo. Courses open soon in four languages.', true),
  ('ja', 'RoadReady デモへようこそ。4 か国語の講習はまもなく開講します。', true),
  ('es', 'Bienvenido a la demo de RoadReady. Los cursos abren pronto en cuatro idiomas.', true),
  ('ru', 'Добро пожаловать в демо RoadReady. Курсы скоро откроются на четырёх языках.', true);
