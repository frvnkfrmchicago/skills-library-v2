/**
 * HMAC-SHA256 helper for signing Edge Function → n8n webhook payloads.
 *
 * The n8n workflow verifies the signature in its first Function node before
 * processing. Without this, anyone who discovered the n8n URL could spoof
 * inquiries directly into Frank's inbox.
 */
const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signHmac(
  secret: string,
  message: string
): Promise<string> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyHmac(
  secret: string,
  message: string,
  expected: string
): Promise<boolean> {
  const actual = await signHmac(secret, message);
  // Constant-time compare
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
