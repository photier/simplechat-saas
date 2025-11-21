// Temporary script to test Iyzico token query
const { PrismaClient } = require('@prisma/client');
const Iyzipay = require('iyzipay');

const prisma = new PrismaClient();

async function testToken() {
  const token = '14765a15-82e1-422f-86fd-fb1cbaa4d8b1';

  const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com',
  });

  const request = {
    locale: Iyzipay.LOCALE.EN,
    token,
  };

  console.log(`\n🔍 Testing token: ${token}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`🌐 API: ${process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'}`);
  console.log('---\n');

  return new Promise((resolve) => {
    iyzipay.subscriptionCheckoutForm.retrieve(request, async (err, result) => {
      if (err) {
        console.error('❌ ERROR:', err);
        await prisma.$disconnect();
        process.exit(1);
      }

      console.log('📦 RESULT:');
      console.log(JSON.stringify(result, null, 2));
      console.log('\n---\n');

      if (result.status === 'success') {
        const subscriptionStatus = result.data?.subscriptionStatus || 'N/A';
        console.log('✅ Payment form retrieved successfully!');
        console.log(`📊 Subscription Status: ${subscriptionStatus}`);

        if (subscriptionStatus === 'ACTIVE') {
          console.log('🎉 SUBSCRIPTION IS ACTIVE! Polling solution will work!');

          // Get bot info
          const paymentToken = await prisma.paymentToken.findUnique({
            where: { token },
            include: { chatbot: true },
          });

          if (paymentToken) {
            console.log(`\n🤖 Bot: ${paymentToken.chatbot.name} (${paymentToken.chatbot.id})`);
            console.log(`📍 Current Status: ${paymentToken.chatbot.status}`);
            console.log(`💳 Subscription Status: ${paymentToken.chatbot.subscriptionStatus}`);
          }
        }
      } else {
        console.log('❌ Payment form not ready');
        console.log(`🔢 Error Code: ${result.errorCode}`);
        console.log(`📝 Error Message: ${result.errorMessage}`);

        if (result.errorCode === '201600') {
          console.log('\n⏱️  This is error 201600 - sandbox still finalizing payment');
          console.log('💡 Need to wait longer OR implement polling solution');
        }
      }

      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

testToken().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
