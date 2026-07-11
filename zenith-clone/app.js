document.addEventListener('DOMContentLoaded', () => {
  // Navigation State Management
  const screenStack = ['screen-splash'];
  
  // App Variables
  let selectedGoal = '';
  let selectedCoach = { id: '', name: 'Maya', avatar: 'M' };
  let enteredPhone = '';
  let enteredOtp = '';
  
  // Focus Timer Variables
  let timerInterval = null;
  let timerSecondsLeft = 25 * 60;
  const timerTotalDuration = 25 * 60;
  let timerIsRunning = false;
  
  // Breath Coach Variables
  let breathInterval = null;
  let breathState = 'stopped'; // 'stopped', 'inhale', 'hold', 'exhale'
  let breathRhythm = 'box'; // 'box' (4-4-4), 'relax' (4-7-8)
  
  // Soundscape Variables
  let activeSoundId = '';
  
  // Elements Selection
  const screens = document.querySelectorAll('.screen');
  const bottomNav = document.getElementById('app-bottom-nav');
  const bottomNavItems = document.querySelectorAll('.nav-item');
  const statusTime = document.getElementById('status-time');
  const dynamicIsland = document.getElementById('island-mock');

  // Update Status Time to Real Local Time
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    statusTime.textContent = `${hours}:${minutes} ${ampm}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Bottom Navigation Visibility Logic
  const hideNavScreens = [
    'screen-splash',
    'screen-goal-setting',
    'screen-coach-selection',
    'screen-auth-phone',
    'screen-auth-otp',
    'screen-permissions',
    'screen-focus-complete'
  ];

  function applyNavVisibility(screenId) {
    if (!screenId || hideNavScreens.includes(screenId)) {
      bottomNav.classList.add('hidden');
      return;
    }
    bottomNav.classList.remove('hidden');
    
    // Sync active tab item highlights
    const tabMap = {
      'screen-dashboard': 'nav-home',
      'screen-focus-timer': 'nav-focus',
      'screen-sleep-tracker': 'nav-sleep',
      'screen-breath-coach': 'nav-breath',
      'screen-settings-premium': 'nav-profile',
      'screen-coach-chat': 'nav-home',
      'screen-soundscapes': 'nav-home',
      'screen-analytics': 'nav-home'
    };
    const activeTabId = tabMap[screenId];
    bottomNavItems.forEach(item => {
      item.classList.toggle('active', activeTabId ? item.id === activeTabId : false);
    });
  }

  // Routing Handler (History Stack)
  function navigateTo(screenId, direction = 'forward') {
    const currentActive = document.querySelector('.screen.active');

    // Trigger Dynamic Island micro-expansion for screen transition
    triggerNotchAlert();

    if (direction === 'forward' && screenId) {
      applyNavVisibility(screenId);
    } else if (direction === 'back' && screenStack.length > 1) {
      const prevScreenId = screenStack[screenStack.length - 2];
      applyNavVisibility(prevScreenId);
    }

    if (direction === 'forward') {
      if (currentActive) {
        currentActive.classList.remove('active');
        currentActive.classList.add('prev');
      }
      const targetScreen = document.getElementById(screenId);
      if (targetScreen) {
        targetScreen.classList.remove('prev');
        targetScreen.classList.add('active');
        if (screenStack[screenStack.length - 1] !== screenId) {
          screenStack.push(screenId);
        }
      }
    } else if (direction === 'back') {
      if (screenStack.length > 1) {
        screenStack.pop();
        const prevScreenId = screenStack[screenStack.length - 1];
        
        if (currentActive) {
          currentActive.classList.remove('active');
        }
        
        const targetScreen = document.getElementById(prevScreenId);
        if (targetScreen) {
          targetScreen.classList.remove('prev');
          targetScreen.classList.add('active');
        }
      }
    }
  }

  // Notch / Dynamic Island Flash Animation
  function triggerNotchAlert() {
    dynamicIsland.classList.add('expanded');
    setTimeout(() => {
      dynamicIsland.classList.remove('expanded');
    }, 450);
  }

  // Global Back Buttons Bindings
  document.querySelectorAll('.header-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(null, 'back');
    });
  });

  // Tab Bar Item Clicks Bindings
  bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScreen = item.getAttribute('data-target');
      if (targetScreen) {
        navigateTo(targetScreen);
      }
    });
  });

  // ==========================================
  // SCREEN 1: SPLASH VIEW
  // ==========================================
  const splashStartBtn = document.getElementById('splash-start-btn');
  if (splashStartBtn) {
    splashStartBtn.addEventListener('click', () => {
      navigateTo('screen-goal-setting');
    });
  }

  // ==========================================
  // SCREEN 2: GOAL SETTING SELECTION
  // ==========================================
  const goalCards = document.querySelectorAll('#screen-goal-setting .selection-card');
  const goalBtn = document.getElementById('goal-continue-btn');

  goalCards.forEach(card => {
    card.addEventListener('click', () => {
      goalCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedGoal = card.getAttribute('data-goal');
      
      goalBtn.removeAttribute('disabled');
      goalBtn.style.opacity = '1';
    });
  });

  if (goalBtn) {
    goalBtn.addEventListener('click', () => {
      navigateTo('screen-coach-selection');
    });
  }

  // ==========================================
  // SCREEN 3: COACH SELECTION
  // ==========================================
  const coachCards = document.querySelectorAll('#screen-coach-selection .selection-card');
  const coachBtn = document.getElementById('coach-continue-btn');

  coachCards.forEach(card => {
    card.addEventListener('click', () => {
      coachCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const coachId = card.getAttribute('data-coach');
      if (coachId === 'maya') {
        selectedCoach = { id: 'maya', name: 'Maya', avatar: 'M' };
      } else if (coachId === 'logan') {
        selectedCoach = { id: 'logan', name: 'Logan', avatar: 'L' };
      } else {
        selectedCoach = { id: 'kira', name: 'Kira', avatar: 'K' };
      }

      coachBtn.removeAttribute('disabled');
      coachBtn.style.opacity = '1';
    });
  });

  if (coachBtn) {
    coachBtn.addEventListener('click', () => {
      // Sync names to dashboard and chat headers
      document.getElementById('dash-coach-avatar').innerText = selectedCoach.avatar;
      document.getElementById('dash-coach-name').innerText = selectedCoach.name;
      document.getElementById('chat-header-title').innerText = selectedCoach.name;
      document.getElementById('chat-coach-icon').innerText = selectedCoach.avatar;

      // Select gradient for coach avatar highlights
      const avatarColors = {
        'maya': 'linear-gradient(135deg, var(--teal-glow) 0%, var(--purple-glow) 100%)',
        'logan': 'linear-gradient(135deg, var(--gold-glow) 0%, var(--purple-glow) 100%)',
        'kira': 'linear-gradient(135deg, var(--teal-glow) 0%, var(--rose-glow) 100%)'
      };
      const avatarStyle = avatarColors[selectedCoach.id];
      document.getElementById('dash-coach-avatar').style.background = avatarStyle;
      document.getElementById('chat-coach-icon').style.background = avatarStyle;

      // Update dashboard welcome greeting summary content
      const summaryText = {
        'maya': 'Ready to relieve tension? Today we are balancing focus tasks with mindful sleep preparation.',
        'logan': 'No excuses. Today we targets three focus sessions and an early sleep window.',
        'kira': 'Bio-rhythms aligned. Today we optimize circadian sleep ranges and hydration stats.'
      };
      document.getElementById('dash-summary-text').innerText = summaryText[selectedCoach.id];

      navigateTo('screen-auth-phone');
    });
  }

  // ==========================================
  // SCREEN 4: SIGNUP MOBILE INPUT
  // ==========================================
  const phoneDisplay = document.getElementById('phone-display');
  const phoneSubmitBtn = document.getElementById('phone-submit-btn');
  const phoneKeys = document.querySelectorAll('#phone-keyboard .keyboard-key');

  phoneKeys.forEach(key => {
    key.addEventListener('click', () => {
      const val = key.getAttribute('data-val');
      
      if (val === 'clear') {
        enteredPhone = '';
      } else if (val === 'back') {
        enteredPhone = enteredPhone.slice(0, -1);
      } else if (enteredPhone.length < 10 && val !== null) {
        enteredPhone += val;
      }
      
      // Render formatted display
      let displayStr = enteredPhone;
      if (enteredPhone.length > 6) {
        displayStr = `(${enteredPhone.slice(0,3)}) ${enteredPhone.slice(3,6)}-${enteredPhone.slice(6)}`;
      } else if (enteredPhone.length > 3) {
        displayStr = `(${enteredPhone.slice(0,3)}) ${enteredPhone.slice(3)}`;
      }
      phoneDisplay.value = displayStr;

      if (enteredPhone.length === 10) {
        phoneSubmitBtn.removeAttribute('disabled');
        phoneSubmitBtn.style.opacity = '1';
      } else {
        phoneSubmitBtn.setAttribute('disabled', 'true');
        phoneSubmitBtn.style.opacity = '0.5';
      }
    });
  });

  if (phoneSubmitBtn) {
    phoneSubmitBtn.addEventListener('click', () => {
      const formattedPhone = `+1 (${enteredPhone.slice(0,3)}) ${enteredPhone.slice(3,6)}-${enteredPhone.slice(6)}`;
      document.getElementById('otp-phone-confirm').innerText = formattedPhone;
      navigateTo('screen-auth-otp');
    });
  }

  // ==========================================
  // SCREEN 5: OTP Passcode Boxes
  // ==========================================
  const otpBoxes = [
    document.getElementById('otp-1'),
    document.getElementById('otp-2'),
    document.getElementById('otp-3'),
    document.getElementById('otp-4')
  ];
  const otpSubmitBtn = document.getElementById('otp-submit-btn');
  const otpKeys = document.querySelectorAll('#otp-keyboard .keyboard-key');

  otpKeys.forEach(key => {
    key.addEventListener('click', () => {
      const val = key.getAttribute('data-val');
      
      if (val === 'clear') {
        enteredOtp = '';
      } else if (val === 'back') {
        enteredOtp = enteredOtp.slice(0, -1);
      } else if (enteredOtp.length < 4 && val !== null) {
        enteredOtp += val;
      }

      // Update passive digits displays
      otpBoxes.forEach((box, i) => {
        box.value = enteredOtp[i] || '';
      });

      if (enteredOtp.length === 4) {
        otpSubmitBtn.removeAttribute('disabled');
        otpSubmitBtn.style.opacity = '1';
      } else {
        otpSubmitBtn.setAttribute('disabled', 'true');
        otpSubmitBtn.style.opacity = '0.5';
      }
    });
  });

  if (otpSubmitBtn) {
    otpSubmitBtn.addEventListener('click', () => {
      navigateTo('screen-permissions');
    });
  }

  // ==========================================
  // SCREEN 6: PERMISSIONS HEALTHKIT
  // ==========================================
  const allowSyncBtn = document.getElementById('btn-allow-sync');
  const skipSyncBtn = document.getElementById('btn-skip-sync');

  if (allowSyncBtn) {
    allowSyncBtn.addEventListener('click', () => {
      triggerNotificationAlert('HealthKit Synced', 'CIRCADIAN RHYTHM INTEGRATION ACTIVE');
      navigateTo('screen-dashboard');
    });
  }

  if (skipSyncBtn) {
    skipSyncBtn.addEventListener('click', () => {
      navigateTo('screen-dashboard');
    });
  }

  // Push Notifications Toast Simulation
  function triggerNotificationAlert(title, text) {
    // Dynamic island animation representing alerts
    dynamicIsland.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:11px; font-weight:700; color:var(--teal-glow);">${title}</div>`;
    dynamicIsland.classList.add('expanded');
    setTimeout(() => {
      dynamicIsland.classList.remove('expanded');
      dynamicIsland.innerHTML = '';
    }, 2500);
  }

  // ==========================================
  // SCREEN 7: DASHBOARD QUICK START
  // ==========================================
  document.getElementById('dash-action-focus').addEventListener('click', () => navigateTo('screen-focus-timer'));
  document.getElementById('dash-action-sleep').addEventListener('click', () => navigateTo('screen-sleep-tracker'));
  document.getElementById('dash-action-breath').addEventListener('click', () => navigateTo('screen-breath-coach'));
  document.getElementById('dash-action-sounds').addEventListener('click', () => navigateTo('screen-soundscapes'));
  document.getElementById('dash-chat-link').addEventListener('click', () => navigateTo('screen-coach-chat'));

  // ==========================================
  // SCREEN 8 & 9: FOCUS FOREST TIMER & GROWING TREE
  // ==========================================
  const timerClock = document.getElementById('focus-timer-clock');
  const timerToggleBtn = document.getElementById('focus-btn-toggle');
  const timerAbortBtn = document.getElementById('focus-btn-abort');
  const timerProgressRing = document.getElementById('timer-ring-indicator');
  const focusTreeGraphic = document.getElementById('focus-tree-graphic');
  const timerStateLbl = document.getElementById('timer-state-lbl');

  function updateTimerClockDisplay() {
    const mins = String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0');
    const secs = String(timerSecondsLeft % 60).padStart(2, '0');
    timerClock.textContent = `${mins}:${secs}`;
    
    // SVG radial progress rings math
    const percentDone = (timerTotalDuration - timerSecondsLeft) / timerTotalDuration;
    const strokeOffset = 754 * (1 - percentDone);
    timerProgressRing.style.strokeDashoffset = strokeOffset;

    // SVG Stalk growing visualizer based on focus progress
    const stalk = focusTreeGraphic.querySelector('.tree-stalk');
    const leaves = focusTreeGraphic.querySelector('.tree-leaves');

    if (percentDone < 0.2) {
      stalk.setAttribute('d', 'M50 90 L50 85');
      stalk.setAttribute('stroke-width', '4');
      leaves.setAttribute('r', '0');
      timerStateLbl.textContent = 'Sprout Seed';
    } else if (percentDone < 0.5) {
      stalk.setAttribute('d', 'M50 90 L50 72');
      stalk.setAttribute('stroke-width', '5');
      leaves.setAttribute('r', '4');
      timerStateLbl.textContent = 'Seedling';
    } else if (percentDone < 0.8) {
      stalk.setAttribute('d', 'M50 90 L50 60 L45 52 L50 60 L55 54');
      stalk.setAttribute('stroke-width', '6');
      leaves.setAttribute('r', '8');
      timerStateLbl.textContent = 'Sapling';
    } else {
      stalk.setAttribute('d', 'M50 90 L50 50 L38 38 L50 50 L62 40 L50 50 L50 90');
      stalk.setAttribute('stroke-width', '8');
      leaves.setAttribute('r', '14');
      timerStateLbl.textContent = 'Mature Oak';
    }
  }

  function startFocusTimer() {
    timerIsRunning = true;
    timerToggleBtn.textContent = 'Pause Focus';
    timerToggleBtn.classList.add('btn-secondary');
    timerToggleBtn.classList.remove('btn-primary');
    
    timerInterval = setInterval(() => {
      if (timerSecondsLeft > 0) {
        timerSecondsLeft--;
        updateTimerClockDisplay();
      } else {
        stopFocusTimer();
        navigateTo('screen-focus-complete');
        // Reset timer values
        timerSecondsLeft = 25 * 60;
        updateTimerClockDisplay();
      }
    }, 1000);
  }

  function stopFocusTimer() {
    timerIsRunning = false;
    timerToggleBtn.textContent = 'Start Focus';
    timerToggleBtn.classList.add('btn-primary');
    timerToggleBtn.classList.remove('btn-secondary');
    clearInterval(timerInterval);
  }

  if (timerToggleBtn) {
    timerToggleBtn.addEventListener('click', () => {
      if (timerIsRunning) {
        stopFocusTimer();
      } else {
        startFocusTimer();
      }
    });
  }

  if (timerAbortBtn) {
    timerAbortBtn.addEventListener('click', () => {
      stopFocusTimer();
      timerSecondsLeft = 25 * 60;
      updateTimerClockDisplay();
      triggerNotificationAlert('Session Aborted', 'TREE WITHERED');
      navigateTo('screen-dashboard');
    });
  }

  // Collect reward btn complete logic
  const collectRewardBtn = document.getElementById('btn-focus-collect');
  if (collectRewardBtn) {
    collectRewardBtn.addEventListener('click', () => {
      navigateTo('screen-analytics');
    });
  }

  // ==========================================
  // SCREEN 10: SLEEP DIAL TARGETS
  // ==========================================
  const sleepDialVal = document.getElementById('sleep-dial-val');
  const sleepKnob = document.getElementById('sleep-opt-knob');
  const sleepToggle = document.getElementById('sleep-opt-auto');

  if (sleepToggle) {
    sleepToggle.addEventListener('change', () => {
      if (sleepToggle.checked) {
        sleepKnob.style.left = '23px';
        sleepToggle.parentNode.firstElementChild.style.backgroundColor = 'var(--teal-glow)';
      } else {
        sleepKnob.style.left = '3px';
        sleepToggle.parentNode.firstElementChild.style.backgroundColor = '#3f3f46';
      }
    });
  }

  // ==========================================
  // SCREEN 11: IMMERSIVE BREATHING COACH
  // ==========================================
  const breathBtn = document.getElementById('breath-btn-start');
  const breathCircle = document.getElementById('breath-coach-circle');
  const breathStateText = document.getElementById('breath-coach-state');
  const breathRhythmBox = document.getElementById('breath-rhythm-box');
  const breathRhythmRelax = document.getElementById('breath-rhythm-relax');

  breathRhythmBox.addEventListener('click', () => {
    breathRhythm = 'box';
    breathRhythmBox.classList.add('active');
    breathRhythmBox.style.borderColor = 'var(--rose-glow)';
    breathRhythmBox.style.backgroundColor = 'var(--rose-glow-dim)';
    breathRhythmRelax.classList.remove('active');
    breathRhythmRelax.style.borderColor = 'var(--border-glass)';
    breathRhythmRelax.style.backgroundColor = 'transparent';
  });

  breathRhythmRelax.addEventListener('click', () => {
    breathRhythm = 'relax';
    breathRhythmRelax.classList.add('active');
    breathRhythmRelax.style.borderColor = 'var(--rose-glow)';
    breathRhythmRelax.style.backgroundColor = 'var(--rose-glow-dim)';
    breathRhythmBox.classList.remove('active');
    breathRhythmBox.style.borderColor = 'var(--border-glass)';
    breathRhythmBox.style.backgroundColor = 'transparent';
  });

  function startBreathLoop() {
    breathState = 'inhale';
    breathBtn.textContent = 'Stop Session';
    breathBtn.style.background = 'var(--bg-surface)';
    breathBtn.style.color = 'var(--text-main)';
    breathBtn.style.border = '1px solid var(--border-glass)';

    let timeInPhase = 0;
    
    function runBreathingStep() {
      // 4-4-4 Box breathing schedule
      if (breathRhythm === 'box') {
        if (breathState === 'inhale') {
          breathCircle.style.transform = 'scale(1.4)';
          breathCircle.innerText = 'Inhale';
          breathStateText.innerText = 'Breathe in deep...';
          timeInPhase++;
          if (timeInPhase >= 4) {
            breathState = 'hold';
            timeInPhase = 0;
          }
        } else if (breathState === 'hold') {
          breathCircle.style.transform = 'scale(1.4)';
          breathCircle.innerText = 'Hold';
          breathStateText.innerText = 'Suspend lungs...';
          timeInPhase++;
          if (timeInPhase >= 4) {
            breathState = 'exhale';
            timeInPhase = 0;
          }
        } else if (breathState === 'exhale') {
          breathCircle.style.transform = 'scale(0.7)';
          breathCircle.innerText = 'Exhale';
          breathStateText.innerText = 'Release breath...';
          timeInPhase++;
          if (timeInPhase >= 4) {
            breathState = 'inhale';
            timeInPhase = 0;
          }
        }
      } 
      // 4-7-8 Relax breathing schedule
      else {
        if (breathState === 'inhale') {
          breathCircle.style.transform = 'scale(1.4)';
          breathCircle.innerText = 'Inhale';
          breathStateText.innerText = 'Breathe in deep...';
          timeInPhase++;
          if (timeInPhase >= 4) {
            breathState = 'hold';
            timeInPhase = 0;
          }
        } else if (breathState === 'hold') {
          breathCircle.style.transform = 'scale(1.4)';
          breathCircle.innerText = 'Hold';
          breathStateText.innerText = 'Suspend lungs...';
          timeInPhase++;
          if (timeInPhase >= 7) {
            breathState = 'exhale';
            timeInPhase = 0;
          }
        } else if (breathState === 'exhale') {
          breathCircle.style.transform = 'scale(0.6)';
          breathCircle.innerText = 'Exhale';
          breathStateText.innerText = 'Release breath slowly...';
          timeInPhase++;
          if (timeInPhase >= 8) {
            breathState = 'inhale';
            timeInPhase = 0;
          }
        }
      }
    }

    runBreathingStep();
    breathInterval = setInterval(runBreathingStep, 1000);
  }

  function stopBreathLoop() {
    breathState = 'stopped';
    breathBtn.textContent = 'Start Session';
    breathBtn.style.background = 'linear-gradient(135deg, var(--rose-glow) 0%, hsl(350, 80%, 55%) 100%)';
    breathBtn.style.color = 'white';
    breathBtn.style.border = 'none';

    clearInterval(breathInterval);
    breathCircle.style.transform = 'scale(1)';
    breathCircle.innerText = 'Ready';
    breathStateText.innerText = 'Steady...';
  }

  if (breathBtn) {
    breathBtn.addEventListener('click', () => {
      if (breathState === 'stopped') {
        startBreathLoop();
      } else {
        stopBreathLoop();
      }
    });
  }

  // ==========================================
  // SCREEN 12: AI COACH CHAT DIALOGUE
  // ==========================================
  const chatInput = document.getElementById('chat-text-input');
  const chatSendBtn = document.getElementById('chat-btn-send');
  const chatList = document.getElementById('chat-messages-list');
  const chatTags = document.querySelectorAll('.chat-preset-tag');

  function sendChatMessage(text) {
    if (!text.trim()) return;

    // Render Sent Bubble
    const sentBubble = document.createElement('div');
    sentBubble.className = 'chat-bubble chat-bubble-sent';
    sentBubble.innerText = text;
    chatList.appendChild(sentBubble);
    chatList.scrollTop = chatList.scrollHeight;

    chatInput.value = '';

    // Mock delayed Typing notification alert inside dynamic island
    triggerNotchAlert();

    // Custom Response generator based on selected coach
    setTimeout(() => {
      const answers = {
        'maya': [
          'Take a slow breath. Your focus is a practice, not a race. How can I help you settle down?',
          'Stress blocks focus. Let us do a quick 4-minute box breathing session together.',
          'Focus is quietness. Try activating one of the background soundscapes to block out surrounding noise.'
        ],
        'logan': [
          'Acknowledge the overwhelm, then compartmentalize. What is the single highest-priority task right now?',
          'Action cures anxiety. Start a 25-minute focus session now. Block all other browser tabs.',
          'Routines generate power. Ensure you dial in a strict rest target for tonight.'
        ],
        'kira': [
          'Cortisol spikes interfere with prefrontal function. What is your hydration status today?',
          'Your sleep dial targets 8.0 hours. AutoSleep logs indicate you missed this by 90 minutes last night.',
          'White light blocks melatonin release. Try shutting off screens 60 minutes before your bed window.'
        ]
      };
      
      const coachReplies = answers[selectedCoach.id] || answers['maya'];
      const replyText = coachReplies[Math.floor(Math.random() * coachReplies.length)];

      const receivedBubble = document.createElement('div');
      receivedBubble.className = 'chat-bubble chat-bubble-received';
      receivedBubble.innerText = replyText;
      chatList.appendChild(receivedBubble);
      chatList.scrollTop = chatList.scrollHeight;
    }, 1800);
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', () => {
      sendChatMessage(chatInput.value);
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage(chatInput.value);
      }
    });
  }

  chatTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const msg = tag.getAttribute('data-msg');
      sendChatMessage(msg);
    });
  });

  // ==========================================
  // SCREEN 13: AMBIENT SOUNDSCAPES
  // ==========================================
  const soundCards = document.querySelectorAll('.soundscape-card');
  const floatingController = document.getElementById('sounds-floating-controller');
  const floatTitle = document.getElementById('sounds-control-title');
  const stopAudioBtn = document.getElementById('sounds-control-btn-stop');

  soundCards.forEach(card => {
    card.addEventListener('click', () => {
      const soundId = card.getAttribute('data-sound');
      const soundName = card.querySelector('div[style*="font-weight: 700"]').innerText;
      
      soundCards.forEach(c => {
        c.classList.remove('active');
        c.querySelector('.soundwave-container').classList.remove('playing');
      });

      card.classList.add('active');
      card.querySelector('.soundwave-container').classList.add('playing');

      activeSoundId = soundId;
      floatTitle.innerText = soundName;
      document.getElementById('focus-sound-name').innerText = soundName;
      floatingController.style.display = 'flex';

      triggerNotificationAlert(soundName, 'PLAYING BACKDROP AUDIO');
    });
  });

  if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', () => {
      soundCards.forEach(c => {
        c.classList.remove('active');
        c.querySelector('.soundwave-container').classList.remove('playing');
      });
      floatingController.style.display = 'none';
      document.getElementById('focus-sound-name').innerText = 'None';
      activeSoundId = '';
    });
  }

  // ==========================================
  // SCREEN 15: PREMIUM SUBSCRIPTION UPGRADE
  // ==========================================
  const premiumTrigger = document.getElementById('premium-banner-trigger');
  const drawerOverlay = document.getElementById('premium-drawer-overlay');
  const premiumDrawer = document.getElementById('premium-drawer');
  const payBtn = document.getElementById('btn-apple-pay');

  if (premiumTrigger) {
    premiumTrigger.addEventListener('click', () => {
      drawerOverlay.classList.add('active');
      premiumDrawer.classList.add('active');
    });
  }

  function closePremiumDrawer() {
    drawerOverlay.classList.remove('active');
    premiumDrawer.classList.remove('active');
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closePremiumDrawer);
  }

  if (payBtn) {
    payBtn.addEventListener('click', () => {
      triggerNotificationAlert('Payment Success', 'ZENITH PREMIUM UNLOCKED');
      closePremiumDrawer();
      document.getElementById('premium-banner-trigger').innerHTML = `
        <span style="color: var(--gold-glow); font-size: 10px; font-weight: 700; text-transform: uppercase;">Zen Premium Active</span>
        <h3 style="font-family: var(--font-title); font-size: 16px; font-weight: 800; margin-top: 4px;">Advanced Diagnostics Active</h3>
      `;
    });
  }

  // ==========================================
  // DEV PANEL SETTINGS TOGGLES
  // ==========================================
  const brainToggle = document.getElementById('dev-opt-brain');
  const brainKnob = document.getElementById('dev-opt-knob-1');

  brainToggle.addEventListener('change', () => {
    if (brainToggle.checked) {
      brainKnob.style.backgroundColor = 'var(--purple-glow)';
      triggerNotificationAlert('Brain Lag Simulated', 'ALERTING USER TO ADJUST FOCUS');
    } else {
      brainKnob.style.backgroundColor = '#3f3f46';
    }
  });

  const healthToggle = document.getElementById('dev-opt-health');
  const healthKnob = document.getElementById('dev-opt-knob-2');

  healthToggle.addEventListener('change', () => {
    if (healthToggle.checked) {
      healthKnob.style.backgroundColor = 'var(--teal-glow)';
      triggerNotificationAlert('Mock Health Logs added', 'SLEEP DIAGNOSTICS UPDATE IN PROCESS');
    } else {
      healthKnob.style.backgroundColor = '#3f3f46';
    }
  });
});
