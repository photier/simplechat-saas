# Iyzico Subscription API Setup Guide

## Current Status

✅ **Subscription API Enabled:** Iyzico has activated the Subscription API on our sandbox account
✅ **Products Created:** Basic ($9.99) and Premium ($19.99) plans created in Iyzico panel
✅ **Environment Variables Set:** Railway configured with plan reference codes
🧪 **Ready for Testing:** Payment flow can now be tested end-to-end

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

## Setup Steps (Completed)

### ✅ Step 1: Create Subscription Products (Done via Iyzico Panel)

**Product Created:** SimpleChat.Bot
- **Product Reference Code:** `39166ac8-8062-4460-b27e-26b8cdc68d76`
- **Created:** 19.11.2025 18:03:54

**Pricing Plans:**
1. **Basic Plan** - $9.99/month
   - Reference Code: `d285c81e-fc1d-48c7-adce-ddd4cfdbe528`

2. **Premium Plan** - $19.99/month
   - Reference Code: `f92c3a3c-d6cb-463e-9783-9e885bb13d1e`

### ✅ Step 2: Railway Environment Variables (Configured)

Added to Railway backend service:

```bash
IYZICO_PRODUCT_REF=39166ac8-8062-4460-b27e-26b8cdc68d76
IYZICO_BASIC_PLAN_REF=d285c81e-fc1d-48c7-adce-ddd4cfdbe528
IYZICO_PREMIUM_PLAN_REF=f92c3a3c-d6cb-463e-9783-9e885bb13d1e
```

### Step 3: Test Subscription Flow

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

1. ✅ **Subscription API activated** - Iyzico enabled the feature
2. ✅ **Products and plans created** - Done via Iyzico panel
3. ✅ **Environment variables configured** - Railway updated with reference codes
4. ✅ **Code deployed** - Backend supports Basic and Premium plans
5. 🧪 **Test payment flow** - Ready for end-to-end testing

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

**Last Updated:** 19 November 2025
**Status:** ✅ Fully Configured - Ready for Testing
