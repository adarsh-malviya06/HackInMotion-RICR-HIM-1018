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
          resolve({ status: res.statusCode, headers: res.headers, cookies: res.headers['set-cookie'], data: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTest() {
  const step = process.argv[2] || 'create';

  if (step === 'create') {
    console.log('=== STEP 1: Creating Data Before Server Restart ===');
    const email = 'real_db_user_123@example.com';
    const reg = await makeRequest({ path: '/api/auth/register', method: 'POST' }, { name: 'Real DB User', email, password: 'password123' });
    console.log('Registration Status:', reg.status);

    const login = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email, password: 'password123' });
    const cookie = login.cookies[0].split(';')[0];
    console.log('Login Status:', login.status, '| User ID:', login.data.user.id);

    // Create 2 Transactions
    const tx1 = await makeRequest({ path: '/api/transactions', method: 'POST' }, { merchant: 'Espresso Bar', amount: 500, category: 'Food & Dining', type: 'expense' }, cookie);
    const tx2 = await makeRequest({ path: '/api/transactions', method: 'POST' }, { merchant: 'Apartment Rent', amount: 25000, category: 'Housing', type: 'expense' }, cookie);
    console.log('Tx1 Created:', tx1.data._id || tx1.data.id, '| Tx2 Created:', tx2.data._id || tx2.data.id);

    // Create Budget & Goal
    const bdg = await makeRequest({ path: '/api/budgets', method: 'POST' }, { category: 'Housing', monthly_limit: 30000 }, cookie);
    const goal = await makeRequest({ path: '/api/goals', method: 'POST' }, { name: 'Vacation Fund', target_amount: 100000, current_amount: 20000 }, cookie);
    console.log('Budget Created:', bdg.data.category, '| Goal Created:', goal.data.name);

    console.log('\nSTEP 1 COMPLETE: Data written to MongoDB. Ready for server restart!');
  } else if (step === 'verify') {
    console.log('=== STEP 2: Verifying Data AFTER Server Restart ===');
    const email = 'real_db_user_123@example.com';
    const login = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email, password: 'password123' });
    console.log('Login After Restart Status:', login.status);
    
    if (login.status !== 200) {
      console.error('[FAIL] Could not log in user after server restart!');
      process.exit(1);
    }

    const cookie = login.cookies[0].split(';')[0];
    const txs = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookie);
    const bdg = await makeRequest({ path: '/api/budgets', method: 'GET' }, null, cookie);
    const goals = await makeRequest({ path: '/api/goals', method: 'GET' }, null, cookie);

    console.log(`Fetched Transactions Count: ${txs.data.length} (Expected 2)`);
    console.log(`Fetched Budgets Count: ${bdg.data.length} (Category: ${bdg.data[0]?.category}, Limit: ₹${bdg.data[0]?.monthly_limit})`);
    console.log(`Fetched Goals Count: ${goals.data.length} (Name: ${goals.data[0]?.name}, Balance: ₹${goals.data[0]?.current_amount})`);

    if (txs.data.length === 2 && bdg.data.length === 1 && goals.data.length === 1) {
      console.log('\n==================================================');
      console.log(' SUCCESS: REAL MONGODB DISK PERSISTENCE VERIFIED!');
      console.log(' All records survived backend process restart!');
      console.log('==================================================');
    } else {
      console.error('\n[FAIL] Records were lost after server restart!');
      process.exit(1);
    }
  }
}

runTest();
