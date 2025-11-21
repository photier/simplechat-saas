const Iyzipay = require('iyzipay');

// Initialize Iyzico client
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com',
});

// Token from latest test
const token = '14765a15-82e1-422f-86fd-fb1cbaa4d8b1';

const request = {
  locale: Iyzipay.LOCALE.EN,
  token,
};

console.log(`Testing Iyzico query for token: ${token}`);
console.log(`API URL: ${process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'}`);
console.log('---');

iyzipay.subscriptionCheckoutForm.retrieve(request, (err, result) => {
  if (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }

  console.log('RESULT:');
  console.log(JSON.stringify(result, null, 2));

  if (result.status === 'success') {
    console.log('\n✅ Payment form retrieved successfully!');
    console.log(`Subscription Status: ${result.data?.subscriptionStatus || 'N/A'}`);
  } else {
    console.log('\n❌ Payment form not found');
    console.log(`Error Code: ${result.errorCode}`);
    console.log(`Error Message: ${result.errorMessage}`);
  }

  process.exit(0);
});
