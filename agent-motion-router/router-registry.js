/* router-registry.js */

/**
 * Capability Registry Database
 * Stores all available visual keyframes, inputs, interactions, and 2026 future assets.
 * Employs clean query methods for automated human-agent collaborative routing.
 */
class CapabilityRegistry {
  constructor() {
    this.capabilities = {
      // 1. KEYFRAME ANIMATIONS
      float: {
        name: "GPU Float Animation",
        category: "animations",
        description: "Continuous vertical floating using optimized hardware transform translation.",
        html: `<div class="anim-float accelerated"></div>`,
        css: `@keyframes float {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-8px); }\n}\n.anim-float {\n  animation: float 3s ease-in-out infinite;\n}`,
        instructions: "Bind this animation to floating visual cards, badges, or headers. Ensure '.accelerated' helper class is added to utilize the GPU layers."
      },
      shimmer: {
        name: "Shimmer Loading Skeleton",
        category: "animations",
        description: "Linear sweep background gradient representing visual text skeletons while data fetches.",
        html: `<div class="anim-shimmer" style="height: 16px; border-radius: 4px;"></div>`,
        css: `@keyframes shimmer {\n  0% { background-position: -200% 0; }\n  100% { background-position: 200% 0; }\n}\n.anim-shimmer {\n  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.1) 37%, rgba(255,255,255,0.03) 63%);\n  background-size: 200% 100%;\n  animation: shimmer 1.8s infinite linear;\n}`,
        instructions: "Use this background style to generate skeleton loading elements during asynchronous state transfers."
      },
      pulse: {
        name: "Breathing Pulse",
        category: "animations",
        description: "Subtle scale and opacity respiration indicator to represent active systems.",
        html: `<button class="anim-pulse accelerated">Active Badge</button>`,
        css: `@keyframes pulse {\n  0%, 100% { transform: scale(0.98); opacity: 0.85; }\n  50% { transform: scale(1.02); opacity: 1; }\n}\n.anim-pulse {\n  animation: pulse 2.5s ease-in-out infinite;\n}`,
        instructions: "Bind this animation to live-status components, map rider vectors, or system indicators."
      },
      shake: {
        name: "Horizontal Error Shake",
        category: "animations",
        description: "Rapid translation shake to alert user of form errors or invalid transactions.",
        html: `<button class="anim-shake">Invalid Input</button>`,
        css: `@keyframes shake {\n  0%, 100% { transform: translateX(0); }\n  15%, 45%, 75% { transform: translateX(-6px); }\n  30%, 60%, 90% { transform: translateX(6px); }\n}\n.anim-shake {\n  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;\n}`,
        instructions: "Attach '.anim-shake' dynamically on JavaScript validation catches. Remove class after 500ms to allow re-triggers."
      },
      morph: {
        name: "Shape Morphing Rotation",
        category: "animations",
        description: "Continuous transition transforming rounded squares into perfect circles and back.",
        html: `<div class="anim-morph accelerated"></div>`,
        css: `@keyframes morph {\n  0%, 100% { border-radius: 50%; transform: scale(0.95) rotate(0deg); background: #FC8019; }\n  50% { border-radius: 16px; transform: scale(1.05) rotate(180deg); background: #E11C54; }\n}\n.anim-morph {\n  animation: morph 4s ease-in-out infinite;\n}`,
        instructions: "Perfect for loading icons, visual backdrops, or creative brand indicators."
      },
      spinpulse: {
        name: "Spin Pulse Loader",
        category: "animations",
        description: "Combined hardware translation spin and scale loading rings.",
        html: `<div class="anim-spin-pulse accelerated"></div>`,
        css: `@keyframes spinPulse {\n  0% { transform: rotate(0deg) scale(0.9); opacity: 0.7; }\n  50% { transform: rotate(180deg) scale(1.1); opacity: 1; }\n  100% { transform: rotate(360deg) scale(0.9); opacity: 0.7; }\n}\n.anim-spin-pulse {\n  animation: spinPulse 2s linear infinite;\n}`,
        instructions: "Bind this style class to inline circular loaders inside transaction or submit action buttons."
      },

      // 2. RESPONSIVE INPUT DESIGNS
      floatlabel: {
        name: "Floating Label Input",
        category: "inputs",
        description: "Responsive text input where the descriptive label slides upward and shrinks upon user interaction.",
        html: `<div class="floating-label-wrapper">\n  <input type="text" id="mob-input" class="floating-input" placeholder=" ">\n  <label for="mob-input" class="floating-label">Mobile Number</label>\n</div>`,
        css: `.floating-label-wrapper { position: relative; }\n.floating-input {\n  width: 100%; padding: 1.25rem 1rem 0.5rem 1rem;\n  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);\n  border-radius: 12px; color: #FFF; outline: none; transition: all 0.3s;\n}\n.floating-label {\n  position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);\n  color: #94A3B8; pointer-events: none; transition: all 0.3s;\n}\n.floating-input:focus ~ .floating-label,\n.floating-input:not(:placeholder-shown) ~ .floating-label {\n  top: 18%; font-size: 0.75rem; color: #FC8019;\n}`,
        instructions: "Ideal for phone-number inputs or form sheets. Ensure input has layout space empty so selector matches."
      },
      elastic: {
        name: "Elastic Underline Input",
        category: "inputs",
        description: "Focus border line expands outwards elastically from the center.",
        html: `<div class="elastic-underline-wrapper">\n  <input type="text" class="elastic-input" placeholder="Type name...">\n  <span class="elastic-bar"></span>\n</div>`,
        css: `.elastic-underline-wrapper { position: relative; }\n.elastic-input {\n  width: 100%; padding: 0.875rem 0.5rem;\n  background: transparent; border: none; border-bottom: 2px solid rgba(255,255,255,0.08);\n  color: #FFF; outline: none; transition: all 0.3s;\n}\n.elastic-bar {\n  position: absolute; bottom: 0; left: 50%; width: 0; height: 2px;\n  background: linear-gradient(135deg, #FC8019 0%, #E11C54 100%);\n  transition: width 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6), left 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);\n}\n.elastic-input:focus ~ .elastic-bar { width: 100%; left: 0; }`,
        instructions: "Use this style class for minimalist, modern textual input panels."
      },
      otp: {
        name: "Numeric OTP Inputs",
        category: "inputs",
        description: "Four separate numeric inputs featuring auto-tabbing forward and backward key bindings.",
        html: `<div class="otp-container">\n  <input type="text" maxlength="1" class="otp-box" aria-label="Digit 1">\n  <input type="text" maxlength="1" class="otp-box" aria-label="Digit 2">\n  <input type="text" maxlength="1" class="otp-box" aria-label="Digit 3">\n  <input type="text" maxlength="1" class="otp-box" aria-label="Digit 4">\n</div>`,
        css: `.otp-container { display: flex; gap: 0.75rem; justify-content: center; }\n.otp-box {\n  width: 52px; height: 56px; background: rgba(255,255,255,0.02);\n  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;\n  color: #FFF; font-size: 1.5rem; font-weight: 700; text-align: center;\n  outline: none; transition: all 0.3s;\n}\n.otp-box:focus { border-color: #FC8019; transform: scale(1.04); }`,
        instructions: "Mount this HTML block. Ensure OTP helper script 'setupOTPNavigation()' inside fields.js is activated for backward delete jumping."
      },
      mic: {
        name: "Speech Microphone Status Trigger",
        category: "inputs",
        description: "Soundwave visualizer and concentric pulsing indicators mimicking live microphone speech capture.",
        html: `<div class="mic-btn-wrapper">\n  <div class="mic-pulse-ring"></div>\n  <button class="mic-action-btn">\n    <!-- SVG path -->\n  </button>\n</div>`,
        css: `@keyframes micPulse {\n  0% { transform: scale(1); opacity: 1; }\n  100% { transform: scale(2.2); opacity: 0; }\n}\n.mic-pulse-ring {\n  position: absolute; width: 100%; height: 100%; border-radius: 50%;\n  background: rgba(225, 28, 84, 0.15); animation: micPulse 2s infinite ease-out;\n}`,
        instructions: "Perfect for simulated speech/voice searching headers."
      },

      // 3. MICRO-INTERACTIONS
      scalebtn: {
        name: "Scale Compression Feedback",
        category: "interactions",
        description: "Tactile click feedback squishing elements down elastically when clicked.",
        html: `<button class="squish-btn accelerated">Click Me</button>`,
        css: `.squish-btn {\n  padding: 0.875rem 1.75rem; background: #FC8019; border: none; border-radius: 12px;\n  color: #FFF; font-weight: 600; cursor: pointer;\n  transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n}\n.squish-btn:active {\n  transform: scale(0.92);\n}`,
        instructions: "Apply to all action items, submission buttons, or tab nodes to deliver mechanical compression feedback."
      },
      glow: {
        name: "Glowing Glass Card",
        category: "interactions",
        description: "Dark glass layer blooming with vibrant radial highlight gradients upon cursor hovers.",
        html: `<div class="glow-card">Hover over me</div>`,
        css: `.glow-card {\n  background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.06);\n  border-radius: 16px; padding: 1.25rem; transition: all 0.3s;\n}\n.glow-card:hover {\n  border-color: #FC8019;\n  box-shadow: 0 0 20px rgba(252, 128, 25, 0.25);\n  background: rgba(252, 128, 25, 0.03);\n}`,
        instructions: "Apply to visual dashboards, menu selection list cards, or promo displays."
      },

      // 4. FUTURE 2026 CAPABILITIES
      canvas: {
        name: "3D Gestures Interactive Canvas",
        category: "future",
        description: "Vector canvas rendering visual grids that morph dynamically tracking coordinate gestures.",
        html: `<canvas id="gesture-grid-canvas" style="width:100%; height:120px; background:#000; border-radius:12px;"></canvas>`,
        css: `canvas {\n  display: block;\n  image-rendering: pixelated;\n}`,
        instructions: "Use to draw interactive mapping structures, background visualizers, or rich animation layers."
      },
      gifs: {
        name: "Dynamic Stickers & GIF Injector",
        category: "future",
        description: "Vector GIF and animated badge container that routes live graphic layers onto screens.",
        html: `<div class="sticker-container" id="live-sticker-layer"></div>`,
        css: `.sticker-container {\n  position: relative;\n  display: flex;\n  gap: 10px;\n}`,
        instructions: "Use this module to inject rich animated SVGs, stickers, or brand-specific celebration sequences."
      }
    };

    // Store active routing maps (capabilityKey -> targetPoint)
    this.routes = [
      { capability: "pulse", target: "rider-status-dot", notes: "Automatically route respiration pulse to the tracking delivery rider markers." },
      { capability: "otp", target: "onboarding-auth-otp", notes: "Binds forward-backward auto-tab controls into login auth page." }
    ];

    // Shared Collaborative Workspace Notes
    this.notes = [
      { author: "Human Partner", text: "We need dynamic routing for AI agents to easily bind animations like Shimmer skeletons directly to menu details pages during data loadings." },
      { author: "Agent-05 (JS Developer)", text: "Agreed. Added JSON router endpoints 'getCapabilities()' and 'bindRoute()' so agents can perform queries autonomously." }
    ];
  }

