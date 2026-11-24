-- Isolated storage for the Sleep Patterns app. Assessment answers, diary
-- entries and generated PDFs are never written to these tables.
begin;

create table if not exists public.sleep_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and length(email) <= 254),
  name text not null default '' check (length(name) <= 100),
  newsletter_status text not null default 'not_subscribed'
    check (newsletter_status in ('not_subscribed', 'active', 'unsubscribed')),
  newsletter_signed_name text check (length(newsletter_signed_name) <= 100),
  newsletter_consent_version text,
  newsletter_consent_text text,
  newsletter_consented_at timestamptz,
  unsubscribed_at timestamptz,
  report_count integer not null default 0,
  last_report_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sleep_report_requests (
  request_id uuid primary key,
  contact_id uuid not null references public.sleep_contacts(id),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  report_version text not null,
  status text not null check (status in ('sending', 'sent', 'failed', 'expired')),
  lock_token uuid,
  lease_expires_at timestamptz,
  attempt_count integer not null default 1,
  email_id text,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.sleep_consent_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.sleep_contacts(id),
  request_id uuid references public.sleep_report_requests(request_id),
  event_type text not null check (event_type in ('report_request', 'newsletter_opt_in', 'newsletter_unsubscribe')),
  consent_version text not null,
  consent_text text not null,
  signed_name text check (length(signed_name) <= 100),
  created_at timestamptz not null default now(),
  unique (request_id, event_type)
);

create table if not exists public.sleep_rate_limits (
  scope_key text not null,
  window_start timestamptz not null,
  expires_at timestamptz not null,
  requests integer not null default 0,
  primary key (scope_key, window_start)
);

create table if not exists public.sleep_admin_tokens (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  kind text not null check (kind in ('login', 'session')),
  email text not null check (email = 'sifu@cloudforesttemple.com'),
  scopes text[] not null default array['contacts:read', 'contacts:export'],
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists sleep_contacts_created_idx on public.sleep_contacts(created_at desc, id);
create index if not exists sleep_contacts_newsletter_idx on public.sleep_contacts(newsletter_status, created_at desc);
create index if not exists sleep_requests_contact_idx on public.sleep_report_requests(contact_id, created_at desc);
create index if not exists sleep_consent_contact_idx on public.sleep_consent_events(contact_id, created_at desc);
create index if not exists sleep_rate_expiry_idx on public.sleep_rate_limits(expires_at);
create index if not exists sleep_tokens_expiry_idx on public.sleep_admin_tokens(expires_at);

alter table public.sleep_contacts enable row level security;
alter table public.sleep_report_requests enable row level security;
alter table public.sleep_consent_events enable row level security;
alter table public.sleep_rate_limits enable row level security;
alter table public.sleep_admin_tokens enable row level security;

revoke all on table public.sleep_contacts, public.sleep_report_requests,
  public.sleep_consent_events, public.sleep_rate_limits, public.sleep_admin_tokens
  from public, anon, authenticated;
grant select, insert, update, delete on table public.sleep_contacts,
  public.sleep_report_requests, public.sleep_consent_events,
  public.sleep_rate_limits, public.sleep_admin_tokens to service_role;

-- Only the Edge Function's service credential can execute these RPCs.
-- They run as their caller, without SECURITY DEFINER privileges.
create or replace function public.sleep_get_config()
returns jsonb language sql stable security invoker
set search_path = pg_catalog
as $$
  select jsonb_object_agg(
    case name when 'sleep_resend_api_key' then 'resend_api_key'
      when 'sleep_signing_secret' then 'signing_secret' end,
    decrypted_secret
  )
  from vault.decrypted_secrets
  where name in ('sleep_resend_api_key', 'sleep_signing_secret');
$$;
grant usage on schema vault to service_role;
grant select on vault.decrypted_secrets to service_role;
revoke all on function public.sleep_get_config() from public, anon, authenticated;
grant execute on function public.sleep_get_config() to service_role;

-- Reserve every limit in one transaction. Locks are acquired in a consistent
-- order so concurrent calls cannot overspend an IP, email or global bucket.
create or replace function public.sleep_take_rate_limit(p_entries jsonb)
returns boolean language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  item jsonb;
  stamp timestamptz := clock_timestamp();
  bucket timestamptz;
  seconds integer;
  allowed integer;
  used integer;
begin
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) not between 1 and 8 then
    raise exception 'Invalid rate limit configuration';
  end if;
  delete from public.sleep_rate_limits where expires_at < stamp - interval '1 day';
  delete from public.sleep_admin_tokens where expires_at < stamp - interval '1 day';
  for item in select value from jsonb_array_elements(p_entries) order by value->>'key' loop
    seconds := (item->>'seconds')::integer;
    allowed := (item->>'limit')::integer;
    if seconds not between 1 and 86400 or allowed not between 1 and 100000
      or length(item->>'key') not between 1 and 160 then
      raise exception 'Invalid rate limit configuration';
    end if;
    bucket := to_timestamp(floor(extract(epoch from stamp) / seconds) * seconds);
    perform pg_advisory_xact_lock(hashtextextended('sleep-rate:' || (item->>'key') || ':' || bucket::text, 0));
    insert into public.sleep_rate_limits(scope_key, window_start, expires_at, requests)
      values (item->>'key', bucket, bucket + make_interval(secs => seconds), 0)
      on conflict (scope_key, window_start) do nothing;
  end loop;
  for item in select value from jsonb_array_elements(p_entries) order by value->>'key' loop
    seconds := (item->>'seconds')::integer;
    bucket := to_timestamp(floor(extract(epoch from stamp) / seconds) * seconds);
    select requests into used from public.sleep_rate_limits
      where scope_key = item->>'key' and window_start = bucket;
    if used >= (item->>'limit')::integer then return false; end if;
  end loop;
  for item in select value from jsonb_array_elements(p_entries) loop
    seconds := (item->>'seconds')::integer;
    bucket := to_timestamp(floor(extract(epoch from stamp) / seconds) * seconds);
    update public.sleep_rate_limits set requests = requests + 1
      where scope_key = item->>'key' and window_start = bucket;
  end loop;
  return true;
