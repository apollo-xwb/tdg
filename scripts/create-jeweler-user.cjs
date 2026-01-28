/**
 * One-time script to create the predefined jeweler auth user.
 * Run once after creating your Supabase project. Reconfigure the password
 * later in Supabase Dashboard → Authentication → Users.
 *
 * Env (required):
 *   SUPABASE_URL              e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API
 *   JEWELER_EMAIL             e.g. jeweler@thediamondguy.co.za
 *
 * Env (optional):
 *   JEWELER_INITIAL_PASSWORD  if unset, a strong random password is generated and printed
 *
 * Then set VITE_JEWELER_EMAIL in .env.local to the same JEWELER_EMAIL.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load .env.local, .env, or .env.example into process.env (simple inline parser)
function loadEnv() {
  const root = path.resolve(__dirname, '..');
  const candidates = ['.env.local', '.env', '.env.example'];
  for (const name of candidates) {
    const file = path.join(root, name);
    if (fs.existsSync(file)) {
      const body = fs.readFileSync(file, 'utf8');
      body.split('\n').forEach((line) => {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      });
      return;
    }
  }
}
loadEnv();

function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const num = '23456789';
  const sym = '!@#$%&*';
  const pick = (s, n) => Array.from({ length: n }, () => s[crypto.randomInt(0, s.length)]).join('');
  const part = [
    pick(upper, 2), pick(lower, 2), pick(num, 2), pick(sym, 2),
    pick(upper + lower + num + sym, 10)
  ].join('');
  return part.split('').sort(() => crypto.randomInt(0, 2) - 1).join('');
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.JEWELER_EMAIL || process.env.VITE_JEWELER_EMAIL || '').trim().toLowerCase();
let password = process.env.JEWELER_INITIAL_PASSWORD;
const generated = !password;
if (generated) password = generatePassword();

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!email) {
  console.error('Set JEWELER_EMAIL (e.g. jeweler@thediamondguy.co.za)');
  process.exit(1);
}
if (password.length < 10) {
  console.error('JEWELER_INITIAL_PASSWORD must be at least 10 characters (or leave unset to auto-generate)');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    if (error.message && error.message.includes('already been registered')) {
      console.log('Jeweler user already exists. Update the password in Supabase Dashboard → Authentication → Users if needed.');
      return;
    }
    console.error('Error creating jeweler user:', error.message);
    process.exit(1);
  }
  console.log('Jeweler user created:', data.user?.email);
  console.log('Set VITE_JEWELER_EMAIL=' + email + ' in .env.local');
  if (generated) {
    console.log('');
    console.log('Initial password (save it; it won’t be shown again):');
    console.log(password);
    console.log('');
  }
  console.log('Change the password in Supabase Dashboard → Authentication → Users when ready.');
}

main();
