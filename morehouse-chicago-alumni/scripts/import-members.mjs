/**
 * import-members.mjs
 * Lane 8 — Morehouse Chicago Alumni Association
 *
 * PURPOSE: Import a CSV of chapter members into the Supabase database.
 * Reads data/seed/members.sample.csv (or a path supplied as a CLI argument),
 * validates required columns, and upserts rows into the `profiles` and `members`
 * tables using the Supabase service role key.
 *
 * SECURITY: The service role key is NEVER committed. It must be set in the
 * environment before running this script:
 *
 *   export SUPABASE_URL="https://your-project-ref.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *   node scripts/import-members.mjs data/seed/members.sample.csv
 *
 * This script is intended to be run locally by a board officer who has been
 * granted the service role key by the chapter president. The key is stored in
 * 1Password or the Supabase dashboard secret — never in this file or .env
 * committed to source control.
 *
 * WHAT IT DOES:
 *   1. Reads and parses the CSV (header row required).
 *   2. Validates that required columns are present and each row passes checks.
 *   3. For each valid row, creates an auth user (if not already present) and
 *      upserts a profiles row + members row.
 *   4. Prints a per-row summary and a final report.
 *
 * REQUIRED CSV COLUMNS:
 *   email         — valid email address for the member
 *   full_name     — member's full name
 *   class_year    — four-digit Morehouse graduation year (1867–2100)
 *   chapter_role_title — free-text role title (e.g. "Chapter President", "Member")
 *
 * OPTIONAL CSV COLUMNS (ignored if not present):
 *   membership_status — one of: pending, active, lapsed, past_due, comped,
 *                       lifetime, manual, suspended, paused, expired
 *                       Defaults to "pending" if omitted.
 *   notes             — admin-only free-text note (not visible to the member)
 *
 * KNOWN LIMITATIONS:
 *   - This script does NOT set Supabase Auth passwords. Members sign in via
 *     the "magic link" (email OTP) flow until they set a password. The board
 *     must trigger the invite/magic-link email from the admin dashboard or via
 *     the Supabase admin API after import.
 *   - stripe_customer_id is not set here; it is created lazily when the member
 *     initiates dues payment through the Stripe Checkout flow.
 *   - class_year is stored on both profiles and members; both are set from the
 *     CSV. If they diverge in future edits, members.class_year is the chapter
 *     record; profiles.class_year is the public display value.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// 1. Environment validation
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('');
  console.error('ERROR: Required environment variables are not set.');
  console.error('');
  console.error('  export SUPABASE_URL="https://your-project-ref.supabase.co"');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.error('');
  console.error('The service role key is available in the Supabase dashboard under');
  console.error('Project Settings > API > Project API keys > service_role (secret).');
  console.error('');
  process.exit(1);
}

if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co')) {
  console.error('ERROR: SUPABASE_URL does not look like a valid Supabase project URL.');
  console.error('  Expected format: https://your-project-ref.supabase.co');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. CSV path from CLI argument or default
// ---------------------------------------------------------------------------

const csvPath = process.argv[2]
  ? resolve(process.argv[2])
  : resolve('data/seed/members.sample.csv');

console.log('');
console.log('Morehouse Chicago Alumni — Member Import');
console.log('=========================================');
console.log('CSV path:', csvPath);
console.log('Supabase URL:', SUPABASE_URL);
console.log('');

// ---------------------------------------------------------------------------
// 3. Parse CSV
// ---------------------------------------------------------------------------

const REQUIRED_COLUMNS = ['email', 'full_name', 'class_year', 'chapter_role_title'];

const VALID_MEMBERSHIP_STATUSES = new Set([
  'pending', 'active', 'lapsed', 'past_due', 'comped',
  'lifetime', 'manual', 'suspended', 'paused', 'expired',
]);

function parseCsv(filePath) {
  let raw;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('ERROR: Cannot read CSV file:', filePath);
    console.error(' ', err.message);
    process.exit(1);
  }

  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) {
    console.error('ERROR: CSV file must have a header row and at least one data row.');
    process.exit(1);
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));

  // Validate required columns
  const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    console.error('ERROR: CSV is missing required columns:', missing.join(', '));
    console.error('  Required columns:', REQUIRED_COLUMNS.join(', '));
    console.error('  Found columns:   ', headers.join(', '));
    process.exit(1);
  }

  const colIndex = (name) => headers.indexOf(name);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`  WARN row ${i + 1}: column count (${values.length}) does not match header (${headers.length}) — skipping.`);
      continue;
    }

    const get = (col) => (values[colIndex(col)] || '').trim();

    rows.push({
      lineNumber: i + 1,
      email: get('email'),
      full_name: get('full_name'),
      class_year: get('class_year'),
      chapter_role_title: get('chapter_role_title'),
      membership_status: get('membership_status') || 'pending',
      notes: get('notes') || null,
    });
  }

  return rows;
}

/**
 * Minimal CSV line splitter. Handles quoted fields with commas inside.
 * Does not handle escaped quotes within fields — sufficient for a board-managed roster.
 */
