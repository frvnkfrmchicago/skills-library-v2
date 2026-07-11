# Board Operations Runbook
## Morehouse Chicago Alumni Association — Platform Operations

This document is written for chapter board members, not software engineers. It covers
every routine action you will perform in the platform: approving members, recording dues,
creating events, approving content for the public hub, and exporting data for reports.
The final section covers the one-time provisioning steps the chapter president or a
technical board member must complete before the platform goes live.

---

## Part 1 — Routine Operations

### 1.1 Approve a pending member

When someone registers on the platform, their `membership_status` is set to `pending`.
They can log in but cannot access members-only content until a board member approves them.

**Steps:**
1. Sign in at `admin.html` with your admin account.
2. Navigate to the Members panel.
3. Find the pending member row (status shown as "Pending").
4. Review their name, email, and class year.
5. Click Approve. Their status changes to `active`.
6. If the member is a chapter officer, set their `chapter_role_title` from the same panel.
7. For comped or lifetime members (no dues required), set status to `comped` or `lifetime`.
   These members will never see a Stripe checkout flow.

**What happens in the background:** The status change writes to the `members` table.
RLS rules immediately update what the member can see. An entry is written to the audit log
with your admin ID and the before/after state.

---

### 1.2 Record or waive dues

**Record a paid invoice (manual reconciliation):**
Use this when a member paid by check, cash, or another non-Stripe method.

1. Navigate to Admin > Dues.
2. Find the member.
3. Open their dues invoice or create a new one for the current period.
4. Set status to `paid` and enter the amount and the period dates.
5. Add a note explaining the payment method (example: "Paid by check at June gala").
6. Save. The member's `membership_status` updates to `active`.

**Waive dues:**
Use this for a board officer, scholarship recipient, or anyone granted a dues waiver.

1. Navigate to Admin > Dues > find the member.
2. Open the invoice and set status to `waived`.
3. Add a note explaining the reason (example: "Waived — board officer serving 2026 term").
4. Save. The member's `membership_status` reflects active standing.

**Comped and lifetime members:**
Members with `membership_status` of `comped`, `lifetime`, or `manual` will never see a
Stripe payment flow. Their dues invoices are automatically set to `waived`. You do not
need to take action unless the board changes their status.

**Stripe-collected dues:**
When a member pays online through the Stripe Checkout flow, the webhook updates their
invoice and member status automatically. You only need manual reconciliation for
offline payments.

---

### 1.3 Create an event

1. Navigate to Admin > Events > New Event.
2. Fill in the required fields:
   - Title (clear, specific — avoid generic titles)
   - Date and start/end time
   - Location (physical address or "Virtual" with the meeting link in the description)
   - Description
3. Set Visibility:
   - `public` — visible to anyone visiting the site.
   - `members_only` — visible only to signed-in members with active status.
   - `board_only` — visible only to admin/board accounts.
   - `draft` — not visible to anyone; use while preparing.
4. Set the ticket price. Leave at $0 for free events. For paid events, you need a
   Stripe Price ID (see Section 2.4 for setup).
5. Set `requires_approval` if you want to review each registration before confirming it.
6. Click Publish to make the event live.

**Event status lifecycle:** draft → published → completed or cancelled.
Completed events remain in the archive. Cancelled events are flagged but not deleted.

**Capacity and waitlist:** if capacity is set, registrations beyond that number go to the
waitlist automatically. You can approve waitlisted registrations manually from the
registrations panel.

---

### 1.4 Approve content for the public hub

Content items arrive in the approval queue from three automated sources
(Morehouse events, Morehouse news, Morehouse sitemap) and from manual submissions
by board members. No content becomes public until a board member approves it.

**Approve an item:**
1. Navigate to Admin > Content.
2. Review items in the Pending queue. Each item shows title, source, date, summary, and
   a Chicago relevance tag (direct / adjacent / general / not relevant).
3. Click Approve for items that are relevant and accurate.
   Click Reject (with a reason) for items that are off-topic, outdated, or inappropriate.
4. Approved items appear immediately on the public content hub.

**Submit a manual item (for Instagram, LinkedIn, or national alumni posts):**
1. Navigate to Admin > Content > Submit URL.
2. Paste the full URL to the post or article.
3. Add a title and a short summary (under 500 characters).
4. Set the source platform and publication date.
5. Submit. The item enters the approval queue like any automated item.

