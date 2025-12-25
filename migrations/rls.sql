-- Habilitar RLS
alter table gift enable row level security;
alter table gift_redemption enable row level security;
alter table payment enable row level security;
alter table transaction_log enable row level security;
alter table audit_log enable row level security;

-- Opcional: revogar permissões públicas explícitas (defesa extra)
revoke all on gift, gift_redemption, payment, transaction_log, audit_log from public;

-- Política: apenas service_role pode tudo (select/insert/update/delete)
create policy "service role full access on gift" on gift
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access on gift_redemption" on gift_redemption
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access on payment" on payment
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access on transaction_log" on transaction_log
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role full access on audit_log" on audit_log
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