end;
$$;
revoke all on function public.sleep_take_rate_limit(jsonb) from public, anon, authenticated;
grant execute on function public.sleep_take_rate_limit(jsonb) to service_role;

create or replace function public.sleep_claim_report(
  p_request_id uuid,
  p_payload_hash text,
  p_report_version text,
  p_email text,
  p_name text,
  p_newsletter_consent boolean,
  p_signature text,
  p_consent_version text,
  p_report_consent_text text,
  p_newsletter_consent_text text
)
returns jsonb language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  existing public.sleep_report_requests%rowtype;
  contact uuid;
  lease uuid := gen_random_uuid();
  stamp timestamptz := clock_timestamp();
begin
  perform pg_advisory_xact_lock(hashtextextended('sleep-report:' || p_request_id::text, 0));
  select * into existing from public.sleep_report_requests where request_id = p_request_id for update;
  if found then
    if existing.payload_hash <> p_payload_hash or existing.report_version <> p_report_version then
      return jsonb_build_object('status', 'conflict');
    end if;
    if existing.status = 'sent' then
      return jsonb_build_object('status', 'sent', 'emailId', existing.email_id);
    end if;
    if existing.created_at < stamp - interval '20 hours' then
      update public.sleep_report_requests set status = 'expired', lock_token = null,
        lease_expires_at = null, updated_at = stamp where request_id = p_request_id;
      return jsonb_build_object('status', 'expired');
    end if;
    if existing.status = 'sending' and existing.lease_expires_at > stamp then
      return jsonb_build_object('status', 'processing');
    end if;
    update public.sleep_report_requests set status = 'sending', lock_token = lease,
      lease_expires_at = stamp + interval '3 minutes', attempt_count = attempt_count + 1,
      updated_at = stamp, last_error_code = null where request_id = p_request_id;
    return jsonb_build_object('status', 'claimed', 'lockToken', lease,
      'contactId', existing.contact_id, 'createdAt', existing.created_at);
  end if;

  insert into public.sleep_contacts(email, name)
    values (p_email, p_name)
    on conflict (email) do update set
      name = case when excluded.name = '' then public.sleep_contacts.name else excluded.name end,
      updated_at = stamp
    returning id into contact;

  insert into public.sleep_report_requests(request_id, contact_id, payload_hash, report_version,
    status, lock_token, lease_expires_at, created_at, updated_at)
    values (p_request_id, contact, p_payload_hash, p_report_version, 'sending', lease,
      stamp + interval '3 minutes', stamp, stamp);

  insert into public.sleep_consent_events(contact_id, request_id, event_type,
    consent_version, consent_text, created_at)
    values (contact, p_request_id, 'report_request', p_consent_version, p_report_consent_text, stamp);

  if p_newsletter_consent then
    if p_signature is null or length(btrim(p_signature)) = 0 then
      raise exception 'A signed newsletter consent is required';
    end if;
    update public.sleep_contacts set newsletter_status = 'active',
      newsletter_signed_name = p_signature, newsletter_consent_version = p_consent_version,
      newsletter_consent_text = p_newsletter_consent_text,
      newsletter_consented_at = stamp, unsubscribed_at = null, updated_at = stamp
      where id = contact;
    insert into public.sleep_consent_events(contact_id, request_id, event_type,
      consent_version, consent_text, signed_name, created_at)
      values (contact, p_request_id, 'newsletter_opt_in', p_consent_version,
        p_newsletter_consent_text, p_signature, stamp);
  end if;
  return jsonb_build_object('status', 'claimed', 'lockToken', lease, 'contactId', contact, 'createdAt', stamp);
