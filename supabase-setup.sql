create table if not exists public.audience_answers (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  question_number integer not null,
  answer text not null check (char_length(answer) between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.audience_answers enable row level security;

create policy "Audience can submit answers"
  on public.audience_answers for insert to anon
  with check (true);

create policy "Anyone can read live answers"
  on public.audience_answers for select to anon
  using (true);

create index if not exists audience_answers_game_question_idx
  on public.audience_answers (game_id, question_number);
