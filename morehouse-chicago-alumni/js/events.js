/**
 * MOREHOUSE ALUMNI — EVENTS MODULE
 * Lane G — mcaa-wave-002 (updated from Lane 3 — mcaa-wave-001)
 *
 * All reads/writes go through window.supabaseClient (contract §2.2).
 * Store.get/set removed — no localStorage dependency.
 * Security: no innerHTML for user-controlled strings (§9 rule 7).
 * Payments: PayPal only. RSVPs.createPaid invokes paypal-checkout Edge Function
 *   (docs/payment-contract-paypal.md §4). No Stripe; no stripe_price_id.
 */

/* ─────────────────────────────────────────────────────
   Internal helpers
───────────────────────────────────────────────────── */

/**
 * Return the authenticated profile_id for the current session, or null.
 */
function _currentProfileId() {
  if (!window.Store || !window.Store._session) return null;
  return window.Store._session.user?.id || null;
}

/**
 * Return true if the current user has role admin or board (from JWT).
 */
function _isAdminOrBoard() {
  const role = window.Store?._session?.user?.app_metadata?.role;
  return role === 'admin' || role === 'board';
}

/**
 * Return true if the current user is a signed-in member (any role).
 */
function _isSignedIn() {
  return window.Store ? window.Store.isSignedIn() : false;
}

/* ─────────────────────────────────────────────────────
   Events namespace
───────────────────────────────────────────────────── */

const Events = {

  /**
   * Fetch all published events visible to the current session.
   * RLS on the server handles visibility for members_only/board_only rows.
   * Returns array of event rows (camelCase remapped).
   */
  async getAll() {
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('[Events.getAll]', error.message);
      return [];
    }
    return (data || []).map(_mapEvent);
  },

  /**
   * Fetch a single event by UUID.
   * Returns the event object or null if not found / RLS blocked.
   */
  async getById(id) {
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[Events.getById]', error.message);
      return null;
    }
    return data ? _mapEvent(data) : null;
  },

  /**
   * Upcoming published events on or after today, RLS-filtered.
   */
  async getUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('[Events.getUpcoming]', error.message);
      return [];
    }
    return (data || []).map(_mapEvent);
  },

  /**
   * Upcoming events filtered by category string.
   */
  async getByCategory(category) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('[Events.getByCategory]', error.message);
      return [];
    }
    return (data || []).map(_mapEvent);
  },

  /**
   * Events in a specific calendar month (1-indexed).
   */
  async getByMonth(year, month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end   = `${year}-${String(month).padStart(2, '0')}-31`;
    const { data, error } = await window.supabaseClient
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('event_date', start)
      .lte('event_date', end)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('[Events.getByMonth]', error.message);
      return [];
    }
    return (data || []).map(_mapEvent);
  },

  /**
   * Admin: create a new event row.
   */
  async create(eventData) {
    const row = _toDbEvent(eventData);
    const { data, error } = await window.supabaseClient
      .from('events')
      .insert(row)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: _mapEvent(data) };
  },

  /**
   * Admin: update an event row.
   */
  async update(id, updates) {
    const row = _toDbEvent(updates);
    const { data, error } = await window.supabaseClient
      .from('events')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: _mapEvent(data) };
  },

  /**
   * Admin: soft-delete by setting status = 'cancelled'.
   */
  async delete(id) {
    const { error } = await window.supabaseClient
      .from('events')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { error: error.message };
    return { data: true };
  },

  /**
   * Count approved registrations for an event.
   * Returns { morehouse, guests, total, waitlisted }.
   * "morehouse" = registrations where the profile has a class_year (set on profile).
   * For display purposes we count registrations; guest_count is additive.
   */
  async getAttendeeCount(eventId) {
    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('status, guest_count, profiles(class_year)')
      .eq('event_id', eventId)
      .in('status', ['approved', 'checked_in']);

    if (error) {
      console.error('[Events.getAttendeeCount]', error.message);
      return { morehouse: 0, guests: 0, total: 0, waitlisted: 0 };
    }

    const rows = data || [];
    let morehouse = 0, guests = 0, waitlisted = 0;

    rows.forEach(r => {
      const isMorehouse = r.profiles?.class_year != null;
      if (r.status === 'waitlisted') {
        waitlisted++;
        return;
      }
      if (isMorehouse) morehouse++;
      else morehouse++; // every registrant counts once
      guests += (r.guest_count || 0);
    });

    // total = attendees (each registration = 1 person) + their guests
    const total = rows.length + rows.reduce((s, r) => s + (r.guest_count || 0), 0);

    // Recalculate waitlisted separately
    const { data: wData } = await window.supabaseClient
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'waitlisted');

    return {
      morehouse: rows.filter(r => r.status !== 'waitlisted').length,
      guests: rows.reduce((s, r) => s + (r.guest_count || 0), 0),
      total,
      waitlisted: wData || 0,
    };
  },

  /**
   * Fixed category list used for filter UI.
   */
  getCategories() {
    return [
      { id: 'all',          label: 'All Events' },
      { id: 'scholarship',  label: 'Scholarships' },
      { id: 'networking',   label: 'Networking' },
      { id: 'community',    label: 'Community Service' },
      { id: 'social',       label: 'Social' },
      { id: 'professional', label: 'Professional Dev' },
    ];
  },
};