function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------------------------------
// 4. Row validation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRow(row) {
  const errors = [];

  if (!row.email || !EMAIL_RE.test(row.email)) {
    errors.push('invalid email');
  }
  if (row.email.toLowerCase().includes('test@test') || row.email.toLowerCase().includes('example.com')) {
    errors.push('placeholder email — replace with a real address');
  }
  if (!row.full_name || row.full_name.trim().length < 2) {
    errors.push('full_name is empty or too short');
  }
  if (row.full_name.toLowerCase().includes('john doe') || row.full_name.toLowerCase() === 'placeholder') {
    errors.push('full_name appears to be a placeholder — replace with a real name');
  }
  const year = parseInt(row.class_year, 10);
  if (isNaN(year) || year < 1867 || year > 2100) {
    errors.push(`class_year must be a number between 1867 and 2100 (got "${row.class_year}")`);
  }
  if (!row.chapter_role_title || row.chapter_role_title.trim().length === 0) {
    errors.push('chapter_role_title is empty');
  }
  if (!VALID_MEMBERSHIP_STATUSES.has(row.membership_status)) {
    errors.push(`membership_status "${row.membership_status}" is not a valid enum value`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// 5. Upsert logic
// ---------------------------------------------------------------------------

async function importRows(rows) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const results = { success: 0, skipped: 0, failed: 0, rows: [] };

  for (const row of rows) {
    const errors = validateRow(row);
    if (errors.length > 0) {
      console.warn(`  SKIP row ${row.lineNumber} (${row.email || 'no email'}): ${errors.join('; ')}`);
      results.skipped++;
      results.rows.push({ lineNumber: row.lineNumber, email: row.email, status: 'skipped', reason: errors.join('; ') });
      continue;
    }

    try {
      // 5a. Create the Supabase auth user (idempotent — listUsers by email).
      //     The service role lets us create users directly without sending an
      //     invitation email (set emailConfirm: true to skip the confirm step).
      //     The board MUST separately trigger an invitation / password-reset
      //     email for each imported member so they can actually sign in.
      let userId;

      const { data: existingUsers, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) throw new Error(`listUsers failed: ${listErr.message}`);

      const existingUser = existingUsers.users.find(
        (u) => u.email && u.email.toLowerCase() === row.email.toLowerCase()
      );

      if (existingUser) {
        userId = existingUser.id;
        console.log(`  Row ${row.lineNumber}: auth user already exists (${row.email}) — using existing id ${userId}`);
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: row.email,
          email_confirm: true,
          user_metadata: { full_name: row.full_name },
        });
        if (createErr) throw new Error(`createUser failed: ${createErr.message}`);
        userId = newUser.user.id;
        console.log(`  Row ${row.lineNumber}: auth user created (${row.email}) id=${userId}`);
      }

      // 5b. Upsert the profiles row.
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: row.email.toLowerCase(),
            full_name: row.full_name,
            class_year: parseInt(row.class_year, 10),
            role: 'member',
          },
          { onConflict: 'id' }
        );
      if (profileErr) throw new Error(`profiles upsert failed: ${profileErr.message}`);

      // 5c. Upsert the members row.
      //     The members table uses profile_id as the unique key.
      const { error: memberErr } = await supabase
        .from('members')
        .upsert(
          {
            profile_id: userId,
            class_year: parseInt(row.class_year, 10),
            chapter_role_title: row.chapter_role_title,
            membership_status: row.membership_status,
            notes: row.notes,
          },
          { onConflict: 'profile_id' }
        );
      if (memberErr) throw new Error(`members upsert failed: ${memberErr.message}`);

      console.log(`  Row ${row.lineNumber}: OK — ${row.full_name} (${row.email}) status=${row.membership_status}`);
      results.success++;
      results.rows.push({ lineNumber: row.lineNumber, email: row.email, status: 'ok' });

    } catch (err) {
      console.error(`  ERROR row ${row.lineNumber} (${row.email}): ${err.message}`);
      results.failed++;
      results.rows.push({ lineNumber: row.lineNumber, email: row.email, status: 'error', reason: err.message });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// 6. Main
// ---------------------------------------------------------------------------

async function main() {
  const rows = parseCsv(csvPath);
  console.log(`Parsed ${rows.length} data row(s) from CSV.`);
  console.log('');

  if (rows.length === 0) {
    console.log('No rows to import. Exiting.');
    process.exit(0);
  }

  const results = await importRows(rows);

  console.log('');
  console.log('--- Import Summary ---');
  console.log(`  Total rows:  ${rows.length}`);
  console.log(`  Succeeded:   ${results.success}`);
  console.log(`  Skipped:     ${results.skipped}`);
  console.log(`  Failed:      ${results.failed}`);
  console.log('');

  if (results.failed > 0) {
    console.error('One or more rows failed. Review the errors above.');
    console.error('Fix the CSV and re-run; upsert logic is idempotent for rows that already succeeded.');
    process.exit(1);
  }

  if (results.skipped > 0) {
    console.warn('Some rows were skipped due to validation errors. Review the warnings above.');
    console.warn('Correct the CSV and re-run for those rows.');
  }

  if (results.success > 0) {
    console.log('Import complete.');
    console.log('');
    console.log('NEXT STEP: Send password-reset / invitation emails to imported members.');
    console.log('  Option A: Supabase Dashboard > Authentication > Users > (select user) > Send magic link.');
    console.log('  Option B: supabase auth admin inviteUserByEmail --email "<email>"');
    console.log('  Members cannot sign in until they set a password or receive a magic link.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Unhandled error:', err.message);
  process.exit(1);
});
