-- Automatically create a public.users profile when a Supabase Auth user signs
-- up.
--
-- WHY THIS IS NEEDED
-- Email confirmation is enabled in this project (GoTrue setting
-- "mailer_autoconfirm" is false), so supabase.auth.signUp() creates the Auth
-- user but returns NO session until the email is confirmed. Without a session a
-- browser cannot insert into public.users (RLS would block it, auth.uid() is
-- null), so profile creation cannot happen from the client at signup time.
-- This trigger runs server-side the moment the auth.users row is created, so a
-- public.users profile is guaranteed regardless of email confirmation.
--
-- HOW TO RUN
-- Supabase Dashboard > SQL Editor > New query > paste this file > Run.
-- Idempotent - safe to run multiple times.
--
-- SECURITY
--   * The function is SECURITY DEFINER, so it runs as the table owner and can
--     write public.users. It is NOT exposed to clients.
--   * role is always hard-coded to 'passenger'. A user can never sign up as
--     driver/admin. (The RLS insert policy in rls_auth_policies.sql enforces
--     the same rule for the client-side fallback insert.)
--   * No password material is stored: password_hash is filled with '' purely
--     because the column is NOT NULL. Supabase Auth owns all passwords.
--   * ON CONFLICT (id) DO NOTHING keeps the trigger idempotent and harmless if
--     a profile row already exists for this Auth user id.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    name,
    email,
    phone,
    password_hash,
    role
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), ''),
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'phone', ''), ''),
    '',
    'passenger'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
