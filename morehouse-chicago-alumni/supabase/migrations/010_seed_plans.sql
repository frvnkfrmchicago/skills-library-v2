-- ============================================================================
-- 010_seed_plans.sql
-- Lane 1 — seed membership_plans. Implements docs/data-contract.md §12 seed
-- requirement: Standard $75/yr, Premium $150/yr, plus a comped marker.
--
-- Anti-mock (G3): these are REAL chapter pricing tiers, not placeholder data.
-- amount_cents is real-format (7500 = $75.00). stripe_price_id is left null
-- until Lane 2 + the board create the Stripe Products/Prices; the comped row
-- is amount_cents = 0 and is the plan applied to comped/lifetime/manual members
-- who never enter Stripe (per §7).
--
-- Idempotent: re-running will not duplicate rows (guarded by name).
-- ============================================================================

insert into public.membership_plans
  (name, amount_cents, interval, stripe_product_id, stripe_price_id, benefits, active, sort_order)
select * from (values
  (
    'Standard Membership',
    7500,                       -- $75.00 / year
    'year',
    null::text,                 -- [PROVISION] Stripe product id set by Lane 2 / board
    null::text,                 -- [PROVISION] Stripe price id set by Lane 2 / board
    '["Annual chapter membership","Access to member directory","Event registration priority","Chapter newsletter","Voting rights at chapter meetings"]'::jsonb,
    true,
    1::smallint
  ),
  (
    'Premium Membership',
    15000,                      -- $150.00 / year (lifetime after 10 years)
    'year',
    null::text,                 -- [PROVISION] Stripe product id set by Lane 2 / board
    null::text,                 -- [PROVISION] Stripe price id set by Lane 2 / board
    '["Everything in Standard","Scholarship gala complimentary ticket","Exclusive networking events","Mentor matching program","CAMAA branded portfolio and materials","Recognition at annual gala"]'::jsonb,
    true,
    2::smallint
  ),
  (
    'Comped Membership',
    0,                          -- $0 — board-granted; never billed via Stripe (§7)
    'lifetime',
    null::text,
    null::text,
    '["Board-granted complimentary membership","Applied to comped / lifetime / manual members","Member never enters Stripe; dues invoices are waived"]'::jsonb,
    true,
    3::smallint
  )
) as v(name, amount_cents, interval, stripe_product_id, stripe_price_id, benefits, active, sort_order)
where not exists (
  select 1 from public.membership_plans mp where mp.name = v.name
);