/* ─────────────────────────────────────────────────────
   RSVPs namespace
───────────────────────────────────────────────────── */

const RSVPs = {

  /**
   * All registrations (admin use — RLS will filter to own rows for members).
   */
  async getAll() {
    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('*, profiles(full_name, class_year, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[RSVPs.getAll]', error.message);
      return [];
    }
    return (data || []).map(_mapReg);
  },

  /**
   * Registrations for a specific event.
   * Attendee list gate: only members/admin may see other registrants (§9 / §6 RLS).
   * Non-members will get an empty array from RLS.
   */
  async getByEvent(eventId) {
    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('*, profiles(full_name, class_year, avatar_url)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[RSVPs.getByEvent]', error.message);
      return [];
    }
    return (data || []).map(_mapReg);
  },

  /**
   * Registrations for the current user.
   */
  async getByCurrentMember() {
    const profileId = _currentProfileId();
    if (!profileId) return [];

    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('*, events(id, title, event_date, start_time, location)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[RSVPs.getByCurrentMember]', error.message);
      return [];
    }
    return (data || []).map(_mapReg);
  },

  /**
   * Pending registrations for admin approval queue.
   */
  async getPending() {
    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('*, profiles(full_name, class_year), events(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[RSVPs.getPending]', error.message);
      return [];
    }
    return (data || []).map(_mapReg);
  },

  /**
   * Check whether the current user has already registered for an event.
   * Returns the registration row or null.
   */
  async getMyRegistration(eventId) {
    const profileId = _currentProfileId();
    if (!profileId) return null;

    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      console.error('[RSVPs.getMyRegistration]', error.message);
      return null;
    }
    return data ? _mapReg(data) : null;
  },

  /**
   * Register the current user for a FREE event.
   *
   * Logic:
   * 1. User must be signed in.
   * 2. Member-only events require a signed-in member.
   * 3. Duplicate registration blocked (unique constraint on event_id + profile_id).
   * 4. If capacity reached and waitlist_capacity > 0 → status = 'waitlisted'.
   * 5. If requires_approval → status = 'pending'; else 'approved'.
   *
   * Returns { data: registration } or { error: string }.
   */
  async create(rsvpData) {
    const profileId = _currentProfileId();
    if (!profileId) return { error: 'You must be signed in to register.' };

    // Load event
    const event = await Events.getById(rsvpData.eventId);
    if (!event) return { error: 'Event not found.' };

    // Member-only gate
    if (event.visibility === 'members_only' && !_isSignedIn()) {
      return { error: 'This event is for members only. Please sign in.' };
    }
    if (event.visibility === 'board_only' && !_isAdminOrBoard()) {
      return { error: 'This event is for board members only.' };
    }

    // Duplicate check
    const existing = await this.getMyRegistration(rsvpData.eventId);
    if (existing && existing.status !== 'cancelled') {
      return { error: 'You have already registered for this event.' };
    }

    // Capacity check
    const counts = await Events.getAttendeeCount(rsvpData.eventId);
    const totalAfter = counts.total + 1 + (rsvpData.guestCount || 0);
    let initialStatus = event.requiresApproval ? 'pending' : 'approved';

    if (event.capacity) {
      if (totalAfter > event.capacity) {
        // Check waitlist room
        const waitlistCap = event.waitlistCapacity || 0;
        if (waitlistCap > 0 && counts.waitlisted < waitlistCap) {
          initialStatus = 'waitlisted';
        } else {
          return { error: 'This event has reached capacity and the waitlist is full.' };
        }
      }
    }

    const row = {
      event_id:        rsvpData.eventId,
      profile_id:      profileId,
      guest_count:     rsvpData.guestCount || 0,
      status:          initialStatus,
      payment_status:  'not_required',
      notes:           rsvpData.notes || null,
    };

    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .insert(row)
      .select()
      .single();

    if (error) {
      // Unique constraint violation = already registered
      if (error.code === '23505') {
        return { error: 'You have already registered for this event.' };
      }
      return { error: error.message };
    }
    return { data: _mapReg(data) };
  },

  /**
   * Initiate registration for a PAID event.
   * Inserts a 'pending' registration row with payment_status='pending',
   * then invokes the PayPal checkout Edge Function (Lane B contract §4).
   *
   * Checkout call shape (Lane B seam — docs/payment-contract-paypal.md §4):
   *   POST /functions/v1/paypal-checkout
   *   Body: {
   *     purpose: 'event_ticket',
   *     event_id: string (UUID),
   *     event_registration_id: string (UUID),  // just-inserted pending row
   *     profile_id: string (UUID),
   *     guest_count: number,
   *   }
   *   Response 200: { order_id: string, status: string, approve_url: string }
   *   Response 4xx: { error: string } — e.g. 'EVENT_NOT_PAID', 'EVENT_AT_CAPACITY'
   *
   * The caller renders paypal.Buttons({ createOrder: () => order_id, onApprove }).
   * Returns { orderId, approveUrl, registration } on success, or { error: string }.
   *
   * No Stripe. No stripe_price_id. Amount is read server-side from events.price_cents.
   */
  async createPaid(rsvpData) {
    const profileId = _currentProfileId();
    if (!profileId) return { error: 'You must be signed in to purchase a ticket.' };

    const event = await Events.getById(rsvpData.eventId);
    if (!event) return { error: 'Event not found.' };

    // Member-only / board-only gate
    if (event.visibility === 'members_only' && !_isSignedIn()) {
      return { error: 'This event is for members only. Please sign in.' };
    }
    if (event.visibility === 'board_only' && !_isAdminOrBoard()) {
      return { error: 'This event is for board members only.' };
    }

    // Duplicate check
    const existing = await this.getMyRegistration(rsvpData.eventId);
    if (existing && existing.status !== 'cancelled') {
      return { error: 'You have already registered for this event.' };
    }

    // Capacity check before creating the pending row
    const counts = await Events.getAttendeeCount(rsvpData.eventId);
    const totalAfter = counts.total + 1 + (rsvpData.guestCount || 0);
    if (event.capacity && totalAfter > event.capacity) {
      const waitlistCap = event.waitlistCapacity || 0;
      if (waitlistCap === 0 || counts.waitlisted >= waitlistCap) {
        return { error: 'This event has reached capacity and the waitlist is full.' };
      }
      // Waitlisted paid registrations are a deferred feature — block for now
      return { error: 'Event is at capacity. Paid waitlist not yet available.' };
    }

    // Insert pending row first so registration_id can be stamped in the PayPal order's custom_id
    const row = {
      event_id:       rsvpData.eventId,
      profile_id:     profileId,
      guest_count:    rsvpData.guestCount || 0,
      status:         'pending',
      payment_status: 'pending',
    };

    const { data: regData, error: regError } = await window.supabaseClient
      .from('event_registrations')
      .insert(row)
      .select()
      .single();

    if (regError) {
      if (regError.code === '23505') return { error: 'You have already registered for this event.' };
      return { error: regError.message };
    }

    const reg = _mapReg(regData);

    // Call Lane B's PayPal checkout Edge Function (payment-contract-paypal.md §4)
    // Body is event_ticket discriminant — no amount, no price, no Stripe fields
    const { data: fnData, error: fnError } = await window.supabaseClient.functions.invoke(
      'paypal-checkout',
      {
        body: {
          purpose:               'event_ticket',
          event_id:              rsvpData.eventId,
          event_registration_id: reg.id,
          profile_id:            profileId,
          guest_count:           rsvpData.guestCount || 0,
        },
      }
    );

    if (fnError || !fnData || fnData.error) {
      // Roll back the pending row so the user can try again
      await window.supabaseClient
        .from('event_registrations')
        .delete()
        .eq('id', reg.id);
      const code = (fnData && fnData.error) || (fnError && fnError.message) || 'CHECKOUT_FAILED';
      return { error: code };
    }

    // Return order_id for paypal.Buttons createOrder, plus approve_url as redirect fallback
    return { orderId: fnData.order_id, approveUrl: fnData.approve_url, registration: reg };
  },

  /**
   * Admin: approve a pending registration.
   */
  async approve(registrationId) {
    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: _mapReg(data) };
  },

  /**
   * Admin: deny / cancel a registration.
   */
  async deny(registrationId) {
    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: _mapReg(data) };
  },
};


