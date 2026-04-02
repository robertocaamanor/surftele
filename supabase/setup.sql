-- 1. Crear la tabla para el feed de noticias
create table if not exists public.news_feed (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    link text not null unique,
    source text not null,
    category text not null,
    published_at timestamp with time zone not null,
    image_url text,
    created_at timestamp with time zone default now()
);

-- 2. Habilitar Tiempo Real para que React pueda recibir actualizaciones en vivo
alter publication supabase_realtime add table public.news_feed;

-- 3. Habilitar la extensión de llamadas HTTP y de Cronjobs (si quieres ejecutar el cron por base de datos)
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 4. Programar un CronJob que llame a tu Edge Function cada hora
-- (NOTA: Descomenta esto y cambia las URls cuando hayas desplegado tu Edge Function)
/*
select cron.schedule(
  'fetch-news-hourly',
  '0 * * * *', -- Ejecuta en el minuto 0 de cada hora
  $$
     select net.http_post(
         url:='https://<TU_PROJECT_REF>.supabase.co/functions/v1/fetch-news',
         headers:='{"Authorization": "Bearer <TU_ANON_KEY>"}'::jsonb
     );
  $$
);
*/