**What NOT to do:**
- Do not copy full article text. Store summaries only (under 500 characters) with a link
  back to the original source. This is a copyright requirement.
- Do not copy images into the platform. Link to the source image.

**Alert: zero-item fetch:**
If the news source returns zero items for two consecutive sync runs, the admin queue
will show an alert. This usually means the Morehouse College website changed its
template — it is not a sign of a dry news spell. Contact the technical board member to
check the content-sync function.

---

### 1.5 Export reports

**Member roster export:**
1. Navigate to Admin > Members.
2. Use the Export CSV button to download the current roster.
3. The CSV includes name, email, class year, membership status, dues status, and join date.
4. Member emails are exported for chapter use only. Do not share with third parties.

**Dues / financial export:**
1. Navigate to Admin > Dues.
2. Filter by period (current year), status (paid / waived / overdue), or member.
3. Export CSV for the selected view.
4. For Stripe transaction records, log in directly to the Stripe dashboard at
   dashboard.stripe.com with the chapter Stripe account credentials.

**Event registrations:**
1. Navigate to Admin > Events > (select event) > Registrations.
2. Export the attendee list as CSV for check-in or communication.

---

## Part 2 — Provisioning Checklist

This section is for the one-time setup of the platform. Complete these steps in order.
Steps marked [REQUIRED] must be completed before any member can sign in or pay dues.
Steps marked [PROVISION] are placeholders where you must supply real credentials.

---

### 2.1 Create the Supabase project [REQUIRED]

1. Go to supabase.com and create a new project in the Morehouse Chicago Alumni org
   (or create the org if it does not yet exist).
2. Choose a strong database password and save it in the chapter password manager
   (1Password or equivalent). This password is NOT recoverable if lost.
3. Note your project reference ID (the subdomain: `your-project-ref.supabase.co`).

**Reference:** https://supabase.com/docs/guides/getting-started/local-development

---

### 2.2 Run the database migrations [REQUIRED]

On a machine with Node.js and the Supabase CLI installed:

```bash
npm install -g supabase
supabase login
supabase db push --project-ref your-project-ref
```

This applies all migration files in `supabase/migrations/` in order (001 through 010).
Migration 010 seeds the three membership plans (Standard $75/yr, Premium $150/yr, Comped).

Verify with: `supabase db status --project-ref your-project-ref`

**If running locally first:**
```bash
supabase start
supabase db reset
```

---

### 2.3 Register the access-token hook [REQUIRED]

The platform uses a Postgres function to inject the member's role into their JWT so
admin/board access is enforced server-side.

1. In the Supabase Dashboard, navigate to Authentication > Hooks.
2. Under "Customize Access Token (JWT) Claims," select
   `public.custom_access_token_hook` as the hook function.
3. Save.

Without this step, `Auth.requireAdmin()` will not work and admin pages will be inaccessible
to all users including the admin account.

**Reference:** https://supabase.com/docs/guides/auth/auth-hooks

---

### 2.4 Create the first admin account [REQUIRED]

1. In the Supabase Dashboard, navigate to Authentication > Users > Invite User.
2. Enter the chapter president's email address.
3. After the president signs in via the invitation link, navigate to Table Editor >
   `profiles` > find the new row.
4. Set the `role` column to `admin`.
5. Sign out and sign back in. The JWT will now carry `role: admin`.

---

### 2.5 Set Supabase Vault secrets [REQUIRED for content sync]

The content-sync Edge Function reads API credentials from the Supabase Vault.
For the current build-now sources (Localist RSS, HTML parse, sitemap), no API keys
are required — these are public endpoints. Set these secrets when you add auth-required
sources in the future.

To add a secret to the Vault:
```bash
supabase secrets set MY_SECRET_NAME="value" --project-ref your-project-ref
```

The `api_config_key` column in `content_sources` stores the secret NAME (never the value).

---

### 2.6 Deploy Edge Functions [REQUIRED]

```bash
supabase functions deploy create-checkout-session --project-ref your-project-ref
supabase functions deploy stripe-webhook --project-ref your-project-ref
supabase functions deploy content-sync --project-ref your-project-ref
```

Set the required environment variables for the payment functions:

```bash
supabase secrets set STRIPE_SECRET_KEY="sk_live_..." --project-ref your-project-ref
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref your-project-ref
```

These keys come from the chapter's Stripe dashboard (see 2.7).

