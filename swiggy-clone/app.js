document.addEventListener('DOMContentLoaded', () => {
  // Navigation State Management
  const screenStack = ['screen-onboarding'];
  let cart = [];
  const deliveryCharges = 35;
  const platformFee = 5;

  // Key Elements
  const screens = document.querySelectorAll('.screen');
  const bottomNav = document.querySelector('.bottom-nav');
  const bottomNavItems = document.querySelectorAll('.nav-item');
  const bottomCartBar = document.querySelector('.bottom-cart-bar');
  
  const hideNavScreens = ['screen-onboarding', 'screen-otp', 'screen-location', 'screen-tracking'];

  function applyNavVisibility(screenId) {
    if (!screenId || hideNavScreens.includes(screenId)) {
      bottomNav.classList.add('hidden');
      return;
    }
    bottomNav.classList.remove('hidden');
    const tabMap = {
      'screen-home': 'nav-home',
      'screen-search': 'nav-search',
      'screen-cart': 'nav-cart'
    };
    const activeTabId = tabMap[screenId];
    bottomNavItems.forEach(item => {
      item.classList.toggle('active', activeTabId ? item.id === activeTabId : false);
    });
  }

  /** Deep link from /screens gallery: ?screen=screen-home */
  function openScreenDirect(screenId) {
    const targetScreen = document.getElementById(screenId);
    if (!targetScreen) return false;

    screens.forEach((s) => s.classList.remove('active', 'prev'));
    targetScreen.classList.add('active');
    screenStack.length = 0;
    screenStack.push(screenId);
    applyNavVisibility(screenId);
    return true;
  }

  function initFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const screenId = params.get('screen');
    const stateId = params.get('state');
    if (screenId && openScreenDirect(screenId)) {
      if (stateId === 'empty' && screenId === 'screen-cart') {
        cart.length = 0;
        renderCart();
      }
      return;
    }
    navigateTo('screen-onboarding');
  }

  initFromQuery();

  if (window.self === window.top) {
    const galleryLink = document.createElement('a');
    galleryLink.href = 'screens/';
    galleryLink.textContent = 'Screens';
    galleryLink.setAttribute('aria-label', 'Open screen gallery');
    galleryLink.className = 'dev-gallery-link';
    document.body.appendChild(galleryLink);
  }

  // Utility to handle Screen Navigation (History Stack based)
  function navigateTo(screenId, direction = 'forward') {
    const currentActive = document.querySelector('.screen.active');

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
      targetScreen.classList.remove('prev');
      targetScreen.classList.add('active');
      if (screenStack[screenStack.length - 1] !== screenId) {
        screenStack.push(screenId);
      }
    } else if (direction === 'back') {
      if (screenStack.length > 1) {
        screenStack.pop();
        const prevScreenId = screenStack[screenStack.length - 1];
        
        if (currentActive) {
          currentActive.classList.remove('active');
        }
        
        const targetScreen = document.getElementById(prevScreenId);
        targetScreen.classList.remove('prev');
        targetScreen.classList.add('active');
      }
    }
  }

  // Handle Global Back Buttons
  document.querySelectorAll('.header-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(null, 'back');
    });
  });

  // Handle Bottom Navigation Tab Clicks
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
  // SCREEN 1: ONBOARDING LOGIC
  // ==========================================
  const phoneInput = document.getElementById('phone-input');
  const onboardingBtn = document.getElementById('onboarding-btn');

  if (phoneInput && onboardingBtn) {
    phoneInput.addEventListener('input', () => {
      const val = phoneInput.value.replace(/\D/g, '');
      phoneInput.value = val; // Force digits only
      
      if (val.length === 10) {
        onboardingBtn.removeAttribute('disabled');
        onboardingBtn.style.opacity = '1';
      } else {
        onboardingBtn.setAttribute('disabled', 'true');
        onboardingBtn.style.opacity = '0.5';
      }
    });

    onboardingBtn.addEventListener('click', () => {
      const formattedPhone = `+91 ${phoneInput.value.slice(0,5)} ${phoneInput.value.slice(5)}`;
      document.getElementById('otp-target-phone').innerText = formattedPhone;
      navigateTo('screen-otp');
      // Autofocus first OTP box
      setTimeout(() => {
        const firstOtp = document.querySelector('.otp-box');
        if (firstOtp) firstOtp.focus();
      }, 400);
    });
  }

  // ==========================================
  // SCREEN 2: OTP VERIFICATION
  // ==========================================
  const otpBoxes = document.querySelectorAll('.otp-box');
  const otpBtn = document.getElementById('otp-btn');

  if (otpBoxes && otpBtn) {
    otpBoxes.forEach((box, idx) => {
      box.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        
        if (val && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
        
        checkOtpCompletion();
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          otpBoxes[idx - 1].focus();
        }
      });
    });

    function checkOtpCompletion() {
      let code = '';
      otpBoxes.forEach(box => code += box.value);
      
      if (code.length === 4) {
        otpBtn.removeAttribute('disabled');
        otpBtn.style.opacity = '1';
      } else {
        otpBtn.setAttribute('disabled', 'true');
        otpBtn.style.opacity = '0.5';
      }
    }

    otpBtn.addEventListener('click', () => {
      navigateTo('screen-location');
    });
  }

  // ==========================================
  // SCREEN 3: LOCATION ACCESS
  // ==========================================
  const gpsBtn = document.getElementById('gps-location-btn');
  const manualBtn = document.getElementById('manual-location-btn');

  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      navigateTo('screen-home');
    });
  }
  if (manualBtn) {
    manualBtn.addEventListener('click', () => {
      navigateTo('screen-home');
    });
  }

  // ==========================================
  // SCREEN 4: HOME / DASHBOARD
  // ==========================================
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceType = card.getAttribute('data-service');
      if (serviceType === 'food') {
        navigateTo('screen-res-detail');
      }
    });
  });

  const searchTrigger = document.querySelector('.search-bar-trigger');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
      navigateTo('screen-search');
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }, 400);
    });
  }

  // ==========================================
  // SCREEN 5: SEARCH FUNCTIONALITY
  // ==========================================
  const searchInput = document.querySelector('.search-input');
  const searchCancel = document.querySelector('.search-cancel');
  
  if (searchCancel) {
    searchCancel.addEventListener('click', () => {
      navigateTo(null, 'back');
    });
  }

  // Add click support for search options or categories
  document.querySelectorAll('.recent-search-item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo('screen-res-detail');
    });
  });

  // ==========================================
  // SCREEN 6: RESTAURANT DETAIL & CART ENGINE
  // ==========================================
  const menuItems = [
    { id: 'dish-1', name: 'Paneer Makhani Butter Masala', price: 289, rating: 4.8 },
    { id: 'dish-2', name: 'Double Masala Veg Maggi Noodles', price: 120, rating: 4.5 },
    { id: 'dish-3', name: 'Classic Garlic Breadsticks (4 pcs)', price: 149, rating: 4.2 },
    { id: 'dish-4', name: 'Stuffed Garlic Bread Roll', price: 199, rating: 4.6 }
  ];

  // Wire Add/Quantity buttons
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dishId = btn.getAttribute('data-dish-id');
      const item = menuItems.find(m => m.id === dishId);
      if (item) {
        addToCart(item);
        updateDishUI(dishId, 1);
      }
    });
  });

  // Handle bottom sheet click
  if (bottomCartBar) {
    bottomCartBar.addEventListener('click', () => {
      navigateTo('screen-cart');
    });
  }

  function addToCart(item) {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    renderCart();
  }

  function removeFromCart(itemId) {
    const existing = cart.find(c => c.id === itemId);
    if (existing) {
      existing.quantity -= 1;
      if (existing.quantity <= 0) {
        cart = cart.filter(c => c.id !== itemId);
        updateDishUI(itemId, 0);
      } else {
        updateDishUI(itemId, existing.quantity);
      }
    }
    renderCart();
  }

  function updateDishUI(dishId, qty) {
    const dishCard = document.querySelector(`[data-dish-card-id="${dishId}"]`);
    if (!dishCard) return;

    const addBtn = dishCard.querySelector('.add-btn');
    const qtyBtn = dishCard.querySelector('.qty-btn');
    const qtyCount = dishCard.querySelector('.qty-count');

    if (qty > 0) {
      addBtn.style.display = 'none';
      qtyBtn.style.display = 'flex';
      qtyCount.innerText = qty;
    } else {
      addBtn.style.display = 'block';
      qtyBtn.style.display = 'none';
    }
  }

  function renderCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const itemSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update bottom float bar
    if (totalItems > 0) {
      bottomCartBar.style.display = 'flex';
      document.getElementById('cart-bar-qty').innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
      document.getElementById('cart-bar-total').innerText = `₹${itemSubtotal}`;
    } else {
      bottomCartBar.style.display = 'none';
    }

    // Update Cart Screen DOM
    const cartItemsList = document.getElementById('cart-items-list');
    const billItemsTotal = document.getElementById('bill-items-total');
    const billGrandTotal = document.getElementById('bill-grand-total');
    const bottomCartPrice = document.getElementById('bottom-cart-price');

    if (cartItemsList) {
      if (cart.length === 0) {
        cartItemsList.innerHTML = `<div style="text-align:center; padding: 40px 0; color: var(--color-text-secondary);">Your cart is empty</div>`;
        billItemsTotal.innerText = '₹0';
        billGrandTotal.innerText = '₹0';
        bottomCartPrice.innerText = '₹0';
        document.getElementById('place-order-btn').setAttribute('disabled', 'true');
        document.getElementById('place-order-btn').style.opacity = '0.5';
      } else {
        document.getElementById('place-order-btn').removeAttribute('disabled');
        document.getElementById('place-order-btn').style.opacity = '1';
        
        let cartHtml = '';
        cart.forEach(item => {
          cartHtml += `
            <div class="cart-item-row">
              <div class="cart-item-left">
                <div class="veg-icon"><div class="veg-icon-dot"></div></div>
                <div class="cart-item-name">${item.name}</div>
              </div>
              <div class="cart-item-right">
                <div style="display:flex; align-items:center; gap:8px; border:1px solid var(--color-border); border-radius:6px; padding:2px 8px;">
                  <span style="cursor:pointer; font-weight:700; color:var(--color-success);" onclick="window.appRemoveItem('${item.id}')">−</span>
                  <span style="font-weight:700; font-size:13px;">${item.quantity}</span>
                  <span style="cursor:pointer; font-weight:700; color:var(--color-success);" onclick="window.appAddItem('${item.id}')">+</span>
                </div>
                <div class="cart-item-price">₹${item.price * item.quantity}</div>
              </div>
            </div>
          `;
        });
        
        cartItemsList.innerHTML = cartHtml;
        billItemsTotal.innerText = `₹${itemSubtotal}`;
        const grandTotal = itemSubtotal + deliveryCharges + platformFee;
        billGrandTotal.innerText = `₹${grandTotal}`;
        bottomCartPrice.innerText = `₹${grandTotal}`;
      }
    }
  }

  // Bind global helper callbacks for dynamic cart lists
  window.appAddItem = (id) => {
    const item = menuItems.find(m => m.id === id);
    if (item) addToCart(item);
  };
  window.appRemoveItem = (id) => {
    removeFromCart(id);
  };

  // Wire up quantity click inside menu list
  document.querySelectorAll('.qty-btn').forEach(btn => {
    const dishId = btn.parentNode.querySelector('.add-btn').getAttribute('data-dish-id');
    const minus = btn.querySelector('.qty-minus');
    const plus = btn.querySelector('.qty-plus');

    minus.addEventListener('click', (e) => {
      e.stopPropagation();
      const existing = cart.find(c => c.id === dishId);
      if (existing) {
        removeFromCart(dishId);
      }
    });

    plus.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = menuItems.find(m => m.id === dishId);
      if (item) {
        addToCart(item);
        const existing = cart.find(c => c.id === dishId);
        updateDishUI(dishId, existing.quantity);
      }
    });
  });

  // ==========================================
  // SCREEN 7: CART CHECKOUT & PLACING ORDER
  // ==========================================
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      navigateTo('screen-tracking');
      startLiveTrackingSim();
    });
  }

  // ==========================================
  // SCREEN 8: LIVE TRACKING SIMULATOR
  // ==========================================
  let trackingInterval = null;

  function startLiveTrackingSim() {
    // Reset steps
    const steps = document.querySelectorAll('.tracking-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Set first step active
    steps[0].classList.add('active');
    
    let currentStep = 0;
    const duration = [4000, 4000, 4000, 4000]; // milliseconds per tracking status change
    
    if (trackingInterval) clearInterval(trackingInterval);
    
    function advanceStep() {
      if (currentStep < steps.length - 1) {
        steps[currentStep].classList.remove('active');
        currentStep++;
        steps[currentStep].classList.add('active');
        
        // Update Status Badge and ETA text
        const statusBadge = document.querySelector('.tracking-status-badge');
        const etaNumber = document.querySelector('.tracking-eta span');
        
        if (currentStep === 1) {
          statusBadge.innerText = 'Rider Assigned';
          etaNumber.innerText = '18 Mins';
        } else if (currentStep === 2) {
          statusBadge.innerText = 'Food Picked Up';
          etaNumber.innerText = '10 Mins';
        } else if (currentStep === 3) {
          statusBadge.innerText = 'Rider Nearby';
          etaNumber.innerText = '2 Mins';
        }
        
        setTimeout(advanceStep, duration[currentStep]);
      } else {
        const statusBadge = document.querySelector('.tracking-status-badge');
        statusBadge.innerText = 'Delivered!';
        statusBadge.style.backgroundColor = 'var(--color-success-light)';
        statusBadge.style.color = 'var(--color-success)';
        document.querySelector('.tracking-eta').innerHTML = 'Your food has <span>Arrived!</span>';
      }
    }
    
    setTimeout(advanceStep, duration[0]);
  }
});