  getCapabilities(category) {
    if (!category || category === "all") {
      return Object.entries(this.capabilities).map(([key, value]) => ({ key, ...value }));
    }
    return Object.entries(this.capabilities)
      .filter(([_, val]) => val.category === category)
      .map(([key, value]) => ({ key, ...value }));
  }

  getCapability(key) {
    return this.capabilities[key] || null;
  }

  registerCapability(key, data) {
    if (this.capabilities[key]) {
      return { success: false, msg: "Capability already registered." };
    }
    this.capabilities[key] = data;
    return { success: true, msg: `Registered capability: ${data.name}` };
  }

  bindRoute(capabilityKey, targetPoint, notes = "") {
    if (!this.capabilities[capabilityKey]) {
      return { success: false, msg: `Failed to bind: ${capabilityKey} capability is not registered.` };
    }
    const newRoute = { capability: capabilityKey, target: targetPoint, notes };
    this.routes.push(newRoute);
    return { success: true, route: newRoute };
  }

  getRoutes() {
    return this.routes;
  }

  addNote(author, text) {
    const newNote = { author, text, timestamp: new Date().toLocaleTimeString() };
    this.notes.push(newNote);
    return newNote;
  }

  getNotes() {
    return this.notes;
  }
}

// Support CommonJS export for Node diagnostics, and browser globals fallback
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CapabilityRegistry;
} else {
  window.CapabilityRegistry = CapabilityRegistry;
}