end;
$$;
revoke all on function public.sleep_claim_report(uuid, text, text, text, text, boolean, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.sleep_claim_report(uuid, text, text, text, text, boolean, text, text, text, text)
  to service_role;

create or replace function public.sleep_finish_report(
  p_request_id uuid, p_lock_token uuid, p_email_id text, p_error_code text
)
returns boolean language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  contact uuid;
  stamp timestamptz := clock_timestamp();
begin
  update public.sleep_report_requests set
    status = case when p_email_id is not null then 'sent' else 'failed' end,
    email_id = p_email_id, last_error_code = left(p_error_code, 80),
    lock_token = null, lease_expires_at = null, updated_at = stamp,
    sent_at = case when p_email_id is not null then stamp else null end
    where request_id = p_request_id and lock_token = p_lock_token and status = 'sending'
    returning contact_id into contact;
  if not found then return false; end if;
  if p_email_id is not null then
    update public.sleep_contacts set report_count = report_count + 1,
      last_report_sent_at = stamp, updated_at = stamp where id = contact;
  end if;
  return true;
end;
$$;
revoke all on function public.sleep_finish_report(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.sleep_finish_report(uuid, uuid, text, text) to service_role;

create or replace function public.sleep_unsubscribe(p_contact_id uuid)
returns boolean language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  contact public.sleep_contacts%rowtype;
begin
  select * into contact from public.sleep_contacts where id = p_contact_id for update;
  if not found then return false; end if;
  if contact.newsletter_status <> 'unsubscribed' then
    update public.sleep_contacts set newsletter_status = 'unsubscribed',
      unsubscribed_at = now(), updated_at = now() where id = p_contact_id;
    insert into public.sleep_consent_events(contact_id, event_type, consent_version, consent_text)
      values (p_contact_id, 'newsletter_unsubscribe', '2026-11-23',
        'Unsubscribe confirmed using the signed link provided to the contact.');
  end if;
  return true;
end;
$$;
revoke all on function public.sleep_unsubscribe(uuid) from public, anon, authenticated;
grant execute on function public.sleep_unsubscribe(uuid) to service_role;

create or replace function public.sleep_redeem_admin_token(p_token_hash text, p_session_hash text)
returns jsonb language plpgsql security invoker
set search_path = pg_catalog
as $$
declare
  owner_email text;
  expiry timestamptz := now() + interval '4 hours';
begin
  update public.sleep_admin_tokens set used_at = now()
    where token_hash = p_token_hash and kind = 'login' and used_at is null
      and expires_at > now() and email = 'sifu@cloudforesttemple.com'
    returning email into owner_email;
  if not found then return jsonb_build_object('ok', false); end if;
  insert into public.sleep_admin_tokens(token_hash, kind, email, scopes, expires_at)
    values (p_session_hash, 'session', owner_email,
      array['contacts:read', 'contacts:export'], expiry);
  return jsonb_build_object('ok', true, 'expiresAt', expiry);
end;
$$;
revoke all on function public.sleep_redeem_admin_token(text, text) from public, anon, authenticated;
grant execute on function public.sleep_redeem_admin_token(text, text) to service_role;

create or replace function public.sleep_admin_overview()
returns jsonb language sql stable security invoker
set search_path = pg_catalog
as $$
  select jsonb_build_object(
    'contacts', (select count(*) from public.sleep_contacts),
    'newsletterActive', (select count(*) from public.sleep_contacts where newsletter_status = 'active'),
    'newsletterUnsubscribed', (select count(*) from public.sleep_contacts where newsletter_status = 'unsubscribed'),
    'reportsSent', (select count(*) from public.sleep_report_requests where status = 'sent'),
    'reportsFailed', (select count(*) from public.sleep_report_requests where status in ('failed', 'expired')),
    'reportsProcessing', (select count(*) from public.sleep_report_requests where status = 'sending')
  );
$$;
revoke all on function public.sleep_admin_overview() from public, anon, authenticated;
grant execute on function public.sleep_admin_overview() to service_role;

-- A single statement keeps export membership stable while new visitors sign up
-- or update their newsletter preferences. Returning JSON avoids the REST API's
-- per-page row cap without offset-based duplicates or omissions.
create or replace function public.sleep_export_contacts(p_status text)
returns jsonb language sql stable security invoker
set search_path = pg_catalog
as $$
  select coalesce(jsonb_agg(to_jsonb(contact) order by contact.created_at desc, contact.id), '[]'::jsonb)
  from public.sleep_contacts as contact
  where p_status = 'all' or contact.newsletter_status = p_status;
$$;
revoke all on function public.sleep_export_contacts(text) from public, anon, authenticated;
grant execute on function public.sleep_export_contacts(text) to service_role;

notify pgrst, 'reload schema';
commit;
