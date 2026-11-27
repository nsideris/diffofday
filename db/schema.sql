create table if not exists editions (
  date date primary key,
  updated timestamptz not null,
  payload jsonb not null,
  published_at timestamptz not null default now()
);

create table if not exists items (
  id text primary key,
  edition date not null references editions(date) on delete cascade,
  kind text not null check (kind in ('top', 'mustread', 'network', 'repos', 'blogs')),
  rank int not null,
  title text not null,
  summary text,
  url text not null,
  source text,
  who text,
  topic text,
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english',
      coalesce(summary, '') || ' ' || coalesce(who, '') || ' ' || coalesce(source, '') || ' ' || coalesce(topic, '')), 'B')
  ) stored
);
create index if not exists items_search on items using gin (search);
create index if not exists items_edition on items (edition);

create table if not exists trends (
  edition date not null references editions(date) on delete cascade,
  rank int not null,
  name text not null,
  n int,
  summary text not null,
  primary key (edition, rank)
);

do $$ begin
  if exists (select from pg_roles where rolname = 'diffofday_reader') then
    grant usage on schema public to diffofday_reader;
    grant select on editions, items, trends to diffofday_reader;
  end if;
end $$;
