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

async function runMultiCsvDeduplicationTest() {
  console.log('===========================================================');
  console.log(' FINLY Multiple CSV Import & Duplicate Protection Test');
  console.log('===========================================================\n');

  try {
    const time = Date.now();
    const email = `dedup_user_${time}@example.com`;
    const password = 'Password123!';

    // 1. Register User & Login
    console.log(`1. Registering user ${email}...`);
    await makeRequest({ path: '/api/auth/register', method: 'POST' }, {
      name: 'Deduplication Test User',
      email,
      password
    });

    const loginRes = await makeRequest({ path: '/api/auth/login', method: 'POST' }, {
      email,
      password
    });
    console.log(`   Login Status: ${loginRes.status}`);
    const rawCookie = loginRes.cookies ? loginRes.cookies[0] : '';
    const cookie = rawCookie.split(';')[0]; // Extract 'token=...'
    console.log(`   Registered & Logged in successfully, Cookie: ${cookie}`);

    // 2. Upload August.csv (4 transactions)
    console.log('\n2. Uploading August.csv (4 transactions)...');
    const augustData = [
      { date: '2026-08-10', merchant: 'Netflix', amount: 649, type: 'expense', category: 'Subscriptions & Tech' },
      { date: '2026-08-12', merchant: 'Whole Foods Market', amount: 125.50, type: 'expense', category: 'Groceries' },
      { date: '2026-08-15', merchant: 'Starbucks Coffee', amount: 350, type: 'expense', category: 'Food & Dining' },
      { date: '2026-08-25', merchant: 'Tech Corp Salary', amount: 85000, type: 'income', category: 'Income' }
    ];

    const augRes = await makeRequest({ path: '/api/transactions/import', method: 'POST' }, {
      items: augustData,
      filesProcessed: 1,
      fileNames: ['August.csv']
    }, cookie);

    console.log(`   Import Status: ${augRes.status}`);
    console.log('   Summary:', JSON.stringify(augRes.data.summary, null, 2));

    if (augRes.data.summary.imported !== 4 || augRes.data.summary.duplicates !== 0) {
      throw new Error(`FAIL: Expected 4 imported and 0 duplicates, got ${augRes.data.summary.imported} imported, ${augRes.data.summary.duplicates} duplicates`);
    }
    console.log('   ✓ PASS: August.csv imported 4 new transactions successfully.');

    // 3. Re-upload August.csv with merchant variations (e.g. NETFLIX.COM, 649.00)
    console.log('\n3. Re-uploading August.csv with merchant variation (NETFLIX.COM)...');
    const augustRepeatData = [
      { date: '2026-08-10', merchant: 'NETFLIX.COM', amount: 649.00, type: 'expense', category: 'Subscriptions' },
      { date: '2026-08-12', merchant: 'Whole Foods', amount: 125.50, type: 'expense', category: 'Groceries' },
      { date: '2026-08-15', merchant: 'STARBUCKS', amount: 350, type: 'expense', category: 'Food' },
      { date: '2026-08-25', merchant: 'Tech Corp Salary', amount: 85000, type: 'income', category: 'Income' }
    ];

    const augRepeatRes = await makeRequest({ path: '/api/transactions/import', method: 'POST' }, {
      items: augustRepeatData,
      filesProcessed: 1,
      fileNames: ['August_repeat.csv']
    }, cookie);

    console.log(`   Import Status: ${augRepeatRes.status}`);
    console.log('   Summary:', JSON.stringify(augRepeatRes.data.summary, null, 2));

    if (augRepeatRes.data.summary.imported !== 0 || augRepeatRes.data.summary.duplicates !== 4) {
      throw new Error(`FAIL: Expected 0 imported and 4 duplicates, got ${augRepeatRes.data.summary.imported} imported, ${augRepeatRes.data.summary.duplicates} duplicates`);
    }
    console.log('   ✓ PASS: All 4 duplicate transactions detected and skipped!');

    // 4. Upload September.csv (3 new transactions)
    console.log('\n4. Uploading September.csv (3 new transactions)...');
    const septData = [
      { date: '2026-09-02', merchant: 'Amazon India', amount: 1899, type: 'expense', category: 'Shopping' },
      { date: '2026-09-10', merchant: 'Netflix', amount: 649, type: 'expense', category: 'Subscriptions & Tech' },
      { date: '2026-09-15', merchant: 'Uber Ride', amount: 420, type: 'expense', category: 'Travel & Transport' }
    ];

    const septRes = await makeRequest({ path: '/api/transactions/import', method: 'POST' }, {
      items: septData,
      filesProcessed: 1,
      fileNames: ['September.csv']
    }, cookie);

    console.log(`   Import Status: ${septRes.status}`);
    console.log('   Summary:', JSON.stringify(septRes.data.summary, null, 2));

    if (septRes.data.summary.imported !== 3 || septRes.data.summary.duplicates !== 0) {
      throw new Error(`FAIL: Expected 3 imported and 0 duplicates, got ${septRes.data.summary.imported} imported, ${septRes.data.summary.duplicates} duplicates`);
    }
    console.log('   ✓ PASS: September transactions added to existing August dataset.');

    // 5. Test Intra-batch Deduplication
    console.log('\n5. Uploading CSV containing intra-batch duplicate (Row 1 & Row 2 identical)...');
    const batchWithDup = [
      { date: '2026-10-01', merchant: 'Apple Store', amount: 9999, type: 'expense', category: 'Shopping' },
      { date: '2026-10-01', merchant: 'Apple Store', amount: 9999, type: 'expense', category: 'Shopping' } // duplicate row
    ];

    const dupRes = await makeRequest({ path: '/api/transactions/import', method: 'POST' }, {
      items: batchWithDup,
      filesProcessed: 1,
      fileNames: ['October_duplicate_row.csv']
    }, cookie);

    console.log(`   Import Status: ${dupRes.status}`);
    console.log('   Summary:', JSON.stringify(dupRes.data.summary, null, 2));

    if (dupRes.data.summary.imported !== 1 || dupRes.data.summary.duplicates !== 1) {
      throw new Error(`FAIL: Expected 1 imported and 1 duplicate, got ${dupRes.data.summary.imported} imported, ${dupRes.data.summary.duplicates} duplicates`);
    }
    console.log('   ✓ PASS: Intra-batch duplicate correctly detected and skipped!');

    // 6. Verify total stored transactions
    console.log('\n6. Fetching total user transactions...');
    const txListRes = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookie);
    console.log(`   Total transactions in DB: ${txListRes.data.length}`);
    if (txListRes.data.length !== 8) { // 4 (Aug) + 3 (Sept) + 1 (Oct) = 8
      throw new Error(`FAIL: Expected 8 total transactions in database, got ${txListRes.data.length}`);
    }
    console.log('   ✓ PASS: Total transaction count matches expected combined dataset (8 items)!');

    console.log('\n===========================================================');
    console.log(' 🎉 ALL MULTIPLE CSV & DEDUPLICATION TESTS PASSED PERFECTLY!');
    console.log('===========================================================');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runMultiCsvDeduplicationTest();
