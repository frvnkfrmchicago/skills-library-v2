-- ═══ SEED: Frank Lawrence Jr. as founder admin ═══
-- This runs AFTER the auto-profile trigger creates the profile row.
-- Sets the founder as the only admin.

UPDATE profiles
SET role = 'admin',
    display_name = 'Frank Lawrence Jr.',
    bio = 'Founder of Asset Persona. Teaching AI fluency, building digital products, and marketing in the AI economy.'
WHERE id = 'e8994136-6b30-43e2-9784-f95fdc87639a';

-- Safety: if trigger didn't fire, insert directly
INSERT INTO profiles (id, display_name, role, bio)
VALUES (
  'e8994136-6b30-43e2-9784-f95fdc87639a',
  'Frank Lawrence Jr.',
  'admin',
  'Founder of Asset Persona. Teaching AI fluency, building digital products, and marketing in the AI economy.'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
