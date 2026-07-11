// =============================================================================
// src/calendar.js -- Calendar view for Agentic Centre
// =============================================================================
// Monthly grid showing scheduled/published posts, color-coded by category.
// Exposes renderCalendar(container, posts, onPostClick) globally.
// =============================================================================

(function () {
  'use strict';

  var currentYear = new Date().getFullYear();
  var currentMonth = new Date().getMonth();

  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var CAT_DOT_CLASS = {
    ai_ml: 'cal-dot-ai_ml',
    dev_tools: 'cal-dot-dev_tools',
    career: 'cal-dot-career',
    culture: 'cal-dot-culture',
    creative: 'cal-dot-creative',
    industry: 'cal-dot-industry'
  };

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function toDateStr(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  /**
   * Render the calendar into a container.
   * @param {HTMLElement} container
   * @param {Array} posts
   * @param {Function} onPostClick -- called with post id
   */
  function renderCalendar(container, posts, onPostClick) {
    if (!container) return;

    var today = new Date();
    var daysInMonth = getDaysInMonth(currentYear, currentMonth);
    var firstDay = getFirstDayOfWeek(currentYear, currentMonth);
    var prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    // Build posts-by-date lookup
    var postsByDate = {};
    (posts || []).forEach(function (p) {
      var dateStr = p.scheduled_at || p.published_at || p.created_at;
      if (!dateStr) return;
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      var key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
      if (!postsByDate[key]) postsByDate[key] = [];
      postsByDate[key].push(p);
    });

    var html = '';

    // Header
    html += '<div class="calendar-header">';
    html += '<button class="cal-nav-btn" id="calPrev">Prev</button>';
    html += '<h3>' + MONTH_NAMES[currentMonth] + ' ' + currentYear + '</h3>';
    html += '<button class="cal-nav-btn" id="calNext">Next</button>';
    html += '</div>';

    // Grid
    html += '<div class="calendar-grid">';

    // Day headers
    DAY_NAMES.forEach(function (day) {
      html += '<div class="cal-day-header">' + day + '</div>';
    });

    // Previous month fill
    for (var pf = firstDay - 1; pf >= 0; pf--) {
      var pd = prevMonthDays - pf;
      html += '<div class="cal-cell other-month"><span class="day-num">' + pd + '</span></div>';
    }

    // Current month days
    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(currentYear, currentMonth, d);
      var isToday = sameDay(cellDate, today);
      var key = currentYear + '-' + currentMonth + '-' + d;
      var cellPosts = postsByDate[key] || [];

      html += '<div class="cal-cell' + (isToday ? ' today' : '') + '" data-date="' + toDateStr(currentYear, currentMonth, d) + '">';
      html += '<span class="day-num">' + d + '</span>';

      cellPosts.slice(0, 3).forEach(function (p) {
        var dotClass = CAT_DOT_CLASS[p.category] || 'cal-dot-ai_ml';
        html += '<span class="cal-post-dot ' + dotClass + '" data-pid="' + p.id + '" draggable="true">';
        html += escHtml((p.headline || '').slice(0, 25));
        html += '</span>';
      });

      if (cellPosts.length > 3) {
        html += '<span style="font-size:9px;color:rgba(148,163,184,.5);">+' + (cellPosts.length - 3) + ' more</span>';
      }

      html += '</div>';
    }

    // Next month fill
    var totalCells = firstDay + daysInMonth;
    var remaining = (7 - (totalCells % 7)) % 7;
    for (var nf = 1; nf <= remaining; nf++) {
      html += '<div class="cal-cell other-month"><span class="day-num">' + nf + '</span></div>';
    }

    html += '</div>';

    container.innerHTML = html;

    // Event listeners
    var prevBtn = container.querySelector('#calPrev');
    var nextBtn = container.querySelector('#calNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(container, posts, onPostClick);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(container, posts, onPostClick);
      });
    }

    // Click on post dots
    container.querySelectorAll('.cal-post-dot').forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        var pid = dot.getAttribute('data-pid');
        if (pid && typeof onPostClick === 'function') {
          onPostClick(pid);
        }
      });
    });

    // --- Drag and Drop ---
    function clearDragStates() {
      container.querySelectorAll('.cal-cell.drag-over').forEach(function (cell) {
        cell.classList.remove('drag-over');
      });
      container.querySelectorAll('.cal-post-dot.dragging').forEach(function (dot) {
        dot.classList.remove('dragging');
      });
    }

    container.querySelectorAll('.cal-post-dot[draggable]').forEach(function (dot) {
      dot.addEventListener('dragstart', function (e) {
        var pid = dot.getAttribute('data-pid');
        e.dataTransfer.setData('text/plain', pid);
        e.dataTransfer.effectAllowed = 'move';
        dot.classList.add('dragging');
      });

      dot.addEventListener('dragend', function () {
        clearDragStates();
      });
    });

    container.querySelectorAll('.cal-cell').forEach(function (cell) {
      cell.addEventListener('dragover', function (e) {
        if (!cell.classList.contains('other-month')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          cell.classList.add('drag-over');
        }
      });

      cell.addEventListener('dragleave', function () {
        cell.classList.remove('drag-over');
      });

      cell.addEventListener('drop', function (e) {
        e.preventDefault();
        clearDragStates();

        var pid = e.dataTransfer.getData('text/plain');
        if (!pid) return;

        var newDateStr = cell.getAttribute('data-date');
        if (!newDateStr) return;

        var allPosts = (typeof window.posts !== 'undefined') ? window.posts : posts;
        var found = null;
        for (var i = 0; i < allPosts.length; i++) {
          if (String(allPosts[i].id) === String(pid)) {
            found = allPosts[i];
            break;
          }
        }
        if (!found) return;

        var parts = newDateStr.split('-');
        var newDate = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        found.scheduled_at = newDate.toISOString();

        if (typeof window.savePosts === 'function') {
          window.savePosts();
        }

        renderCalendar(container, allPosts, onPostClick);
      });
    });
  }

  // Expose globally
  window.renderCalendar = renderCalendar;
})();
