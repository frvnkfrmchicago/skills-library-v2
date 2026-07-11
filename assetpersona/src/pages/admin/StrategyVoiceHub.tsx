import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarBlank,
  ChatCircle,
  MagnifyingGlass,
  DownloadSimple,
  Sparkle,
  CheckCircle,
  Brain,
  Plus,
  Trash,
  X as XIcon,
  Prohibit,
  Warning
} from '@phosphor-icons/react';
import {
  getStoredStrategy,
  saveStrategy,
  type ContentStrategy,
  type ContentSlot
} from '../../data/contentStrategyData';
import './StrategyVoiceHub.css';

export default function StrategyVoiceHub() {
  // Hub Mode Tabs: 'schedule' | 'voice'
  const [activeTab, setActiveTab] = useState<'schedule' | 'voice'>('schedule');

  // Strategy Schedule State
  const [strategy, setStrategy] = useState<ContentStrategy>(getStoredStrategy);
  const [platform, setPlatform] = useState<'threads' | 'linkedin'>('threads');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');

  // Edit Drawer State
  const [editingSlot, setEditingSlot] = useState<ContentSlot | null>(null);
  const [editingDay, setEditingDay] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Edit Form Fields
  const [formTime, setFormTime] = useState('');
  const [formTool, setFormTool] = useState('');
  const [formType, setFormType] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formKeywords, setFormKeywords] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState('');

  // Notification Banner State
  const [notification, setNotification] = useState<string | null>(null);

  // Persist changes to localStorage whenever strategy state changes
  useEffect(() => {
    saveStrategy(strategy);
  }, [strategy]);

  // List of days based on active platform data
  const daysList = useMemo(() => {
    const list = platform === 'threads' ? strategy.threads : strategy.linkedin;
    return list.map(d => d.day);
  }, [platform, strategy]);

  // Flattened and filtered list of slots for display
  const filteredSlots = useMemo(() => {
    const activeList = platform === 'threads' ? strategy.threads : strategy.linkedin;
    const q = searchQuery.toLowerCase().trim();

    return activeList.map(dayData => {
      // Filter slots inside this day
      const matchedSlots = dayData.slots.filter(slot => {
        const matchesSearch =
          slot.tool.toLowerCase().includes(q) ||
          slot.type.toLowerCase().includes(q) ||
          slot.desc.toLowerCase().includes(q) ||
          slot.kw.some(k => k.toLowerCase().includes(q));
        
        const matchesDay = selectedDayFilter === 'All' || dayData.day === selectedDayFilter;
        return matchesSearch && matchesDay;
      });

      return {
        day: dayData.day,
        slots: matchedSlots
      };
    }).filter(d => d.slots.length > 0);
  }, [platform, strategy, searchQuery, selectedDayFilter]);

  // Open the edit drawer for a specific slot
  const openEditDrawer = (day: string, slot: ContentSlot) => {
    setEditingDay(day);
    setEditingSlot(slot);
    setFormTime(slot.time);
    setFormTool(slot.tool);
    setFormType(slot.type);
    setFormDesc(slot.desc);
    setFormKeywords([...slot.kw]);
    setTagInput('');
    setFormError('');
    setDrawerOpen(true);
  };

  // Close the drawer
  const closeEditDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setEditingSlot(null);
      setEditingDay('');
    }, 300); // Wait for transition animation
  };

  // Add tag to the form tags array
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,$/, '');
      if (val && !formKeywords.includes(val)) {
        setFormKeywords([...formKeywords, val]);
        setTagInput('');
      }
    }
  };

  // Remove tag from form tags array
  const removeTag = (index: number) => {
    setFormKeywords(formKeywords.filter((_, i) => i !== index));
  };

  // Save the slot edits back to state
  const saveSlotChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTime.trim() || !formTool.trim() || !formType.trim() || !formDesc.trim()) {
      setFormError('All fields except keywords are required.');
      return;
    }

    // Emoji check stop gate: no emojis allowed in content strategy configurations
    const emojiRegex = /[\uD800-\uDFFF\u2600-\u27BF]/;
    if (emojiRegex.test(formTool) || emojiRegex.test(formType) || emojiRegex.test(formDesc)) {
      setFormError('Emojis are strictly prohibited in the system metadata and logs.');
      return;
    }

    const updatedStrategy = { ...strategy };
    const list = platform === 'threads' ? updatedStrategy.threads : updatedStrategy.linkedin;
    const dayData = list.find(d => d.day === editingDay);

    if (dayData && editingSlot) {
      const slotIndex = dayData.slots.findIndex(s => s.id === editingSlot.id);
      if (slotIndex > -1) {
        dayData.slots[slotIndex] = {
          ...editingSlot,
          time: formTime,
          tool: formTool,
          type: formType,
          desc: formDesc,
          kw: formKeywords
        };
      }
    }

    setStrategy(updatedStrategy);
    closeEditDrawer();
    triggerNotification('Slot updated successfully');
  };

  // Create a new blank slot
  const addNewSlot = () => {
    const targetDay = selectedDayFilter === 'All' ? daysList[0] : selectedDayFilter;
    const newSlot: ContentSlot = {
      id: `${platform}-${targetDay.toLowerCase()}-${Date.now()}`,
      time: '12:00 PM',
      tool: 'New Topic',
      type: 'Tip',
      desc: 'Enter post description here.',
      kw: ['General']
    };

    const updatedStrategy = { ...strategy };
    const list = platform === 'threads' ? updatedStrategy.threads : updatedStrategy.linkedin;
    const dayData = list.find(d => d.day === targetDay);

    if (dayData) {
      dayData.slots.push(newSlot);
      // Sort slots by time helper
      dayData.slots.sort((a, b) => {
        const timeToMinutes = (tStr: string) => {
          const m = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!m) return 0;
          let hrs = parseInt(m[1]);
          const mins = parseInt(m[2]);
          const ampm = m[3].toUpperCase();
          if (ampm === 'PM' && hrs < 12) hrs += 12;
          if (ampm === 'AM' && hrs === 12) hrs = 0;
          return hrs * 60 + mins;
        };
        return timeToMinutes(a.time) - timeToMinutes(b.time);
      });
      setStrategy(updatedStrategy);
      openEditDrawer(targetDay, newSlot);
      triggerNotification(`New slot added to ${targetDay}`);
    }
  };

  // Delete a slot
  const deleteSlot = (dayName: string, id: string) => {
    if (!confirm('Are you sure you want to delete this scheduling slot?')) return;
    
    const updatedStrategy = { ...strategy };
    const list = platform === 'threads' ? updatedStrategy.threads : updatedStrategy.linkedin;
    const dayData = list.find(d => d.day === dayName);

    if (dayData) {
      dayData.slots = dayData.slots.filter(s => s.id !== id);
      setStrategy(updatedStrategy);
      triggerNotification('Slot deleted');
    }
  };

  // Download config file
  const downloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(strategy, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "content_schedule.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification('Configuration downloaded. Put this in your content-hub folder.');
  };

  // Trigger brief alert banners
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div className="strategy-hub">
      {/* ── Title Header ── */}
      <header className="strategy-hub__head">
        <div>
          <h1>Content Strategy & Voice Hub</h1>
          <p className="strategy-hub__sub">
            Design your publishing channels, customize calendar topics, and enforce builder brand voice.
          </p>
        </div>
        
        <div className="strategy-hub__tabs-wrapper">
          <div className="strategy-hub__nav-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'schedule'}
              className={`strategy-hub__tab-btn ${activeTab === 'schedule' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <CalendarBlank size={16} />
              <span>Publishing Calendar</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'voice'}
              className={`strategy-hub__tab-btn ${activeTab === 'voice' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('voice')}
            >
              <Brain size={16} />
              <span>Voice & Style Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Notification Banner ── */}
      {notification && (
        <div className="strategy-hub__notif liquid-glass" role="status">
          <CheckCircle size={18} weight="fill" className="strategy-hub__notif-icon" />
          <div className="strategy-hub__notif-body">
            <p className="strategy-hub__notif-text">{notification}</p>
          </div>
        </div>
      )}

      {/* ── SCHEDULE MODE ── */}
      {activeTab === 'schedule' && (
        <>
          {/* Controls toolbar */}
          <div className="strategy-hub__toolbar">
            <div className="strategy-hub__platform-toggle">
              <button
                type="button"
                className={`strategy-hub__plat-btn ${platform === 'threads' ? 'is-active' : ''}`}
                onClick={() => { setPlatform('threads'); setSelectedDayFilter('All'); }}
              >
                <ChatCircle size={16} />
                <span>Threads Daily (77)</span>
              </button>
              <button
                type="button"
                className={`strategy-hub__plat-btn ${platform === 'linkedin' ? 'is-active' : ''}`}
                onClick={() => { setPlatform('linkedin'); setSelectedDayFilter('All'); }}
              >
                <Sparkle size={16} />
                <span>LinkedIn Weekly (14)</span>
              </button>
            </div>

            <div className="strategy-hub__actions">
              <button type="button" className="strategy-hub__btn-add" onClick={addNewSlot}>
                <Plus size={14} weight="bold" />
                <span>Add Slot</span>
              </button>
              <button type="button" className="strategy-hub__btn-export" onClick={downloadConfig}>
                <DownloadSimple size={14} weight="bold" />
                <span>Export Strategy</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="strategy-hub__filter-row">
            <label className="strategy-hub__search">
              <MagnifyingGlass size={14} />
              <input
                type="search"
                placeholder="Search topics, content types, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>

            <div className="strategy-hub__day-filters">
              <button
                type="button"
                className={`strategy-hub__day-pill ${selectedDayFilter === 'All' ? 'is-active' : ''}`}
                onClick={() => setSelectedDayFilter('All')}
              >
                All Days
              </button>
              {daysList.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`strategy-hub__day-pill ${selectedDayFilter === day ? 'is-active' : ''}`}
                  onClick={() => setSelectedDayFilter(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar List Groups */}
          <div className="strategy-hub__calendar-container">
            {filteredSlots.length === 0 ? (
              <div className="strategy-hub__empty liquid-glass">
                <Warning size={32} />
                <p>No schedule entries match your search filters.</p>
              </div>
            ) : (
              filteredSlots.map(dayData => (
                <div key={dayData.day} className="strategy-hub__day-group liquid-glass">
                  <h3 className="strategy-hub__day-heading">{dayData.day}</h3>
                  <div className="strategy-hub__table-wrapper">
                    <table className="strategy-hub__table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Topic / Tool</th>
                          <th>Post Type</th>
                          <th>Keywords</th>
                          <th>Approach & Description</th>
                          <th aria-label="Actions"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayData.slots.map(slot => (
                          <tr key={slot.id} className="strategy-hub__row" onClick={() => openEditDrawer(dayData.day, slot)}>
                            <td className="strategy-hub__cell-time">{slot.time}</td>
                            <td className="strategy-hub__cell-topic">
                              <span className="strategy-hub__topic-badge">{slot.tool}</span>
                            </td>
                            <td className="strategy-hub__cell-type">{slot.type}</td>
                            <td className="strategy-hub__cell-keywords">
                              <div className="strategy-hub__tags-list">
                                {slot.kw.map((k, i) => (
                                  <span key={i} className="strategy-hub__tag-pill">{k}</span>
                                ))}
                              </div>
                            </td>
                            <td className="strategy-hub__cell-desc">{slot.desc}</td>
                            <td className="strategy-hub__cell-actions" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                className="strategy-hub__action-btn"
                                onClick={() => deleteSlot(dayData.day, slot.id)}
                                title="Delete Slot"
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sync instructions panel */}
          <div className="strategy-hub__sync-card liquid-glass">
            <div className="strategy-hub__sync-header">
              <Brain size={22} weight="duotone" />
              <h3>Sync strategy with N8N pipelines</h3>
            </div>
            <p>
              Vite UI changes are saved locally in your browser's <code>localStorage</code>. To update the underlying workflows:
            </p>
            <ol className="strategy-hub__sync-steps">
              <li>
                Click <strong>Export Strategy</strong> above to download the updated <code>content_schedule.json</code> file.
              </li>
              <li>
                Place the downloaded file inside your content hub folder:<br />
                <code>/Users/franklawrencejr./Documents/Automation Centre/grazzhopper-content-hub/</code>
              </li>
              <li>
                Run the local merge and sync commands:<br />
                <code>node sync-schedule.js</code>
              </li>
              <li>
                Re-deploy to the live N8N instance:<br />
                <code>node restore-original-workflows.js</code>
              </li>
            </ol>
          </div>
        </>
      )}

      {/* ── VOICE & STYLE PROFILE MODE ── */}
      {activeTab === 'voice' && (
        <div className="strategy-hub__voice-grid">
          {/* Left panel: guidelines and formatting rules */}
          <div className="strategy-hub__voice-col">
            <div className="strategy-hub__card liquid-glass">
              <div className="strategy-hub__card-header">
                <Brain size={20} weight="duotone" className="strategy-hub__card-icon" />
                <h2>Persona & Brand Guidelines</h2>
              </div>
              <ul className="strategy-hub__guidelines">
                {strategy.voice.guidelines.map((g, i) => (
                  <li key={i} className="strategy-hub__guide-item">
                    <h4>{g.title}</h4>
                    <p>{g.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="strategy-hub__card liquid-glass">
              <div className="strategy-hub__card-header">
                <Prohibit size={20} weight="duotone" className="strategy-hub__card-icon" />
                <h2>Style Stop Gates & Formatting</h2>
              </div>
              <ul className="strategy-hub__rules">
                {strategy.voice.formattingRules.map((r, i) => (
                  <li key={i} className="strategy-hub__rule-item">
                    <h4>{r.title}</h4>
                    <p className="strategy-hub__rule-text">{r.rule}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right panel: banned words and code examples */}
          <div className="strategy-hub__voice-col">
            <div className="strategy-hub__card liquid-glass">
              <div className="strategy-hub__card-header">
                <Warning size={20} weight="duotone" className="strategy-hub__card-icon" />
                <h2>AI Language Ban List</h2>
              </div>
              <div className="strategy-hub__ban-table-wrapper">
                <table className="strategy-hub__ban-table">
                  <thead>
                    <tr>
                      <th>Banned Phrase</th>
                      <th>Reason</th>
                      <th>Alternatives</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.voice.bannedWords.map((b, i) => (
                      <tr key={i}>
                        <td className="strategy-hub__ban-word">{b.word}</td>
                        <td className="strategy-hub__ban-reason">{b.reason}</td>
                        <td className="strategy-hub__ban-alt">{b.alternatives}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="strategy-hub__card liquid-glass">
              <div className="strategy-hub__card-header">
                <Sparkle size={20} weight="duotone" className="strategy-hub__card-icon" />
                <h2>Voice Calibration Examples</h2>
              </div>
              <div className="strategy-hub__examples-list">
                {strategy.voice.styleExamples.map((ex, i) => (
                  <div key={i} className="strategy-hub__example-block">
                    <h4>{ex.title}</h4>
                    <div className="strategy-hub__example-comparison">
                      <div className="strategy-hub__ex-bad">
                        <span className="strategy-hub__ex-lbl bad">AI Style (AVOID)</span>
                        <p>{ex.ai}</p>
                      </div>
                      <div className="strategy-hub__ex-good">
                        <span className="strategy-hub__ex-lbl good">Frank Builder Style (USE)</span>
                        <p>{ex.human}</p>
                      </div>
                    </div>
                    <p className="strategy-hub__ex-note"><strong>Rule: </strong>{ex.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT DRAWERS / SIDE SLIDE OVER ── */}
      {drawerOpen && (
        <div className="strategy-drawer-backdrop" onClick={closeEditDrawer}>
          <div className="strategy-drawer liquid-glass" onClick={e => e.stopPropagation()}>
            <header className="strategy-drawer__head">
              <div>
                <h2>Edit Schedule Entry</h2>
                <span className="strategy-drawer__sub">{editingDay} • {platform.toUpperCase()}</span>
              </div>
              <button type="button" className="strategy-drawer__close" onClick={closeEditDrawer}>
                <XIcon size={20} />
              </button>
            </header>

            <form className="strategy-drawer__form" onSubmit={saveSlotChanges}>
              {formError && (
                <div className="strategy-drawer__error" role="alert">
                  <Warning size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="strategy-drawer__field">
                <label htmlFor="slot-time">Posting Time</label>
                <input
                  id="slot-time"
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="e.g. 7:00 AM"
                  required
                />
              </div>

              <div className="strategy-drawer__field">
                <label htmlFor="slot-tool">Topic / Tool Name</label>
                <input
                  id="slot-tool"
                  type="text"
                  value={formTool}
                  onChange={(e) => setFormTool(e.target.value)}
                  placeholder="e.g. Claude Code"
                  required
                />
              </div>

              <div className="strategy-drawer__field">
                <label htmlFor="slot-type">Post Type</label>
                <input
                  id="slot-type"
                  type="text"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  placeholder="e.g. Tip, AI education, Morning news"
                  required
                />
              </div>

              <div className="strategy-drawer__field">
                <label>Keywords & Tags</label>
                <div className="strategy-drawer__tags-wrapper">
                  <div className="strategy-drawer__tags">
                    {formKeywords.map((k, i) => (
                      <span key={i} className="strategy-drawer__tag">
                        {k}
                        <button type="button" onClick={() => removeTag(i)}>
                          <XIcon size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type keyword and press Enter"
                  />
                </div>
                <span className="strategy-drawer__field-tip">Tags are matching triggers for Scrapers.</span>
              </div>

              <div className="strategy-drawer__field">
                <label htmlFor="slot-desc">Approach & Guidelines</label>
                <textarea
                  id="slot-desc"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={6}
                  placeholder="Provide guidance on prompt approach, references, and core ideas..."
                  required
                />
              </div>

              <div className="strategy-drawer__warning-notice">
                <Prohibit size={16} />
                <span>Emojis are strictly banned from UI logs, toast messages, and code. Keep descriptions clean and emoji-free.</span>
              </div>

              <div className="strategy-drawer__actions">
                <button type="button" className="strategy-drawer__btn-cancel" onClick={closeEditDrawer}>
                  Cancel
                </button>
                <button type="submit" className="strategy-drawer__btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
