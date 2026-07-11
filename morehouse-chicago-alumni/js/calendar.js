/**
 * MOREHOUSE ALUMNI — CALENDAR MODULE
 * Lane 3 — mcaa-wave-001
 *
 * Async-aware: Events.getByMonth() is now async. Calendar.render() awaits it.
 * No innerHTML with user-controlled data; event titles never injected via innerHTML
 * (day cells only contain numeric day values from code).
 */

const Calendar = {
  currentYear:  new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  _container:   null,
  /** Map of 'YYYY-MM-DD' → [eventId, ...] for click routing */
  _dateIndex:   {},

  async init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    await this.render();
  },

  async render() {
    if (!this._container) return;

    const year      = this.currentYear;
    const month     = this.currentMonth;
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay  = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const todayStr    = new Date().toISOString().split('T')[0];

    // Async fetch events for this month
    let monthEvents = [];
    try {
      monthEvents = await Events.getByMonth(year, month + 1);
    } catch (e) {
      console.error('[Calendar.render] Events.getByMonth failed', e);
    }

    // Build date index for click routing
    this._dateIndex = {};
    monthEvents.forEach(evt => {
      if (!this._dateIndex[evt.date]) this._dateIndex[evt.date] = [];
      this._dateIndex[evt.date].push(evt.id);
    });
    const eventDates = new Set(Object.keys(this._dateIndex));

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Build calendar header using DOM APIs (no user strings in markup)
    const wrapper = document.createElement('div');

    const header = document.createElement('div');
    header.className = 'calendar__header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'calendar__title';
    titleEl.textContent = monthName;
    header.appendChild(titleEl);

    const nav = document.createElement('div');
    nav.className = 'calendar__nav';

    const prevBtn  = document.createElement('button');
    prevBtn.className = 'btn btn--ghost btn--sm';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.textContent = '←';
    prevBtn.addEventListener('click', () => this.prevMonth());

    const todayBtn = document.createElement('button');
    todayBtn.className = 'btn btn--ghost btn--sm';
    todayBtn.id = 'cal-today';
    todayBtn.textContent = 'Today';
    todayBtn.addEventListener('click', () => this.goToToday());

    const nextBtn  = document.createElement('button');
    nextBtn.className = 'btn btn--ghost btn--sm';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.textContent = '→';
    nextBtn.addEventListener('click', () => this.nextMonth());

    nav.appendChild(prevBtn);
    nav.appendChild(todayBtn);
    nav.appendChild(nextBtn);
    header.appendChild(nav);
    wrapper.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'calendar__grid';

    // Day-of-week labels
    dayLabels.forEach(label => {
      const d = document.createElement('div');
      d.className = 'calendar__day-label';
      d.textContent = label;
      grid.appendChild(d);
    });

    // Previous-month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrev - i;
      const cell = document.createElement('div');
      cell.className = 'calendar__day calendar__day--other-month';
      cell.textContent = day;
      grid.appendChild(cell);
    }

    // Current-month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday  = dateStr === todayStr;
      const hasEvent = eventDates.has(dateStr);

      const classes = [
        'calendar__day',
        isToday  ? 'calendar__day--today'     : '',
        hasEvent ? 'calendar__day--has-event' : '',
      ].filter(Boolean).join(' ');

      const cell = document.createElement('div');
      cell.className = classes;
      cell.dataset.date = dateStr;
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.textContent = day;
      cell.addEventListener('click',  () => this.onDateClick(dateStr));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.onDateClick(dateStr); }
      });
      grid.appendChild(cell);
    }

    // Next-month leading days
    const totalCells = firstDay + daysInMonth;
    const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar__day calendar__day--other-month';
      cell.textContent = i;
      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);

    // Replace container contents
    this._container.replaceChildren(wrapper);
  },

  async prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    await this.render();
  },

  async nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    await this.render();
  },

  async goToToday() {
    const today = new Date();
    this.currentYear  = today.getFullYear();
    this.currentMonth = today.getMonth();
    await this.render();
  },

  onDateClick(dateStr) {
    const ids = this._dateIndex[dateStr] || [];

    // Visual selection
    this._container.querySelectorAll('.calendar__day--selected').forEach(el => {
      el.classList.remove('calendar__day--selected');
    });
    const selectedEl = this._container.querySelector(`[data-date="${CSS.escape(dateStr)}"]`);
    if (selectedEl) selectedEl.classList.add('calendar__day--selected');

    if (ids.length === 1) {
      window.location.href = `event-detail.html?id=${encodeURIComponent(ids[0])}`;
    } else if (ids.length > 1) {
      const eventSection = document.getElementById('event-list');
      if (eventSection) eventSection.scrollIntoView({ behavior: 'smooth' });
    }
  },
};

window.Calendar = Calendar;
