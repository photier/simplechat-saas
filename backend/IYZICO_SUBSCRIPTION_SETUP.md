# Iyzico Subscription API Setup Guide

## Current Status

**Problem:** Error 100001 "Sistem hatası" when creating subscription products
**Root Cause:** Subscription API is disabled by default on all Iyzico accounts (sandbox included)
**Solution:** Contact Iyzico support to enable Subscription API

## Important Findings

### 1. Error 100001 - Not a Code Bug

From GitHub issue: https://github.com/iyzico/iyzipay-python/issues/71

> "iyzico'yu arayarak subscription'ı oynaylatmanız gerekiyor. Bu bir kod hatası değil"

Error 100001 indicates that the Subscription API feature is not enabled on your account. This is **NOT** a code problem - it's an account-level restriction.

### 2. Subscription API Activation Required

**Both sandbox and production accounts** require manual activation by Iyzico support team.

**How to Request:**
- Contact: Iyzico support (phone or email)
- Request: "Subscription API'yi aktif etmek istiyorum"
- Specify: Both sandbox and production environments

### 3. Current Implementation Status

✅ **Completed:**
- Iyzico SDK initialized in payment.service.ts
- Subscription product creation method (using SDK's built-in `subscriptionProduct.create()`)
- Subscription pricing plan creation method (using SDK's built-in `subscriptionPricingPlan.create()`)
- Subscription checkout form creation
- Subscription callback handling
- Auth guards re-enabled on setup endpoints

**Files Modified:**
- `src/payment/payment.service.ts` - SDK-based subscription methods
- `src/payment/payment.controller.ts` - Setup endpoints with JWT auth

**Latest Commits:**
```
67f1300 - fix: Re-enable auth guards on setup endpoints + document Iyzico subscription requirement
47b47c2 - refactor: Use SDK built-in methods for subscription product/plan creation
```

## Setup Steps (After Iyzico Enables Subscription API)

### Step 1: Create Subscription Product (One-Time)

**Endpoint:** `POST /payment/setup/product`
**Auth:** Requires JWT token (tenant login)

```bash
curl -X POST https://api.simplechat.bot/payment/setup/product \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "referenceCode": "xxx-xxx-xxx",
  "name": "SimpleChat Bot Subscription",
  "description": "Monthly subscription for SimpleChat AI chatbot service",
  ...
}
```

**Save the `referenceCode`** - you'll need it for the next step.

### Step 2: Create Pricing Plan (One-Time)

**Endpoint:** `POST /payment/setup/plan`
**Auth:** Requires JWT token (tenant login)

```bash
curl -X POST https://api.simplechat.bot/payment/setup/plan \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "productReferenceCode": "xxx-xxx-xxx"
  }'
```

**Expected Response:**
```json
{
  "referenceCode": "yyy-yyy-yyy",
  "productReferenceCode": "xxx-xxx-xxx",
  "name": "Basic Plan - Monthly",
  "price": "9.99",
  "currencyCode": "USD",
  "paymentInterval": "MONTHLY",
  ...
}
```

**Save the `referenceCode`** - this is your pricing plan reference.

### Step 3: Update Railway Environment Variables

Add these to Railway backend service:

```bash
IYZICO_PRODUCT_REF=xxx-xxx-xxx      # From Step 1
IYZICO_PLAN_REF=yyy-yyy-yyy         # From Step 2
```

**How to Add:**
1. Go to Railway dashboard
2. Select `simplechat-saas` service
3. Go to Variables tab
4. Add both variables
5. Redeploy service

### Step 4: Test Subscription Flow

After Railway redeploys:

1. **Create a bot** in tenant dashboard
2. **Click "Activate Bot"** - should open payment modal
3. **Payment modal** should show Iyzico checkout form
4. **Use test card:**
   - Card: 5890040000000016
   - Expiry: 12/30
   - CVV: 123
5. **Complete payment** - should redirect to success page
6. **Verify bot status** - should change to ACTIVE

## Technical Details

### SDK Resources Used

From `iyzipay-node` library:

- `iyzipay.subscriptionProduct.create()` - Create subscription product
- `iyzipay.subscriptionPricingPlan.create()` - Create pricing plan
- `iyzipay.subscriptionCheckoutForm.initialize()` - Create checkout form
- `iyzipay.subscriptionCheckoutForm.retrieve()` - Verify payment

### Request Format

**Subscription Product:**
```typescript
{
  locale: Iyzipay.LOCALE.TR,        // Sandbox requires Turkish
  conversationId: `product-${Date.now()}`,
  name: 'SimpleChat Bot Subscription',
  description: 'Monthly subscription for SimpleChat AI chatbot service'
}
```

**Pricing Plan:**
```typescript
{
  locale: Iyzipay.LOCALE.TR,
  conversationId: `plan-${Date.now()}`,
  productReferenceCode: 'xxx-xxx-xxx',  // From product creation
  name: 'Basic Plan - Monthly',
  price: '9.99',
  currencyCode: 'USD',
  paymentInterval: 'MONTHLY',
  paymentIntervalCount: 1,
  trialPeriodDays: 0,
  planPaymentType: 'RECURRING',
  recurrenceCount: 0  // 0 = unlimited recurring
}
```

### Authentication

SDK handles authentication automatically using:
- `IYZICO_API_KEY` (from Railway env)
- `IYZICO_SECRET_KEY` (from Railway env)
- `IYZICO_URI` (sandbox or production)

Uses IYZWSv2 authentication format internally.

## Existing Environment Variables

Already set in Railway:

```bash
IYZICO_API_KEY=your_sandbox_api_key
IYZICO_SECRET_KEY=your_sandbox_secret_key
IYZICO_URI=https://sandbox-api.iyzipay.com
```

## Next Steps

1. **Contact Iyzico** - Request Subscription API activation
2. **Wait for confirmation** - They'll notify when enabled
3. **Run setup endpoints** - Create product and plan
4. **Add env variables** - Update Railway with reference codes
5. **Test payment flow** - Verify end-to-end subscription

## Resources

- **Iyzico Docs:** https://docs.iyzico.com/en/products/subscription
- **SDK Repo:** https://github.com/iyzico/iyzipay-node
- **Subscription Samples:** https://github.com/iyzico/iyzipay-node/blob/master/samples/IyzipaySubscriptionSamples.js
- **Error Codes:** https://docs.iyzico.com/en/add-ons/error-codes

## Notes

- Setup endpoints are **one-time use** - only need to run once per environment
- Product and plan are **global** - shared across all tenants
- Each bot subscription uses the **same pricing plan**
- Monthly charges are **automatic** - handled by Iyzico
- Webhook endpoint exists but not implemented yet (`/payment/webhook`)

---

**Last Updated:** January 2025
**Status:** Waiting for Iyzico to enable Subscription API
