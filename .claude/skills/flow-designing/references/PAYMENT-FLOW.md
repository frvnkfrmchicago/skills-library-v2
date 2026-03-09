# Payment Flow Reference

Detailed audit checklists for payment and checkout flows.

---

## Benchmarks

| Metric | Target | Industry Average |
|--------|--------|-----------------|
| Cart-to-checkout conversion | > 40% | 30% |
| Checkout completion | > 70% | 47% (70% abandonment) |
| Payment error rate | < 2% | 5% |
| Time to purchase | < 90 seconds | 120-180 seconds |

---

## Payment Flow Checkpoints

```
Critical checkpoints:
├── Is the total price visible at ALL TIMES during checkout?
├── Are taxes, fees, and shipping calculated BEFORE final step?
│   └── NEVER surprise the user with additional costs
├── Inline validation on all form fields?
│   ├── Card number format (auto-spaces, detects card type)
│   ├── Expiry date (MM/YY with smart formatting)
│   ├── CVV (3 or 4 digits depending on card type)
│   └── Billing zip code (auto-validation)
├── Multiple payment methods available?
│   ├── Apple Pay / Google Pay (one-tap checkout)
│   ├── Saved cards (if returning user)
│   ├── PayPal, Stripe, or other digital wallets
│   └── Regional methods (PIX, UPI, etc.)
├── Guest checkout available?
├── Error messages are SPECIFIC ("Card declined — try another card")
├── Confirmation screen with order summary before final charge
├── Success state clear (order number, receipt, next steps)
├── Email/push receipt sent within 30 seconds
└── Retry path if payment fails (not kicked back to beginning)
```

---

## Regional Payment Method Selection

```
Decision framework:
├── Step 1: Check analytics for top 5 countries by DAU/MAU
├── Step 2: For each country, identify dominant payment methods:
│   ├── US/UK/EU: Cards, Apple Pay, Google Pay, PayPal
│   ├── Brazil: PIX (77% of digital payments)
│   ├── India: UPI (81% of digital transactions)
│   ├── China: WeChat Pay, Alipay
│   ├── Japan: Konbini, PayPay, credit cards
│   ├── Germany: Klarna, SEPA Direct Debit
│   ├── Netherlands: iDEAL (58% of online payments)
│   ├── Southeast Asia: GrabPay, GCash, OVO, Dana
│   └── Africa: M-Pesa, Flutterwave, Paystack
├── Step 3: Check payment processor coverage
│   ├── Stripe: covers most via Payment Element
│   ├── RevenueCat: mobile subscriptions + IAP
│   └── Adyen: broadest global coverage
└── Step 4: Always offer Apple Pay / Google Pay first
    └── One-tap checkout reduces abandonment by 30-50%
```

**Minimum viable payment stack:**
- **Stage 1** (MVP): Apple Pay + Google Pay + card fallback via Stripe
- **Stage 2** (scaling): Add PayPal + regional methods for top 3 countries
- **Stage 3** (global): Add Klarna/Afterpay for BNPL, regional wallets

---

## In-App Purchase (iOS/Android)

```
Apple IAP requirements:
├── MUST use Apple IAP for digital goods/services
├── External payment links allowed in US only (May 2025+)
├── Subscription management links must go to Settings
├── Restore purchases button required
├── Price displayed in local currency
└── Free trial terms must be crystal clear

Google Play Billing:
├── MUST use Google Play Billing for digital goods
├── Play Store manages subscriptions
├── Obfuscated account ID required for purchase verification
├── Consumable vs non-consumable properly configured
└── Grace periods and account hold handled
```

---

## Payment Security Checklist

- [ ] PCI DSS compliant (never store raw card data)
- [ ] Use tokenized payment processors (Stripe, Square, RevenueCat)
- [ ] HTTPS everywhere — no exceptions
- [ ] 3D Secure implemented for card transactions
- [ ] Fraud detection (velocity checks, device fingerprinting)
- [ ] Refund flow works end-to-end
- [ ] Webhook verification for payment callbacks (signed payloads)

---

## Game Monetization Compliance

### Loot Box / Gacha Regulations

| Region | Regulation | Requirement |
|--------|-----------|-------------|
| Belgium | Banned outright | Remove or face prosecution |
| Netherlands | Banned if tradeable | Tradeable items = illegal |
| EU (DSA) | Transparency required | Disclose odds, spending limits for minors |
| China | Odds disclosure mandatory | Publish exact drop rates |
| Japan | Kompu gacha banned | Cannot require collecting SETS |
| South Korea | Odds + age-gating | Probabilities + age verification |
| Apple (global) | Must disclose odds | Guideline 3.1.1 |
| Google (global) | Must disclose odds | Play Store policy |

### In-Game Currency Audit

```
Critical checkpoints:
├── Is real-money cost always visible alongside virtual currency?
├── Is there a spending cap or warning for minors?
├── Can users see their total spending to date?
├── Are refund paths clear and functional?
├── Is there a "cooling off" period before large purchases?
├── Are premium items available through gameplay, not ONLY purchase?
└── Is pricing consistent across platforms?
```

### Monetization Security

- [ ] Loot box odds disclosed accurately before purchase
- [ ] Spending limits configurable for minor accounts
- [ ] No dark patterns (artificial scarcity with real money)
- [ ] Virtual currency shows real-money equivalent
- [ ] Subscription auto-renewal terms crystal clear
- [ ] Server-side validation for all purchases
- [ ] Receipt validation for IAP
