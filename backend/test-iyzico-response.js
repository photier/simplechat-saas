const Iyzipay = require('iyzipay');

// Use same credentials as backend
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com',
});

// Test token from last failed payment
const token = '80751ed3-1605-40aa-ad45-e27ddedb76ab';

const request = {
  locale: Iyzipay.LOCALE.EN,
  token,
};

console.log('🔍 Retrieving subscription checkout result for token:', token);

iyzipay.subscriptionCheckoutForm.retrieve(request, (err, result) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('\n✅ Full Iyzico Response:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📋 Available top-level fields:', Object.keys(result));

    if (result.data) {
      console.log('\n📋 Available data fields:', Object.keys(result.data));
    }

    // Try to find conversationId
    console.log('\n🔎 Searching for conversationId:');
    console.log('  result.conversationId:', result.conversationId);
    console.log('  result.data?.conversationId:', result.data?.conversationId);
  }
});
