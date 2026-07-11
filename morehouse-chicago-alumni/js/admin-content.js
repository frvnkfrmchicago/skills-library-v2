/**
 * MOREHOUSE CHICAGO ALUMNI — ADMIN CONTENT QUEUE
 * Lane 4 — Content Hub
 *
 * Security: Auth.requireAdmin() called before any render. Admin gate = Supabase
 * session JWT (app_metadata.role), not a UI hint.
 *
 * No innerHTML for user-controlled strings — textContent or DOM methods only.
 * No secrets in this file — all Supabase access uses the anon key + RLS.
 * Admin writes succeed only because RLS policy grants content_items manage to admin role.
 *
 * Skills: api-integrating, frontend-architecting, anti-mock-enforcing
 */

(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const state = {
    items: [],
    sources: [],
    filterStatus: "pending",
    filterPlatform: "",
    filterRelevance: "",
    sortField: "relevance_score",
    loading: false,
    page: 0,
    pageSize: 25,
    rejectModalItemId: null,
    editModalItemId: null,
  };

  // Relevance sort weight (direct > adjacent > general > not_relevant)
  const RELEVANCE_WEIGHT = {
    direct: 4,
    adjacent: 3,
    general: 2,
    not_relevant: 1,
  };

  // -------------------------------------------------------------------------
  // Auth gate — FIRST operation before any DOM mutation
  // -------------------------------------------------------------------------

  async function init() {
    // FOAC: body is hidden until gate passes (see admin-content.html).
    // Auth.requireAdmin() redirects if the JWT role is not admin/board.
    if (!window.Auth || !window.Auth.requireAdmin()) return;

    // Shell render (Lane A) — runs only after the gate passes.
    if (window.Shell) {
      window.Shell.render({
        page: 'admin',
        breadcrumbs: [
          { label: 'Admin', href: 'admin.html' },
          { label: 'Content Queue' }
        ]
      });
    }

    // Admin sidebar — consistent with admin.html and admin-dues.html.
    renderAdminSidebar();

    // Reveal the body now that auth + shell have settled.
    document.body.style.visibility = "visible";

    await loadSources();
    await loadItems();
    bindToolbar();
    bindManualForm();
    bindModals();
  }

  // -------------------------------------------------------------------------
  // Admin sidebar (mirrors admin.js and admin-dues.js pattern)
  // -------------------------------------------------------------------------

  function renderAdminSidebar() {
    const sidebar = document.getElementById("admin-sidebar");
    if (!sidebar) return;
    sidebar.innerHTML = "";

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Admin navigation");

    function sidebarLink(label, href, current) {
      const a = document.createElement("a");
      a.className = "admin-sidebar__link" + (current ? " active" : "");
      a.href = href;
      a.textContent = label;
      if (current) a.setAttribute("aria-current", "page");
      return a;
    }

    nav.appendChild(sidebarLink("Overview",       "admin.html",         false));
    nav.appendChild(sidebarLink("Approvals",      "admin.html",         false));
    nav.appendChild(sidebarLink("Members",        "admin.html",         false));
    nav.appendChild(sidebarLink("Events",         "admin.html",         false));
    nav.appendChild(document.createElement("hr"));
    nav.appendChild(sidebarLink("Dues Ledger",    "admin-dues.html",    false));
    nav.appendChild(sidebarLink("Content Queue",  "admin-content.html", true));

    sidebar.appendChild(nav);
  }

  // -------------------------------------------------------------------------
  // Data loaders
  // -------------------------------------------------------------------------

  async function loadSources() {
    const { data, error } = await window.supabaseClient
      .from("content_sources")
      .select("id, platform, source_name, requires_auth, active")
      .order("source_name");

    if (error) {
      console.error("loadSources:", error.message);
      return;
    }
    state.sources = data || [];
    populateSourceFilter();
  }

  async function loadItems() {
    state.loading = true;
    renderLoadingState(true);

    let query = window.supabaseClient
      .from("content_items")
      .select(
        "id, source_id, title, summary, url, source_url, source_platform, source_date, " +
        "fetched_at, published_at, relevance_tags, chicago_relevance, content_type, " +
        "image_url, approval_status, approved_by, approved_at, rejection_reason, " +
        "is_featured, created_at, updated_at"
      );

    if (state.filterStatus) {
      query = query.eq("approval_status", state.filterStatus);
    }
    if (state.filterPlatform) {
      query = query.eq("source_platform", state.filterPlatform);
    }
    if (state.filterRelevance) {
      query = query.eq("chicago_relevance", state.filterRelevance);
    }

    // Server sort by date; relevance sort done client-side after
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("loadItems:", error.message);
      renderError("Failed to load content items. Check your connection and try again.");
      state.loading = false;
      return;
    }

    state.items = (data || []).sort(sortComparator);
    state.loading = false;
    renderLoadingState(false);
    renderQueue();
    renderPagination();
  }

  function sortComparator(a, b) {
    // Primary: relevance weight desc
    const rA = RELEVANCE_WEIGHT[a.chicago_relevance] || 1;
    const rB = RELEVANCE_WEIGHT[b.chicago_relevance] || 1;
    if (rB !== rA) return rB - rA;
    // Secondary: source_date desc (null last)
    const dA = a.source_date ? new Date(a.source_date).getTime() : 0;
    const dB = b.source_date ? new Date(b.source_date).getTime() : 0;
    return dB - dA;
  }

  // -------------------------------------------------------------------------
  // Render helpers — all textContent, no innerHTML for user strings
  // -------------------------------------------------------------------------

  function renderLoadingState(isLoading) {
    const el = document.getElementById("queue-loading");
    if (el) el.style.display = isLoading ? "block" : "none";
  }

  function renderError(msg) {
    const container = document.getElementById("queue-container");
    if (!container) return;
    container.innerHTML = "";
    const p = document.createElement("p");
    p.className = "content-error";
    p.textContent = msg;
    container.appendChild(p);
  }

  function renderQueue() {
    const container = document.getElementById("queue-container");
    if (!container) return;
    container.innerHTML = "";

    const start = state.page * state.pageSize;
    const page = state.items.slice(start, start + state.pageSize);

    if (page.length === 0) {
      const empty = document.createElement("p");
      empty.className = "queue-empty";
      empty.textContent = "No items match the current filters.";
      container.appendChild(empty);
      return;
    }

    page.forEach((item) => {
      container.appendChild(buildItemCard(item));
    });
  }

  function buildItemCard(item) {
    const card = document.createElement("div");
    card.className = "queue-card";
    card.dataset.id = item.id;
    card.dataset.status = item.approval_status;

    // Status badge
    const badge = document.createElement("span");
    badge.className = "status-badge status-" + item.approval_status;
    badge.textContent = item.approval_status.replace("_", " ");
    card.appendChild(badge);

    // Featured indicator
    if (item.is_featured) {
      const feat = document.createElement("span");
      feat.className = "featured-badge";
      feat.textContent = "Featured";
      card.appendChild(feat);
    }

    // Title
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.title || "(No title)";
    card.appendChild(title);

    // Platform + relevance meta
    const meta = document.createElement("p");
    meta.className = "card-meta";
    const platformText = item.source_platform
      ? item.source_platform.replace(/_/g, " ")
      : "unknown";
    const relevanceText = item.chicago_relevance
      ? item.chicago_relevance.replace(/_/g, " ")
      : "unknown";
    meta.textContent = platformText + " — " + relevanceText;
    if (item.source_date) {
      meta.textContent += " — " + formatDateShort(item.source_date);
    }
    card.appendChild(meta);

    // Summary
    if (item.summary) {
      const summary = document.createElement("p");
      summary.className = "card-summary";
      summary.textContent = item.summary;
      card.appendChild(summary);
    }

    // Source link (safe — href is a URL from DB, not user-rendered HTML)
    if (item.url) {
      const link = document.createElement("a");
      link.className = "card-source-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View source";
      card.appendChild(link);
    }

    // Tags
    if (item.relevance_tags && item.relevance_tags.length > 0) {
      const tags = document.createElement("div");
      tags.className = "card-tags";
      item.relevance_tags.slice(0, 5).forEach((tag) => {
        const t = document.createElement("span");
        t.className = "tag";
        t.textContent = tag;
        tags.appendChild(t);
      });
      card.appendChild(tags);
    }

    // Action buttons
    const actions = buildActionButtons(item);
    card.appendChild(actions);

    return card;
  }

  function buildActionButtons(item) {
    const actions = document.createElement("div");
    actions.className = "card-actions";

    if (item.approval_status === "pending") {
      const approveBtn = makeButton("Approve", "btn-approve", () => approveItem(item.id, false));
      const featureBtn = makeButton("Approve + Feature", "btn-feature", () => approveItem(item.id, true));
      const rejectBtn = makeButton("Reject", "btn-reject", () => openRejectModal(item.id));
      actions.appendChild(approveBtn);
      actions.appendChild(featureBtn);
      actions.appendChild(rejectBtn);
    }

    if (item.approval_status === "approved" || item.approval_status === "auto_approved") {
      if (!item.is_featured) {
        const featBtn = makeButton("Feature", "btn-feature", () => featureItem(item.id, true));
        actions.appendChild(featBtn);
      } else {
        const unfeatBtn = makeButton("Unfeature", "btn-unfeature", () => featureItem(item.id, false));
        actions.appendChild(unfeatBtn);
      }
      const archBtn = makeButton("Archive", "btn-archive", () => archiveItem(item.id));
      actions.appendChild(archBtn);
    }

    if (item.approval_status === "rejected") {
      const reApproveBtn = makeButton("Re-approve", "btn-approve", () => approveItem(item.id, false));
      actions.appendChild(reApproveBtn);
    }

    // Edit summary always available (pending, approved, auto_approved)
    if (["pending", "approved", "auto_approved"].includes(item.approval_status)) {
      const editBtn = makeButton("Edit Summary", "btn-edit", () => openEditModal(item));
      actions.appendChild(editBtn);
    }

    return actions;
  }

  function makeButton(label, className, onClick) {
    const btn = document.createElement("button");
    btn.className = "action-btn " + className;
    btn.textContent = label;
    btn.type = "button";
    btn.addEventListener("click", onClick);
    return btn;
  }

  function renderPagination() {
    const container = document.getElementById("queue-pagination");
    if (!container) return;
    container.innerHTML = "";

    const total = state.items.length;
    const totalPages = Math.ceil(total / state.pageSize);

    if (totalPages <= 1) return;

    const info = document.createElement("span");
    info.textContent =
      "Page " + (state.page + 1) + " of " + totalPages + " (" + total + " items)";
    container.appendChild(info);

    if (state.page > 0) {
      const prev = makeButton("Previous", "btn-page", () => {
        state.page--;
        renderQueue();
        renderPagination();
        window.scrollTo(0, 0);
      });
      container.appendChild(prev);
    }

    if (state.page < totalPages - 1) {
      const next = makeButton("Next", "btn-page", () => {
        state.page++;
        renderQueue();
        renderPagination();
        window.scrollTo(0, 0);
      });
      container.appendChild(next);
    }
  }

  // -------------------------------------------------------------------------
  // Admin actions — all re-validate server-side via RLS on the service call
  // -------------------------------------------------------------------------

  async function approveItem(itemId, featured) {
    const now = new Date().toISOString();
    const session = await window.supabaseClient.auth.getUser();
    const userId = session?.data?.user?.id || null;

    const update = {
      approval_status: "approved",
      approved_by: userId,
      approved_at: now,
      published_at: now,
      is_featured: featured,
      updated_at: now,
    };

    const { error } = await window.supabaseClient
      .from("content_items")
      .update(update)
      .eq("id", itemId);

    if (error) {
      showToast("Approval failed: " + error.message, "error");
      return;
    }
    showToast(featured ? "Approved and featured." : "Approved.", "success");
    await loadItems();
  }

  async function featureItem(itemId, isFeatured) {
    const { error } = await window.supabaseClient
      .from("content_items")
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq("id", itemId);

    if (error) {
      showToast("Failed: " + error.message, "error");
      return;
    }
    showToast(isFeatured ? "Item featured." : "Item unfeatured.", "success");
    await loadItems();
  }

  async function archiveItem(itemId) {
    const { error } = await window.supabaseClient
      .from("content_items")
      .update({ approval_status: "archived", updated_at: new Date().toISOString() })
      .eq("id", itemId);

    if (error) {
      showToast("Archive failed: " + error.message, "error");
      return;
    }
    showToast("Item archived.", "success");
    await loadItems();
  }

  async function rejectItemWithReason(itemId, reason) {
    if (!reason || reason.trim().length < 3) {
      showToast("Rejection reason required (at least 3 characters).", "error");
      return;
    }

    const { error } = await window.supabaseClient
      .from("content_items")
      .update({
        approval_status: "rejected",
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      showToast("Rejection failed: " + error.message, "error");
      return;
    }
    showToast("Item rejected.", "success");
    closeRejectModal();
    await loadItems();
  }

  async function saveEditedSummary(itemId, newTitle, newSummary) {
    if (!newSummary || newSummary.trim().length === 0) {
      showToast("Summary cannot be empty.", "error");
      return;
    }
    if (newSummary.trim().length > 500) {
      showToast("Summary must be 500 characters or fewer.", "error");
      return;
    }

    const update = {
      updated_at: new Date().toISOString(),
      summary: newSummary.trim(),
    };
    if (newTitle && newTitle.trim().length > 0) {
      update.title = newTitle.trim();
    }

    const { error } = await window.supabaseClient
      .from("content_items")
      .update(update)
      .eq("id", itemId);

    if (error) {
      showToast("Save failed: " + error.message, "error");
      return;
    }
    showToast("Summary updated.", "success");
    closeEditModal();
    await loadItems();
  }

  // -------------------------------------------------------------------------
  // Manual "Add content item" form — first-class path for Instagram/LinkedIn/national
  // -------------------------------------------------------------------------

  function bindManualForm() {
    const form = document.getElementById("manual-add-form");
    if (!form) return;

    // Populate source select
    const sourceSelect = document.getElementById("manual-source-id");
    if (sourceSelect) {
      state.sources.forEach((src) => {
        const opt = document.createElement("option");
        opt.value = src.id;
        // textContent safe — from DB
        opt.textContent = src.source_name + (src.requires_auth ? " (manual only)" : "");
        sourceSelect.appendChild(opt);
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitManualItem(form);
    });

    const toggleBtn = document.getElementById("toggle-manual-form");
    const formSection = document.getElementById("manual-form-section");
    if (toggleBtn && formSection) {
      toggleBtn.addEventListener("click", () => {
        const hidden = formSection.style.display === "none";
        formSection.style.display = hidden ? "block" : "none";
        toggleBtn.textContent = hidden ? "Cancel" : "Add Content Item";
      });
    }
  }

  async function submitManualItem(form) {
    const sourceId = form.querySelector("#manual-source-id")?.value?.trim();
    const url = form.querySelector("#manual-url")?.value?.trim();
    const title = form.querySelector("#manual-title")?.value?.trim();
    const summary = form.querySelector("#manual-summary")?.value?.trim();
    const platform = form.querySelector("#manual-platform")?.value;
    const sourceDateRaw = form.querySelector("#manual-source-date")?.value;
    const contentType = form.querySelector("#manual-content-type")?.value;

    // Validation
    const errors = [];
    if (!sourceId) errors.push("Source is required.");
    if (!url || !/^https?:\/\//.test(url)) errors.push("A valid URL is required.");
    if (!title || title.length < 2) errors.push("Title is required.");
    if (!summary || summary.length < 10) errors.push("Summary is required (at least 10 characters).");
    if (summary && summary.length > 500) errors.push("Summary must be 500 characters or fewer.");
    if (!platform) errors.push("Platform is required.");

    if (errors.length > 0) {
      showFormError("manual-form-error", errors.join(" "));
      return;
    }

    clearFormError("manual-form-error");

    // Resolve source platform for denormalization
    const source = state.sources.find((s) => s.id === sourceId);
    const sourcePlatform = source?.platform || platform;

    const now = new Date().toISOString();
    const session = await window.supabaseClient.auth.getUser();
    const userId = session?.data?.user?.id || null;

    const rawText = title + " " + summary;
    const tags = [];
    const DIRECT = ["chicago", "illinois", "midwest", "chapter", "camaa", "chicagoland"];
    const ADJACENT = ["alumni", "career", "scholarship", "giving", "networking", "mentoring", "homecoming"];
    let chicagoRelevance = "general";
    const lower = rawText.toLowerCase();
    const directHit = DIRECT.find((k) => lower.includes(k));
    if (directHit) {
      tags.push(directHit);
      chicagoRelevance = "direct";
    } else {
      const adjacentHits = ADJACENT.filter((k) => lower.includes(k));
      if (adjacentHits.length > 0) {
        tags.push(...adjacentHits.slice(0, 5));
        chicagoRelevance = "adjacent";
      }
    }

    const newItem = {
      source_id: sourceId,
      external_id: null,
      title: title,
      summary: summary + " — Added manually",
      url: url,
      source_url: source?.source_url || url,
      source_platform: sourcePlatform,
      source_date: sourceDateRaw || null,
      relevance_tags: tags,
      chicago_relevance: chicagoRelevance,
      content_type: contentType || "news",
      image_url: null,
      approval_status: "pending",
      approved_by: null,
      fetched_at: now,
    };

    const { error } = await window.supabaseClient
      .from("content_items")
      .insert(newItem);

    if (error) {
      if (error.code === "23505") {
        showFormError("manual-form-error", "This URL already exists for this source.");
      } else {
        showFormError("manual-form-error", "Insert failed: " + error.message);
      }
      return;
    }

    showToast("Content item added to queue.", "success");
    form.reset();
    const formSection = document.getElementById("manual-form-section");
    if (formSection) formSection.style.display = "none";
    const toggleBtn = document.getElementById("toggle-manual-form");
    if (toggleBtn) toggleBtn.textContent = "Add Content Item";
    await loadItems();
  }

  // -------------------------------------------------------------------------
  // Toolbar: filters + refresh
  // -------------------------------------------------------------------------

  function populateSourceFilter() {
    const platformFilter = document.getElementById("filter-platform");
    if (!platformFilter) return;

    const platforms = [...new Set(state.sources.map((s) => s.platform))];
    platforms.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p.replace(/_/g, " ");
      platformFilter.appendChild(opt);
    });
  }

  function bindToolbar() {
    const statusFilter = document.getElementById("filter-status");
    const platformFilter = document.getElementById("filter-platform");
    const relevanceFilter = document.getElementById("filter-relevance");
    const refreshBtn = document.getElementById("btn-refresh");

    if (statusFilter) {
      statusFilter.value = state.filterStatus;
      statusFilter.addEventListener("change", async () => {
        state.filterStatus = statusFilter.value;
        state.page = 0;
        await loadItems();
      });
    }

    if (platformFilter) {
      platformFilter.addEventListener("change", async () => {
        state.filterPlatform = platformFilter.value;
        state.page = 0;
        await loadItems();
      });
    }

    if (relevanceFilter) {
      relevanceFilter.addEventListener("change", async () => {
        state.filterRelevance = relevanceFilter.value;
        state.page = 0;
        await loadItems();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        state.page = 0;
        await loadItems();
      });
    }
  }

  // -------------------------------------------------------------------------
  // Reject modal
  // -------------------------------------------------------------------------

  function openRejectModal(itemId) {
    state.rejectModalItemId = itemId;
    const modal = document.getElementById("reject-modal");
    const input = document.getElementById("reject-reason-input");
    if (!modal || !input) return;
    input.value = "";
    modal.style.display = "flex";
    input.focus();
  }

  function closeRejectModal() {
    state.rejectModalItemId = null;
    const modal = document.getElementById("reject-modal");
    if (modal) modal.style.display = "none";
  }

  function bindModals() {
    // Reject modal
    const rejectConfirm = document.getElementById("reject-confirm-btn");
    const rejectCancel = document.getElementById("reject-cancel-btn");
    if (rejectConfirm) {
      rejectConfirm.addEventListener("click", async () => {
        const reason = document.getElementById("reject-reason-input")?.value || "";
        await rejectItemWithReason(state.rejectModalItemId, reason);
      });
    }
    if (rejectCancel) {
      rejectCancel.addEventListener("click", closeRejectModal);
    }

    // Edit modal
    const editSave = document.getElementById("edit-save-btn");
    const editCancel = document.getElementById("edit-cancel-btn");
    if (editSave) {
      editSave.addEventListener("click", async () => {
        const title = document.getElementById("edit-title-input")?.value || "";
        const summary = document.getElementById("edit-summary-input")?.value || "";
        await saveEditedSummary(state.editModalItemId, title, summary);
      });
    }
    if (editCancel) {
      editCancel.addEventListener("click", closeEditModal);
    }

    // Close modals on overlay click
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeRejectModal();
          closeEditModal();
        }
      });
    });
  }

  function openEditModal(item) {
    state.editModalItemId = item.id;
    const modal = document.getElementById("edit-modal");
    const titleInput = document.getElementById("edit-title-input");
    const summaryInput = document.getElementById("edit-summary-input");
    if (!modal || !titleInput || !summaryInput) return;
    titleInput.value = item.title || "";
    summaryInput.value = item.summary || "";
    modal.style.display = "flex";
    titleInput.focus();
  }

  function closeEditModal() {
    state.editModalItemId = null;
    const modal = document.getElementById("edit-modal");
    if (modal) modal.style.display = "none";
  }

  // -------------------------------------------------------------------------
  // Toast notifications
  // -------------------------------------------------------------------------

  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "info");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  function showFormError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.display = "block";
  }

  function clearFormError(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = "";
    el.style.display = "none";
  }

  // -------------------------------------------------------------------------
  // Bootstrap
  // -------------------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", init);
})();
