export class HUD {
  constructor() {
    this.p1Bar = document.getElementById('p1-health');
    this.p2Bar = document.getElementById('p2-health');
    this.p1BarDelayed = document.getElementById('p1-health-delayed');
    this.p2BarDelayed = document.getElementById('p2-health-delayed');
    this.p1Special = document.getElementById('p1-special');
    this.p2Special = document.getElementById('p2-special');
    this.timerEl = document.getElementById('timer');
    this.roundEl = document.getElementById('round-text');
    this.comboEl = document.getElementById('combo-text');
    this.announceOverlay = document.getElementById('round-announce');
    this.announceText = document.getElementById('announce-text');
    this.announceSub = document.getElementById('announce-sub');
    this.victoryScreen = document.getElementById('victory-screen');
    this.victoryText = document.getElementById('victory-text');
    this.koOverlay = document.getElementById('ko-overlay');

    // Delayed health bar state
    this._p1Delayed = 100;
    this._p2Delayed = 100;
  }

  updateHealth(p1, p2) {
    const p1Pct = p1.healthPercent * 100;
    const p2Pct = p2.healthPercent * 100;

    // Instant green bar
    this.p1Bar.style.width = p1Pct + '%';
    this.p2Bar.style.width = p2Pct + '%';

    // Delayed red bar (slowly catches up — 300ms delay feel)
    this._p1Delayed += (p1Pct - this._p1Delayed) * 0.04;
    this._p2Delayed += (p2Pct - this._p2Delayed) * 0.04;
    if (this.p1BarDelayed) this.p1BarDelayed.style.width = this._p1Delayed + '%';
    if (this.p2BarDelayed) this.p2BarDelayed.style.width = this._p2Delayed + '%';

    // Color states
    this.p1Bar.setAttribute('data-health', p1Pct > 50 ? '' : p1Pct > 25 ? 'mid' : 'low');
    this.p2Bar.setAttribute('data-health', p2Pct > 50 ? '' : p2Pct > 25 ? 'mid' : 'low');
  }

  updateSpecial(p1, p2) {
    if (this.p1Special) this.p1Special.style.width = p1.specialPercent * 100 + '%';
    if (this.p2Special) this.p2Special.style.width = p2.specialPercent * 100 + '%';
  }

  updateTimer(seconds) {
    this.timerEl.textContent = Math.ceil(Math.max(0, seconds));
  }

  updateRound(round) {
    this.roundEl.textContent = 'ROUND ' + round;
  }

  showCombo(fighter, count) {
    if (!this.comboEl || count < 2) {
      if (this.comboEl) this.comboEl.style.opacity = '0';
      return;
    }
    const labels = ['', '', '2 HIT!', '3 HIT COMBO!', '4 HIT COMBO!', '5 HIT COMBO!!', '6+ BRUTAL!!!'];
    const text = count >= 6 ? labels[6] : labels[count] || count + ' HIT!';
    this.comboEl.textContent = text;
    this.comboEl.style.opacity = '1';
    this.comboEl.style.color = count >= 5 ? '#ff2d75' : count >= 3 ? '#ffd700' : '#ffffff';
    this.comboEl.style.fontSize = Math.min(2.2, 1 + count * 0.15) + 'rem';
    this.comboEl.style.transform = `scale(${1 + count * 0.05})`;

    clearTimeout(this._comboTimeout);
    this._comboTimeout = setTimeout(() => {
      if (this.comboEl) {
        this.comboEl.style.opacity = '0';
        this.comboEl.style.transform = 'scale(1)';
      }
    }, 1200);
  }

  // ── Floating Damage Numbers ──
  spawnDamageNumber(damage, worldX, worldY) {
    const el = document.createElement('div');
    el.className = 'damage-number';
    el.textContent = '-' + damage;

    // Position relative to game container center
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    const screenX = rect.width / 2 + worldX * 55 + (Math.random() - 0.5) * 30;
    const screenY = rect.height / 2 - worldY * 30 - 20;
    el.style.left = screenX + 'px';
    el.style.top = screenY + 'px';

    // Color by damage amount
    if (damage >= 25) {
      el.style.color = '#ff2d75';
      el.style.fontSize = '2rem';
      el.classList.add('damage-crit');
    } else if (damage >= 15) {
      el.style.color = '#ffd700';
      el.style.fontSize = '1.5rem';
    }

    container.appendChild(el);

    // Animate upward and fade
    let frame = 0;
    const animate = () => {
      frame++;
      el.style.top = (screenY - frame * 1.5) + 'px';
      el.style.opacity = Math.max(0, 1 - frame / 40);
      if (frame < 40) {
        requestAnimationFrame(animate);
      } else {
        el.remove();
      }
    };
    requestAnimationFrame(animate);
  }

  // ── KO Graphic ──
  showKO() {
    if (!this.koOverlay) {
      const overlay = document.createElement('div');
      overlay.id = 'ko-overlay';
      overlay.innerHTML = '<span class="ko-text">K.O.!</span>';
      document.getElementById('game-container').appendChild(overlay);
      this.koOverlay = overlay;
    }
    this.koOverlay.classList.remove('hidden');
    this.koOverlay.style.display = 'flex';
    setTimeout(() => {
      if (this.koOverlay) {
        this.koOverlay.classList.add('hidden');
        this.koOverlay.style.display = 'none';
      }
    }, 2000);
  }

  showAnnounce(text, sub, duration = 2000) {
    this.announceText.textContent = text;
    this.announceSub.textContent = sub;
    this.announceOverlay.classList.remove('hidden');
    this.announceText.style.animation = 'none';
    this.announceSub.style.animation = 'none';
    void this.announceText.offsetHeight;
    this.announceText.style.animation = '';
    this.announceSub.style.animation = '';
    return new Promise(resolve => {
      setTimeout(() => {
        this.announceOverlay.classList.add('hidden');
        resolve();
      }, duration);
    });
  }

  showVictory(name) {
    this.victoryText.textContent = name + ' WINS!';
    this.victoryScreen.classList.remove('hidden');
  }

  hideVictory() {
    this.victoryScreen.classList.add('hidden');
  }
}
