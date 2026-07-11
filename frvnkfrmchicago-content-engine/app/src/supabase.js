// =============================================================================
// src/supabase.js -- Supabase client setup for Asset Persona Content Hub
// =============================================================================
// Reads SUPABASE_URL and SUPABASE_ANON_KEY from a global config object.
// Falls back gracefully when Supabase is not configured.
// =============================================================================

const SUPABASE_CONFIG = window.AP_CONFIG || {};
const SUPABASE_URL = SUPABASE_CONFIG.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.SUPABASE_ANON_KEY || '';

let apSupaClient = null;
let activeChannel = null;

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[supabase] No URL or key configured -- running in offline mode.');
    return null;
  }

  const lib = window.supabase || window.supabaseJs;
  if (!lib || typeof lib.createClient !== 'function') {
    console.warn('[supabase] Supabase client library not loaded.');
    return null;
  }

  try {
    apSupaClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[supabase] Client initialized.');
    return apSupaClient;
  } catch (err) {
    console.error('[supabase] Init failed:', err);
    return null;
  }
}

/**
 * Subscribe to realtime changes on the posts table.
 * @param {Function} callback -- called with (eventType, payload)
 * @returns {Function} unsubscribe
 */
function subscribeToPostChanges(callback) {
  if (!apSupaClient) {
    console.warn('[supabase] Cannot subscribe -- client not initialized.');
    return function noop() {};
  }

  if (activeChannel) {
    try { apSupaClient.removeChannel(activeChannel); } catch (e) { /* noop */ }
  }

  activeChannel = apSupaClient
    .channel('ap-posts-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      function (payload) {
        try {
          callback(payload.eventType, payload);
        } catch (err) {
          console.error('[supabase] Realtime handler error:', err);
        }
      }
    )
    .subscribe(function (status) {
      if (status === 'SUBSCRIBED') {
        console.log('[supabase] Realtime SUBSCRIBED to posts.');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
         console.warn('[supabase] Realtime status:', status);
      }
    });

  return function unsubscribe() {
    if (activeChannel && apSupaClient) {
      try { apSupaClient.removeChannel(activeChannel); } catch (e) { /* noop */ }
      activeChannel = null;
    }
  };
}

// Cleanup on page unload
window.addEventListener('beforeunload', function () {
  if (activeChannel && apSupaClient) {
    try { apSupaClient.removeChannel(activeChannel); } catch (e) { /* noop */ }
  }
});

// Auto-init
initSupabase();

// Expose globally for other modules
window.apSupabase = apSupaClient;
window.subscribeToPostChanges = subscribeToPostChanges;
