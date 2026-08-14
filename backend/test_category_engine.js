import http from 'http';

function makeRequest(options, postData = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: options.path,
        method: options.method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(body); } catch { parsed = body; }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            cookies: res.headers['set-cookie'],
            data: parsed
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runCategoryEngineTest() {
  console.log('===========================================================');
  console.log(' Finova Automatic Categorization Engine Test');
  console.log('===========================================================\n');

  try {
    const time = Date.now();
    const email = `cat_user_${time}@example.com`;
    const password = 'Password123!';

    // 1. Register & Login
    console.log(`1. Registering user ${email}...`);
    await makeRequest({ path: '/api/auth/register', method: 'POST' }, {
      name: 'Categorization Test User',
      email,
      password
    });

    const loginRes = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email, password });
    const rawCookie = loginRes.cookies ? loginRes.cookies[0] : '';
    const cookie = rawCookie.split(';')[0];
    console.log('   ✓ Registered & Logged in successfully.');

    // 2. Upload August CSV with sample merchants
    console.log('\n2. Ingesting August CSV with 16 diverse merchants...');
    const testItems = [
      { date: '2026-08-01', merchant: 'Swiggy Food', amount: 450, type: 'expense' },
      { date: '2026-08-02', merchant: 'ZOMATO ONLINE', amount: 320, type: 'expense' },
      { date: '2026-08-03', merchant: 'Amazon.in', amount: 2499, type: 'expense' },
      { date: '2026-08-04', merchant: 'Netflix.com', amount: 649, type: 'expense' },
      { date: '2026-08-05', merchant: 'Spotify India', amount: 119, type: 'expense' },
      { date: '2026-08-06', merchant: 'Uber Trip', amount: 380, type: 'expense' },
      { date: '2026-08-07', merchant: 'Ola Cabs', amount: 240, type: 'expense' },
      { date: '2026-08-08', merchant: 'Flipkart Online', amount: 1599, type: 'expense' },
      { date: '2026-08-09', merchant: 'Zepto Quick Grocery', amount: 290, type: 'expense' },
      { date: '2026-08-10', merchant: 'Blinkit Express', amount: 410, type: 'expense' },
      { date: '2026-08-11', merchant: 'Rent Payment Landlord', amount: 25000, type: 'expense' },
      { date: '2026-08-12', merchant: 'BESCOM Electricity Bill', amount: 1450, type: 'expense' },
      { date: '2026-08-13', merchant: 'University College Fees', amount: 45000, type: 'expense' },
      { date: '2026-08-14', merchant: 'Apollo Pharmacy', amount: 820, type: 'expense' },
      { date: '2026-08-15', merchant: 'IRCTC Railway Ticket', amount: 1250, type: 'expense' },
      { date: '2026-08-25', merchant: 'Monthly Tech Corp Salary', amount: 120000, type: 'income' }
    ];

    const importRes = await makeRequest({ path: '/api/transactions/import', method: 'POST' }, {
      items: testItems,
      filesProcessed: 1,
      fileNames: ['August_Test.csv']
    }, cookie);

    console.log('   Import Response Summary:', JSON.stringify(importRes.data.summary, null, 2));

    // 3. Fetch saved transactions and verify categories stored in DB
    console.log('\n3. Fetching saved transactions from DB & verifying categories...');
    const txRes = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookie);
    const dbTxs = txRes.data;

    console.log(`   Fetched ${dbTxs.length} transactions from database.`);

    const expectedMappings = {
      'Swiggy': 'Food & Dining',
      'Zomato': 'Food & Dining',
      'Amazon': 'Shopping',
      'Netflix': 'Subscriptions & Tech',
      'Spotify': 'Subscriptions & Tech',
      'Uber': 'Transportation',
      'Ola': 'Transportation',
      'Flipkart': 'Shopping',
      'Zepto': 'Groceries',
      'Blinkit': 'Groceries',
      'Rent': 'Rent & Housing',
      'Electricity': 'Bills & Utilities',
      'College': 'Education',
      'Apollo': 'Healthcare',
      'Irctc': 'Travel',
      'Salary': 'Salary / Income'
    };

    let passCount = 0;
    Object.keys(expectedMappings).forEach(keyword => {
      const matchedTx = dbTxs.find(t => t.merchant.toLowerCase().includes(keyword.toLowerCase()) || (t.raw_description || '').toLowerCase().includes(keyword.toLowerCase()));
      const expectedCat = expectedMappings[keyword];
      if (matchedTx && matchedTx.category === expectedCat) {
        console.log(`   ✓ ${keyword} -> Category: "${matchedTx.category}" [MATCHED]`);
        passCount++;
      } else {
        console.error(`   ❌ ${keyword} -> Expected "${expectedCat}", Got "${matchedTx ? matchedTx.category : 'NOT FOUND'}"`);
      }
    });

    if (passCount !== Object.keys(expectedMappings).length) {
      throw new Error(`FAIL: Expected ${Object.keys(expectedMappings).length} category matches, got ${passCount}`);
    }

    // 4. Verify all transactions have non-empty, non-uncategorized categories
    const invalidCatCount = dbTxs.filter(t => !t.category || t.category === 'Uncategorized').length;
    if (invalidCatCount > 0) {
      throw new Error(`FAIL: ${invalidCatCount} transactions left without a valid category!`);
    }
    console.log('\n   ✓ PASS: 100% of stored transactions possess a valid, meaningful category in DB!');

    console.log('\n===========================================================');
    console.log(' 🎉 AUTOMATIC CATEGORIZATION ENGINE TEST PASSED PERFECTLY!');
    console.log('===========================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runCategoryEngineTest();
