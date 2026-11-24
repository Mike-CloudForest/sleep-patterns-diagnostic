-- Saved assessments are separate from the original report/contact service.
-- Only an explicit profile-saving choice writes birth data and answers here.
-- Email ownership must be verified before a pending snapshot becomes history.
begin;

create table if not exists public.sleep_saved_assessments (
  id uuid primary key,
  contact_id uuid not null references public.sleep_contacts(id),
  report_request_id uuid unique references public.sleep_report_requests(request_id),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  report_version text not null check (length(report_version) between 1 and 80),
  assessment jsonb not null check (jsonb_typeof(assessment) = 'object' and octet_length(assessment::text) <= 49152),
  confirmed_at timestamptz,
  pending_expires_at timestamptz,
  created_at timestamptz not null default now(),
  check (confirmed_at is not null or pending_expires_at is not null)
);

create table if not exists public.sleep_profile_consent_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.sleep_contacts(id),
  submission_id uuid not null,
  event_type text not null check (event_type in ('profile_save', 'profile_delete')),
  consent_version text not null check (length(consent_version) between 1 and 80),
  consent_text text not null check (length(consent_text) between 1 and 2000),
  created_at timestamptz not null default now(),
  unique (submission_id, event_type)
);

create table if not exists public.sleep_profile_tokens (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  kind text not null check (kind in ('login', 'session')),
  contact_id uuid not null references public.sleep_contacts(id),
  pending_assessment_id uuid references public.sleep_saved_assessments(id) on delete cascade,
  scopes text[] not null default array['profile:read', 'profile:write', 'profile:delete'],
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists sleep_saved_contact_idx on public.sleep_saved_assessments(contact_id, created_at desc, id);
create index if not exists sleep_saved_pending_expiry_idx on public.sleep_saved_assessments(pending_expires_at) where confirmed_at is null;
create index if not exists sleep_profile_token_expiry_idx on public.sleep_profile_tokens(expires_at);
create index if not exists sleep_profile_token_contact_idx on public.sleep_profile_tokens(contact_id);
create index if not exists sleep_profile_token_pending_idx on public.sleep_profile_tokens(pending_assessment_id);
create index if not exists sleep_profile_consent_contact_idx on public.sleep_profile_consent_events(contact_id, created_at desc);

alter table public.sleep_saved_assessments enable row level security;
alter table public.sleep_profile_consent_events enable row level security;
alter table public.sleep_profile_tokens enable row level security;
revoke all on table public.sleep_saved_assessments, public.sleep_profile_consent_events,
  public.sleep_profile_tokens from public, anon, authenticated;
grant select, insert, update, delete on table public.sleep_saved_assessments,
  public.sleep_profile_consent_events, public.sleep_profile_tokens to service_role;

create or replace function public.sleep_save_assessment(
  p_contact_id uuid, p_submission_id uuid, p_report_request_id uuid,
  p_payload_hash text, p_report_version text, p_assessment jsonb,
  p_consent_version text, p_consent_text text, p_confirmed boolean,
  p_created_at timestamptz default null, p_session_hash text default null
)
returns jsonb language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  prior public.sleep_saved_assessments%rowtype;
  stamp timestamptz := clock_timestamp();
  creation timestamptz := coalesce(p_created_at, stamp);
begin
  perform pg_advisory_xact_lock(hashtextextended('sleep-profile-contact:' || p_contact_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended('sleep-profile-save:' || p_submission_id::text, 0));
  if p_confirmed and not exists (select 1 from public.sleep_profile_tokens
    where token_hash = p_session_hash and kind = 'session' and contact_id = p_contact_id
      and used_at is null and expires_at > clock_timestamp() and 'profile:write' = any(scopes)) then
    return jsonb_build_object('status', 'unauthorized');
  end if;
  if p_payload_hash !~ '^[0-9a-f]{64}$' or jsonb_typeof(p_assessment) <> 'object'
    or octet_length(p_assessment::text) > 49152 or not p_confirmed and p_report_request_id is null then
    raise exception 'Invalid saved assessment';
  end if;
  if p_report_request_id is not null and not exists (
    select 1 from public.sleep_report_requests where request_id = p_report_request_id and contact_id = p_contact_id
  ) then raise exception 'Invalid report owner'; end if;
  select * into prior from public.sleep_saved_assessments where id = p_submission_id for update;
  if found then
    if prior.contact_id <> p_contact_id or prior.payload_hash <> p_payload_hash then
      return jsonb_build_object('status', 'conflict');
    end if;
    return jsonb_build_object('status', 'saved', 'id', prior.id, 'confirmed', prior.confirmed_at is not null);
  end if;
  -- An intentionally deleted saved profile must never be recreated by an old
  -- report retry or reused submission identifier.
  if exists (select 1 from public.sleep_profile_consent_events
    where submission_id = p_submission_id and event_type = 'profile_save') then
    return jsonb_build_object('status', 'deleted');
  end if;
  insert into public.sleep_saved_assessments(id, contact_id, report_request_id, payload_hash,
    report_version, assessment, confirmed_at, pending_expires_at, created_at)
    values (p_submission_id, p_contact_id, p_report_request_id, p_payload_hash,
      p_report_version, p_assessment, case when p_confirmed then stamp else null end,
      case when p_confirmed then null else creation + interval '7 days' end, creation);
  insert into public.sleep_profile_consent_events(contact_id, submission_id, event_type, consent_version, consent_text)
    values (p_contact_id, p_submission_id, 'profile_save', p_consent_version, p_consent_text);
  delete from public.sleep_saved_assessments where confirmed_at is null and pending_expires_at < stamp;
  delete from public.sleep_profile_tokens where expires_at < stamp - interval '1 day';
  return jsonb_build_object('status', 'saved', 'id', p_submission_id, 'confirmed', p_confirmed);
end;
$$;
revoke all on function public.sleep_save_assessment(uuid, uuid, uuid, text, text, jsonb, text, text, boolean, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.sleep_save_assessment(uuid, uuid, uuid, text, text, jsonb, text, text, boolean, timestamptz, text)
  to service_role;

create or replace function public.sleep_redeem_profile_token(p_token_hash text, p_session_hash text)
returns jsonb language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  login public.sleep_profile_tokens%rowtype;
  expiry timestamptz := clock_timestamp() + interval '4 hours';
begin
  if p_session_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid session'; end if;
  select * into login from public.sleep_profile_tokens where token_hash = p_token_hash
    and kind = 'login' and used_at is null and expires_at > clock_timestamp();
  if not found then return jsonb_build_object('ok', false); end if;
  perform pg_advisory_xact_lock(hashtextextended('sleep-profile-contact:' || login.contact_id::text, 0));
  select * into login from public.sleep_profile_tokens where token_hash = p_token_hash
    and kind = 'login' and used_at is null and expires_at > clock_timestamp() for update;
  if not found then return jsonb_build_object('ok', false); end if;
  if login.pending_assessment_id is not null then
    update public.sleep_saved_assessments set confirmed_at = clock_timestamp(), pending_expires_at = null
      where id = login.pending_assessment_id and contact_id = login.contact_id
        and (confirmed_at is not null or pending_expires_at > clock_timestamp());
    if not found then return jsonb_build_object('ok', false); end if;
  elsif not exists (select 1 from public.sleep_saved_assessments
    where contact_id = login.contact_id and confirmed_at is not null) then
    return jsonb_build_object('ok', false);
  end if;
  update public.sleep_profile_tokens set used_at = clock_timestamp() where token_hash = p_token_hash;
  insert into public.sleep_profile_tokens(token_hash, kind, contact_id, scopes, expires_at)
    values (p_session_hash, 'session', login.contact_id,
      array['profile:read', 'profile:write', 'profile:delete'], expiry);
  return jsonb_build_object('ok', true, 'expiresAt', expiry);
end;
$$;
revoke all on function public.sleep_redeem_profile_token(text, text) from public, anon, authenticated;
grant execute on function public.sleep_redeem_profile_token(text, text) to service_role;

create or replace function public.sleep_delete_saved_profile(
  p_contact_id uuid, p_submission_id uuid, p_consent_version text, p_consent_text text, p_session_hash text
)
returns boolean language plpgsql security invoker
set search_path = pg_catalog
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('sleep-profile-contact:' || p_contact_id::text, 0));
  if not exists (select 1 from public.sleep_profile_tokens where token_hash = p_session_hash
    and contact_id = p_contact_id and kind = 'session' and used_at is null
    and expires_at > clock_timestamp() and 'profile:delete' = any(scopes)) then return false; end if;
  delete from public.sleep_profile_tokens where contact_id = p_contact_id;
  delete from public.sleep_saved_assessments where contact_id = p_contact_id;
  insert into public.sleep_profile_consent_events(contact_id, submission_id, event_type, consent_version, consent_text)
    values (p_contact_id, p_submission_id, 'profile_delete', p_consent_version, p_consent_text)
    on conflict (submission_id, event_type) do nothing;
  return true;
end;
$$;
revoke all on function public.sleep_delete_saved_profile(uuid, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.sleep_delete_saved_profile(uuid, uuid, text, text, text) to service_role;

create or replace function public.sleep_admin_profile_summaries(p_contact_ids uuid[])
returns jsonb language plpgsql stable security invoker
set search_path = pg_catalog
as $$
begin
  if coalesce(array_length(p_contact_ids, 1), 0) > 100 then raise exception 'Too many contacts'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
    'id', item.id, 'contact_id', item.contact_id, 'report_version', item.report_version,
    'created_at', item.created_at, 'confirmed_at', item.confirmed_at,
    'assessment', jsonb_build_object('answers', item.assessment->'answers',
      'traditionsSelection', item.assessment->'traditionsSelection',
      'chart', case when item.assessment->'chart' is not null and item.assessment->'chart' <> 'null'::jsonb
        then jsonb_build_object('available', true) else null end)
  )), '[]'::jsonb) from (
    select distinct on (contact_id) * from public.sleep_saved_assessments
    where contact_id = any(p_contact_ids) and confirmed_at is not null
    order by contact_id, created_at desc, id
  ) item);
end;
$$;
revoke all on function public.sleep_admin_profile_summaries(uuid[]) from public, anon, authenticated;
grant execute on function public.sleep_admin_profile_summaries(uuid[]) to service_role;

notify pgrst, 'reload schema';
commit;
