/**
 * Cash Out Charge Calculator
 * Modern Futuristic Materialistic Engine with Dynamic MFS Sync & Limits
 * Author: Tanym Barakah
 */

(function () {
  'use strict';

  // Fallback / Initial Rates & Configurations
  let MFS_CONFIG = {
    lastUpdated: '2026-11-23',
    lastUpdatedBengali: '২৩ নভেম্বর ২০২৬',
    providers: {
      bkash: {
        name: 'bKash',
        fullName: 'বিকাশ',
        minAmount: 200,
        maxAmount: 25000,
        officialSource: 'https://www.bkash.com/en/charges',
        color: '#e2136e',
        app: { rate: 1.75, text: '১৭.৫০৳ / ১০০০৳' },
        ussd: { rate: 1.85, text: '১৮.৫০৳ / ১০০০৳' }
      },
      bkash_pA: {
        name: 'bKash প্রিয়',
        fullName: 'বিকাশ প্রিয় এজেন্ট',
        minAmount: 200,
        maxAmount: 25000,
        officialSource: 'https://www.bkash.com/en/priyo-agent',
        color: '#e2136e',
        app: { rate: 1.49, text: '১৪.৯০৳ (≤ ২৫,০০০৳)' },
        ussd: { rate: 1.49, text: '১৪.৯০৳ (≤ ২৫,০০০৳)' }
      },
      nagad: {
        name: 'Nagad',
        fullName: 'নগদ',
        minAmount: 50,
        maxAmount: 25000,
        officialSource: 'https://nagad.com.bd/services/charges',
        color: '#f7941d',
        app: { rate: 1.149, text: '১১.৪৯৳ / ১০০০৳' },
        ussd: { rate: 1.494, text: '১৪.৯৪৳ / ১০০০৳' }
      },
      upay: {
        name: 'Upay',
        fullName: 'উপায়',
        minAmount: 50,
        maxAmount: 25000,
        officialSource: 'https://www.upaybd.com/tariff-and-limits',
        color: '#004b93',
        app: { rate: 1.40, text: '১৪.০০৳ / ১০০০৳' },
        ussd: { rate: 1.40, text: '১৪.০০৳ / ১০০০৳' }
      },
      rocket: {
        name: 'Rocket',
        fullName: 'রকেট',
        minAmount: 20,
        maxAmount: 25000,
        officialSource: 'https://www.dutchbanglabank.com/rocket/fees-charges.html',
        color: '#8c3494',
        app: { rate: 1.67, text: '১৬.৭০৳ / ১০০০৳' },
        ussd: { rate: 1.67, text: '১৬.৭০৳ / ১০০০৳' }
      },
      tap: {
        name: 'Tap',
        fullName: 'ট্যাপ',
        minAmount: 50,
        maxAmount: 25000,
        officialSource: 'https://www.tapnpay.com.bd/',
        color: '#0d47a1',
        app: { rate: 1.47, text: '১৪.৭০৳ / ১০০০৳' },
        ussd: { rate: 1.80, text: '১৮.০০৳ / ১০০০৳' }
      }
    }
  };

  // State
  let currentMethod = 'app';
  let currentProvider = 'bkash';

  // DOM Elements
  const amountInput = document.getElementById('amount');
  const clearBtn = document.getElementById('clearBtn');
  const methodBtns = document.querySelectorAll('.method-btn');
  const methodSelector = document.querySelector('.method-selector');
  const providerCards = document.querySelectorAll('.provider-card');
  const rateBadge = document.getElementById('rateBadge');
  const minAmountBadge = document.getElementById('minAmountBadge');
  const priyoNotice = document.getElementById('priyoNotice');
  const priyoNoticeText = document.getElementById('priyoNoticeText');
  const chargeValEl = document.getElementById('chargeVal');
  const chargeRateSubEl = document.getElementById('chargeRateSub');
  const totalNeededEl = document.getElementById('totalNeeded');
  const inHandAmountEl = document.getElementById('inHandAmount');
  const quickChips = document.querySelectorAll('.chip');
  const themeToggle = document.getElementById('themeToggle');
  const toggleComparisonBtn = document.getElementById('toggleComparison');
  const comparisonSection = document.querySelector('.comparison-section');
  const comparisonList = document.getElementById('comparisonList');
  const syncRatesBtn = document.getElementById('syncRatesBtn');
  const lastUpdatedDateEl = document.getElementById('lastUpdatedDate');
  const officialSourceLink = document.getElementById('officialSourceLink');
  const toastEl = document.getElementById('toast');
  const toastMsgEl = document.getElementById('toastMsg');

  // Bengali Number Converter
  function toBengaliNumber(num) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, d => bengaliDigits[d]);
  }

  // Toast Notification
  function showToast(message) {
    if (!toastEl) return;
    toastMsgEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // Fetch Live Rates from JSON / MFS data endpoint
  async function fetchLiveRates(showFeedback = false) {
    if (syncRatesBtn) syncRatesBtn.classList.add('rotating');
    try {
      const response = await fetch(`./data/rates.json?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.providers) {
          // Merge with config
          Object.keys(data.providers).forEach(key => {
            if (MFS_CONFIG.providers[key]) {
              MFS_CONFIG.providers[key] = {
                ...MFS_CONFIG.providers[key],
                ...data.providers[key]
              };
            }
          });
          if (data.lastUpdatedBengali && lastUpdatedDateEl) {
            lastUpdatedDateEl.textContent = data.lastUpdatedBengali;
          }
          updateDynamicProviderState();
          updateProviderSubtexts();
          updateRateBadge();
          calculateCharge();

          if (showFeedback) {
            showToast('এমএফএস সাইটের ডাটা সফলভাবে সিঙ্ক হয়েছে!');
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch external rates, using verified local data.', err);
      if (showFeedback) {
        showToast('ভেরিফাইড অফিশিয়াল ডাটা সক্রিয় রয়েছে!');
      }
    } finally {
      if (syncRatesBtn) {
        setTimeout(() => syncRatesBtn.classList.remove('rotating'), 600);
      }
    }
  }

  // Update Dynamic Minimum Amount and Official Source Link per Operator
  function updateDynamicProviderState() {
    const providerObj = MFS_CONFIG.providers[currentProvider];
    if (!providerObj) return;

    // 1. Dynamic Minimum Amount Update
    const minVal = providerObj.minAmount || 50;
    amountInput.min = minVal;
    amountInput.placeholder = `যেমন: ১০০০ (সর্বনিম্ন ${toBengaliNumber(minVal)}৳)`;
    
    if (minAmountBadge) {
      minAmountBadge.textContent = `সর্বনিম্ন ${toBengaliNumber(minVal)} ৳`;
    }

    // 2. Dynamic Official Source Link Update
    if (officialSourceLink && providerObj.officialSource) {
      officialSourceLink.href = providerObj.officialSource;
      officialSourceLink.title = `${providerObj.name} এর অফিসিয়াল চার্জ পাতা দেখুন`;
    }

    // 3. Dynamic Priyo Notice Check
    if (currentProvider === 'bkash_pA') {
      priyoNotice.classList.add('visible');
    } else {
      priyoNotice.classList.remove('visible');
    }
  }

  // Update Rate Badge
  function updateRateBadge() {
    const providerObj = MFS_CONFIG.providers[currentProvider];
    if (providerObj && providerObj[currentMethod]) {
      rateBadge.textContent = `চার্জ: ${toBengaliNumber(providerObj[currentMethod].rate)}%`;
    }
  }

  // Update Subtexts inside Operator cards
  function updateProviderSubtexts() {
    providerCards.forEach(card => {
      const p = card.dataset.provider;
      const subEl = card.querySelector('.provider-rate-text');
      const providerObj = MFS_CONFIG.providers[p];
      if (providerObj && providerObj[currentMethod] && subEl) {
        subEl.textContent = providerObj[currentMethod].text;
      }
    });
  }

  // Initialize
  function init() {
    initTheme();
    bindEvents();
    updateDynamicProviderState();
    updateRateBadge();
    calculateCharge();
    fetchLiveRates(false);
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem('cashout_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('cashout_theme', nextTheme);
      });
    }
  }

  // Event Listeners
  function bindEvents() {
    // Amount input typing
    amountInput.addEventListener('input', () => {
      toggleClearButton();
      calculateCharge();
    });

    // Clear Button
    clearBtn.addEventListener('click', () => {
      amountInput.value = '';
      toggleClearButton();
      calculateCharge();
      amountInput.focus();
    });

    // Quick Chips
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = parseFloat(chip.dataset.amount);
        amountInput.value = val;
        toggleClearButton();
        calculateCharge();
      });
    });

    // Method Selection (App vs USSD)
    methodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        methodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMethod = btn.dataset.method;
        if (currentMethod === 'ussd') {
          methodSelector.classList.add('ussd-active');
        } else {
          methodSelector.classList.remove('ussd-active');
        }
        updateProviderSubtexts();
        updateRateBadge();
        calculateCharge();
      });
    });

    // Provider Card Selection
    providerCards.forEach(card => {
      card.addEventListener('click', () => {
        providerCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentProvider = card.dataset.provider;

        // Auto Update Minimum Amount and Links
        updateDynamicProviderState();
        updateRateBadge();
        calculateCharge();
      });
    });

    // Live Sync Button Click
    if (syncRatesBtn) {
      syncRatesBtn.addEventListener('click', () => {
        fetchLiveRates(true);
      });
    }

    // Comparison Toggle
    if (toggleComparisonBtn) {
      toggleComparisonBtn.addEventListener('click', () => {
        comparisonSection.classList.toggle('open');
      });
    }
  }

  // Toggle Clear Button
  function toggleClearButton() {
    if (amountInput.value && amountInput.value.trim() !== '') {
      clearBtn.style.display = 'grid';
    } else {
      clearBtn.style.display = 'none';
    }
  }

  // Core Calculation Function
  window.calculateCharge = function () {
    const amountVal = parseFloat(amountInput.value);
    const amount = isNaN(amountVal) ? 0 : amountVal;

    const providerObj = MFS_CONFIG.providers[currentProvider];
    const rateData = providerObj ? providerObj[currentMethod] : { rate: 1.75 };
    const minVal = providerObj ? (providerObj.minAmount || 50) : 50;
    const ratePercent = rateData.rate;

    // Check bKash Priyo limit
    if (currentProvider === 'bkash_pA') {
      if (amount > 25000) {
        priyoNoticeText.textContent = 'সতর্কতা: প্রিয় এজেন্ট লিমিট ২৫,০০০৳ এর বেশি হলে সাধারণ রেট (১.৭৫%) প্রযোজ্য হবে।';
      } else {
        priyoNoticeText.textContent = 'বিকাশ প্রিয় এজেন্ট সুবিধা মাসে সর্বোচ্চ ২৫,০০০ টাকা পর্যন্ত প্রযোজ্য।';
      }
    }

    let charge = 0;
    let totalNeeded = 0;
    let inHand = 0;

    if (amount >= minVal) {
      charge = amount * (ratePercent / 100);
      totalNeeded = amount + charge;
      inHand = Math.max(0, amount - charge);
    }

    // Update Main Display with smooth number
    animateValue(chargeValEl, charge);

    // Update Subtitles and Breakdown
    const methodLabel = currentMethod === 'app' ? 'অ্যাপ' : 'ইউএসএসডি';
    chargeRateSubEl.textContent = `হার: ${toBengaliNumber(ratePercent)}% (${methodLabel})`;
    totalNeededEl.textContent = `৳ ${formatNumber(totalNeeded)}`;
    inHandAmountEl.textContent = `৳ ${formatNumber(inHand)}`;

    // Update comparison list
    renderComparison(amount);
  };

  // Render comparison list for all operators
  function renderComparison(amount) {
    if (!comparisonList) return;
    const providers = MFS_CONFIG.providers;
    let html = '';

    Object.keys(providers).forEach(key => {
      const op = providers[key];
      const methodData = op[currentMethod] || op.app;
      const isSelected = key === currentProvider;
      const minOp = op.minAmount || 50;
      const opCharge = amount >= minOp ? (amount * (methodData.rate / 100)).toFixed(2) : '০.০০';

      html += `
        <div class="compare-row ${isSelected ? 'highlighted' : ''}">
          <span class="compare-op">
            <span class="compare-op-dot" style="background-color: ${op.color}"></span>
            ${op.fullName}
          </span>
          <span class="compare-val">৳ ${opCharge}</span>
        </div>
      `;
    });

    comparisonList.innerHTML = html;
  }

  // Number Formatter
  function formatNumber(num) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Value Animator
  function animateValue(element, endVal) {
    const duration = 250;
    const startVal = parseFloat(element.getAttribute('data-val') || '0');
    element.setAttribute('data-val', endVal);

    if (startVal === endVal) {
      element.textContent = formatNumber(endVal);
      return;
    }

    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Ease Out Cubic
      const current = startVal + (endVal - startVal) * ease;

      element.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatNumber(endVal);
      }
    }

    requestAnimationFrame(step);
  }

  // Auto Init on DOM Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