**SECURITY:** Never put `sk_live_`, `sk_test_`, or `whsec_` values in any file in this
repository. They belong only in Supabase secrets (Edge Function env) or in the chapter
password manager.

---

### 2.7 Create Stripe products and prices [REQUIRED for dues collection]

[PROVISION] The chapter must create a Stripe account at stripe.com if one does not exist.

In the Stripe dashboard:
1. Create a Product named "Standard Membership" — recurring, $75.00/year.
   Copy the `prod_...` product ID and the `price_...` price ID.
2. Create a Product named "Premium Membership" — recurring, $150.00/year.
   Copy the product ID and price ID.
3. Update the `membership_plans` table in Supabase with these IDs:
   ```sql
   update public.membership_plans
     set stripe_product_id = 'prod_standard', stripe_price_id = 'price_standard'
     where name = 'Standard Membership';

   update public.membership_plans
     set stripe_product_id = 'prod_premium', stripe_price_id = 'price_premium'
     where name = 'Premium Membership';
   ```
4. In the Stripe dashboard, create a Webhook endpoint pointing to:
   `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   Select events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `invoice.payment_action_required`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `charge.refunded`.
5. Copy the webhook signing secret (`whsec_...`) and add it as a Supabase secret (step 2.6).

---

### 2.8 Fill js/config.js [REQUIRED]

Open `js/config.js` and replace the placeholder values with the real Supabase URL
and anon key (NOT the service role key — the anon key is safe to commit):

```javascript
window.SUPABASE_URL = 'https://your-project-ref.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGci...'; // anon key from Supabase > Settings > API
window.SUPABASE_CONFIGURED = true;
```

The anon key is the public key that lives in the frontend. It is safe to commit.
The service role key MUST NOT be in this file.

---

### 2.9 Import the founding member roster [REQUIRED]

Prepare the member CSV using `data/seed/members.sample.csv` as a template.
Required columns: `email`, `full_name`, `class_year`, `chapter_role_title`.

Run the import script locally:

```bash
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."   # service role key — never commit this
node scripts/import-members.mjs path/to/your-roster.csv
```

After the import, send invitation emails to members from the Supabase dashboard or:
```bash
# For each member who needs a magic link:
supabase auth admin inviteUserByEmail your-member@example.com --project-ref your-project-ref
```

---

### 2.10 Seed the content_sources table [REQUIRED for content hub]

The content_sources.json file contains the six sources (three active, three deferred).
Insert them via the Supabase table editor or via SQL:

```sql
-- Example for the Localist RSS source. Run for each row in content_sources.json.
insert into public.content_sources
  (platform, source_name, source_url, api_url, fetch_method, poll_interval_hours,
   active, requires_auth, auth_notes, consecutive_failures)
values
  ('morehouse_events', 'Morehouse College Events (Localist RSS)',
   'https://events.morehouse.edu', 'https://events.morehouse.edu/calendar/1.xml',
   'rss_poll', 6, true, false, null, 0);
```

The Instagram and LinkedIn rows should be inserted with `active = false` and the
`auth_notes` from the JSON file. They remain inactive until the college grants OAuth.

---

### 2.11 Deploy the frontend [REQUIRED]

Host the static files (all `.html`, `css/`, `js/`, `assets/` directories) on any
static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

Required HTTP headers at the hosting layer:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; connect-src https://your-project-ref.supabase.co https://js.stripe.com; frame-src https://js.stripe.com; style-src 'self' 'unsafe-inline';`

Adjust the CSP `connect-src` with your real Supabase project URL.

---

## Part 3 — Ongoing Maintenance

- **Renew Stripe products:** Stripe subscription prices should not be changed once members
  are subscribed. Create a new price and migrate subscriptions if the dues amount changes.
- **Content sync alerts:** if the content hub shows a zero-item alert for the news source,
  the Morehouse College news page template may have changed. The technical board member
  should update the HTML parse selectors in the content-sync Edge Function.
- **Morehouse partnership ask:** the single highest-value relationship action for reliable
  content is to ask Morehouse College web communications to enable an official RSS feed for
  `news.morehouse.edu` and to consider granting social content access to the chapter app.
- **Member offboarding:** when a member leaves, set their `membership_status` to `lapsed`
  or `suspended`. Do not delete profile rows (audit log integrity).
- **Annual dues cycle:** at the start of each dues period, the board treasurer should
  generate invoices for active members. Members with Stripe subscriptions are billed
  automatically; others receive a manual invoice.