/* ─────────────────────────────────────────────────────
   Row mappers (DB snake_case → JS camelCase)
   No user-controlled strings are passed through innerHTML anywhere.
───────────────────────────────────────────────────── */

function _mapEvent(row) {
  return {
    id:               row.id,
    title:            row.title,
    description:      row.description || '',
    date:             row.event_date,
    time:             row.start_time,
    endTime:          row.end_time,
    location:         row.location || '',
    locationUrl:      row.location_url,
    capacity:         row.capacity,
    waitlistCapacity: row.waitlist_capacity,
    visibility:       row.visibility,       // 'public'|'members_only'|'board_only'|'draft'
    status:           row.status,
    priceCents:       row.price_cents,
    paymentLinkUrl:   row.payment_link_url,
    imageUrl:         row.image_url,
    requiresApproval: row.requires_approval,
    category:         row.category || 'general',
    createdBy:        row.created_by,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
  };
}

function _toDbEvent(obj) {
  const out = {};
  if (obj.title            !== undefined) out.title             = obj.title;
  if (obj.description      !== undefined) out.description       = obj.description;
  if (obj.date             !== undefined) out.event_date        = obj.date;
  if (obj.time             !== undefined) out.start_time        = obj.time;
  if (obj.endTime          !== undefined) out.end_time          = obj.endTime;
  if (obj.location         !== undefined) out.location          = obj.location;
  if (obj.locationUrl      !== undefined) out.location_url      = obj.locationUrl;
  if (obj.capacity         !== undefined) out.capacity          = obj.capacity;
  if (obj.waitlistCapacity !== undefined) out.waitlist_capacity = obj.waitlistCapacity;
  if (obj.visibility       !== undefined) out.visibility        = obj.visibility;
  if (obj.status           !== undefined) out.status            = obj.status;
  if (obj.priceCents       !== undefined) out.price_cents       = obj.priceCents;
  if (obj.paymentLinkUrl   !== undefined) out.payment_link_url  = obj.paymentLinkUrl;
  if (obj.imageUrl         !== undefined) out.image_url         = obj.imageUrl;
  if (obj.requiresApproval !== undefined) out.requires_approval = obj.requiresApproval;
  if (obj.category         !== undefined) out.category          = obj.category;
  if (obj.createdBy        !== undefined) out.created_by        = obj.createdBy;
  return out;
}

function _mapReg(row) {
  return {
    id:            row.id,
    eventId:       row.event_id,
    profileId:     row.profile_id,
    guestCount:    row.guest_count,
    status:        row.status,
    paymentStatus: row.payment_status,
    paymentId:     row.payment_id,
    checkedInAt:   row.checked_in_at,
    qrCodeToken:   row.qr_code_token,
    notes:         row.notes,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
    // Joined columns when present
    name:          row.profiles?.full_name   || null,
    classYear:     row.profiles?.class_year  || null,
    avatarUrl:     row.profiles?.avatar_url  || null,
    eventTitle:    row.events?.title         || null,
    eventDate:     row.events?.event_date    || null,
  };
}

window.Events = Events;
window.RSVPs  = RSVPs;
